/*
 * NearHi safety monitor (v0.1)
 *
 * Runs in the VIEWER's browser and watches the PARTNER's incoming video.
 * Because the sender cannot touch the viewer's client, this check cannot be
 * bypassed by editing the sender's JavaScript.
 *
 * Needs these globals loaded first (all self-hosted, see public/vendor):
 *   tf (tf.min.js), nsfwjs (nsfwjs.min.js), faceapi (face-api.js)
 *
 * Usage:
 *   const mon = NearHiSafety.create({
 *     video: document.getElementById('remoteVideo'),
 *     modelsBase: '/models',
 *     reportUrl: '/api/safety/report',
 *     getContext: () => ({ roomId, partnerId }),
 *     onFlag: (flag) => { ... skip partner, show message ... },
 *   });
 *   await mon.start();   // when a partner connects
 *   mon.stop();          // when the partner leaves (also clears blur)
 *
 * IMPORTANT: age estimation is a risk signal, not proof. It is noisy near the
 * 18 boundary. Tune the thresholds below on your own test images.
 */
(function (global) {
  'use strict';

  const DEFAULTS = {
    intervalMs: 2000,        // one analysis every 2 s keeps CPU low
    analysisSize: 320,       // frame is downscaled to this width before analysis
    modelsBase: '/models',
    reportUrl: null,
    // NSFW (nsfwjs classes: Drawing, Hentai, Neutral, Porn, Sexy)
    nsfwHardThreshold: 0.60, // Porn + Hentai at or above this: blur immediately
    nsfwSexyThreshold: 0.85, // Sexy alone at or above this: blur immediately
    nsfwSoftThreshold: 0.40, // Porn + Hentai + Sexy*0.5 at or above this: report only
    // Age (median of recent face readings, so one bad frame does nothing)
    ageWindow: 5,            // readings kept
    ageMinReadings: 3,       // need at least this many before acting
    minorBlurAge: 15,        // median below this: blur + report
    minorReportAge: 18,      // median below this: silent report for review
    minFaceScore: 0.5,       // ignore weak face detections
    // No face / camera covered
    noFaceFrames: 8,         // consecutive frames (about 16 s) with no face: inform only
    reportCooldownMs: 30000, // do not spam reports for the same partner
    sendFrameOnFlag: true,   // attach one small JPEG when a flag fires
  };

  function median(arr) {
    if (!arr.length) return null;
    const s = arr.slice().sort((a, b) => a - b);
    const m = Math.floor(s.length / 2);
    return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
  }

  /*
   * Pure decision function, no browser needed, so it can be unit tested.
   * state: { ages: number[], noFaceCount: number }
   * reading: { nsfw: {Porn, Hentai, Sexy, ...}, faces: [{age, score}] }
   * returns: { action: 'none'|'report'|'blur', reasons: string[], medianAge }
   */
  function decide(state, reading, cfg) {
    const reasons = [];
    let action = 'none';
    const bump = (a) => {
      const rank = { none: 0, report: 1, blur: 2 };
      if (rank[a] > rank[action]) action = a;
    };

    const n = reading.nsfw || {};
    const pornHentai = (n.Porn || 0) + (n.Hentai || 0);
    const sexy = n.Sexy || 0;
    if (pornHentai >= cfg.nsfwHardThreshold) { reasons.push('nsfw_explicit'); bump('blur'); }
    else if (sexy >= cfg.nsfwSexyThreshold) { reasons.push('nsfw_sexual'); bump('blur'); }
    else if (pornHentai + sexy * 0.5 >= cfg.nsfwSoftThreshold) { reasons.push('nsfw_suspect'); bump('report'); }

    const goodFaces = (reading.faces || []).filter((f) => f.score >= cfg.minFaceScore);
    if (goodFaces.length) {
      state.noFaceCount = 0;
      // Use the youngest face in frame, since the risk is any minor on camera.
      state.ages.push(Math.min(...goodFaces.map((f) => f.age)));
      if (state.ages.length > cfg.ageWindow) state.ages.shift();
    } else {
      state.noFaceCount += 1;
    }

    const medianAge = state.ages.length >= cfg.ageMinReadings ? median(state.ages) : null;
    if (medianAge !== null) {
      if (medianAge < cfg.minorBlurAge) { reasons.push('likely_minor'); bump('blur'); }
      else if (medianAge < cfg.minorReportAge) { reasons.push('possible_minor'); bump('report'); }
    }

    if (state.noFaceCount === cfg.noFaceFrames) reasons.push('no_face_long');

    return { action, reasons, medianAge };
  }

  function create(userCfg) {
    const cfg = Object.assign({}, DEFAULTS, userCfg);
    const video = cfg.video;
    if (!video) throw new Error('NearHiSafety: video element required');

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    let nsfwModel = null;
    let timer = null;
    let busy = false;
    let loaded = false;
    let state = { ages: [], noFaceCount: 0 };
    let lastReportAt = 0;
    let blurred = false;

    async function loadModels() {
      if (loaded) return;
      await tf.ready();
      nsfwModel = await nsfwjs.load(); // default MobileNetV2 is bundled in nsfwjs.min.js
      await faceapi.nets.tinyFaceDetector.loadFromUri(cfg.modelsBase);
      await faceapi.nets.ageGenderNet.loadFromUri(cfg.modelsBase);
      loaded = true;
    }

    function setBlur(on) {
      blurred = on;
      video.style.filter = on ? 'blur(40px) brightness(0.6)' : '';
    }

    function grabFrame() {
      const vw = video.videoWidth, vh = video.videoHeight;
      if (!vw || !vh) return false;
      const w = cfg.analysisSize;
      const h = Math.round((vh / vw) * w);
      canvas.width = w;
      canvas.height = h;
      ctx.drawImage(video, 0, 0, w, h);
      return true;
    }

    async function analyse() {
      if (busy || !loaded) return;
      if (document.hidden) return;                       // save CPU in background tabs
      if (video.paused || video.readyState < 2) return;  // no live frame
      if (!grabFrame()) return;
      busy = true;
      try {
        const preds = await nsfwModel.classify(canvas, 5);
        const nsfw = {};
        preds.forEach((p) => { nsfw[p.className] = p.probability; });

        const dets = await faceapi
          .detectAllFaces(canvas, new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.4 }))
          .withAgeAndGender();
        const faces = dets.map((d) => ({ age: d.age, score: d.detection.score }));

        const result = decide(state, { nsfw, faces }, cfg);
        if (result.action === 'blur' && !blurred) setBlur(true);
        if (result.action !== 'none') await flag(result, nsfw, faces);
      } catch (e) {
        console.warn('NearHiSafety analyse error', e);
      } finally {
        busy = false;
      }
    }

    async function flag(result, nsfw, faces) {
      const now = Date.now();
      const payload = {
        action: result.action,
        reasons: result.reasons,
        medianAge: result.medianAge,
        nsfw,
        faces,
        ts: now,
        context: cfg.getContext ? cfg.getContext() : {},
      };
      if (cfg.onFlag) { try { cfg.onFlag(payload); } catch (_) {} }
      if (!cfg.reportUrl) return;
      if (now - lastReportAt < cfg.reportCooldownMs) return;
      lastReportAt = now;
      if (cfg.sendFrameOnFlag) {
        // low-res, low-quality frame; only sent when a flag fires
        payload.frame = canvas.toDataURL('image/jpeg', 0.5);
      }
      try {
        await fetch(cfg.reportUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          keepalive: true,
        });
      } catch (_) { /* never break the call because a report failed */ }
    }

    return {
      async start() {
        await loadModels();
        state = { ages: [], noFaceCount: 0 };
        setBlur(false);
        clearInterval(timer);
        timer = setInterval(analyse, cfg.intervalMs);
      },
      stop() {
        clearInterval(timer);
        timer = null;
        state = { ages: [], noFaceCount: 0 };
        setBlur(false);
      },
      unblur() { setBlur(false); },
      isBlurred() { return blurred; },
      _analyseNow: analyse, // for tests
      _debug: () => ({ ages: state.ages.slice(), noFaceCount: state.noFaceCount }),
    };
  }

  global.NearHiSafety = { create, decide, DEFAULTS, _median: median };
})(typeof window !== 'undefined' ? window : globalThis);