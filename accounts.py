"""Accounts for NearHi rooms. Random 1-on-1 chat never touches this file and still needs no account.

Sign-in is Google only: the browser gets a Google ID token, this server verifies it with Google's
public keys and then hands out its own session cookie. Passwords are never handled or stored.
What is stored: the Google account id, the email, the username the person picked, when they
confirmed they are 18+, and hashed session tokens. Nothing else.
"""

import asyncio
import hashlib
import os
import re
import secrets
import sqlite3
import threading
import time
from typing import Callable, Optional

from fastapi import APIRouter, HTTPException, Request, Response
from fastapi.requests import HTTPConnection

GOOGLE_CLIENT_ID = os.environ.get("GOOGLE_CLIENT_ID", "").strip()
# Local testing only. Never set this on the live server: it lets anyone sign in without Google.
DEV_LOGIN = os.environ.get("DEV_LOGIN") == "1"
DB_PATH = os.environ.get("DB_PATH", "data/nearhi.db")
COOKIE_NAME = "nh_session"
SESSION_DAYS = 30

USERNAME_RE = re.compile(r"^[A-Za-z0-9_]{3,20}$")
RESERVED_NAMES = {
    "admin", "administrator", "moderator", "mod", "nearhi", "support", "staff", "owner",
    "system", "official", "help", "security", "root", "stranger", "you", "anonymous",
}

router = APIRouter(prefix="/auth")
_db: Optional[sqlite3.Connection] = None
_db_lock = threading.Lock()
deletion_hooks: list[Callable[[str], None]] = []   # called with the account id when an account is deleted
_moderate: Optional[Callable] = None                # async (text) -> bool, set by install()


def init_db() -> None:
    global _db
    folder = os.path.dirname(DB_PATH)
    if folder:
        os.makedirs(folder, exist_ok=True)
    _db = sqlite3.connect(DB_PATH, check_same_thread=False)
    _db.row_factory = sqlite3.Row
    with _db_lock:
        _db.executescript(
            """
            PRAGMA journal_mode=WAL;
            CREATE TABLE IF NOT EXISTS accounts (
                id TEXT PRIMARY KEY,
                google_sub TEXT NOT NULL UNIQUE,
                email TEXT NOT NULL,
                username TEXT COLLATE NOCASE,
                adult_confirmed_at REAL,
                created_at REAL NOT NULL
            );
            CREATE UNIQUE INDEX IF NOT EXISTS accounts_username ON accounts(username) WHERE username IS NOT NULL;
            CREATE TABLE IF NOT EXISTS sessions (
                token_hash TEXT PRIMARY KEY,
                account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
                expires_at REAL NOT NULL
            );
            CREATE INDEX IF NOT EXISTS sessions_account ON sessions(account_id);
            """
        )
        cols = {r["name"] for r in _db.execute("PRAGMA table_info(accounts)").fetchall()}
        for col in ("name", "picture", "bio"):
            if col not in cols:
                _db.execute(f"ALTER TABLE accounts ADD COLUMN {col} TEXT")
        _db.commit()


def _run(sql: str, args: tuple = (), fetch: str = "none"):
    with _db_lock:
        cur = _db.execute(sql, args)
        rows = cur.fetchone() if fetch == "one" else cur.fetchall() if fetch == "all" else None
        _db.commit()
    return rows


async def db(sql: str, args: tuple = (), fetch: str = "none"):
    return await asyncio.to_thread(_run, sql, args, fetch)


def _hash(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()


class _Bucket:
    def __init__(self, capacity: float, refill_per_s: float):
        self.capacity, self.refill, self.tokens, self.t = capacity, refill_per_s, capacity, time.monotonic()

    def allow(self) -> bool:
        now = time.monotonic()
        self.tokens = min(self.capacity, self.tokens + (now - self.t) * self.refill)
        self.t = now
        if self.tokens >= 1:
            self.tokens -= 1
            return True
        return False


_buckets: dict[str, _Bucket] = {}


def rate_ok(key: str, capacity: float = 10, refill_per_s: float = 0.2) -> bool:
    """Small per-key limiter for sign-in and profile calls."""
    if len(_buckets) > 20000:
        _buckets.clear()
    bucket = _buckets.setdefault(key, _Bucket(capacity, refill_per_s))
    return bucket.allow()


def request_ip(conn: HTTPConnection) -> str:
    forwarded = conn.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return conn.client.host if conn.client else "unknown"


def need_header(request: Request) -> None:
    """State-changing calls must carry this header. A web page on another site cannot add it
    without a CORS preflight, which this server never allows, so it blocks cross-site forms."""
    if request.headers.get("x-nh") != "1":
        raise HTTPException(status_code=403, detail="bad request")


async def current_account(conn: HTTPConnection) -> Optional[dict]:
    token = conn.cookies.get(COOKIE_NAME)
    if not token or _db is None:
        return None
    row = await db(
        "SELECT a.id, a.username, a.adult_confirmed_at FROM sessions s JOIN accounts a ON a.id = s.account_id "
        "WHERE s.token_hash = ? AND s.expires_at > ?",
        (_hash(token), time.time()),
        "one",
    )
    if not row:
        return None
    return {"id": row["id"], "username": row["username"], "adult": bool(row["adult_confirmed_at"])}


def public(account: dict) -> dict:
    return {"id": account["id"], "username": account["username"], "adult": account["adult"],
            "needs_profile": not (account["username"] and account["adult"])}


async def _start_session(request: Request, response: Response, account_id: str) -> None:
    token = secrets.token_urlsafe(32)
    await db(
        "INSERT INTO sessions (token_hash, account_id, expires_at) VALUES (?, ?, ?)",
        (_hash(token), account_id, time.time() + SESSION_DAYS * 86400),
    )
    await db("DELETE FROM sessions WHERE expires_at < ?", (time.time(),))
    https = request.headers.get("x-forwarded-proto", request.url.scheme) == "https"
    response.set_cookie(
        COOKIE_NAME, token, max_age=SESSION_DAYS * 86400, httponly=True, samesite="lax", secure=https, path="/"
    )


@router.get("/config")
async def auth_config():
    return {"google_client_id": GOOGLE_CLIENT_ID or None, "dev_login": DEV_LOGIN}


@router.get("/me")
async def me(request: Request):
    account = await current_account(request)
    return {"account": public(account) if account else None}


def _verify_google(credential: str) -> dict:
    from google.auth.transport import requests as grequests
    from google.oauth2 import id_token

    info = id_token.verify_oauth2_token(credential, grequests.Request(), GOOGLE_CLIENT_ID)
    if info.get("iss") not in ("accounts.google.com", "https://accounts.google.com"):
        raise ValueError("bad issuer")
    if not info.get("email_verified"):
        raise ValueError("email not verified")
    return info


def _clean_picture(url: str) -> str:
    # Only keep Google profile picture URLs, so nothing else can be injected into the page.
    return url if url.startswith("https://") and ".googleusercontent.com/" in url[:60] and len(url) < 400 else ""


async def _sign_in(request: Request, response: Response, sub: str, email: str, name: str = "", picture: str = "") -> dict:
    name = re.sub(r"\s+", " ", name).strip()[:60]
    picture = _clean_picture(picture)
    row = await db("SELECT id FROM accounts WHERE google_sub = ?", (sub,), "one")
    if row:
        account_id = row["id"]
        await db(
            "UPDATE accounts SET email = ?, name = ?, picture = ? WHERE id = ?", (email, name, picture, account_id)
        )
    else:
        account_id = secrets.token_hex(8)
        await db(
            "INSERT INTO accounts (id, google_sub, email, name, picture, created_at) VALUES (?, ?, ?, ?, ?, ?)",
            (account_id, sub, email, name, picture, time.time()),
        )
    await _start_session(request, response, account_id)
    row = await db("SELECT id, username, adult_confirmed_at FROM accounts WHERE id = ?", (account_id,), "one")
    return public({"id": row["id"], "username": row["username"], "adult": bool(row["adult_confirmed_at"])})


@router.post("/google")
async def google_login(request: Request, response: Response):
    need_header(request)
    if not GOOGLE_CLIENT_ID:
        raise HTTPException(status_code=503, detail="Google sign-in is not set up on this server")
    if not rate_ok("login:" + request_ip(request), 8, 0.1):
        raise HTTPException(status_code=429, detail="too many attempts, try again in a minute")
    body = await request.json()
    credential = body.get("credential") if isinstance(body, dict) else None
    if not isinstance(credential, str) or not credential or len(credential) > 5000:
        raise HTTPException(status_code=400, detail="missing credential")
    try:
        info = await asyncio.to_thread(_verify_google, credential)
    except Exception:
        raise HTTPException(status_code=401, detail="Google sign-in could not be verified")
    return {
        "account": await _sign_in(
            request, response, str(info["sub"]), str(info.get("email", "")),
            str(info.get("name", "")), str(info.get("picture", "")),
        )
    }


@router.post("/dev")
async def dev_login(request: Request, response: Response):
    """Only exists when DEV_LOGIN=1. For testing on your own computer."""
    if not DEV_LOGIN:
        raise HTTPException(status_code=404, detail="not found")
    need_header(request)
    body = await request.json()
    name = re.sub(r"[^a-z0-9]", "", str((body or {}).get("name", "tester")).lower())[:20] or "tester"
    return {"account": await _sign_in(request, response, "dev-" + name, name + "@dev.local")}


@router.post("/profile")
async def set_profile(request: Request):
    need_header(request)
    account = await current_account(request)
    if not account:
        raise HTTPException(status_code=401, detail="sign in first")
    if not rate_ok("profile:" + account["id"], 6, 0.05):
        raise HTTPException(status_code=429, detail="slow down")
    body = await request.json()
    if not isinstance(body, dict):
        raise HTTPException(status_code=400, detail="bad request")
    if body.get("adult") is not True:
        raise HTTPException(status_code=400, detail="You must confirm you are 18 or older")
    if account["username"]:
        # The username is fixed once chosen, so reports and bans always point at the same name.
        if not account["adult"]:
            await db("UPDATE accounts SET adult_confirmed_at = ? WHERE id = ?", (time.time(), account["id"]))
            account["adult"] = True
        return {"account": public(account)}
    username = str(body.get("username", "")).strip()
    if not USERNAME_RE.match(username):
        raise HTTPException(status_code=400, detail="Username must be 3 to 20 letters, numbers or underscores")
    if username.lower() in RESERVED_NAMES:
        raise HTTPException(status_code=400, detail="That username is not available")
    if _moderate and not await _moderate(username.replace("_", " ")):
        raise HTTPException(status_code=400, detail="That username is not allowed")
    try:
        await db(
            "UPDATE accounts SET username = ?, adult_confirmed_at = ? WHERE id = ?",
            (username, time.time(), account["id"]),
        )
    except sqlite3.IntegrityError:
        raise HTTPException(status_code=409, detail="That username is taken")
    account.update(username=username, adult=True)
    return {"account": public(account)}


@router.get("/profile")
async def get_profile(request: Request):
    """Everything stored about the signed-in account. Only ever returned to its owner."""
    account = await current_account(request)
    if not account:
        raise HTTPException(status_code=401, detail="sign in first")
    row = await db(
        "SELECT username, email, name, picture, bio, created_at FROM accounts WHERE id = ?", (account["id"],), "one"
    )
    return {
        "profile": {
            "username": row["username"],
            "email": row["email"],
            "name": row["name"] or "",
            "picture": row["picture"] or "",
            "bio": row["bio"] or "",
            "created_at": row["created_at"],
        }
    }


@router.post("/bio")
async def set_bio(request: Request):
    need_header(request)
    account = await current_account(request)
    if not account:
        raise HTTPException(status_code=401, detail="sign in first")
    if not rate_ok("bio:" + account["id"], 6, 0.05):
        raise HTTPException(status_code=429, detail="slow down")
    body = await request.json()
    bio = re.sub(r"\s+", " ", str((body or {}).get("bio", ""))).strip()
    if len(bio) > 140:
        raise HTTPException(status_code=400, detail="Keep it under 140 characters")
    if bio and _moderate and not await _moderate(bio):
        raise HTTPException(status_code=400, detail="That text is not allowed")
    await db("UPDATE accounts SET bio = ? WHERE id = ?", (bio, account["id"]))
    return {"bio": bio}


@router.post("/logout")
async def logout(request: Request, response: Response):
    need_header(request)
    token = request.cookies.get(COOKIE_NAME)
    if token:
        await db("DELETE FROM sessions WHERE token_hash = ?", (_hash(token),))
    response.delete_cookie(COOKIE_NAME, path="/")
    return {"ok": True}


@router.delete("/me")
async def delete_me(request: Request, response: Response):
    """Deletes the account and everything stored about it."""
    need_header(request)
    account = await current_account(request)
    if not account:
        raise HTTPException(status_code=401, detail="sign in first")
    await db("DELETE FROM sessions WHERE account_id = ?", (account["id"],))
    await db("DELETE FROM accounts WHERE id = ?", (account["id"],))
    for hook in deletion_hooks:
        hook(account["id"])
    response.delete_cookie(COOKIE_NAME, path="/")
    return {"ok": True}


def install(app, main_module) -> None:
    """Called once from main.py. Gives this module the content check without importing main."""
    global _moderate
    _moderate = main_module.check_message
    app.include_router(router)

    @app.on_event("startup")
    async def _accounts_startup():
        init_db()
        if not GOOGLE_CLIENT_ID and not DEV_LOGIN:
            print("WARNING: GOOGLE_CLIENT_ID is not set, so nobody can sign in to rooms.")
        if DEV_LOGIN:
            print("WARNING: DEV_LOGIN=1, anyone can sign in without Google. Never use this on the live server.")