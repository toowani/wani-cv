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

  body.dataset.lang = lang;
  body.dataset.fx = fx;

  /* ============================================================
     BOOT SEQUENCE — 터미널 부팅 연출
     ============================================================ */
  const BOOT_LINES = [
    "WANI.SYS v4.0 — amphibian identity kernel",
    "> scanning habitat ................ LAND ✓ WATER ✓",
    "> mount /dev/land   (academics) ... OK",
    "> mount /dev/water  (music) ....... OK",
    "> waking the crocodile ............ OK",
    "        _   _",
    "      _(o)_(o)_",
    "  ~~~/  ~ ~ ~  \\_____.~~~",
    "> handle check .................... @toowani (\"완전 나답게\")",
    "> WELCOME TO BOTH WORLDS.",
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
    <rect x="4" y="1" width="2" height="2" fill="#050507"/>
    <rect x="12" y="1" width="2" height="2" fill="#050507"/>
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
      if (on) active = b;
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
    $("#content").hidden = false;
    $("#site-footer").hidden = false;
    $("#hud-mode-label").textContent = "MODE: " + (m === "dev" ? "DEV_WANI" : "ARTIST_WANI");
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
    $("#site-footer").hidden = true;
    $("#map-nav").hidden = true;
    $("#landing").hidden = false;
    $("#hud-mode-label").textContent = "MODE: NULL";
    setTicker("none");
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  window.addEventListener("popstate", (e) => {
    const v = e.state?.view ||
      (location.hash === "#dev" ? "dev" :
       location.hash === "#artist" ? "artist" :
       location.hash === "#game" ? "game" : "home");
    if (v === "game") { window.WANI_GAME?.open(false); return; }
    if (window.WANI_GAME?.isOpen()) window.WANI_GAME.close(false);
    if (v === "dev" || v === "artist") setMode(v, false);
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
    setMode(mode === "dev" ? "artist" : "dev");
  });

  $("#btn-lang").addEventListener("click", () => {
    lang = lang === "ko" ? "en" : "ko";
    localStorage.setItem("wani-lang", lang);
    body.dataset.lang = lang;
    applyUI();
    if (mode !== "none") renderMode(mode);
  });

  $("#btn-fx").addEventListener("click", () => {
    fx = fx === "high" ? "low" : fx === "low" ? "off" : "high";
    localStorage.setItem("wani-fx", fx);
    body.dataset.fx = fx;
    $("#btn-fx").textContent = "FX:" + fx.toUpperCase();
  });
  $("#btn-fx").textContent = "FX:" + fx.toUpperCase();

  $("#btn-audio").addEventListener("click", () => {
    WANI_AUDIO.toggle()
      .then(() => {
        $("#btn-audio").textContent = WANI_AUDIO.isPlaying() ? "■ AUDIO" : "▶ AUDIO";
      })
      .catch(() => {
        // 음원 파일 없음 → 힌트 표시
        $("#btn-audio").textContent = "✕ NO TRACK";
        setTimeout(() => { $("#btn-audio").textContent = "▶ AUDIO"; }, 2000);
      });
  });
  document.getElementById("audio-el").addEventListener("error", () => {
    $("#btn-audio").textContent = "✕ NO TRACK";
    setTimeout(() => { $("#btn-audio").textContent = "▶ AUDIO"; }, 2000);
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
      <p class="pr-head">${t("GIST 전기전자컴퓨터공학과 3학년 · AI/ML · 힙합 베이스 전자음악 아티스트",
        "Junior, EECS @ GIST · AI/ML · hip-hop based electronic music artist")}<br>
        changwan@gm.gist.ac.kr · kcw9151@gmail.com · github.com/toowani · youtube.com/@toowani</p>`;
    h += `<h2>${t("개발 — 땅 위의 나", "DEV — me on land")}</h2>`;
    for (const sec of SITE_DATA.dev.sections) h += printSection(sec);
    h += `<h2>${t("음악 — 물 속의 나", "ARTIST — me in water")}</h2>`;
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

  /* ============================================================
     CROC CURSOR — 입 벌린 악어 / 클릭 깨물기 / 스크롤 회전
     ============================================================ */
  (function initCrocCursor() {
    const cur = $("#croc-cursor");
    if (!cur || !matchMedia("(hover: hover)").matches) return;
    window.addEventListener("pointermove", (e) => {
      cur.style.left = e.clientX + "px";
      cur.style.top = e.clientY + "px";
      cur.classList.add("on");
    }, { passive: true });
    window.addEventListener("pointerdown", () => {
      cur.classList.remove("bite");
      void cur.offsetWidth; // 애니메이션 재시작
      cur.classList.add("bite");
    });
    let spinT = null;
    window.addEventListener("scroll", () => {
      cur.classList.add("spin");
      clearTimeout(spinT);
      spinT = setTimeout(() => cur.classList.remove("spin"), 220);
    }, { passive: true });
    document.documentElement.addEventListener("pointerleave", () => cur.classList.remove("on"));
  })();

  /* ---------- 시계 ---------- */
  setInterval(() => {
    $("#hud-clock").textContent = new Date().toTimeString().slice(0, 8);
  }, 1000);

  /* ---------- init ---------- */
  applyUI();
  setTicker("none");
  // 해시 딥링크: #dev / #artist 로 직접 진입 가능
  const initHash = location.hash.replace("#", "");
  if (initHash === "dev" || initHash === "artist") {
    history.replaceState({ view: initHash }, "", "#" + initHash);
    applyMode(initHash);
  } else {
    history.replaceState({ view: "home" }, "", location.pathname + location.search);
  }
  runBoot();
})();
