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
├── main.py              backend: matching, chat relay, signaling relay, /ice-servers
├── requirements.txt
├── Procfile              tells Railway/Render how to start the app
├── .gitignore
├── docs/
│   └── banner.svg
└── static/
    ├── index.html        landing page, served at /
    ├── talk/
    │   └── index.html    the chat app, served at /talk/
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

Without the two `TURN_*` variables set, `/ice-servers` just returns Google's public STUN server. That's enough for most home networks but will fail behind stricter NATs and some mobile carriers, add a TURN provider before relying on this for real users.

## 🚀 Deployment

Push to GitHub, then on Railway: New Project, deploy from the repo, add a Redis plugin, set `REDIS_URL` to `${{Redis.REDIS_URL}}` in the web service's variables, generate a domain.

## ⚠️ Known limitations

- **Single process.** The map of live WebSocket connections lives in memory in one process. Scaling to multiple workers or instances needs that moved to something shared (Redis pub/sub) so a message can reach a user connected to a different process.
- **No content moderation yet.** Neither chat text nor video is screened. This needs to exist before this goes out to real strangers, text moderation first, then periodic video frame checks.
- **No CSAM detection or reporting pipeline.** This is a legal requirement, not an optional feature, before taking real traffic. Needs a vetted third-party provider (PhotoDNA, Thorn Safer), not a custom detector. Get real legal advice on reporting obligations for your jurisdiction.