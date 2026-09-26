import json
import os
import time
import uuid
from typing import Optional

import httpx
import redis.asyncio as redis
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
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

app = FastAPI()
redis_client: Optional["redis.Redis"] = None

# in-process map of user_id -> live websocket. Works for a single backend
# process. If you scale to multiple workers/instances later, this needs to
# move to something shared (e.g. Redis pub/sub) so a message can reach a
# user connected to a different process.
connections: dict[str, WebSocket] = {}


@app.on_event("startup")
async def startup():
    global redis_client
    redis_client = redis.from_url(REDIS_URL, decode_responses=True)


@app.on_event("shutdown")
async def shutdown():
    if redis_client:
        await redis_client.close()


async def remove_from_pool(user_id: str):
    await redis_client.zrem(WAITING_GEO_KEY, user_id)
    await redis_client.delete(WAITING_META_PREFIX + user_id)


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
    for candidate_id, dist in candidates:
        if candidate_id == user_id:
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
                radius_km = float(msg.get("radius_km", 5))

                await redis_client.geoadd(WAITING_GEO_KEY, (lon, lat, user_id))
                await redis_client.hset(
                    WAITING_META_PREFIX + user_id,
                    mapping={"radius_km": radius_km, "joined_at": time.time()},
                )

                peer_id = await find_match(user_id, lat, lon, radius_km)
                if peer_id:
                    await pair_users(user_id, peer_id)
                    initiator = user_id < peer_id  # deterministic, both sides agree
                    await send_to(user_id, {"type": "matched", "peer_id": peer_id, "initiator": initiator})
                    await send_to(peer_id, {"type": "matched", "peer_id": user_id, "initiator": not initiator})

            elif mtype in ("chat", "signal"):
                peer_id = await redis_client.get(ROOM_PREFIX + user_id)
                if peer_id:
                    await send_to(peer_id, {"type": mtype, "data": msg.get("data")})

            elif mtype == "skip":
                await remove_from_pool(user_id)
                peer_id = await unpair(user_id)
                if peer_id:
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


app.mount("/", StaticFiles(directory="static", html=True), name="static")