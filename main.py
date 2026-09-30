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

WAITING_GEO_KEY = "waiting:geo"        # geo set: user_id -> (lon, lat)
WAITING_META_PREFIX = "waiting:meta:"  # hash per user_id: radius_km, joined_at
ROOM_PREFIX = "room:"                  # user_id -> peer_id while paired
RECENT_PREFIX = "recent:"              # user_id -> set of peers they just skipped or left

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

            elif mtype in ("chat", "signal"):
                peer_id = await redis_client.get(ROOM_PREFIX + user_id)
                if peer_id:
                    await send_to(peer_id, {"type": mtype, "data": msg.get("data")})

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


@app.get("/talk")
async def talk_redirect():
    # relative redirect, so it keeps whatever scheme and host the visitor used
    return RedirectResponse("/talk/")


app.mount("/", StaticFiles(directory="static", html=True), name="static")