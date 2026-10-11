# Running and operating NearHi

This is for whoever runs the site. If you just want to use NearHi, go to [nearhi.cybernetic.co.in](https://nearhi.cybernetic.co.in).

## 🎯 How matching works

- A person picks a radius: presets from 10 km up to 1000 km, a custom number (10 to 20000 km), or Anywhere. Anywhere is the default while the user base is small.
- The backend puts them in a waiting pool in Redis, keyed by location.
- When someone else is waiting within range, and they are within range of the other person back (matching is mutual), the two are paired. Anywhere only matches people whose own radius also reaches it.
- Video and audio go directly between the two browsers over WebRTC. The server only relays chat text and the WebRTC handshake, not the video stream.
- **Skip** moves to the next person on the same screen. **Stop** ends everything and turns the camera off. If the other person leaves or skips, the page goes back to searching. The same two people are not paired again for 60 seconds after a skip.
- Device locations are often wrong by a few km (laptops especially), so the page sends how accurate its location is, and the server lets a pair match a little beyond their radii: the sum of both errors, never more than 30 km (`TOLERANCE_CAP_KM` in `main.py`). If a device's accuracy is worse than the radius chosen, the page warns before searching and offers a one-tap widen. The page asks for a precise position first (GPS on phones) and falls back to the ordinary one.

## 🔑 Environment variables

| Variable | Required | Default | Purpose |
|---|---|---|---|
| `REDIS_URL` | No | `redis://localhost:6379` | On Railway, set this to `${{Redis.REDIS_URL}}` to reference the Redis add-on. |
| `TURN_API_KEY` | No | unset | API key from a TURN provider (e.g. metered.ca). |
| `TURN_DOMAIN` | No | unset | The subdomain your TURN provider gave you. |
| `OPENAI_API_KEY` | No | unset | Turns on screening of chat messages and video stills (OpenAI's moderation endpoint, free). Without it, nothing is screened. |
| `BAN_SALT` | **Set it in production** | a public dev-only default | Secret that scrambles IPs before they're stored. While it is the public default, anyone can reverse the stored hashes, so set your own random value. |
| `ADMIN_TOKEN` | No | unset | Password for the admin routes and the `/admin/` page. Without it they return 404 and are disabled. Sent in an `Authorization` header, never in the URL. |
| `STATS_UTC_OFFSET_MINUTES` | No | `330` (India) | Which time zone the daily reach numbers follow. `330` is IST, `0` is UTC. |
| `MODERATION_URL` | No | OpenAI's endpoint | Only for testing: points screening at a stand-in server instead of OpenAI. |

Without the two `TURN_*` variables set, `/ice-servers` just returns Google's public STUN server. That's enough for most home networks but will fail behind stricter NATs and some mobile carriers, so add a TURN provider before relying on this for real users.

Without `OPENAI_API_KEY` set, chat and video still work, they just aren't screened. This fails open deliberately: a broken moderation call should never be the reason a call stops working. Open `/status` on the live site to confirm what is switched on. It returns `text_screening`, `video_screening` and `ban_salt_set`, and the server also prints a warning at startup for anything unset.

Never commit secrets. `.env` is in `.gitignore`. Set them as variables on your host.

## 🚀 Deployment

Push to GitHub, then on Railway: New Project, deploy from the repo, add a Redis plugin, set `REDIS_URL` to `${{Redis.REDIS_URL}}` in the web service's variables, generate a domain. A variable change only takes effect after the service redeploys.

## 🛡️ Moderation and bans

**Chat.** Every message is checked before it's relayed. A flagged message is never delivered, the sender is told, and it's counted against their `client_id`.

**Video.** While two people are in a call, each browser takes a small still (320 px JPEG) of the *other* person's video every 5 seconds and sends it to the server, which checks it and discards it. Frames are only ever held in memory, never stored or logged. If one is flagged, the viewer's call ends with an explanation, the sender is told the other person left, and an automatic report goes into the review queue against the sender. Screening what you *receive* is deliberate: someone running a modified page could skip checking their own camera, but can't stop the other side from checking theirs. The cost is that a modified viewer could send fake frames to flag an innocent person. That can only create a report for you to review, never a ban, which is one reason bans are manual.

**Identity.** Each browser gets a `client_id`, a random value in `localStorage`. It's not an account, there's no login or profile behind it, it only exists so a ban means something across sessions. A scrambled (salted-hash) IP is kept alongside it, never the raw address. Clearing site data resets the `client_id`.

**Review.** Open `/admin/` and paste your `ADMIN_TOKEN`. You'll see each reported browser with how many reports came from people, how many were automatic, how many *different* people reported it (the number to trust most), and the latest reason. From there you can **Ban**, **Dismiss**, and **Unban**. A ban takes effect immediately and disconnects the person if they're connected. Blocking their *network* as well is off by default, because mobile carriers put many people behind one address and a network block can lock out innocent people. The same actions exist as API routes (`/admin/reports`, `/admin/stats`, `/admin/reach`, `/admin/bans`, `/admin/ban`, `/admin/unban`, `/admin/dismiss`) that expect `Authorization: Bearer <ADMIN_TOKEN>`.

**Banning is manual, not automatic.** Flags are counted and reports are queued, but nobody is banned until you decide. Automatic banning on a flag count risks banning someone over one bad judgment call, and the reviewer is one person, so check `/admin/` regularly once people are using it.

## 📈 Seeing your reach

Sign in at `/admin/`. The **Reach** table shows the last 14 days, newest first:

| Column | What it counts |
|---|---|
| Visitors | Different browsers that opened any page that day. Someone who comes back tomorrow counts again |
| Page views | Pages opened, including reloads |
| Searchers / Searches | Different browsers that pressed Start / times anyone entered the waiting pool (a skip or reconnect searches again) |
| Matches | Pairs that were matched |
| Video worked / No video | Matched calls where the video link came up within 15 seconds / did not. This is the number that shows whether people are really getting video |
| Peak online | The most connections open at once that day, which is what decides whether anyone finds a match |

Under the table, **Tagged links** and **Other websites** show where visitors came from. To compare channels, add `?ref=` and any short name to the link you share, for example `https://nearhi.cybernetic.co.in/?ref=lpu-hostel` in one group and `?ref=batch-2027` in another. Each name is counted separately. Links shared in WhatsApp and Instagram usually carry no referring site, so tags are the only way to tell them apart.

How it works, and what it does not do: each public page sends one small note to `/hit`, and the server counts the browser's random ID through a Redis HyperLogLog, which keeps a count and cannot be read back, mixed with a secret that changes daily. No cookies, no third-party scripts, no stored IPs or IDs, and bots that run JavaScript are filtered out. Counts are kept for 180 days. Search engines and link previews never run the script, so they are not in the numbers.

Your own testing is counted unless you press **Don't count my visits on this browser** on the admin page, which also keeps that browser's searches and messages out. Do that on every device you test with. The Privacy Policy describes this counting, so keep the two in step if you change either.

## 🔧 When two people don't connect

Open **Connection details** (the small arrow under the call box) on both devices and compare. It shows the page version, whether the server is reachable, how accurate the device's location is, the search radius, what the server says about who else is searching, and, once matched, the state and route of the video link.

| What you see | What it means | Fix |
|---|---|---|
| "No one else is searching" on both | The two devices are on different servers (for example one on `localhost`, one on the live site), or one isn't actually searching | Use the same address on both |
| "1 other person is searching, but none inside your radius" | Their location, as your device reports it, is further away than your radius. Laptops estimate location from the network and are often 5 to 50 km off | Choose a bigger radius, or Anywhere. The page already allows for the accuracy your device reports (up to 30 km), so this mostly means the device reported a position that looked more accurate than it was |
| "...their search radius is smaller than the distance between you" | The other side has a smaller radius, so they can't see you back | Widen the radius on the other device too |
| "Matched, but no video link" | Matching worked, the video can't connect. Usually a phone on mobile data and a laptop on Wi-Fi with no relay server | Set up a TURN provider (`TURN_API_KEY`, `TURN_DOMAIN`). The details box says whether one is configured. Text chat still works meanwhile |
| "Connection lost. Reconnecting..." | The connection dropped (screen lock, network change, redeploy). It reconnects by itself | Wait a few seconds |

For the live picture of the whole site, call `GET /admin/stats` with the admin token: it returns how many people are connected, how many are searching, and how many calls are in progress.

## ⚠️ Known limitations

- **Single process.** The map of live WebSocket connections lives in memory in one process. Scaling to multiple workers or instances needs that moved to something shared (Redis pub/sub) so a message can reach a user connected to a different process.
- **Video is sampled, not watched.** One still every 5 seconds means anything shown between samples is missed, and the screening can also flag harmless things. It lowers the risk, it does not remove it, and nobody watches calls live.
- **No CSAM detection or reporting pipeline.** The screening above is a general content check, it is **not** a detector for child sexual abuse material. That needs a vetted specialist provider (PhotoDNA, Thorn Safer), not a custom detector, plus real legal advice on reporting obligations for your jurisdiction. This is still a launch blocker for wide public use.
- **A call can't survive a dropped connection.** The page reconnects by itself (and checks the connection is really alive when a phone is unlocked or the network returns), then searches again. The other person is told you left and you're matched with someone new, not put back into the same call.
- **18+ is a checkbox.** Nothing verifies age. Two adults is the intended use, but a minor can click the same button.
- **Network addresses are visible during a call.** Direct video means each person's browser can see the other's IP address, which roughly reveals a city. Forcing every call through a TURN relay would hide it, at the cost of relaying all video traffic through your provider. The Privacy Policy says this plainly.
- **The legal pages are a plain-language starting point, not legal advice.** Have a lawyer read them, especially for Indian requirements around platforms (grievance contact) and personal data, before a wide launch. The contact address in both pages is `nearhi.in@gmail.com`; change it there if you ever move it.
- **Bans aren't unbreakable.** A `client_id` lives in `localStorage` and an IP can change, so someone determined enough can clear site data and switch networks to get a fresh identity. This raises the bar for casual repeat offenders, it doesn't stop a determined one. Nothing short of phone or ID verification does, and that's a much bigger product decision, not a bug fix.