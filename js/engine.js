/* ============================================================
   WANI.SYS — VISUAL ENGINE (amphibian edition)
   마우스 인터랙션: 파티클 유영 추종 — 파티클 떼가 물고기처럼
   커서를 따라 헤엄침 (리플/렌즈 없음)
   + 랜딩 수면 웨이브(마우스에 반응해 출렁임)
   + 오디오 재생 시 진폭/스펙트럼 반응 (Web Audio API)
   - 떨어지는 모션 없음
   - 단일 rAF 루프, DPR 1.5 상한, 탭 비활성/FX:OFF 시 정지
   ============================================================ */
(function () {
  "use strict";

  const bg = document.getElementById("bg-canvas");
  const wl = document.getElementById("waterline-canvas");
  const bgCtx = bg.getContext("2d");
  const wlCtx = wl ? wl.getContext("2d") : null;
  const DPR = Math.min(window.devicePixelRatio || 1, 1.5);

  let W = 0, H = 0;
  let running = true;
  let T = 0;

  /* ----- 모드별 팔레트 (CSS 변수와 동일) ----- */
  const PALETTES = {
    none:   ["#b6ff00", "#00e5ff", "#2979ff"],
    dev:    ["#b6ff00", "#ffb300", "#ff6a00"],   // 땅: 라임/앰버/오렌지
    artist: ["#00e5ff", "#2979ff", "#9ff7ff"],   // 물: 시안/딥블루/아쿠아
  };
  const palette = () => PALETTES[document.body.dataset.mode] || PALETTES.none;
  const fxLevel = () => document.body.dataset.fx; // high | low | off
  const mode = () => document.body.dataset.mode;

  /* ============================================================
     AUDIO — Web Audio API 분석기 (track.mp3 없으면 idle 폴백)
     ============================================================ */
  const audioEl = document.getElementById("audio-el");
  let actx = null, analyser = null, freqData = null, timeData = null;
  let audioReady = false;

  function initAudio() {
    if (actx) return;
    try {
      actx = new (window.AudioContext || window.webkitAudioContext)();
      const src = actx.createMediaElementSource(audioEl);
      analyser = actx.createAnalyser();
      analyser.fftSize = 256;
      src.connect(analyser);
      analyser.connect(actx.destination);
      freqData = new Uint8Array(analyser.frequencyBinCount);
      timeData = new Uint8Array(analyser.fftSize);
      audioReady = true;
    } catch (e) {
      console.warn("[WANI.SYS] audio init failed:", e);
    }
  }

  function getAudioState() {
    if (audioReady && !audioEl.paused) {
      analyser.getByteFrequencyData(freqData);
      analyser.getByteTimeDomainData(timeData);
      let sum = 0;
      for (let i = 0; i < freqData.length; i++) sum += freqData[i];
      return { amp: sum / freqData.length / 255, spectrum: freqData, live: true };
    }
    const amp = 0.1 + Math.sin(T * 1.3) * 0.04 + Math.random() * 0.015;
    return { amp, spectrum: null, live: false };
  }

  window.WANI_AUDIO = {
    toggle() {
      initAudio();
      if (!audioReady) return Promise.reject(new Error("no-audio"));
      if (actx.state === "suspended") actx.resume();
      if (audioEl.paused) return audioEl.play();
      audioEl.pause();
      return Promise.resolve("paused");
    },
    isPlaying() { return audioReady && !audioEl.paused; },
  };

  /* ============================================================
     PARTICLES — 유영 추종 (물고기 떼처럼 커서를 따라다님)
     ============================================================ */
  let particles = [];
  const mouse = { x: -9999, y: -9999, vx: 0, vy: 0, px: -9999, py: -9999, active: false };

  function particleCount() {
    const base = fxLevel() === "low" ? 45 : 130;
    return Math.min(base, Math.floor(W * H / 12000));
  }

  function initParticles() {
    const n = particleCount();
    particles = Array.from({ length: n }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.5, vy: (Math.random() - 0.5) * 0.5,
      r: 1 + Math.random() * 2.4,
      c: (Math.random() * 3) | 0,
      wob: Math.random() * 6.283,          // 유영 흔들림 위상
      follow: 0.15 + Math.random() * 0.85, // 개체별 추종 강도(느슨한 무리)
    }));
  }

  function drawParticles(amp) {
    const pal = palette();
    const m = mode();
    const speedCap = 3.2 + amp * 4;

    for (const p of particles) {
      p.wob += 0.05 + amp * 0.1;

      // --- 유영 추종: 커서를 향해 완만하게 조향 ---
      if (mouse.active) {
        const dx = mouse.x - p.x, dy = mouse.y - p.y;
        const dist = Math.hypot(dx, dy) || 1;
        if (dist > 60) { // 너무 가까우면 몰리지 않게
          const steer = 0.02 * p.follow;
          p.vx += (dx / dist) * steer * Math.min(dist, 400) / 60;
          p.vy += (dy / dist) * steer * Math.min(dist, 400) / 60;
        } else {
          p.vx -= (dx / dist) * 0.03; // 개인 공간 유지
          p.vy -= (dy / dist) * 0.03;
        }
      }

      // --- 모드별 유영 습성 (낙하 모션 없음) ---
      if (m === "artist") p.vy -= 0.008;  // 물: 기포처럼 살짝 떠오름
      p.vx += Math.sin(p.wob) * 0.02;     // S자 유영
      p.vy += Math.cos(p.wob * 0.7) * 0.012;

      // 속도 제한 + 감쇠
      const sp = Math.hypot(p.vx, p.vy);
      if (sp > speedCap) { p.vx = p.vx / sp * speedCap; p.vy = p.vy / sp * speedCap; }
      p.vx *= 0.98; p.vy *= 0.98;
      p.x += p.vx; p.y += p.vy;

      // 화면 순환
      if (p.x < -10) p.x = W + 10; if (p.x > W + 10) p.x = -10;
      if (p.y < -10) p.y = H + 10; if (p.y > H + 10) p.y = -10;

      // 그리기 — 이동 방향으로 길쭉하게 (물고기 느낌)
      const ang = Math.atan2(p.vy, p.vx);
      const len = p.r * (2 + Math.min(sp, 3));
      bgCtx.beginPath();
      bgCtx.moveTo(p.x + Math.cos(ang) * len, p.y + Math.sin(ang) * len);
      bgCtx.lineTo(p.x - Math.cos(ang) * len, p.y - Math.sin(ang) * len);
      bgCtx.strokeStyle = pal[p.c % pal.length];
      bgCtx.lineWidth = p.r * (1 + amp);
      bgCtx.globalAlpha = 0.4 + amp * 0.45;
      bgCtx.lineCap = "round";
      bgCtx.stroke();
      bgCtx.globalAlpha = 1;
    }
  }

  /* ============================================================
     SPECTRUM BARS (하단, 오디오 반응)
     ============================================================ */
  function drawSpectrum(state) {
    const pal = palette();
    const n = 48, bw = W / n;
    for (let i = 0; i < n; i++) {
      let v;
      if (state.spectrum) {
        v = state.spectrum[(i * state.spectrum.length / n) | 0] / 255;
      } else {
        v = state.amp * (0.4 + 0.6 * Math.abs(Math.sin(T * 2 + i * 0.4)));
      }
      const h = v * H * 0.2;
      const grad = bgCtx.createLinearGradient(0, H, 0, H - h);
      grad.addColorStop(0, pal[0]);
      grad.addColorStop(1, pal[1]);
      bgCtx.fillStyle = grad;
      bgCtx.globalAlpha = 0.32;
      bgCtx.fillRect(i * bw + 1, H - h, bw - 2, h);
      bgCtx.globalAlpha = 1;
    }
    if (state.spectrum && timeData) {
      bgCtx.beginPath();
      bgCtx.strokeStyle = pal[2];
      bgCtx.globalAlpha = 0.5;
      bgCtx.lineWidth = 1.5;
      for (let i = 0; i < timeData.length; i += 4) {
        const x = i / timeData.length * W;
        const y = H * 0.5 + (timeData[i] - 128) / 128 * H * 0.15;
        i === 0 ? bgCtx.moveTo(x, y) : bgCtx.lineTo(x, y);
      }
      bgCtx.stroke();
      bgCtx.globalAlpha = 1;
    }
  }

  /* ============================================================
     LANDING WATERLINE — 수면 웨이브 (마우스에 반응)
     ============================================================ */
  function drawWaterline(amp) {
    const landing = document.getElementById("landing");
    if (!wlCtx || !landing || landing.hidden) return;
    const rect = wl.getBoundingClientRect();
    const w = rect.width, h = rect.height, mid = h / 2;
    wlCtx.clearRect(0, 0, w, h);

    const localMx = mouse.x;
    const speed = Math.min(Math.hypot(mouse.vx, mouse.vy), 30);
    const bumpAmp = mouse.active ? 10 + speed * 1.2 : 0;

    const yAt = (x) => {
      const g = Math.exp(-((x - localMx) ** 2) / (2 * 90 * 90));
      return mid
        + Math.sin(x * 0.018 + T * 1.6) * (6 + amp * 22)
        + Math.sin(x * 0.043 - T * 2.3) * (3 + amp * 10)
        - g * bumpAmp * Math.sin(T * 6);
    };

    // 수면 아래 채움 (물)
    wlCtx.beginPath();
    for (let x = 0; x <= w; x += 4) {
      const y = yAt(x);
      x === 0 ? wlCtx.moveTo(x, y) : wlCtx.lineTo(x, y);
    }
    wlCtx.lineTo(w, h); wlCtx.lineTo(0, h); wlCtx.closePath();
    const grad = wlCtx.createLinearGradient(0, mid - 20, 0, h);
    grad.addColorStop(0, "rgba(0,229,255,0.30)");
    grad.addColorStop(1, "rgba(41,121,255,0.02)");
    wlCtx.fillStyle = grad;
    wlCtx.fill();

    // 수면 라인
    wlCtx.beginPath();
    for (let x = 0; x <= w; x += 4) {
      const y = yAt(x);
      x === 0 ? wlCtx.moveTo(x, y) : wlCtx.lineTo(x, y);
    }
    wlCtx.strokeStyle = "#00e5ff";
    wlCtx.globalAlpha = 0.9;
    wlCtx.lineWidth = 1.5;
    wlCtx.shadowColor = "#00e5ff";
    wlCtx.shadowBlur = 8;
    wlCtx.stroke();
    wlCtx.shadowBlur = 0;
    wlCtx.globalAlpha = 1;
  }

  /* ============================================================
     MAIN LOOP (단일 rAF)
     ============================================================ */
  function frame() {
    T += 0.016;
    // 게임 오버레이가 열려 있으면 배경 연산 전부 스킵 (GPU 절약)
    if (window.WANI_GAME?.isOpen()) {
      requestAnimationFrame(frame);
      return;
    }
    if (!running || fxLevel() === "off") {
      bgCtx.fillStyle = "#050507";
      bgCtx.fillRect(0, 0, W, H);
      requestAnimationFrame(frame);
      return;
    }
    const state = getAudioState();

    // 잔상 페이드
    bgCtx.fillStyle = "rgba(5,5,7,0.16)";
    bgCtx.fillRect(0, 0, W, H);

    drawParticles(state.amp);
    drawSpectrum(state);
    drawWaterline(state.amp);

    // 마우스 속도 감쇠 (수면 범프 계산용)
    mouse.vx *= 0.85; mouse.vy *= 0.85;

    document.documentElement.style.setProperty("--amp", state.amp.toFixed(3));
    requestAnimationFrame(frame);
  }

  /* ----- resize / visibility / pointer ----- */
  function resize() {
    W = window.innerWidth; H = window.innerHeight;
    bg.width = W * DPR; bg.height = H * DPR;
    bg.style.width = W + "px"; bg.style.height = H + "px";
    bgCtx.setTransform(DPR, 0, 0, DPR, 0, 0);
    if (wl) {
      const rect = wl.getBoundingClientRect();
      wl.width = rect.width; wl.height = rect.height;
    }
    initParticles();
  }
  window.addEventListener("resize", resize);
  document.addEventListener("visibilitychange", () => { running = !document.hidden; });

  window.addEventListener("pointermove", (e) => {
    mouse.vx = e.clientX - (mouse.px === -9999 ? e.clientX : mouse.px);
    mouse.vy = e.clientY - (mouse.py === -9999 ? e.clientY : mouse.py);
    mouse.px = mouse.x = e.clientX;
    mouse.py = mouse.y = e.clientY;
    mouse.active = true;
    document.documentElement.style.setProperty("--mx", (e.clientX / W).toFixed(3));
    document.documentElement.style.setProperty("--my", (e.clientY / H).toFixed(3));
  }, { passive: true });

  window.addEventListener("pointerleave", () => { mouse.active = false; });

  resize();
  requestAnimationFrame(frame);
})();
