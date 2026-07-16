/* ============================================================
   WANI.SYS — LIFE MAP (journey mode)
   data.js의 dev/artist 활동을 연대순으로 자동 수집해
   왼쪽(과거)→오른쪽(현재) 모험 지도를 그림.
   세로 스크롤 → 지도가 가로로 흐르고 악어가 경로를 따라 걸음.
   경로 위 = 개발(땅) / 아래 = 음악·영상(물)
   ============================================================ */
(function () {
  "use strict";

  const section = document.getElementById("journey");
  const track = document.getElementById("jy-track");
  const svg = document.getElementById("jy-svg");
  const nodesEl = document.getElementById("jy-nodes");
  const croc = document.getElementById("jy-croc");
  const hint = document.getElementById("jy-hint");
  const yearEl = document.getElementById("jy-year");
  let curYear = "";

  let W = 0, H = 0, trackW = 0, PAD0 = 0, PAD1 = 0;
  let nodes = [];   // { x, y, el }
  let walkT = null;

  const lang = () => document.body.dataset.lang || "ko";
  const loc = (v) => (v && typeof v === "object") ? v[lang()] : v;

  /* ---------- data.js에서 이벤트 자동 수집 (연도순 정렬) ---------- */
  function collect() {
    const evs = [];
    const push = (side, it) => {
      const yRaw = loc(it.year) ?? "";
      const m = String(yRaw).match(/(\d{4})(?:\.(\d{1,2}))?/);
      if (!m) return;
      evs.push({
        side,
        sort: +m[1] * 100 + (+(m[2] || 1)),
        year: yRaw,
        title: loc(it.title) ?? "",
        sub: loc(it.sub) ?? "",
        desc: loc(it.desc) ?? "",
        tags: it.tags || [],
      });
    };
    const HAS_ITEMS = ["cards", "list", "tracks", "timeline"];
    for (const sec of SITE_DATA.dev.sections)
      if (HAS_ITEMS.includes(sec.type))
        sec.items.forEach((it) => push("land", it));
    for (const sec of SITE_DATA.artist.sections)
      if (HAS_ITEMS.includes(sec.type))
        sec.items.forEach((it) => push("water", it));
    evs.sort((a, b) => b.sort - a.sort); // 최신 먼저 — NOW에서 출발해 과거로 거슬러 걷기
    return evs;
  }

  /* ---------- 경로: 완만한 이중 사인파 ---------- */
  const pathY = (x) =>
    H * 0.5 + Math.sin(x * 0.0038) * 32 + Math.sin(x * 0.0011 + 2) * 20;

  /* ---------- 지도 빌드 ---------- */
  function build() {
    W = window.innerWidth;
    H = window.innerHeight;
    const mobile = W <= 720;
    const SP = mobile ? 270 : 350;          // 이벤트 간격
    const CARD_EST = mobile ? 200 : 195;    // 카드 높이 추정치 (겹침 방지 클램프용)
    const TOP_SAFE = mobile ? 78 : 92;      // HUD+티커 아래 안전선
    const BOT_SAFE = 62;                    // 하단 티커 위 안전선
    PAD0 = Math.max(W * 0.45, 280);
    PAD1 = Math.max(W * 0.55, 320);

    const evs = collect();
    trackW = PAD0 + evs.length * SP + PAD1;
    track.style.width = trackW + "px";
    // 세로 스크롤 길이 = 가로 이동량 + 화면 한 장
    section.style.height = (trackW - W + H) + "px";

    /* 경로 SVG */
    let d = "";
    for (let x = 0; x <= trackW; x += 8)
      d += (x ? "L" : "M") + x + " " + pathY(x).toFixed(1);
    svg.setAttribute("viewBox", `0 0 ${trackW} ${H}`);
    svg.setAttribute("width", trackW);
    svg.setAttribute("height", H);
    svg.innerHTML = `
      <defs>
        <linearGradient id="jy-grad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stop-color="#8f8d86"/>
          <stop offset="1" stop-color="#8f8d86"/>
        </linearGradient>
      </defs>
      <path d="${d}" fill="none" stroke="url(#jy-grad)" stroke-width="2"
            stroke-dasharray="10 9" opacity=".75"/>`;

    /* 노드 + 카드 */
    const ui = SITE_DATA.ui[lang()];
    const stems = mobile ? [62, 148] : [80, 178];
    const laneIdx = { land: 0, water: 0 };
    let html = "";
    nodes = evs.map((ev, i) => {
      const x = PAD0 + i * SP + SP / 2;
      const y = pathY(x);
      let stem = stems[laneIdx[ev.side] % 2];
      laneIdx[ev.side]++;
      // 화면 밖(HUD·티커)으로 나가지 않게 스템 클램프
      if (ev.side === "land") stem = Math.max(52, Math.min(stem, y - TOP_SAFE - CARD_EST));
      else stem = Math.max(52, Math.min(stem, (H - BOT_SAFE) - y - CARD_EST));

      const pos = ev.side === "land"
        ? `bottom:${(H - y + stem).toFixed(0)}px`
        : `top:${(y + stem).toFixed(0)}px`;
      html += `
        <span class="jy-dot ${ev.side}" style="left:${x}px;top:${y.toFixed(0)}px"></span>
        <span class="jy-stem ${ev.side}" style="left:${x}px;height:${stem}px;${
          ev.side === "land" ? `bottom:${(H - y).toFixed(0)}px` : `top:${y.toFixed(0)}px`}"></span>
        <article class="jy-card ${ev.side}" data-i="${i}" style="left:${x}px;${pos}">
          <div class="jy-year">${ev.year}</div>
          <h3 class="jy-title">${ev.title}</h3>
          ${ev.sub ? `<div class="jy-sub">${ev.sub}</div>` : ""}
          ${ev.desc ? `<p class="jy-desc">${ev.desc}</p>` : ""}
          ${ev.tags.length ? `<div class="jy-tags">${ev.tags.map((t) => `<span>${t}</span>`).join("")}</div>` : ""}
        </article>`;
      return { x, y, yr: Math.floor(ev.sort / 100) };
    });
    curYear = ""; // 리빌드 시 연도 배경 갱신 강제

    /* 깃발: 왼쪽 = NOW(출발), 오른쪽 = 2022(여행의 시작점) + 종점 CTA */
    const xS = PAD0 * 0.5, xE = trackW - PAD1 * 0.55;
    html += `
      <div class="jy-flag end" style="left:${xS}px;top:${pathY(xS).toFixed(0)}px">⚑ ${ui.jyNow}</div>
      <div class="jy-flag" style="left:${xE}px;top:${pathY(xE).toFixed(0)}px">⚑ ${ui.jyStart}</div>
      <div class="jy-cta" style="left:${xE}px;top:${(pathY(xE) + 56).toFixed(0)}px">
        <button data-jy-go="dev">▲ DEV_WANI</button>
        <button data-jy-go="artist">▼ ARTIST_WANI</button>
      </div>`;

    nodesEl.innerHTML = html;
    nodes.forEach((n, i) => { n.el = nodesEl.querySelector(`.jy-card[data-i="${i}"]`); });
    update();
  }

  /* ---------- 스크롤 → 악어 워크 + 카메라 (관성 물리: 미끄러지듯 가감속) ---------- */
  let curX = 0, velX = 0;

  function scrollTarget() {
    const scrollable = section.offsetHeight - H;
    const p = Math.min(1, Math.max(0, (window.scrollY - section.offsetTop) / (scrollable || 1)));
    // 양끝 깃발과 겹치지 않게 살짝 안쪽에서 출발·도착
    const x0 = PAD0 * 0.5 + 130, x1 = trackW - PAD1 * 0.55 - 130;
    return { x: x0 + p * (x1 - x0), p, x0, x1 };
  }

  function render(p) {
    const y = pathY(curX);
    const slope = (pathY(curX + 8) - pathY(curX - 8)) / 16;

    croc.style.left = curX.toFixed(1) + "px";
    croc.style.top = y.toFixed(1) + "px";
    croc.style.setProperty("--tilt", (Math.atan(slope) * 57.3 * 0.7).toFixed(1) + "deg");

    const cam = Math.min(Math.max(curX - W * 0.42, 0), Math.max(trackW - W, 0));
    track.style.transform = `translate3d(${-cam.toFixed(1)}px,0,0)`;

    // 악어와 가까운 카드 하이라이트 + 현재 위치의 연도
    let bestYr = "", bestD = Infinity;
    for (const n of nodes) {
      const d = Math.abs(n.x - curX);
      n.el.classList.toggle("near", d < 190);
      if (d < bestD) { bestD = d; bestYr = String(n.yr); }
    }
    if (bestYr && bestYr !== curYear) {
      curYear = bestYr;
      yearEl.textContent = bestYr;
      yearEl.classList.remove("tick");
      void yearEl.offsetWidth; // 애니메이션 재시작
      yearEl.classList.add("tick");
    }

    hint.classList.toggle("off", p > 0.03);
  }

  /* build 직후·리사이즈 시 — 글라이드 없이 즉시 위치 맞춤 */
  let prevTX = 0, lastDir = 1;
  function update() {
    if (section.hidden || !trackW) return;
    const t = scrollTarget();
    curX = t.x; velX = 0; prevTX = t.x;
    render(t.p);
  }

  /* 장난감 자동차 물리: 스크롤 변화량 = 미는 힘(임펄스), 이후 마찰로만 감속하며 관성 주행.
     k = (1-마찰)로 맞춰서 정속 스크롤 중엔 스크롤 속도 그대로 따라가고(고무줄 랙 없음),
     멈추면 남은 속도로 스르륵 미끄러지다 정지 */
  const FRICTION = 0.93;
  const PUSH = 1 - FRICTION; // 정속 스크롤 시 속도 1:1 수렴 조건
  (function tick() {
    if (!section.hidden && trackW) {
      const t = scrollTarget();
      const err = t.x - curX;
      const dT = t.x - prevTX;
      if (dT !== 0) lastDir = Math.sign(dT); // 마지막 스크롤 진행 방향
      velX += dT * PUSH; // 스크롤이 민 만큼만 가속 (임펄스)
      // 견인은 목표가 '진행 방향 앞'에 있을 때만 — 지나쳤으면 그 자리에 정지 (되돌아오는 역주행 금지)
      if (err * lastDir > 0) velX += err * 0.0012;
      prevTX = t.x;
      velX *= FRICTION;              // 바닥 마찰 — 미끄러지며 감속
      velX = Math.max(-70, Math.min(70, velX));

      let moved = false;
      if (Math.abs(velX) > 0.02 || Math.abs(err) > 0.5) { curX += velX; moved = true; }

      curX = Math.max(t.x0, Math.min(t.x1, curX)); // 경계 밖으로 미끄러지지 않게
      if (moved) render(t.p);
      croc.classList.toggle("walk", Math.abs(velX) > 0.4); // 걷는 동안 다리 유지
    }
    requestAnimationFrame(tick);
  })();

  /* ---------- 카드 탭 → 설명 펼치기 / 종점 CTA ---------- */
  nodesEl.addEventListener("click", (e) => {
    const go = e.target.closest("[data-jy-go]");
    if (go) { window.WANI_NAV?.setMode(go.dataset.jyGo); return; }
    const card = e.target.closest(".jy-card");
    if (card) card.classList.toggle("open");
  });

  /* ---------- listeners ---------- */
  /* 스크롤은 관성 루프(tick)가 매 프레임 목표를 읽으므로 별도 리스너 불필요 */
  let rsT = null;
  window.addEventListener("resize", () => {
    if (section.hidden) return;
    clearTimeout(rsT);
    rsT = setTimeout(build, 150);
  });

  window.WANI_JOURNEY_MAP = { build, update };
})();
