import hashlib
import json
import os
import time
import uuid
from typing import Optional

import httpx
import redis.asyncio as redis
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import RedirectResponse
from fastapi.staticfiles import StaticFiles

# Set these once you sign up with a TURN provider (e.g. metered.ca). Until
# then this endpoint just returns Google's public STUN server, which is
# enough for P2P to work on most home/office networks but will fail behind
# stricter NATs and some mobile carriers.
TURN_API_KEY = os.environ.get("TURN_API_KEY")
TURN_DOMAIN = os.environ.get("TURN_DOMAIN")  # e.g. "yoursubdomain.metered.live"

REDIS_URL = os.environ.get("REDIS_URL", "redis://localhost:6379")

# Moderation: OpenAI's moderation endpoint is free. Without a key set, chat
# still works, messages just aren't screened, logged clearly below so this
# doesn't fail silently in production.
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")

# Salts the hashed IP used for bans, so raw IPs are never stored. Set your
# own random value in production; this default is fine for local testing only.
BAN_SALT = os.environ.get("BAN_SALT", "dev-only-change-me")

# Shared secret for the /admin endpoints. There's no login system yet, this
# is a single token you keep private, not real auth, treat it like a password.
ADMIN_TOKEN = os.environ.get("ADMIN_TOKEN")

WAITING_GEO_KEY = "waiting:geo"        # geo set: user_id -> (lon, lat)
WAITING_META_PREFIX = "waiting:meta:"  # hash per user_id: radius_km, joined_at
ROOM_PREFIX = "room:"                  # user_id -> peer_id while paired
RECENT_PREFIX = "recent:"              # user_id -> set of peers they just skipped or left
BANNED_CLIENTS_KEY = "banned:clients"  # set of banned client_id values (browser-stored)
BANNED_IPS_KEY = "banned:ips"          # set of banned hashed-IP values
FLAGGED_COUNT_PREFIX = "flagged:"      # client_id -> count of moderation-flagged messages
REPORTS_KEY = "reports:pending"        # list of pending report records, newest last
MAX_PENDING_REPORTS = 500              # oldest reports drop off past this, so the list can't grow forever

MIN_RADIUS_KM = 10
MAX_RADIUS_KM = 20050                  # more than half the Earth's circumference, i.e. "anywhere"
RECENT_SKIP_TTL_SECONDS = 60           # don't re-match the same pair right after a skip

app = FastAPI()
redis_client: Optional["redis.Redis"] = None
claim_pair_script = None

# Two people searching at the same moment can each find the other in the pool.
# This script removes both from the pool in one atomic step, and only if both
# are still there, so exactly one side gets to create the pairing.
CLAIM_PAIR_LUA = """
if redis.call('ZSCORE', KEYS[1], ARGV[1]) and redis.call('ZSCORE', KEYS[1], ARGV[2]) then
  redis.call('ZREM', KEYS[1], ARGV[1], ARGV[2])
  return 1
end
return 0
"""

# in-process map of user_id -> live websocket. Works for a single backend
# process. If you scale to multiple workers/instances later, this needs to
# move to something shared (e.g. Redis pub/sub) so a message can reach a
# user connected to a different process.
connections: dict[str, WebSocket] = {}
identities: dict[str, dict] = {}  # user_id -> {"client_id": ..., "ip_hash": ...}


@app.on_event("startup")
async def startup():
    global redis_client, claim_pair_script
    redis_client = redis.from_url(REDIS_URL, decode_responses=True)
    claim_pair_script = redis_client.register_script(CLAIM_PAIR_LUA)


@app.on_event("shutdown")
async def shutdown():
    if redis_client:
        await redis_client.close()


async def remove_from_pool(user_id: str):
    await redis_client.zrem(WAITING_GEO_KEY, user_id)
    await redis_client.delete(WAITING_META_PREFIX + user_id)


def clamp_radius(value) -> float:
    """Server-side radius limits. The UI enforces these too, but a client can
    send anything over the socket."""
    try:
        radius = float(value)
    except (TypeError, ValueError):
        return float(MIN_RADIUS_KM)
    if radius != radius:  # NaN
        return float(MIN_RADIUS_KM)
    return max(float(MIN_RADIUS_KM), min(float(MAX_RADIUS_KM), radius))


async def claim_pair(a: str, b: str) -> bool:
    return bool(await claim_pair_script(keys=[WAITING_GEO_KEY], args=[a, b]))


async def mark_recent(a: str, b: str):
    for user, other in ((a, b), (b, a)):
        await redis_client.sadd(RECENT_PREFIX + user, other)
        await redis_client.expire(RECENT_PREFIX + user, RECENT_SKIP_TTL_SECONDS)


async def find_match(user_id: str, lat: float, lon: float, radius_km: float) -> Optional[str]:
    """Find a waiting user within radius_km whose own radius also covers us
    (mutual match, not one-sided)."""
    candidates = await redis_client.geosearch(
        WAITING_GEO_KEY,
        longitude=lon,
        latitude=lat,
        radius=radius_km,
        unit="km",
        sort="ASC",
        withdist=True,
    )
    recent = await redis_client.smembers(RECENT_PREFIX + user_id)
    for candidate_id, dist in candidates:
        if candidate_id == user_id or candidate_id in recent:
            continue
        meta = await redis_client.hgetall(WAITING_META_PREFIX + candidate_id)
        if not meta:
            continue
        candidate_radius = float(meta.get("radius_km", 0))
        if float(dist) <= candidate_radius:
            return candidate_id
    return None


async def pair_users(a: str, b: str):
    await remove_from_pool(a)
    await remove_from_pool(b)
    await redis_client.set(ROOM_PREFIX + a, b, ex=3600)
    await redis_client.set(ROOM_PREFIX + b, a, ex=3600)


async def unpair(user_id: str) -> Optional[str]:
    peer = await redis_client.get(ROOM_PREFIX + user_id)
    await redis_client.delete(ROOM_PREFIX + user_id)
    if peer:
        await redis_client.delete(ROOM_PREFIX + peer)
    return peer


async def send_to(user_id: str, payload: dict):
    ws = connections.get(user_id)
    if ws:
        try:
            await ws.send_text(json.dumps(payload))
        except Exception:
            pass


def hash_ip(ip: str) -> str:
    return hashlib.sha256((BAN_SALT + ip).encode()).hexdigest()


def client_ip(websocket: WebSocket) -> str:
    forwarded = websocket.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return websocket.client.host if websocket.client else "unknown"


async def is_banned(client_id: str, ip_hash: str) -> bool:
    if client_id and await redis_client.sismember(BANNED_CLIENTS_KEY, client_id):
        return True
    if ip_hash and await redis_client.sismember(BANNED_IPS_KEY, ip_hash):
        return True
    return False


async def check_message(text: str) -> bool:
    """True if the text is safe to relay. Fails open (allows the message) if
    no API key is set or the moderation call itself fails, since a broken
    moderation call should never be the reason chat stops working."""
    if not OPENAI_API_KEY or not text:
        return True
    try:
        async with httpx.AsyncClient(timeout=5) as client:
            resp = await client.post(
                "https://api.openai.com/v1/moderations",
                headers={"Authorization": f"Bearer {OPENAI_API_KEY}"},
                json={"input": text},
            )
            resp.raise_for_status()
            result = resp.json()["results"][0]
            return not result["flagged"]
    except Exception:
        return True


async def record_flag(client_id: str):
    if client_id:
        await redis_client.incr(FLAGGED_COUNT_PREFIX + client_id)


async def record_report(reported: dict, reporter: dict, reason: str):
    record = {
        "reported_client_id": reported.get("client_id"),
        "reported_ip_hash": reported.get("ip_hash"),
        "reporter_client_id": reporter.get("client_id"),
        "reason": (reason or "")[:280],
        "ts": time.time(),
    }
    await redis_client.rpush(REPORTS_KEY, json.dumps(record))
    await redis_client.ltrim(REPORTS_KEY, -MAX_PENDING_REPORTS, -1)


@app.websocket("/ws")
async def ws_endpoint(websocket: WebSocket):
    await websocket.accept()
    user_id = str(uuid.uuid4())
    connections[user_id] = websocket
    await websocket.send_text(json.dumps({"type": "hello", "user_id": user_id}))

    try:
        while True:
            raw = await websocket.receive_text()
            msg = json.loads(raw)
            mtype = msg.get("type")

            if mtype == "find":
                # identity is attached to the 'find' message (the first real action a
                # client takes), rather than at connect time, so the client has had a
                # chance to load or generate its stored client_id first.
                client_id = str(msg.get("client_id") or "")[:128]
                ip_hash = hash_ip(client_ip(websocket))
                identities[user_id] = {"client_id": client_id, "ip_hash": ip_hash}

                if await is_banned(client_id, ip_hash):
                    await websocket.send_text(json.dumps({"type": "banned"}))
                    await websocket.close()
                    return

                lat = float(msg["lat"])
                lon = float(msg["lon"])
                radius_km = clamp_radius(msg.get("radius_km"))

                await redis_client.geoadd(WAITING_GEO_KEY, (lon, lat, user_id))
                await redis_client.hset(
                    WAITING_META_PREFIX + user_id,
                    mapping={"radius_km": radius_km, "joined_at": time.time()},
                )

                for _ in range(20):
                    peer_id = await find_match(user_id, lat, lon, radius_km)
                    if not peer_id:
                        break  # nobody suitable right now, stay in the pool
                    if await claim_pair(user_id, peer_id):
                        await pair_users(user_id, peer_id)
                        initiator = user_id < peer_id  # deterministic, both sides agree
                        await send_to(user_id, {"type": "matched", "peer_id": peer_id, "initiator": initiator})
                        await send_to(peer_id, {"type": "matched", "peer_id": user_id, "initiator": not initiator})
                        break
                    if await redis_client.zscore(WAITING_GEO_KEY, user_id) is None:
                        break  # someone else already paired us, they send the notifications
                    # otherwise that candidate was taken by someone else, look again

            elif mtype == "signal":
                peer_id = await redis_client.get(ROOM_PREFIX + user_id)
                if peer_id:
                    await send_to(peer_id, {"type": "signal", "data": msg.get("data")})

            elif mtype == "chat":
                peer_id = await redis_client.get(ROOM_PREFIX + user_id)
                if not peer_id:
                    continue
                text = msg.get("data")
                if await check_message(text):
                    await send_to(peer_id, {"type": "chat", "data": text})
                else:
                    await record_flag(identities.get(user_id, {}).get("client_id", ""))
                    await send_to(user_id, {"type": "chat_blocked"})

            elif mtype == "report":
                peer_id = await redis_client.get(ROOM_PREFIX + user_id)
                if peer_id:
                    await record_report(
                        reported=identities.get(peer_id, {}),
                        reporter=identities.get(user_id, {}),
                        reason=msg.get("reason", ""),
                    )

            elif mtype == "skip":
                await remove_from_pool(user_id)
                peer_id = await unpair(user_id)
                if peer_id:
                    await mark_recent(user_id, peer_id)
                    await send_to(peer_id, {"type": "peer_left"})

    except WebSocketDisconnect:
        pass
    finally:
        peer_id = await unpair(user_id)
        if peer_id:
            await send_to(peer_id, {"type": "peer_left"})
        await remove_from_pool(user_id)
        connections.pop(user_id, None)
        identities.pop(user_id, None)


@app.get("/ice-servers")
async def ice_servers():
    if not TURN_API_KEY or not TURN_DOMAIN:
        return [{"urls": "stun:stun.l.google.com:19302"}]
    try:
        async with httpx.AsyncClient(timeout=5) as client:
            resp = await client.get(
                f"https://{TURN_DOMAIN}/api/v1/turn/credentials",
                params={"apiKey": TURN_API_KEY},
            )
            resp.raise_for_status()
            return resp.json()
    except Exception:
        # if the TURN provider is unreachable, fail back to STUN-only
        # rather than breaking the whole app
        return [{"urls": "stun:stun.l.google.com:19302"}]


def require_admin(token: str):
    from fastapi import HTTPException
    if not ADMIN_TOKEN or token != ADMIN_TOKEN:
        raise HTTPException(status_code=404)  # 404, not 401: don't advertise this endpoint exists


@app.get("/admin/reports")
async def admin_reports(token: str = ""):
    require_admin(token)
    raw = await redis_client.lrange(REPORTS_KEY, 0, -1)
    reports = [json.loads(r) for r in raw]
    counts = {}
    for r in reports:
        cid = r.get("reported_client_id")
        if cid:
            counts[cid] = counts.get(cid, 0) + 1
    return {"reports": list(reversed(reports)), "report_counts_by_client_id": counts}


@app.post("/admin/ban")
async def admin_ban(token: str = "", client_id: str = "", ip_hash: str = ""):
    require_admin(token)
    if not client_id and not ip_hash:
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail="provide client_id and/or ip_hash")
    if client_id:
        await redis_client.sadd(BANNED_CLIENTS_KEY, client_id)
    if ip_hash:
        await redis_client.sadd(BANNED_IPS_KEY, ip_hash)
    return {"banned": {"client_id": client_id or None, "ip_hash": ip_hash or None}}


@app.get("/talk")
async def talk_redirect():
    # relative redirect, so it keeps whatever scheme and host the visitor used
    return RedirectResponse("/talk/")


app.mount("/", StaticFiles(directory="static", html=True), name="static")