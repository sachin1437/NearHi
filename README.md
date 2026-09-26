# TalkToMe

Random video and text chat with strangers, matched by how close they are to you, not just randomly from anywhere in the world.

## How it works

- You set a radius (10 to 50 km).
- The backend puts you in a waiting pool in Redis, keyed by your location.
- When someone else is waiting within range of you (and you're within range of them, matching is mutual), you're paired.
- Video and audio go directly between the two browsers over WebRTC. The server only relays chat text and the WebRTC handshake, not the actual video stream.

## Stack

- **Backend:** FastAPI, one WebSocket endpoint handling matching, chat relay, and WebRTC signaling relay.
- **Matching:** Redis geo commands (`GEOADD` / `GEOSEARCH`), sub-millisecond radius lookups.
- **Video:** WebRTC, STUN by default (Google's public server), TURN pluggable via a `/ice-servers` endpoint for networks where direct P2P fails.
- **Frontend:** one HTML file, no framework, no build step.

## Project structure

```
nearby-chat/
├── main.py              backend: matching, chat relay, signaling relay, /ice-servers
├── requirements.txt
├── Procfile              tells Railway/Render how to start the app
├── .gitignore
├── test_matching.py      two-client test harness, see Testing below
└── static/
    └── index.html        the entire frontend
```

## Running locally

1. Install and start Redis (`brew install redis` on Mac, `sudo apt install redis-server` on Linux, Docker or WSL on Windows).
2. Create and activate a virtual environment, then `pip install -r requirements.txt`.
3. `python -m uvicorn main:app --host 0.0.0.0 --port 8000`
4. Open `http://localhost:8000` in two browser tabs (or two devices on the same network), allow location and camera in both.

## Environment variables

| Variable | Required | Default | Purpose |
|---|---|---|---|
| `REDIS_URL` | No | `redis://localhost:6379` | On Railway, set this to `${{Redis.REDIS_URL}}` to reference the Redis add-on. |
| `TURN_API_KEY` | No | unset | API key from a TURN provider (e.g. metered.ca). |
| `TURN_DOMAIN` | No | unset | The subdomain your TURN provider gave you. |

Without the two `TURN_*` variables set, `/ice-servers` just returns Google's public STUN server. That's enough for most home networks but will fail behind stricter NATs and some mobile carriers, add a TURN provider before relying on this for real users.

## Deployment

Push to GitHub, then on Railway: New Project, deploy from the repo, add a Redis plugin, set `REDIS_URL` to `${{Redis.REDIS_URL}}` in the web service's variables, generate a domain. Full walkthrough was covered in chat when this was built, ask if you need it again.

## Testing

`test_matching.py` spins up two fake clients against a running instance and checks that nearby users match, far-away users don't, and that chat/signaling messages actually relay between paired users. Run it with the server already running locally:

```
python test_matching.py
```

## Known limitations

- **Single process.** The map of live WebSocket connections lives in memory in one process. Scaling to multiple workers or instances needs that moved to something shared (Redis pub/sub) so a message can reach a user connected to a different process.
- **No content moderation yet.** Neither chat text nor video is screened. This needs to exist before this goes out to real strangers, see the moderation plan discussed separately, text moderation first, then periodic video frame checks.
- **No CSAM detection or reporting pipeline.** This is a legal requirement, not an optional feature, before taking real traffic. Needs a vetted third-party provider (PhotoDNA, Thorn Safer), not a custom detector. Get real legal advice on reporting obligations for your jurisdiction.
- **Peer disconnect returns you to idle.** If your match leaves, you're dropped back to the start screen (camera off) rather than automatically searching for someone new. Can be changed if you'd rather it auto-continue.