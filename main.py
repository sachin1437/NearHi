import asyncio
import hashlib
import json
import os
import secrets
import time
import uuid
from typing import Optional

import httpx
import redis.asyncio as redis
from fastapi import Depends, FastAPI, Header, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.responses import RedirectResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

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

# Where moderation requests go. Defaults to OpenAI. Overridable so a test can
# point it at a local stand-in instead of the real service.
MODERATION_URL = os.environ.get("MODERATION_URL", "https://api.openai.com/v1/moderations")

# Video screening: each browser samples a still of the OTHER person's video and
# sends it here. Frames are checked in memory and never written anywhere.
FRAME_INTERVAL_MS = 5000       # how often browsers are told to sample
FRAME_MIN_INTERVAL_S = 2.0     # frames arriving faster than this from one connection are dropped
FRAME_MAX_CHARS = 200_000      # size cap for one frame (a base64 JPEG data URL), roughly 150 KB

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
last_frame_at: dict[str, float] = {}  # user_id -> monotonic time of the last accepted frame
background_tasks: set = set()         # keeps frame-check tasks alive until they finish


async def clear_stale_state():
    """This process keeps every live connection in memory, so right after a start
    nobody is actually connected. Anything Redis still holds from before a restart
    or redeploy (people 'waiting', rooms) belongs to connections that no longer
    exist, and would otherwise get matched with real users and go nowhere. Bans,
    reports and flag counts are deliberately left alone."""
    await redis_client.delete(WAITING_GEO_KEY)
    for prefix in (WAITING_META_PREFIX, ROOM_PREFIX):
        async for key in redis_client.scan_iter(match=prefix + "*", count=500):
            await redis_client.delete(key)


@app.on_event("startup")
async def startup():
    global redis_client, claim_pair_script
    redis_client = redis.from_url(REDIS_URL, decode_responses=True)
    claim_pair_script = redis_client.register_script(CLAIM_PAIR_LUA)
    await clear_stale_state()
    if not OPENAI_API_KEY:
        print("WARNING: OPENAI_API_KEY is not set, so chat and video are NOT being screened.")
    if not ADMIN_TOKEN:
        print("WARNING: ADMIN_TOKEN is not set, so the admin routes are disabled.")
    if BAN_SALT == "dev-only-change-me":
        print("WARNING: BAN_SALT is the public default, set your own secret before real users arrive.")


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
        if candidate_id not in connections:
            # left without being cleaned up: drop the stale entry instead of matching a ghost
            await remove_from_pool(candidate_id)
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
                MODERATION_URL,
                headers={"Authorization": f"Bearer {OPENAI_API_KEY}"},
                json={"input": text},
            )
            resp.raise_for_status()
            result = resp.json()["results"][0]
            return not result["flagged"]
    except Exception:
        return True


async def check_image(data_url: str) -> bool:
    """True if one video frame is safe. Same fail-open rule as text. The image is
    only ever held in memory for this call, never written anywhere. This is a
    general content check, it is NOT a detector for child sexual abuse material."""
    if not OPENAI_API_KEY:
        return True
    try:
        async with httpx.AsyncClient(timeout=8) as client:
            resp = await client.post(
                MODERATION_URL,
                headers={"Authorization": f"Bearer {OPENAI_API_KEY}"},
                json={
                    "model": "omni-moderation-latest",
                    "input": [{"type": "image_url", "image_url": {"url": data_url}}],
                },
            )
            resp.raise_for_status()
            return not resp.json()["results"][0]["flagged"]
    except Exception:
        return True


async def record_flag(client_id: str):
    if client_id:
        await redis_client.incr(FLAGGED_COUNT_PREFIX + client_id)


async def record_report(reported: dict, reporter: dict, reason: str, source: str = "user"):
    record = {
        "reported_client_id": reported.get("client_id"),
        "reported_ip_hash": reported.get("ip_hash"),
        "reporter_client_id": reporter.get("client_id"),
        "reason": str(reason or "")[:280],
        "source": source,  # "user" for the Report button, "video-screen" for an automatic flag
        "ts": time.time(),
    }
    await redis_client.rpush(REPORTS_KEY, json.dumps(record))
    await redis_client.ltrim(REPORTS_KEY, -MAX_PENDING_REPORTS, -1)


async def screen_frame(user_id: str, peer_id: str, data_url: str):
    """Check one frame of the other person's video. Runs as its own task so a slow
    moderation call never stalls chat or signaling for this user."""
    if await check_image(data_url):
        return
    # They may have skipped or been re-matched while the check ran: only act if
    # this user is still paired with the same person.
    if await redis_client.get(ROOM_PREFIX + user_id) != peer_id:
        return
    reported = identities.get(peer_id, {})
    await record_flag(reported.get("client_id", ""))
    await record_report(
        reported=reported,
        reporter=identities.get(user_id, {}),
        reason="auto: video frame flagged by screening",
        source="video-screen",
    )
    await unpair(user_id)
    await mark_recent(user_id, peer_id)
    await send_to(user_id, {"type": "video_blocked"})
    await send_to(peer_id, {"type": "peer_left"})


@app.websocket("/ws")
async def ws_endpoint(websocket: WebSocket):
    await websocket.accept()
    user_id = str(uuid.uuid4())
    connections[user_id] = websocket
    await websocket.send_text(json.dumps({
        "type": "hello",
        "user_id": user_id,
        "video_screening": bool(OPENAI_API_KEY),
        "frame_interval_ms": FRAME_INTERVAL_MS,
    }))

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
                if not isinstance(text, str) or not text.strip():
                    continue
                text = text[:2000]
                if await check_message(text):
                    await send_to(peer_id, {"type": "chat", "data": text})
                else:
                    await record_flag(identities.get(user_id, {}).get("client_id", ""))
                    await send_to(user_id, {"type": "chat_blocked"})

            elif mtype == "frame":
                if not OPENAI_API_KEY:
                    continue
                now = time.monotonic()
                data_url = msg.get("data")
                last = last_frame_at.get(user_id)
                if (
                    (last is not None and now - last < FRAME_MIN_INTERVAL_S)
                    or not isinstance(data_url, str)
                    or len(data_url) > FRAME_MAX_CHARS
                    or not data_url.startswith("data:image/jpeg;base64,")
                ):
                    continue
                peer_id = await redis_client.get(ROOM_PREFIX + user_id)
                if not peer_id:
                    continue
                last_frame_at[user_id] = now
                task = asyncio.create_task(screen_frame(user_id, peer_id, data_url))
                background_tasks.add(task)
                task.add_done_callback(background_tasks.discard)

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
        last_frame_at.pop(user_id, None)


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


def require_admin(authorization: str = Header(default="")):
    """The admin token travels in an Authorization header, not the URL, so it never
    lands in server logs or browser history. 404 rather than 401 so these routes
    don't advertise that they exist."""
    supplied = authorization[7:] if authorization.lower().startswith("bearer ") else ""
    if not ADMIN_TOKEN or not secrets.compare_digest(supplied.encode(), ADMIN_TOKEN.encode()):
        raise HTTPException(status_code=404)


class Target(BaseModel):
    client_id: str = ""
    ip_hash: str = ""


async def kick_matching(client_id: str, ip_hash: str):
    """Disconnect anyone connected right now who matches a fresh ban, so it takes
    effect immediately instead of at their next search."""
    for uid, ident in list(identities.items()):
        if (client_id and ident.get("client_id") == client_id) or (ip_hash and ident.get("ip_hash") == ip_hash):
            await send_to(uid, {"type": "banned"})
            ws = connections.get(uid)
            if ws:
                try:
                    await ws.close()
                except Exception:
                    pass


@app.get("/status")
async def status():
    """Lets you confirm the safety settings took effect on the live site. Booleans only, nothing secret."""
    return {
        "text_screening": bool(OPENAI_API_KEY),
        "video_screening": bool(OPENAI_API_KEY),
        "ban_salt_set": BAN_SALT != "dev-only-change-me",
    }


@app.get("/admin/reports", dependencies=[Depends(require_admin)])
async def admin_reports():
    raw = await redis_client.lrange(REPORTS_KEY, 0, -1)
    reports = [json.loads(r) for r in raw]
    counts = {}
    for r in reports:
        cid = r.get("reported_client_id")
        if cid:
            counts[cid] = counts.get(cid, 0) + 1
    flags = {}
    async for key in redis_client.scan_iter(match=FLAGGED_COUNT_PREFIX + "*", count=200):
        value = await redis_client.get(key)
        if value and len(flags) < 500:
            flags[key[len(FLAGGED_COUNT_PREFIX):]] = int(value)
    return {
        "reports": list(reversed(reports)),
        "report_counts_by_client_id": counts,
        "flag_counts_by_client_id": flags,
    }


@app.get("/admin/bans", dependencies=[Depends(require_admin)])
async def admin_bans():
    return {
        "client_ids": sorted(await redis_client.smembers(BANNED_CLIENTS_KEY)),
        "ip_hashes": sorted(await redis_client.smembers(BANNED_IPS_KEY)),
    }


@app.post("/admin/ban", dependencies=[Depends(require_admin)])
async def admin_ban(target: Target):
    if not target.client_id and not target.ip_hash:
        raise HTTPException(status_code=400, detail="provide client_id and/or ip_hash")
    if target.client_id:
        await redis_client.sadd(BANNED_CLIENTS_KEY, target.client_id)
    if target.ip_hash:
        await redis_client.sadd(BANNED_IPS_KEY, target.ip_hash)
    await kick_matching(target.client_id, target.ip_hash)
    return {"banned": {"client_id": target.client_id or None, "ip_hash": target.ip_hash or None}}


@app.post("/admin/unban", dependencies=[Depends(require_admin)])
async def admin_unban(target: Target):
    if not target.client_id and not target.ip_hash:
        raise HTTPException(status_code=400, detail="provide client_id and/or ip_hash")
    if target.client_id:
        await redis_client.srem(BANNED_CLIENTS_KEY, target.client_id)
    if target.ip_hash:
        await redis_client.srem(BANNED_IPS_KEY, target.ip_hash)
    return {"unbanned": {"client_id": target.client_id or None, "ip_hash": target.ip_hash or None}}


@app.post("/admin/dismiss", dependencies=[Depends(require_admin)])
async def admin_dismiss(target: Target):
    """Clear every pending report and the flag count for one browser, once you've
    reviewed them. Not atomic: a report filed during the same instant could be lost,
    which is acceptable at this scale."""
    if not target.client_id:
        raise HTTPException(status_code=400, detail="provide client_id")
    raw = await redis_client.lrange(REPORTS_KEY, 0, -1)
    keep = [r for r in raw if json.loads(r).get("reported_client_id") != target.client_id]
    await redis_client.delete(REPORTS_KEY)
    if keep:
        await redis_client.rpush(REPORTS_KEY, *keep)
    await redis_client.delete(FLAGGED_COUNT_PREFIX + target.client_id)
    return {"dismissed": target.client_id, "removed": len(raw) - len(keep)}


@app.get("/talk")
async def talk_redirect():
    # relative redirect, so it keeps whatever scheme and host the visitor used
    return RedirectResponse("/talk/")


app.mount("/", StaticFiles(directory="static", html=True), name="static")