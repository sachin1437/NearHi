![NearHi](docs/banner.svg)

# NearHi

**Talk to someone near you, right now.** Open the site, press start, and you're on a video call with a stranger who is within the distance you chose. No sign-up, no app, nothing to install.

### 👉 [nearhi.cybernetic.co.in](https://nearhi.cybernetic.co.in)

Runs in the browser on your phone or laptop (Chrome, Safari, Edge, Firefox). 18+ only.

## How to use it

1. Open [nearhi.cybernetic.co.in](https://nearhi.cybernetic.co.in) and press **Start talking**.
2. Pick how far away you're happy to meet someone, from 10 km to anywhere, and allow your location and camera when the browser asks.
3. You're connected with the next person searching within range. Chat by text or video. **Skip** moves you to someone new, **Stop** ends it and turns your camera off.

NearHi is new, so there may not be many people online at any moment. If you're alone, pick **Anywhere**, or send the link to a friend and both press Start at the same time.

## What makes it different

Most random chat sites match you with anyone in the world. NearHi matches you by distance. You choose the radius, and you're only paired with someone whose own radius reaches you too, so you don't end up in a call with someone far outside the distance you chose.

Phones and laptops often guess their location a few kilometres off. NearHi allows for that, and warns you before you start if your device's location is rougher than the radius you picked.

## Safety and privacy, in plain words

- **Adults only.** NearHi is for people 18 and over. It cannot check anyone's age, so a minor could still press the button. If you see one, press Report or write to us.
- **Automatic screening, not live watching.** Chat messages and small stills from the video are checked automatically for harmful content. It misses things and sometimes flags harmless ones, and nobody watches calls live. Use **Report** if someone behaves badly. Reported browsers are reviewed and can be banned.
- **No account, no recordings.** We don't ask for a name, email or phone number. Video goes directly between the two browsers and is never recorded by us. Chat text is not stored.
- **Your location** is used only to find people in range, and is removed once you're matched, skip, or leave. The other person is never told it.
- **The other person can see your IP address during a video call**, which can roughly reveal your city. That is how direct video calls work. Use a VPN if that bothers you.

Read the full [Terms of Use](https://nearhi.cybernetic.co.in/terms/) and [Privacy Policy](https://nearhi.cybernetic.co.in/privacy/).

## Contact

Questions, reports, or a request about something that involves you: **nearhi.in@gmail.com**

---

## For developers

This repository is the code behind the live site. You don't need it to use NearHi. If you want to read it, run it, or host your own copy, here's the short version.

![Python](https://img.shields.io/badge/Python-3.12-3776AB?logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-Geo%20Matching-DC382D?logo=redis&logoColor=white)
![WebRTC](https://img.shields.io/badge/WebRTC-P2P%20Video-333333)

**Stack**

- **Backend:** FastAPI, one WebSocket endpoint for matching, chat relay and WebRTC signaling.
- **Matching:** Redis geo commands (`GEOADD` / `GEOSEARCH`), mutual radius check, atomic pairing with a Lua script.
- **Video:** WebRTC peer to peer, STUN by default, TURN pluggable through `/ice-servers`.
- **Frontend:** a landing page at `/` and the chat app at `/talk/`. Plain HTML, CSS and JavaScript, no framework, no build step. The font (Bricolage Grotesque, Open Font License) is self-hosted.
- **Moderation:** OpenAI's moderation endpoint for chat text and sampled video stills, manual bans through a token-protected admin page.

**Run it locally**

1. Install and start Redis (`brew install redis` on Mac, `sudo apt install redis-server` on Linux, Memurai, Docker or WSL on Windows).
2. Create and activate a virtual environment, then `pip install -r requirements.txt`.
3. `python -m uvicorn main:app --host 0.0.0.0 --port 8000`
4. Open `http://localhost:8000` in two browser tabs, allow location and camera in both.

**Everything else** (environment variables, deployment, moderation and bans, the reach numbers, troubleshooting when two people don't connect, known limitations) is in [docs/OPERATING.md](docs/OPERATING.md).

**Project structure**

```
NearHi/
├── main.py              backend: matching, chat + video screening, signaling relay, bans, admin API
├── requirements.txt
├── Procfile             tells Railway/Render how to start the app
├── test_matching.py     checks against a running local server
├── docs/
│   ├── banner.svg
│   └── OPERATING.md     running and operating the site
└── static/
    ├── index.html       landing page, served at /
    ├── talk/            the chat app, served at /talk/
    ├── hit.js           counts a page visit (no cookies)
    ├── admin/           report review and reach numbers, served at /admin/ (needs the admin token)
    ├── terms/           Terms of Use
    ├── privacy/         Privacy Policy
    ├── fonts/           self-hosted font, its stylesheet and licence
    ├── topo.svg, topo-tile-dark.webp, topo-tile-light.webp    background artwork
    ├── og-image.png     preview image shown when the link is shared
    └── favicon.svg, favicon.ico, apple-touch-icon.png         site icons
```