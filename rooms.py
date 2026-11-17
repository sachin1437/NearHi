"""NearHi rooms: public or unlisted group rooms with video and text, run by an owner who acts as admin.

Everything here lives in memory of this one server process, like the 1-on-1 pairing does. A server
restart closes all rooms, which is fine because a room is only a live conversation. Accounts are in
accounts.py. This module reuses the moderation, ban and report helpers from main.py.

Video is peer to peer: every person connects directly to every other person (a mesh), so this server
only relays the small setup messages. That is why video rooms are capped at six people.
"""

import asyncio
import json
import secrets
import time
from typing import Optional

from fastapi import APIRouter, HTTPException, Request, WebSocket, WebSocketDisconnect

import accounts

ID_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
MAX_VIDEO_MEMBERS = 6
MAX_TEXT_MEMBERS = 30
MAX_ROOMS = 200
OWNER_GRACE_S = 60                 # a room closes if its owner has been gone this long (covers a page refresh)
TITLE_MIN, TITLE_MAX = 3, 60
RULES_MAX = 500
CHAT_MAX_CHARS = 1000
SIGNAL_MAX_CHARS = 20000
REPORT_REASON_MAX = 300
VIDEO_FLAGS_BEFORE_BAN = 3         # automatic video flags before the account is blocked from rooms
MAX_STRIKES = 100

M = None                           # the main module, set by install()
router = APIRouter(prefix="/api/rooms")
rooms: dict[str, "Room"] = {}
background: set = set()


class Member:
    def __init__(self, ws: WebSocket, account: dict, ip_hash: str):
        self.id = secrets.token_hex(4)
        self.ws = ws
        self.account_id = account["id"]
        self.username = account["username"]
        self.ip_hash = ip_hash
        self.admitted = False
        self.mic = True
        self.cam = True
        self.last_frame = 0.0

    def info(self, room: "Room") -> dict:
        return {
            "id": self.id,
            "username": self.username,
            "role": "owner" if self.account_id == room.owner_id else "member",
            "mic": self.mic,
            "cam": self.cam,
        }


class Room:
    def __init__(self, room_id, owner_id, owner_name, title, rules, mode, max_members, policy, listed):
        self.id = room_id
        self.owner_id = owner_id
        self.owner_name = owner_name
        self.title = title
        self.rules = rules
        self.mode = mode
        self.max = max_members
        self.policy = policy          # "open" or "approval"
        self.listed = listed
        self.locked = False
        self.created = time.time()
        self.members: dict[str, Member] = {}
        self.pending: dict[str, Member] = {}
        self.bans: set[str] = set()
        self.owner_absent_since: Optional[float] = time.monotonic()

    def owner_member(self) -> Optional[Member]:
        return next((m for m in self.members.values() if m.account_id == self.owner_id), None)

    def meta(self) -> dict:
        return {
            "id": self.id,
            "title": self.title,
            "rules": self.rules,
            "mode": self.mode,
            "max": self.max,
            "count": len(self.members),
            "policy": self.policy,
            "locked": self.locked,
            "listed": self.listed,
            "owner": self.owner_name,
        }


async def send(ws: WebSocket, payload: dict) -> None:
    try:
        await ws.send_text(json.dumps(payload))
    except Exception:
        pass


async def broadcast(room: Room, payload: dict, exclude: Optional[str] = None) -> None:
    for member in list(room.members.values()):
        if member.id != exclude:
            await send(member.ws, payload)


async def drop_member(room: Room, member: Member, payload: Optional[dict], code: int = 4003) -> None:
    """Take someone out of a room: tell them why, close their connection, tell everyone else."""
    was_in = room.members.pop(member.id, None) is not None
    room.pending.pop(member.id, None)
    if payload:
        await send(member.ws, payload)
    try:
        await member.ws.close(code=code)
    except Exception:
        pass
    if was_in:
        await broadcast(room, {"type": "member_left", "id": member.id, "reason": (payload or {}).get("type", "left")})


async def close_room(room: Room, reason: str) -> None:
    if rooms.get(room.id) is not room:
        return
    rooms.pop(room.id, None)
    for member in list(room.members.values()) + list(room.pending.values()):
        await send(member.ws, {"type": "room_closed", "reason": reason})
        try:
            await member.ws.close(code=4004)
        except Exception:
            pass
    room.members.clear()
    room.pending.clear()


async def reaper() -> None:
    while True:
        await asyncio.sleep(10)
        now = time.monotonic()
        for room in list(rooms.values()):
            if room.owner_member():
                room.owner_absent_since = None
            elif room.owner_absent_since is None:
                room.owner_absent_since = now
            elif now - room.owner_absent_since > OWNER_GRACE_S:
                await close_room(room, "owner_left")


def on_account_deleted(account_id: str) -> None:
    for room in list(rooms.values()):
        if room.owner_id == account_id:
            task = asyncio.get_event_loop().create_task(close_room(room, "account_deleted"))
            background.add(task)
            task.add_done_callback(background.discard)


def new_room_id() -> str:
    while True:
        room_id = "".join(secrets.choice(ID_CHARS) for _ in range(6))
        if room_id not in rooms:
            return room_id


async def need_account(request: Request) -> dict:
    account = await accounts.current_account(request)
    if not account:
        raise HTTPException(status_code=401, detail="Sign in to use rooms")
    if not account["username"] or not account["adult"]:
        raise HTTPException(status_code=403, detail="Finish your profile first")
    return account


@router.get("")
async def list_rooms():
    live = [r for r in rooms.values() if r.listed and r.owner_member()]
    live.sort(key=lambda r: (-len(r.members), -r.created))
    out = []
    for r in live[:100]:
        meta = r.meta()
        meta["rules"] = meta["rules"][:160]
        out.append(meta)
    return {"rooms": out}


@router.get("/{room_id}")
async def room_info(room_id: str):
    room = rooms.get(room_id.upper())
    if not room:
        raise HTTPException(status_code=404, detail="That room is closed or does not exist")
    return {"room": room.meta()}


@router.post("")
async def create_room(request: Request):
    accounts.need_header(request)
    account = await need_account(request)
    if await M.is_banned("acct:" + account["id"], M.hash_ip(accounts.request_ip(request))):
        raise HTTPException(status_code=403, detail="Your account can't create rooms")
    if not accounts.rate_ok("create:" + account["id"], 3, 1 / 60):
        raise HTTPException(status_code=429, detail="Slow down a little")
    body = await request.json()
    if not isinstance(body, dict):
        raise HTTPException(status_code=400, detail="bad request")

    mine = next((r for r in rooms.values() if r.owner_id == account["id"]), None)
    if mine:
        raise HTTPException(status_code=409, detail={"message": "You already have an open room", "room_id": mine.id})
    if len(rooms) >= MAX_ROOMS:
        raise HTTPException(status_code=503, detail="Too many rooms right now, try again later")

    title = " ".join(str(body.get("title", "")).split())[:TITLE_MAX]
    rules = str(body.get("rules", "")).strip()[:RULES_MAX]
    mode = body.get("mode")
    policy = body.get("policy")
    if len(title) < TITLE_MIN:
        raise HTTPException(status_code=400, detail=f"Give the room a title of at least {TITLE_MIN} characters")
    if mode not in ("video", "text") or policy not in ("open", "approval"):
        raise HTTPException(status_code=400, detail="bad settings")
    cap = MAX_VIDEO_MEMBERS if mode == "video" else MAX_TEXT_MEMBERS
    try:
        max_members = int(body.get("max", cap))
    except (TypeError, ValueError):
        raise HTTPException(status_code=400, detail="bad size")
    max_members = max(2, min(cap, max_members))
    if not await M.check_message(title) or (rules and not await M.check_message(rules)):
        raise HTTPException(status_code=400, detail="The title or rules were not allowed")

    room = Room(new_room_id(), account["id"], account["username"], title, rules, mode, max_members, policy,
                bool(body.get("listed", True)))
    rooms[room.id] = room
    return {"room": room.meta()}


def is_flagged_enough(count) -> bool:
    try:
        return int(count or 0) >= VIDEO_FLAGS_BEFORE_BAN
    except ValueError:
        return False


async def screen_room_frame(room: Room, viewer: Member, target: Member, data_url: str) -> None:
    if await M.check_image(data_url):
        return
    if room.members.get(target.id) is not target:
        return
    key = "acct:" + target.account_id
    await M.bump("flagged_video")
    await M.record_flag(key)
    await M.record_report(
        reported={"client_id": key, "ip_hash": target.ip_hash},
        reporter={"client_id": "acct:" + viewer.account_id, "ip_hash": viewer.ip_hash},
        reason="auto: video frame flagged by screening (room " + room.id + ")",
        source="video-screen",
    )
    if is_flagged_enough(await M.redis_client.get(M.FLAGGED_COUNT_PREFIX + key)):
        await M.redis_client.sadd(M.BANNED_CLIENTS_KEY, key)
    await drop_member(room, target, {"type": "video_blocked"})


async def admit(room: Room, member: Member) -> None:
    member.admitted = True
    room.pending.pop(member.id, None)
    room.members[member.id] = member
    await send(member.ws, {
        "type": "joined",
        "you": member.info(room),
        "room": room.meta(),
        "members": [m.info(room) for m in room.members.values() if m.id != member.id],
        "video_screening": bool(M.OPENAI_API_KEY),
        "frame_interval_ms": M.FRAME_INTERVAL_MS,
    })
    await broadcast(room, {"type": "member_joined", "member": member.info(room)}, exclude=member.id)
    if member.account_id == room.owner_id:
        room.owner_absent_since = None
        for pending in room.pending.values():
            await send(member.ws, {"type": "join_request", "id": pending.id, "username": pending.username})


def limiters() -> dict:
    return {
        "all": M.TokenBucket(80, 20),
        "chat": M.TokenBucket(8, 1.5),
        "report": M.TokenBucket(3, 1 / 20),
        "frame": M.TokenBucket(4, 0.8),
        "admin": M.TokenBucket(20, 2),
        "state": M.TokenBucket(6, 1),
    }


@router.websocket("/ws")
async def room_socket(websocket: WebSocket):
    await websocket.accept()
    account = await accounts.current_account(websocket)
    if not account or not account["username"] or not account["adult"]:
        await send(websocket, {"type": "error", "code": "auth"})
        await websocket.close(code=4401)
        return
    ip_hash = M.hash_ip(M.client_ip(websocket))
    if await M.is_banned("acct:" + account["id"], ip_hash):
        await send(websocket, {"type": "error", "code": "banned"})
        await websocket.close(code=4403)
        return
    room = rooms.get(str(websocket.query_params.get("r", "")).upper())
    if not room:
        await send(websocket, {"type": "error", "code": "no_room"})
        await websocket.close(code=4404)
        return
    is_owner = account["id"] == room.owner_id
    if account["id"] in room.bans:
        await send(websocket, {"type": "error", "code": "room_banned"})
        await websocket.close(code=4403)
        return
    if not is_owner and room.locked:
        await send(websocket, {"type": "error", "code": "room_locked"})
        await websocket.close(code=4403)
        return

    # The same account opening the room again (a refresh, a second tab) replaces the old connection.
    for old in list(room.members.values()) + list(room.pending.values()):
        if old.account_id == account["id"]:
            await drop_member(room, old, {"type": "replaced"}, code=4000)
    if not is_owner and len(room.members) >= room.max:
        await send(websocket, {"type": "error", "code": "room_full"})
        await websocket.close(code=4403)
        return

    member = Member(websocket, account, ip_hash)
    limits = limiters()
    strikes = 0

    if is_owner or room.policy == "open":
        await admit(room, member)
    else:
        room.pending[member.id] = member
        await send(websocket, {"type": "pending", "room": room.meta()})
        owner = room.owner_member()
        if owner:
            await send(owner.ws, {"type": "join_request", "id": member.id, "username": member.username})

    try:
        while True:
            raw = await websocket.receive_text()
            if len(raw) > M.MAX_MESSAGE_CHARS:
                await websocket.close(code=1009)
                return
            try:
                msg = json.loads(raw)
            except ValueError:
                continue
            if not isinstance(msg, dict):
                continue
            mtype = msg.get("type")
            if not limits["all"].allow() or (mtype in limits and not limits[mtype].allow()):
                strikes += 1
                if strikes >= MAX_STRIKES:
                    await websocket.close(code=1008)
                    return
                continue

            if mtype == "ping":
                await send(websocket, {"type": "pong"})
                continue
            if room.members.get(member.id) is not member:
                continue   # waiting for approval, or already removed: nothing else is allowed yet

            if mtype == "chat":
                text = msg.get("text")
                if not isinstance(text, str) or not text.strip():
                    continue
                text = text.strip()[:CHAT_MAX_CHARS]
                if await M.check_message(text):
                    await broadcast(room, {"type": "chat", "from": member.id, "username": member.username,
                                           "text": text, "ts": time.time()})
                    await M.bump("chats")
                else:
                    await M.record_flag("acct:" + member.account_id)
                    await send(websocket, {"type": "chat_blocked"})
                    await M.bump("flagged_chat")

            elif mtype == "signal":
                target = room.members.get(str(msg.get("to", "")))
                data = msg.get("data")
                if target and target is not member and isinstance(data, dict) and len(json.dumps(data)) <= SIGNAL_MAX_CHARS:
                    await send(target.ws, {"type": "signal", "from": member.id, "data": data})

            elif mtype == "state":
                member.mic = bool(msg.get("mic", True))
                member.cam = bool(msg.get("cam", True))
                await broadcast(room, {"type": "member_state", "id": member.id, "mic": member.mic, "cam": member.cam},
                                exclude=member.id)

            elif mtype == "frame":
                data_url = msg.get("data")
                target = room.members.get(str(msg.get("of", "")))
                now = time.monotonic()
                if (
                    not M.OPENAI_API_KEY
                    or not target
                    or target is member
                    or now - member.last_frame < 1.0
                    or not isinstance(data_url, str)
                    or len(data_url) > M.FRAME_MAX_CHARS
                    or not data_url.startswith("data:image/jpeg;base64,")
                ):
                    continue
                member.last_frame = now
                task = asyncio.create_task(screen_room_frame(room, member, target, data_url))
                background.add(task)
                task.add_done_callback(background.discard)

            elif mtype == "report":
                target = room.members.get(str(msg.get("target", "")))
                if target and target is not member:
                    await M.bump("reports")
                    await M.record_report(
                        reported={"client_id": "acct:" + target.account_id, "ip_hash": target.ip_hash},
                        reporter={"client_id": "acct:" + member.account_id, "ip_hash": member.ip_hash},
                        reason=("room " + room.id + ": " + str(msg.get("reason") or ""))[:REPORT_REASON_MAX + 20],
                    )
                    await send(websocket, {"type": "report_ok"})

            elif mtype == "admin" and member.account_id == room.owner_id:
                await handle_admin(room, member, msg)
                if rooms.get(room.id) is not room:
                    return

    except WebSocketDisconnect:
        pass
    finally:
        if room.members.get(member.id) is member:
            room.members.pop(member.id, None)
            await broadcast(room, {"type": "member_left", "id": member.id, "reason": "left"})
            if member.account_id == room.owner_id:
                room.owner_absent_since = time.monotonic()
        if room.pending.pop(member.id, None):
            owner = room.owner_member()
            if owner:
                await send(owner.ws, {"type": "request_withdrawn", "id": member.id})


async def handle_admin(room: Room, owner: Member, msg: dict) -> None:
    action = msg.get("action")
    target_id = str(msg.get("target", ""))
    if action in ("kick", "ban"):
        target = room.members.get(target_id)
        if target and target is not owner:
            if action == "ban":
                room.bans.add(target.account_id)
            await drop_member(room, target, {"type": "kicked", "ban": action == "ban"})
    elif action in ("approve", "deny"):
        target = room.pending.get(target_id)
        if not target:
            return
        if action == "approve":
            if len(room.members) >= room.max:
                await send(owner.ws, {"type": "error", "code": "room_full"})
                return
            await admit(room, target)
        else:
            await drop_member(room, target, {"type": "denied"}, code=4003)
    elif action in ("lock", "unlock"):
        room.locked = action == "lock"
        await broadcast(room, {"type": "room_update", "room": room.meta()})
    elif action == "policy" and msg.get("value") in ("open", "approval"):
        room.policy = msg["value"]
        await broadcast(room, {"type": "room_update", "room": room.meta()})
    elif action == "close":
        await close_room(room, "closed_by_owner")


def install(app, main_module) -> None:
    """Called once from main.py, after the helpers it uses are defined."""
    global M
    M = main_module
    accounts.install(app, main_module)
    accounts.deletion_hooks.append(on_account_deleted)
    app.include_router(router)

    @app.on_event("startup")
    async def _rooms_startup():
        task = asyncio.create_task(reaper())
        background.add(task)