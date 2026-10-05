![NearHi](docs/banner.svg)

![Python](https://img.shields.io/badge/Python-3.12-3776AB?logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-Geo%20Matching-DC382D?logo=redis&logoColor=white)
![WebRTC](https://img.shields.io/badge/WebRTC-P2P%20Video-333333)

Random video and text chat with strangers, matched by how close they are to you, not just randomly from anywhere in the world.

## 🎯 How it works

- You pick a radius: presets from 10 km up to 1000 km, a custom number (10 to 20000 km), or Anywhere.
- The backend puts you in a waiting pool in Redis, keyed by your location.
- When someone else is waiting within range of you (and you're within range of them, matching is mutual), you're paired.
- Video and audio go directly between the two browsers over WebRTC. The server only relays chat text and the WebRTC handshake, not the actual video stream.
- **Skip** moves you to the next person on the same screen. **Stop** ends everything and turns the camera off. If the person you're talking to leaves or skips you, you automatically go back to searching. The same two people are not paired again for 60 seconds after a skip.
- Matching is mutual, so Anywhere only matches people whose own radius also reaches you.

## 🧱 Stack

- **Backend:** FastAPI, one WebSocket endpoint handling matching, chat relay, and WebRTC signaling relay.
- **Matching:** Redis geo commands (`GEOADD` / `GEOSEARCH`), sub-millisecond radius lookups.
- **Video:** WebRTC, STUN by default (Google's public server), TURN pluggable via a `/ice-servers` endpoint for networks where direct P2P fails.
- **Frontend:** a landing page at `/` and the chat app at `/talk/`. Plain HTML, CSS and JavaScript, no framework, no build step. The font (Bricolage Grotesque, Open Font License) is self-hosted.

## 📁 Project structure

```
nearby-chat/
├── main.py              backend: matching, chat + video screening, signaling relay, bans, admin API
├── requirements.txt
├── Procfile              tells Railway/Render how to start the app
├── .gitignore
├── docs/
│   └── banner.svg
└── static/
    ├── index.html        landing page, served at /
    ├── talk/
    │   └── index.html    the chat app, served at /talk/
    ├── admin/
    │   └── index.html    the report review page, served at /admin/ (needs the admin token)
    ├── terms/
    │   └── index.html    Terms of Use
    ├── privacy/
    │   └── index.html    Privacy Policy
    ├── fonts/            self-hosted font, its stylesheet and licence
    ├── topo.svg          map artwork used on the landing page
    ├── og-image.png      preview image shown when the link is shared
    └── favicon.svg, favicon.ico, apple-touch-icon.png    site icons
```

## 💻 Running locally

1. Install and start Redis (`brew install redis` on Mac, `sudo apt install redis-server` on Linux, Docker or WSL on Windows).
2. Create and activate a virtual environment, then `pip install -r requirements.txt`.
3. `python -m uvicorn main:app --host 0.0.0.0 --port 8000`
4. Open `http://localhost:8000` in two browser tabs (or two devices on the same network), allow location and camera in both.

## 🔑 Environment variables

| Variable | Required | Default | Purpose |
|---|---|---|---|
| `REDIS_URL` | No | `redis://localhost:6379` | On Railway, set this to `${{Redis.REDIS_URL}}` to reference the Redis add-on. |
| `TURN_API_KEY` | No | unset | API key from a TURN provider (e.g. metered.ca). |
| `TURN_DOMAIN` | No | unset | The subdomain your TURN provider gave you. |
| `OPENAI_API_KEY` | No | unset | Turns on screening of chat messages and video stills (OpenAI's moderation endpoint, free). Without it, nothing is screened. |
| `BAN_SALT` | **Set it in production** | a public dev-only default | Secret that scrambles IPs before they're stored. While it is the public default, anyone can reverse the stored hashes, so set your own random value. |
| `ADMIN_TOKEN` | No | unset | Password for the admin routes and the `/admin/` page. Without it they return 404 and are disabled. Sent in an `Authorization` header, never in the URL. |
| `MODERATION_URL` | No | OpenAI's endpoint | Only for testing: points screening at a stand-in server instead of OpenAI. |

Without the two `TURN_*` variables set, `/ice-servers` just returns Google's public STUN server. That's enough for most home networks but will fail behind stricter NATs and some mobile carriers, add a TURN provider before relying on this for real users.

Without `OPENAI_API_KEY` set, chat and video still work exactly as before, they just aren't screened. This fails open deliberately, a broken moderation call should never be the reason a call stops working. Open `/status` on the live site to confirm what is switched on, it returns `text_screening`, `video_screening` and `ban_salt_set`, and the server also prints a warning at startup for anything unset.

## 🚀 Deployment

Push to GitHub, then on Railway: New Project, deploy from the repo, add a Redis plugin, set `REDIS_URL` to `${{Redis.REDIS_URL}}` in the web service's variables, generate a domain.

## 🛡️ Moderation and bans

**Chat.** Every message is checked before it's relayed. A flagged message is never delivered, the sender is told, and it's counted against their `client_id`.

**Video.** While two people are in a call, each browser takes a small still (320 px JPEG) of the *other* person's video every 5 seconds and sends it to the server, which checks it and discards it. Frames are only ever held in memory, never stored or logged. If one is flagged, the viewer's call ends with an explanation, the sender is told the other person left, and an automatic report goes into the review queue against the sender. Screening what you *receive* is deliberate: someone running a modified page could skip checking their own camera, but can't stop the other side from checking theirs. The cost is that a modified viewer could send fake frames to flag an innocent person. That can only create a report for you to review, never a ban, which is one reason bans are manual.

**Identity.** Each browser gets a `client_id`, a random value in `localStorage`. It's not an account, there's no login or profile behind it, it only exists so a ban means something across sessions. A scrambled (salted-hash) IP is kept alongside it, never the raw address. Clearing site data resets the `client_id`.

**Review.** Open `/admin/` and paste your `ADMIN_TOKEN`. You'll see each reported browser with how many reports came from people, how many were automatic, how many *different* people reported it (the number to trust most), and the latest reason. From there you can **Ban**, **Dismiss**, and **Unban**. A ban takes effect immediately and disconnects the person if they're connected. Blocking their *network* as well is off by default, because mobile carriers put many people behind one address and a network block can lock out innocent people. The same actions exist as API routes (`/admin/reports`, `/admin/bans`, `/admin/ban`, `/admin/unban`, `/admin/dismiss`) that expect `Authorization: Bearer <ADMIN_TOKEN>`.

**Banning is manual, not automatic.** Flags are counted and reports are queued, but nobody is banned until you decide. Automatic banning on a flag count risks banning someone over one bad judgment call, and you're the only reviewer, so check `/admin/` regularly once people are using it.

## ⚠️ Known limitations

- **Single process.** The map of live WebSocket connections lives in memory in one process. Scaling to multiple workers or instances needs that moved to something shared (Redis pub/sub) so a message can reach a user connected to a different process.
- **Video is sampled, not watched.** One still every 5 seconds means anything shown between samples is missed, and the screening can also flag harmless things. It lowers the risk, it does not remove it, and nobody watches calls live.
- **No CSAM detection or reporting pipeline.** The screening above is a general content check, it is **not** a detector for child sexual abuse material. That needs a vetted specialist provider (PhotoDNA, Thorn Safer), not a custom detector, plus real legal advice on reporting obligations for your jurisdiction. This is still a launch blocker for wide public use.
- **18+ is a checkbox.** Nothing verifies age. Two adults is the intended use, but a minor can click the same button.
- **Network addresses are visible during a call.** Direct video means each person's browser can see the other's IP address, which roughly reveals a city. Forcing every call through a TURN relay would hide it, at the cost of relaying all video traffic through your provider. The Privacy Policy says this plainly.
- **The legal pages are a plain-language starting point, not legal advice.** Have a lawyer read them, especially for Indian requirements around platforms (grievance contact) and personal data, before a wide launch. Replace the `YOUR_CONTACT_EMAIL_HERE` placeholder in both pages first.
- **Bans aren't unbreakable.** A `client_id` lives in `localStorage` and an IP can change, someone determined enough can clear site data and switch networks to get a fresh identity. This raises the bar for casual repeat offenders, it doesn't stop a determined one. Nothing short of phone or ID verification does, and that's a much bigger product decision, not a bug fix.