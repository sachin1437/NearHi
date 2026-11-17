"""
Drop-in FastAPI router that receives flags from safety-monitor.js.

Add to your app:
    from safety_report import router as safety_router
    app.include_router(safety_router)

Stores flagged frames on disk (small JPEGs) and counts strikes per partner in
Redis. Adjust STRIKE_LIMIT and the action you take when it is reached.
"""
import base64
import json
import os
import time
import uuid

from fastapi import APIRouter, Request, Response

router = APIRouter()

EVIDENCE_DIR = os.environ.get("SAFETY_EVIDENCE_DIR", "/var/nearhi/evidence")
STRIKE_LIMIT = 3          # distinct flagged sessions before action
STRIKE_TTL = 24 * 3600    # strikes expire after a day
MAX_BODY = 200_000        # bytes, ignore anything bigger

os.makedirs(EVIDENCE_DIR, exist_ok=True)


@router.post("/api/safety/report")
async def safety_report(request: Request):
    raw = await request.body()
    if len(raw) > MAX_BODY:
        return Response(status_code=413)
    try:
        data = json.loads(raw)
    except ValueError:
        return Response(status_code=400)

    ctx = data.get("context") or {}
    partner_id = str(ctx.get("partnerId", "unknown"))[:64]
    reasons = [str(r)[:32] for r in (data.get("reasons") or [])][:6]
    action = data.get("action")
    report_id = uuid.uuid4().hex[:12]

    # Save the evidence frame, if one was sent
    frame = data.get("frame")
    if isinstance(frame, str) and frame.startswith("data:image/jpeg;base64,"):
        try:
            img = base64.b64decode(frame.split(",", 1)[1])
            with open(os.path.join(EVIDENCE_DIR, f"{int(time.time())}_{report_id}.jpg"), "wb") as f:
                f.write(img)
        except Exception:
            pass

    with open(os.path.join(EVIDENCE_DIR, "reports.jsonl"), "a") as f:
        f.write(json.dumps({
            "id": report_id, "ts": int(time.time()), "partner": partner_id,
            "action": action, "reasons": reasons, "medianAge": data.get("medianAge"),
        }) + "\n")

    # Strikes: only 'blur' flags count, 'report' flags are for human review.
    # Uncomment once you have a Redis handle `r` in scope:
    #
    # if action == "blur":
    #     key = f"strikes:{partner_id}"
    #     n = await r.incr(key)
    #     await r.expire(key, STRIKE_TTL)
    #     if n >= STRIKE_LIMIT:
    #         await r.set(f"banned:{partner_id}", 1, ex=7 * 24 * 3600)
    #         # then refuse to match this partner id / IP in your matcher
    #
    # Note: one viewer can lie about a partner. Count strikes from DIFFERENT
    # viewers (use a Redis set keyed by viewer id) before banning anyone.

    return Response(status_code=204)