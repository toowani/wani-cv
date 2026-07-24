/* ============================================================
   WANI.SYS — MAIN CONTROLLER
   부팅 시퀀스 / 모드 전환 / KO·EN 렌더링 / FX 설정 / 스크롤 연출
   ============================================================ */
(function () {
  "use strict";

  const $ = (s) => document.querySelector(s);
  const body = document.body;

  /* ---------- 상태 (localStorage에 저장) ---------- */
  let lang = localStorage.getItem("wani-lang") || "ko";
  let fx = localStorage.getItem("wani-fx") ||
    (matchMedia("(prefers-reduced-motion: reduce)").matches ? "off" : "high");
  let mode = "none"; // "dev" | "artist"
  let theme = localStorage.getItem("wani-theme") || "dark";

  body.dataset.lang = lang;
  body.dataset.fx = fx;
  if (theme === "light") body.dataset.theme = "light";

  /* ============================================================
     BOOT SEQUENCE — 터미널 부팅 연출
     ============================================================ */
  const BOOT_LINES = [
    "WANI.SYS v5.0",
    "> init display .................... OK",
    "> load profile .................... KIM CHANGWAN / GIST EECS",
    "> load modules .................... ML · DSP · AUDIO",
    "> mount /dev  (engineering) ....... OK",
    "> mount /wav  (music) ............. OK",
    "        _   _",
    "      _(o)_(o)_",
    "  ~~~/  ~ ~ ~  \\_____.~~~",
    "> handle .......................... @toowani",
    "> READY.",
  ];
  function runBoot() {
    const boot = $("#boot");
    const log = $("#boot-log");
    const fill = $("#boot-bar-fill");
    // 같은 세션 재방문이면 축약 부팅 (짜증 방지)
    const revisit = sessionStorage.getItem("wani-booted");
    const speed = fx === "off" ? 30 : (revisit ? 45 : 170);
    let i = 0, iv = null;

    function finish() {
      clearInterval(iv);
      window.removeEventListener("keydown", skip);
      boot.removeEventListener("pointerdown", skip);
      sessionStorage.setItem("wani-booted", "1");
      boot.classList.add("done");
      setTimeout(() => boot.remove(), 700);
    }
    function skip() {
      log.textContent = BOOT_LINES.join("\n") + "\n";
      fill.style.width = "100%";
      finish();
    }
    // 클릭/키 입력으로 즉시 스킵
    boot.addEventListener("pointerdown", skip);
    window.addEventListener("keydown", skip);

    iv = setInterval(() => {
      if (i < BOOT_LINES.length) {
        log.textContent += BOOT_LINES[i] + "\n";
        fill.style.width = ((i + 1) / BOOT_LINES.length * 100) + "%";
        i++;
      } else {
        setTimeout(finish, 350);
        clearInterval(iv);
      }
    }, speed);
  }

  /* ============================================================
     i18n — UI 라벨 적용
     ============================================================ */
  function applyUI() {
    const ui = SITE_DATA.ui[lang];
    document.querySelectorAll("[data-ui]").forEach((el) => {
      const key = el.dataset.ui;
      if (ui[key] !== undefined) el.innerHTML = ui[key];
    });
    $("#btn-lang").textContent = lang === "ko" ? "KO → EN" : "EN → KO";
    document.documentElement.lang = lang;
  }

  /* ============================================================
     CONTENT RENDER — data.js → DOM
     ============================================================ */
  function esc(s) { return s; } // data.js는 신뢰된 로컬 콘텐츠 (span 등 마크업 허용)
  /* 문자열 또는 {ko,en} 객체 모두 허용 */
  function loc(v) { return (v && typeof v === "object") ? v[lang] : v; }

  function renderCards(items) {
    return `<div class="card-grid">` + items.map((it) => `
      <article class="card reveal">
        ${it.year ? `<div class="card-year">${loc(it.year)}</div>` : ""}
        <h3 class="card-title">${esc(it.title[lang] ?? it.title)}</h3>
        ${it.sub ? `<div class="card-sub">${loc(it.sub)}</div>` : ""}
        <p class="card-desc">${esc(it.desc?.[lang] ?? "")}</p>
        ${it.tags ? `<div class="card-tags">${it.tags.map((t) => `<span class="tag">${t}</span>`).join("")}</div>` : ""}
        ${it.link ? `<a class="card-link" href="${it.link.url}" target="_blank" rel="noopener">${it.link.label[lang]}</a>` : ""}
      </article>`).join("") + `</div>`;
  }

  /* DEV — 아카이브/레포 목록형 1열 리스트 (고밀도) */
  function renderList(items) {
    return `<div class="dev-list">` + items.map((it) => `
      <article class="dl-row reveal">
        <div class="dl-meta">${loc(it.year) ?? ""}</div>
        <div class="dl-main">
          <h3 class="dl-title">${esc(it.title[lang] ?? it.title)}</h3>${it.sub ? `<span class="dl-sub">${loc(it.sub)}</span>` : ""}
          <p class="dl-desc">${esc(it.desc?.[lang] ?? "")}</p>
          <div class="dl-foot">
            ${it.tags ? it.tags.map((t) => `<span class="dl-tag">[${t}]</span>`).join("") : ""}
            ${it.link ? `<a href="${it.link.url}" target="_blank" rel="noopener">${it.link.label[lang]} ↗</a>` : ""}
          </div>
        </div>
      </article>`).join("") + `</div>`;
  }

  /* ARTIST — 앨범 크레딧형 트랙리스트 (큰 타이포) */
  function renderTracks(items, secIdx) {
    const side = String.fromCharCode(65 + (secIdx % 26)); // A, B, C…
    return `<div class="tracklist">` + items.map((it, i) => `
      <article class="trk reveal">
        <div class="trk-no">${side}${i + 1}</div>
        <div class="trk-main">
          <h3 class="trk-title">${esc(it.title[lang] ?? it.title)}</h3>
          <div class="trk-meta">${it.year ? `<span class="trk-year">${loc(it.year)}</span>` : ""}${it.sub ? loc(it.sub) : ""}</div>
          <p class="trk-desc">${esc(it.desc?.[lang] ?? "")}</p>
          ${it.tags ? `<div class="trk-credits">${it.tags.map((t) => `<span>${t}</span>`).join("")}</div>` : ""}
          ${it.link ? `<a class="trk-link" href="${it.link.url}" target="_blank" rel="noopener">${it.link.label[lang]}</a>` : ""}
        </div>
      </article>`).join("") + `</div>`;
  }

  function renderTimeline(items) {
    return `<div class="timeline">` + items.map((it) => `
      <div class="tl-item reveal">
        <div class="tl-year">${it.year}</div>
        <div class="tl-title">${esc(it.title[lang])}</div>
        <div class="tl-desc">${esc(it.desc[lang])}</div>
      </div>`).join("") + `</div>`;
  }

  /* 성적표 — 학기별 접이식(details) + GPA 요약 */
  function gradeClass(g) {
    if (g === "A+") return "ap";
    if (g === "A0") return "a0";
    if (g === "B+" || g === "B0") return "b";
    return "s"; // S / P 등
  }
  function renderTranscript(sec) {
    let html = `<p class="tr-summary reveal">${sec.summary[lang]}</p><div class="tr-list">`;
    for (const s of sec.semesters) {
      if (s.gap) {
        html += `<div class="tr-gap reveal">${s.name[lang]}</div>`;
        continue;
      }
      html += `<details class="tr-sem reveal"${s.open ? " open" : ""}>
        <summary><span class="tr-sem-name">${s.name[lang]}</span><span class="tr-sem-stat">${s.stat[lang]}</span></summary>
        <table class="tr-table">
          <thead><tr><th>Code</th><th>${lang === "ko" ? "과목" : "Course"}</th><th>Cr.</th><th>Grade</th></tr></thead>
          <tbody>` +
        s.courses.map((c) => `<tr>
            <td class="tr-code">${c[0]}</td>
            <td class="tr-title">${lang === "ko" ? c[1] : c[2]}</td>
            <td>${c[3]}</td>
            <td class="tr-grade g-${gradeClass(c[4])}">${c[4]}</td>
          </tr>`).join("") +
        `</tbody></table></details>`;
    }
    return html + `</div>`;
  }

  function renderLinks(items, note) {
    return `<div class="links-row">` + items.map((it) =>
      `<a class="link-big reveal" href="${it.url}" target="_blank" rel="noopener">${it.label}</a>`
    ).join("") + `</div>` +
    (note ? `<p class="links-note reveal">${note[lang]}</p>` : "");
  }

  function renderMode(m) {
    const data = SITE_DATA[m];
    const content = $("#content");
    let num = 0;
    const pad = (n) => String(n).padStart(2, "0");

    let html = `
      <section class="section-block reveal" id="sec-about">
        <div class="section-head">
          <span class="section-num">${pad(++num)}</span>
          <h2 class="section-title glitch-text" data-text="${m === "dev" ? "ABOUT.EXE" : "ABOUT.WAV"}">${m === "dev" ? "ABOUT.EXE" : "ABOUT.WAV"}</h2>
        </div>
        <div class="section-ghost">${m === "dev" ? "DEV" : "ARTIST"}</div>
        <div class="term-box">${data.intro[lang].map((l) =>
          l.startsWith("$") ? `<div><span class="prompt">${l}</span></div>` : `<div>${l}</div>`
        ).join("")}<span class="cursor-blink"></span></div>
      </section>
      <p class="audio-hint reveal">${SITE_DATA.ui[lang].audioHint}</p>`;

    let trackSec = 0;
    for (const sec of data.sections) {
      html += `
      <section class="section-block reveal" id="sec-${sec.id}">
        <div class="section-head">
          <span class="section-num">${pad(++num)}</span>
          <h2 class="section-title glitch-text" data-text="${sec.title.en}">${sec.title[lang]}</h2>
        </div>
        <div class="section-ghost">${sec.ghost}</div>
        <div class="section-body">
          ${sec.type === "cards" ? renderCards(sec.items)
            : sec.type === "list" ? renderList(sec.items)
            : sec.type === "tracks" ? renderTracks(sec.items, trackSec++)
            : sec.type === "timeline" ? renderTimeline(sec.items)
            : sec.type === "transcript" ? renderTranscript(sec)
            : renderLinks(sec.items, sec.note)}
        </div>
      </section>`;
    }

    // 크로스 모드 유도 — 한쪽만 보고 떠나지 않게
    const ui = SITE_DATA.ui[lang];
    const other = m === "dev" ? "artist" : "dev";
    html += `
      <section class="cross-cta reveal">
        <p class="cross-cta-tag">${m === "dev" ? ui.crossDive : ui.crossSurface}</p>
        <button class="cross-cta-btn ${other === "artist" ? "to-water" : "to-land"}" data-cross="${other}">
          ${m === "dev" ? ui.crossToArtist : ui.crossToDev} →
        </button>
      </section>`;

    content.innerHTML = html;
    content.querySelector("[data-cross]")?.addEventListener("click", (e) => {
      setMode(e.currentTarget.dataset.cross);
    });
    observeReveals();
    buildMapNav(m);
  }

  /* ============================================================
     MAP NAV — 늪지대 지도 (현재 섹션 위치에 악어가 헤엄쳐 감)
     ============================================================ */
  const MAP_CROC_SVG = `<svg width="26" height="16" viewBox="0 0 26 16">
    <rect x="3" y="0" width="4" height="4" fill="var(--c2)"/>
    <rect x="11" y="0" width="4" height="4" fill="var(--c2)"/>
    <rect x="4" y="1" width="2" height="2" fill="#0f0f0f"/>
    <rect x="12" y="1" width="2" height="2" fill="#0f0f0f"/>
    <rect x="0" y="6" width="26" height="5" fill="var(--c1)"/>
    <rect x="4" y="11" width="3" height="2" fill="#fff"/>
    <rect x="12" y="11" width="3" height="2" fill="#fff"/>
  </svg>`;
  let spy = null;

  function buildMapNav(m) {
    const nav = $("#map-nav");
    const items = [{ id: "sec-about", label: m === "dev" ? "ABOUT.EXE" : "ABOUT.WAV" }];
    for (const sec of SITE_DATA[m].sections) items.push({ id: "sec-" + sec.id, label: sec.title[lang] });
    nav.innerHTML =
      `<div class="map-title">${m === "dev" ? "LAND MAP" : "SWAMP MAP"}</div><div class="map-trail">` +
      items.map((it) =>
        `<button class="map-node" data-target="${it.id}"><span class="map-dot"></span><span class="map-label">${it.label}</span></button>`
      ).join("") +
      `<span id="map-croc" aria-hidden="true">${MAP_CROC_SVG}</span></div>`;
    nav.hidden = false;
    nav.querySelectorAll(".map-node").forEach((b) =>
      b.addEventListener("click", () =>
        document.getElementById(b.dataset.target)?.scrollIntoView({ behavior: "smooth", block: "start" })
      )
    );
    setActiveNode("sec-about");
    spy?.disconnect();
    spy = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) setActiveNode(e.target.id);
    }, { rootMargin: "-25% 0px -65% 0px" });
    document.querySelectorAll("#content .section-block[id]").forEach((s) => spy.observe(s));
  }

  function setActiveNode(id) {
    const nav = $("#map-nav");
    let active = null;
    nav.querySelectorAll(".map-node").forEach((b) => {
      const on = b.dataset.target === id;
      b.classList.toggle("active", on);
      if (on) { active = b; b.setAttribute("aria-current", "true"); }
      else b.removeAttribute("aria-current");
    });
    const croc = $("#map-croc");
    if (active && croc) croc.style.top = (active.offsetTop + active.offsetHeight / 2) + "px";
  }

  /* ============================================================
     MODE SWITCH + HISTORY — 모드 전환을 브라우저 히스토리에 기록
     (뒤로가기 = 이전 화면, #dev/#artist 해시로 딥링크 가능)
     ============================================================ */
  function applyMode(m) {
    mode = m;
    body.dataset.mode = m;
    $("#landing").hidden = true;
    $("#journey").hidden = true;
    $("#content").hidden = false;
    $("#site-footer").hidden = false;
    $("#hud-mode-label").textContent = "MODE: " + (m === "dev" ? "R&D_WANI" : "ART_WANI");
    setTicker(m);
    renderMode(m);
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  function setMode(m, push = true) {
    if (push) history.pushState({ view: m }, "", "#" + m);
    if (fx === "off") { applyMode(m); return; }
    const flash = $("#mode-flash");
    flash.classList.remove("active");
    void flash.offsetWidth; // reflow → 애니메이션 재시작
    flash.classList.add("active");
    setTimeout(() => applyMode(m), 200);
  }

  function goHome(push = true) {
    if (push && mode !== "none") {
      history.pushState({ view: "home" }, "", location.pathname + location.search);
    }
    mode = "none";
    body.dataset.mode = "none";
    $("#content").hidden = true;
    $("#journey").hidden = true;
    $("#site-footer").hidden = true;
    $("#map-nav").hidden = true;
    $("#landing").hidden = false;
    $("#hud-mode-label").textContent = "MODE: NULL";
    setTicker("none");
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  /* ---------- LIFE MAP (journey) — WANI 타이틀 클릭 ---------- */
  function applyJourney() {
    mode = "journey";
    body.dataset.mode = "journey"; // dev/artist가 아니므로 혼합(기본) 팔레트
    $("#landing").hidden = true;
    $("#content").hidden = true;
    $("#site-footer").hidden = true;
    $("#map-nav").hidden = true;
    $("#journey").hidden = false;
    $("#hud-mode-label").textContent = "MODE: LIFE.MAP";
    setTicker("journey");
    window.scrollTo({ top: 0, behavior: "instant" });
    window.WANI_JOURNEY_MAP.build();
  }

  function enterJourney(push = true) {
    if (push) history.pushState({ view: "journey" }, "", "#journey");
    if (fx === "off") { applyJourney(); return; }
    const flash = $("#mode-flash");
    flash.classList.remove("active");
    void flash.offsetWidth;
    flash.classList.add("active");
    setTimeout(applyJourney, 200);
  }

  window.addEventListener("popstate", (e) => {
    const v = e.state?.view ||
      (location.hash === "#dev" ? "dev" :
       location.hash === "#artist" ? "artist" :
       location.hash === "#journey" ? "journey" :
       location.hash === "#game" ? "game" : "home");
    if (v === "game") { window.WANI_GAME?.open(false); return; }
    if (window.WANI_GAME?.isOpen()) window.WANI_GAME.close(false);
    if (v === "dev" || v === "artist") setMode(v, false);
    else if (v === "journey") enterJourney(false);
    else goHome(false);
  });

  /* ---------- 티커 ---------- */
  function setTicker(m) {
    const t = SITE_DATA.ticker[m] || SITE_DATA.ticker.none;
    const repeated = t.repeat(6);
    $("#ticker-top-inner").textContent = repeated;
    $("#ticker-bottom-inner").textContent = repeated;
  }

  /* ============================================================
     SCROLL — reveal + 제목 지터
     ============================================================ */
  let observer = null;
  function observeReveals() {
    observer?.disconnect();
    observer = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) e.target.classList.add("visible");
    }, { threshold: 0.08 });
    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
  }

  let jitterTimer = null;
  window.addEventListener("scroll", () => {
    if (fx !== "high") return;
    document.querySelectorAll(".section-title").forEach((el) => el.classList.add("jitter"));
    clearTimeout(jitterTimer);
    jitterTimer = setTimeout(() => {
      document.querySelectorAll(".section-title").forEach((el) => el.classList.remove("jitter"));
    }, 160);
  }, { passive: true });

  /* ============================================================
     HUD BUTTONS
     ============================================================ */
  $("#btn-mode").addEventListener("click", () => {
    if (mode === "none") return;
    if (mode === "journey") { setMode("dev"); return; }
    setMode(mode === "dev" ? "artist" : "dev");
  });

  $("#btn-lang").addEventListener("click", () => {
    lang = lang === "ko" ? "en" : "ko";
    localStorage.setItem("wani-lang", lang);
    body.dataset.lang = lang;
    applyUI();
    if (mode === "journey") window.WANI_JOURNEY_MAP.build();
    else if (mode !== "none") renderMode(mode);
  });

  $("#btn-fx").addEventListener("click", () => {
    fx = fx === "high" ? "low" : fx === "low" ? "off" : "high";
    localStorage.setItem("wani-fx", fx);
    body.dataset.fx = fx;
    $("#btn-fx").textContent = "FX:" + fx.toUpperCase();
  });
  $("#btn-fx").textContent = "FX:" + fx.toUpperCase();

  /* 라이트/다크 테마 토글 */
  $("#btn-theme").addEventListener("click", () => {
    theme = theme === "dark" ? "light" : "dark";
    localStorage.setItem("wani-theme", theme);
    if (theme === "light") body.dataset.theme = "light";
    else delete body.dataset.theme;
  });

  /* 아이콘 + 라벨 구조 유지 (모바일에선 CSS가 라벨을 숨겨 아이콘만 표시) */
  function setAudioBtn(icon, label) {
    $("#btn-audio").innerHTML = icon + ' <span class="btn-label">' + label + "</span>";
  }
  $("#btn-audio").addEventListener("click", () => {
    WANI_AUDIO.toggle()
      .then(() => {
        setAudioBtn(WANI_AUDIO.isPlaying() ? "■" : "▶", "AUDIO");
      })
      .catch(() => {
        // 음원 파일 없음 → 힌트 표시
        setAudioBtn("✕", "NO TRACK");
        setTimeout(() => setAudioBtn("▶", "AUDIO"), 2000);
      });
  });
  document.getElementById("audio-el").addEventListener("error", () => {
    setAudioBtn("✕", "NO TRACK");
    setTimeout(() => setAudioBtn("▶", "AUDIO"), 2000);
  });

  /* ============================================================
     PRINT — 두 모드 전체를 한 문서로 (인쇄/PDF 저장용)
     ============================================================ */
  function printSection(sec) {
    let h = `<h3>${sec.title[lang]}</h3>`;
    if (sec.type === "transcript") {
      h += `<p class="pr-note">${sec.summary[lang]}</p>`;
      for (const s of sec.semesters) {
        if (s.gap) { h += `<p class="pr-gap">— ${s.name[lang]} —</p>`; continue; }
        h += `<p class="pr-sem"><strong>${s.name[lang]}</strong> · ${s.stat[lang]}</p>
        <table><tbody>` + s.courses.map((c) =>
          `<tr><td>${c[0]}</td><td>${lang === "ko" ? c[1] : c[2]}</td><td>${c[3]}</td><td>${c[4]}</td></tr>`
        ).join("") + `</tbody></table>`;
      }
      return h;
    }
    if (sec.type === "links") {
      h += `<p>` + sec.items.map((it) => `${it.label}: ${it.url.replace("mailto:", "")}`).join(" · ") + `</p>`;
      return h;
    }
    for (const it of sec.items) {
      h += `<div class="pr-item">
        <p><strong>${it.title[lang]}</strong> <span class="pr-year">${loc(it.year) ?? ""}</span></p>
        ${it.sub ? `<p class="pr-sub">${loc(it.sub)}</p>` : ""}
        <p class="pr-desc">${it.desc?.[lang] ?? ""}</p>
      </div>`;
    }
    return h;
  }

  function buildPrint() {
    const root = $("#print-root");
    const t = (ko, en) => (lang === "ko" ? ko : en);
    let h = `
      <h1>김창완 KIM CHANGWAN — wani (@toowani)</h1>
      <p class="pr-head">${t("GIST 전기전자컴퓨터공학과 3학년 · ML/DL · AI 연구 · 힙합 베이스 전자음악/하이퍼팝 프로듀서",
        "Junior, EECS @ GIST · ML/DL · AI research · hip-hop bass electronic / hyperpop producer")}<br>
        changwan@gm.gist.ac.kr · kcw9151@gmail.com · github.com/toowani · youtube.com/@toowani</p>`;
    h += `<h2>${t("DEV — 개발·연구", "DEV — engineering & research")}</h2>`;
    for (const sec of SITE_DATA.dev.sections) h += printSection(sec);
    h += `<h2>${t("ARTIST — 음악·콘텐츠", "ARTIST — music & content")}</h2>`;
    for (const sec of SITE_DATA.artist.sections) h += printSection(sec);
    root.innerHTML = h;
  }

  $("#btn-print").addEventListener("click", () => {
    buildPrint();
    window.print();
  });

  /* 로고: 홈 복귀 + (홈에서 3연타 시) 이스터에그 악어 게임 */
  let logoTaps = 0, logoTapTimer = null;
  $("#logo").addEventListener("click", (e) => {
    e.preventDefault();
    if (mode === "none") {
      logoTaps++;
      clearTimeout(logoTapTimer);
      logoTapTimer = setTimeout(() => { logoTaps = 0; }, 550);
      if (logoTaps >= 3) {
        logoTaps = 0;
        window.WANI_GAME?.open();
        return;
      }
    } else {
      logoTaps = 0;
    }
    goHome();
  });

  document.querySelectorAll("[data-choose]").forEach((btn) =>
    btn.addEventListener("click", () => setMode(btn.dataset.choose))
  );

  /* WANI 타이틀 → LIFE MAP (클릭/키보드) */
  const landingTitle = document.querySelector(".landing-title");
  landingTitle.addEventListener("click", () => enterJourney());
  landingTitle.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); enterJourney(); }
  });

  /* journey.js 등 외부 모듈에서 모드 전환할 수 있게 노출 */
  window.WANI_NAV = { setMode, goHome };

  /* ============================================================
     CROC CURSOR — 입 벌린 악어 / 클릭 깨물기 / 스크롤 회전
     ============================================================ */
  (function initCrocCursor() {
    const cur = $("#croc-cursor");
    if (!cur || !matchMedia("(hover: hover)").matches) return;
    const bodyEl = cur.querySelector(".croc-body");
    const skins = cur.querySelectorAll(".croc-skin");

    let lastX = -9999, lastY = -9999;
    window.addEventListener("pointermove", (e) => {
      lastX = e.clientX; lastY = e.clientY;
      cur.style.left = e.clientX + "px";
      cur.style.top = e.clientY + "px";
      cur.classList.add("on");
      // 누른 채 이동(드래그) — 정지 타이머 리셋. 이동을 멈추고 가만히 있으면 다시 분노 축적
      if (pressed && !bursting &&
          Math.hypot(e.clientX - pressX, e.clientY - pressY) > 6) {
        pressX = e.clientX; pressY = e.clientY; // 기준점 재설정
        pressT0 = performance.now();            // 멈춘 시점부터 다시 카운트
        burstT0 = 0;
      }
    }, { passive: true });
    document.documentElement.addEventListener("pointerleave", () => cur.classList.remove("on"));

    /* ---- 클릭: 입 다뭄 → 분노(빨개짐) → 폭발(물고기 도망) → 진정(복귀) ---- */
    let pressed = false, pressT0 = 0;
    let anger = 0, bursting = false, burstT0 = 0;
    let pressX = 0, pressY = 0;
    const baseFills = []; // 원래 색 (테마 변수 반영)
    const hexToRgb = (c) => {
      const m = c.match(/\d+/g);
      return m ? m.slice(0, 3).map(Number) : [207, 205, 198];
    };
    const RAGE = [224, 82, 60]; // 분노 레드
    function startPress(e) {
      pressed = true;
      pressT0 = performance.now();
      if (e && e.clientX !== undefined) { lastX = e.clientX; lastY = e.clientY; }
      pressX = lastX; pressY = lastY;
      cur.classList.add("bite");
      if (anger === 0) { // 화가 남아있으면 기존 base 유지 (빨개진 색을 base로 오인 방지)
        baseFills.length = 0;
        skins.forEach((el) => baseFills.push(hexToRgb(getComputedStyle(el).fill)));
      }
    }
    function endPress() {
      pressed = false;
      burstT0 = 0;
      cur.classList.remove("bite"); // 분노·폭발은 tick에서 서서히 해소
    }
    window.addEventListener("pointerdown", startPress);
    window.addEventListener("pointerup", endPress);
    window.addEventListener("pointercancel", endPress);
    window.addEventListener("blur", endPress);

    /* ---- 스크롤: 방향별 회전(아래=시계, 위=반시계) + 스프링 복귀 ---- */
    let angle = 0, spinVel = 0;
    window.addEventListener("wheel", (e) => {
      spinVel += e.deltaY > 0 ? 14 : -14;
      spinVel = Math.max(-46, Math.min(46, spinVel));
    }, { passive: true });

    (function tick() {
      const now = performance.now();

      /* 분노 게이지 — 마우스가 멈춘 채 눌려 있을 때만 축적 (이동 시 타이머 리셋) */
      if (pressed) {
        if (now - pressT0 > 400) anger = Math.min(1, anger + 0.011); // 서서히 빨개짐
        // 최대 분노에서 0.6초 더 버티면 — 폭발
        if (anger >= 1 && !bursting) {
          if (!burstT0) burstT0 = now;
          if (now - burstT0 > 600) {
            bursting = true;
            cur.classList.remove("angry");
            cur.classList.add("burst");
            window.WANI_FISH?.panic(lastX, lastY);
          }
        }
      } else if (anger > 0) {
        anger = Math.max(0, anger - 0.012); // 화가 사그라듦
        if (bursting && anger < 0.5) {
          bursting = false;
          cur.classList.remove("burst");
          window.WANI_FISH?.calm(); // 물고기 복귀
        }
        if (anger === 0) skins.forEach((el) => { el.style.fill = ""; });
      }

      /* 색 적용 */
      if (anger > 0) {
        skins.forEach((el, i) => {
          const b = baseFills[i] || [207, 205, 198];
          const rgb = b.map((v, k) => Math.round(v + (RAGE[k] - v) * anger));
          el.style.fill = `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`;
        });
      }
      cur.classList.toggle("angry", !bursting && pressed && anger > 0.85);
      // 회전: 속도 감쇠 → 멈추면 스프링으로 부드럽게 원위치
      if (spinVel !== 0) {
        angle += spinVel;
        spinVel *= 0.9;
        if (Math.abs(spinVel) < 0.2) {
          spinVel = 0;
          angle = angle % 360; // 가장 가까운 한 바퀴 기준으로 복귀
          if (angle > 180) angle -= 360;
          if (angle < -180) angle += 360;
        }
      } else if (angle !== 0) {
        angle += (0 - angle) * 0.1; // ease-out 스프링
        if (Math.abs(angle) < 0.15) angle = 0;
      }
      bodyEl.style.transform = angle ? `rotate(${angle.toFixed(2)}deg)` : "";
      requestAnimationFrame(tick);
    })();
  })();

  /* ---------- 시계 ---------- */
  setInterval(() => {
    $("#hud-clock").textContent = new Date().toTimeString().slice(0, 8);
  }, 1000);

  /* ---------- init ---------- */
  applyUI();
  setTicker("none");
  // 해시 딥링크: #dev / #artist / #journey 로 직접 진입 가능
  const initHash = location.hash.replace("#", "");
  if (initHash === "dev" || initHash === "artist") {
    history.replaceState({ view: initHash }, "", "#" + initHash);
    applyMode(initHash);
  } else if (initHash === "journey") {
    history.replaceState({ view: "journey" }, "", "#journey");
    applyJourney();
  } else {
    history.replaceState({ view: "home" }, "", location.pathname + location.search);
  }
  runBoot();
})();
