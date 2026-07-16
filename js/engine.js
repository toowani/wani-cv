/* ============================================================
   WANI.SYS — VISUAL ENGINE (hardware UI edition)
   - 물고기 파티클: 커서를 따라 유영하는 파스텔 물고기 떼
   - 랜딩 수면 라인: 단색, 마우스·오디오 반응
   - 오디오 분석기(Web Audio API): ▶ AUDIO 버튼용
   - 떨어지는 모션 없음 / 글로우 없음
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

  const fxLevel = () => document.body.dataset.fx; // high | low | off

  /* ----- 파스텔 팔레트 — CSS 변수 추종 (테마/모드 전환 반영) ----- */
  let pal = ["#aad59e", "#b8cde6", "#cee1f3"];
  let palFrame = 0;
  function refreshPalette() {
    const cs = getComputedStyle(document.body);
    const read = (v, fb) => (cs.getPropertyValue(v).trim() || fb);
    pal = [
      read("--land1", "#aad59e"),
      read("--water1", "#b8cde6"),
      read("--water2", "#cee1f3"),
    ];
  }

  /* ============================================================
     AUDIO — Web Audio API 분석기 (track.mp3 없으면 idle 폴백)
     ============================================================ */
  const audioEl = document.getElementById("audio-el");
  let actx = null, analyser = null, freqData = null;
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
      audioReady = true;
    } catch (e) {
      console.warn("[WANI.SYS] audio init failed:", e);
    }
  }

  function getAmp() {
    if (audioReady && !audioEl.paused) {
      analyser.getByteFrequencyData(freqData);
      let sum = 0;
      for (let i = 0; i < freqData.length; i++) sum += freqData[i];
      return sum / freqData.length / 255;
    }
    return 0.1 + Math.sin(T * 1.3) * 0.04;
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
     FISH PARTICLES — 커서를 따라다니는 유영 물고기 떼
     ============================================================ */
  let particles = [];
  const mouse = { x: -9999, y: -9999, vx: 0, vy: 0, px: -9999, py: -9999, active: false };

  function particleCount() {
    const base = fxLevel() === "low" ? 22 : 60;
    return Math.min(base, Math.floor(W * H / 26000));
  }

  function initParticles() {
    const n = particleCount();
    particles = Array.from({ length: n }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.5, vy: (Math.random() - 0.5) * 0.5,
      r: 0.8 + Math.random() * 1.6,
      c: (Math.random() * 3) | 0,
      wob: Math.random() * 6.283,          // 유영 흔들림 위상
      follow: 0.15 + Math.random() * 0.85, // 개체별 추종 강도(느슨한 무리)
    }));
  }

  /* ---- 패닉: 악어 분노 폭발 → 화면 밖으로 도망 / 진정 → 가장자리에서 복귀 ---- */
  let panicMode = false;
  window.WANI_FISH = {
    panic(x, y) {
      panicMode = true;
      for (const p of particles) {
        const dx = p.x - x, dy = p.y - y;
        const d = Math.hypot(dx, dy) || 1;
        const burst = 9 + Math.random() * 5;
        p.vx = (dx / d) * burst;
        p.vy = (dy / d) * burst;
      }
    },
    calm() {
      panicMode = false;
      // 화면 밖 물고기는 가장 가까운 가장자리 바로 안쪽으로 — 도망간 방향에서 다시 모여듦
      for (const p of particles) {
        p.x = Math.max(-8, Math.min(W + 8, p.x));
        p.y = Math.max(-8, Math.min(H + 8, p.y));
        p.vx *= 0.1; p.vy *= 0.1;
      }
    },
  };

  function drawParticles(amp) {
    const speedCap = panicMode ? 15 : 3 + amp * 3.5;
    for (const p of particles) {
      p.wob += panicMode ? 0.3 : 0.05 + amp * 0.08;

      if (panicMode) {
        // 공포 — 파닥거리며 계속 바깥으로
        p.vx += Math.sin(p.wob * 3) * 0.3;
        p.vy += Math.cos(p.wob * 2.6) * 0.3;
      } else if (mouse.active) {
        // 커서를 향해 완만하게 조향
        const dx = mouse.x - p.x, dy = mouse.y - p.y;
        const dist = Math.hypot(dx, dy) || 1;
        if (dist > 60) {
          const steer = 0.02 * p.follow;
          p.vx += (dx / dist) * steer * Math.min(dist, 400) / 60;
          p.vy += (dy / dist) * steer * Math.min(dist, 400) / 60;
        } else {
          p.vx -= (dx / dist) * 0.03; // 개인 공간 유지
          p.vy -= (dy / dist) * 0.03;
        }
      }

      // S자 유영 (낙하 모션 없음)
      p.vx += Math.sin(p.wob) * 0.02;
      p.vy += Math.cos(p.wob * 0.7) * 0.012;

      const sp = Math.hypot(p.vx, p.vy);
      if (sp > speedCap) { p.vx = p.vx / sp * speedCap; p.vy = p.vy / sp * speedCap; }
      const damp = panicMode ? 0.995 : 0.98;
      p.vx *= damp; p.vy *= damp;
      p.x += p.vx; p.y += p.vy;

      if (panicMode) {
        // 화면 밖 일정 거리에서 대기 (순환 이동 없음 — 진짜 도망간 것처럼)
        p.x = Math.max(-260, Math.min(W + 260, p.x));
        p.y = Math.max(-260, Math.min(H + 260, p.y));
      } else {
        if (p.x < -10) p.x = W + 10; if (p.x > W + 10) p.x = -10;
        if (p.y < -10) p.y = H + 10; if (p.y > H + 10) p.y = -10;
      }

      // 이동 방향으로 길쭉한 스트로크 — 물고기
      const ang = Math.atan2(p.vy, p.vx);
      const len = p.r * (2 + Math.min(sp, 3));
      bgCtx.beginPath();
      bgCtx.moveTo(p.x + Math.cos(ang) * len, p.y + Math.sin(ang) * len);
      bgCtx.lineTo(p.x - Math.cos(ang) * len, p.y - Math.sin(ang) * len);
      bgCtx.strokeStyle = pal[p.c % pal.length];
      bgCtx.lineWidth = p.r;
      bgCtx.globalAlpha = 0.3 + amp * 0.3;
      bgCtx.lineCap = "round";
      bgCtx.stroke();
      bgCtx.globalAlpha = 1;
    }
  }

  /* ============================================================
     LANDING WATERLINE — 단색 수면 라인 (마우스에 반응)
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
        + Math.sin(x * 0.018 + T * 1.6) * (5 + amp * 18)
        + Math.sin(x * 0.043 - T * 2.3) * (2 + amp * 8)
        - g * bumpAmp * Math.sin(T * 6);
    };

    wlCtx.beginPath();
    for (let x = 0; x <= w; x += 4) {
      const y = yAt(x);
      x === 0 ? wlCtx.moveTo(x, y) : wlCtx.lineTo(x, y);
    }
    wlCtx.strokeStyle = pal[1];
    wlCtx.globalAlpha = 0.9;
    wlCtx.lineWidth = 1.5;
    wlCtx.stroke();
    wlCtx.globalAlpha = 1;
  }

  /* ============================================================
     MAIN LOOP (단일 rAF)
     ============================================================ */
  function frame() {
    T += 0.016;
    if (window.WANI_GAME?.isOpen()) {
      requestAnimationFrame(frame);
      return;
    }
    if (!running || fxLevel() === "off") {
      bgCtx.clearRect(0, 0, W, H);
      requestAnimationFrame(frame);
      return;
    }
    if (++palFrame % 30 === 0) refreshPalette(); // 테마/모드 전환 추종

    const amp = getAmp();
    bgCtx.clearRect(0, 0, W, H); // 잔상 없이 깔끔하게
    drawParticles(amp);
    drawWaterline(amp);

    mouse.vx *= 0.85; mouse.vy *= 0.85;
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

  refreshPalette();
  resize();
  requestAnimationFrame(frame);
})();

/* ============================================================
   ASCII SEA LIFE — 랜딩 물속 생물들
   - 대장 악어(#croc): 슬금슬금 배회 (겁 없음)
   - 나머지: 둥둥 떠다니다 커서가 다가오면 후다닥 도망
   ============================================================ */
(function () {
  "use strict";
  const landing = document.getElementById("landing");
  const crocEl = document.getElementById("croc");
  if (!landing) return;
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  /* 생물 도감 — [오른쪽 보기, 왼쪽 보기] (noflip은 방향 없음) */
  const ARTS = [
    { r: "><((('>", l: "<')))><", fs: 13 },
    { r: "><((('>", l: "<')))><", fs: 10 },
    { r: "><>", l: "<><", fs: 12 },
    { r: "><>", l: "<><", fs: 10 },
    { r: "<コ:彡", l: "彡:コ>", fs: 12 },
    { r: " .-.\n(   )\n )|(", l: " .-.\n(   )\n )|(", fs: 10, noflip: true },
    { r: "(\\/)(;,,;)(\\/)", l: "(\\/)(;,,;)(\\/)", fs: 9, noflip: true },
    { r: "o\n  O\n °", l: "o\n  O\n °", fs: 9, noflip: true },
  ];

  const box = document.createElement("div");
  box.id = "critters";
  box.setAttribute("aria-hidden", "true");
  landing.appendChild(box);

  const mx = { x: -9999, y: -9999 };
  window.addEventListener("pointermove", (e) => { mx.x = e.clientX; mx.y = e.clientY; }, { passive: true });

  let critters = [];
  function region() {
    // 물속 = 수면 아래
    return { x0: 8, x1: innerWidth - 60, y0: innerHeight * 0.56, y1: innerHeight * 0.92 };
  }
  function spawn() {
    box.innerHTML = "";
    const rg = region();
    critters = ARTS.map((a, i) => {
      const el = document.createElement("pre");
      el.className = "critter" + (i % 2 ? " alt" : "");
      el.style.fontSize = a.fs + "px";
      el.textContent = a.r;
      box.appendChild(el);
      return {
        a, el, dir: 1,
        x: rg.x0 + Math.random() * (rg.x1 - rg.x0),
        y: rg.y0 + Math.random() * (rg.y1 - rg.y0),
        vx: 0, vy: 0, tvx: 0, tvy: 0, wt: Math.random() * 100, gone: 0,
      };
    });
  }

  let T = 0;
  let crocAx = 0, crocAy = 0; // 악어 회피 오프셋 (스무딩)
  if (crocEl) crocEl.style.animation = "none"; // CSS 봅 대신 JS 드리프트로 통합

  function tick() {
    T += 0.016;
    if (landing.hidden || document.body.dataset.fx === "off") {
      requestAnimationFrame(tick);
      return;
    }

    /* 대장 악어 — 느긋한 배회 + 커서엔 살짝만 반응 (제자리 사수) */
    if (crocEl) {
      const wx = Math.sin(T * 0.13) * 26 + Math.sin(T * 0.047) * 16;
      const wy = Math.sin(T * 0.3) * 6 + Math.sin(T * 0.09) * 4;
      const r = crocEl.getBoundingClientRect();
      const dx = (r.left + r.width / 2) - mx.x;
      const dy = (r.top + r.height / 2) - mx.y;
      const d = Math.hypot(dx, dy);
      let ax = 0, ay = 0;
      if (d < 170 && d > 0.1) { // 몸을 슬쩍 트는 정도 (최대 ±30px)
        const f = (170 - d) / 170;
        ax = (dx / d) * f * 30;
        ay = (dy / d) * f * 16;
      }
      crocAx += (ax - crocAx) * 0.07;
      crocAy += (ay - crocAy) * 0.07;
      crocEl.style.transform =
        `translate(${(wx + crocAx).toFixed(1)}px, ${(wy + crocAy).toFixed(1)}px)`;
    }

    /* 겁쟁이 생물들 */
    const rg = region();
    for (const c of critters) {
      // 도망쳐서 화면 밖으로 나간 상태 — 잠시 쉬었다가 좌/우에서 재등장
      if (c.gone) {
        if (T >= c.gone) {
          c.gone = 0;
          const fromLeft = Math.random() < 0.5;
          c.x = fromLeft ? -70 : innerWidth + 70;
          c.y = rg.y0 + Math.random() * (rg.y1 - rg.y0);
          c.vx = c.tvx = fromLeft ? 0.9 : -0.9;
          c.vy = c.tvy = 0;
          c.wt = 200 + Math.random() * 200;
          if (!c.a.noflip) { c.dir = fromLeft ? 1 : -1; c.el.textContent = c.dir > 0 ? c.a.r : c.a.l; }
        } else {
          continue;
        }
      }
      // 한가로운 유영 목표 갱신
      if (--c.wt <= 0) {
        c.wt = 120 + Math.random() * 260;
        c.tvx = (Math.random() - 0.5) * 0.7;
        c.tvy = (Math.random() - 0.5) * 0.28;
      }
      c.vx += (c.tvx - c.vx) * 0.02;
      c.vy += (c.tvy - c.vy) * 0.02;

      // 커서 접근 → 후다닥
      const dx = c.x - mx.x, dy = c.y - mx.y;
      const d = Math.hypot(dx, dy);
      if (d < 150 && d > 0.1) {
        const f = (150 - d) / 150;
        c.vx += (dx / d) * f * 2.4;
        c.vy += (dy / d) * f * 1.5;
      }

      // 속도 상한 + 감쇠
      const sp = Math.hypot(c.vx, c.vy);
      if (sp > 8) { c.vx = c.vx / sp * 8; c.vy = c.vy / sp * 8; }
      if (sp > 1.2) { c.vx *= 0.96; c.vy *= 0.96; } // 도망 후 진정

      c.x += c.vx; c.y += c.vy;

      // 좌우로는 화면 밖까지 튕겨나갈 수 있음 — 완전히 나가면 잠수 타이머 시작
      if (c.x < -90 || c.x > innerWidth + 90) {
        c.gone = T + 1.5 + Math.random() * 3.5; // 1.5~5초 뒤 재등장
        c.el.style.transform = "translate(-9999px,-9999px)";
        continue;
      }
      // 상하(수면·바닥)는 못 넘음
      if (c.y < rg.y0) { c.y = rg.y0; c.vy = Math.abs(c.vy) * 0.6; }
      if (c.y > rg.y1) { c.y = rg.y1; c.vy = -Math.abs(c.vy) * 0.6; }

      // 진행 방향으로 몸 뒤집기
      if (!c.a.noflip) {
        const nd = c.vx > 0.08 ? 1 : c.vx < -0.08 ? -1 : c.dir;
        if (nd !== c.dir) { c.dir = nd; c.el.textContent = nd > 0 ? c.a.r : c.a.l; }
      }

      const bob = Math.sin(T * 1.4 + c.x * 0.02) * 2; // 둥둥
      c.el.style.transform = `translate(${c.x.toFixed(1)}px, ${(c.y + bob).toFixed(1)}px)`;
    }
    requestAnimationFrame(tick);
  }

  window.addEventListener("resize", spawn);
  spawn();
  requestAnimationFrame(tick);
})();
