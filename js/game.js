/* ============================================================
   WANI MAZE — 이스터에그 악어 미로 게임
   진입: 홈(mode=null)에서 WANI.SYS 로고 3연타
   규칙:
   - 화살표/WASD/스와이프로 악어 조작
   - 물고기(물길)와 열매(땅길)를 전부 먹으면 클리어
   - 사냥꾼 2명을 피할 것 (목숨 3개)
   - 8초마다 땅⇄물 페이즈 전환: L길은 땅에서만, W길은 물에서만 통행 가능
   - 제한시간 90초, 클리어 시 남은 시간 × 10점 보너스
   ============================================================ */
(function () {
  "use strict";

  /* ---------- 미로 (15×13) ----------
     # 벽 · . 상시 통행 · L 땅 페이즈 전용 · W 물 페이즈 전용 */
  const MAP = [
    "###############",
    "#.....#.....W.#",
    "#.###.#.###.#.#",
    "#L..#...W.#...#",
    "#.#.#.###.#.#W#",
    "#.#.....#...#.#",
    "#.###.#.#.###.#",
    "#.....#.....L.#",
    "###.#.####.#.##",
    "#W..#....#.#..#",
    "#.#.###.#..#L.#",
    "#.......#.....#",
    "###############",
  ];
  const COLS = 15, ROWS = 13;
  const PLAYER_SPAWN = { x: 1, y: 1 };
  const HUNTER_SPAWNS = [{ x: 7, y: 5 }, { x: 13, y: 11 }];

  const TIME_LIMIT = 90;       // 초
  const PHASE_SEC = 8;         // 페이즈 전환 주기
  const WARN_SEC = 1.6;        // 전환 예고 시간
  const PLAYER_MS = 150;       // 타일 이동 시간(ms)
  const HUNTER_MS = 210;
  const PELLET_PT = 10;

  const LAND = { c1: "#b6ff00", c2: "#ffb300", bg: "#0a0f04" };
  const WATER = { c1: "#00e5ff", c2: "#2979ff", bg: "#03101c" };

  /* ---------- DOM ---------- */
  const overlay = document.getElementById("game-overlay");
  const cvs = document.getElementById("game-canvas");
  const ctx = cvs.getContext("2d");
  const elScore = document.getElementById("g-score");
  const elBest = document.getElementById("g-best");
  const elPhase = document.getElementById("g-phase");
  const elTime = document.getElementById("g-time");
  const elLives = document.getElementById("g-lives");
  const elMsg = document.getElementById("game-msg");

  /* ---------- 상태 ---------- */
  let open = false, running = false, raf = null, lastT = 0;
  let tile = 32, offX = 0, offY = 0;
  let phase, phaseT, timeLeft, score, lives, pellets, invincible;
  let player, hunters;
  let flashT = 0;

  const at = (x, y) => (MAP[y] && MAP[y][x]) || "#";
  function passable(x, y, ph) {
    const t = at(x, y);
    if (t === "#") return false;
    if (t === "L") return ph === "land";
    if (t === "W") return ph === "water";
    return true;
  }

  /* ---------- 엔티티 ---------- */
  function makeEntity(spawn, ms) {
    return { x: spawn.x, y: spawn.y, fx: spawn.x, fy: spawn.y, // fx/fy = 보간된 표시 위치
      tx: spawn.x, ty: spawn.y, moving: false, t: 0, ms, dir: { x: 0, y: 0 }, want: { x: 0, y: 0 } };
  }
  function startMove(e, dx, dy) {
    e.tx = e.x + dx; e.ty = e.y + dy;
    e.dir = { x: dx, y: dy };
    e.moving = true; e.t = 0;
  }
  function stepEntity(e, dt, isHunter) {
    if (!e.moving) return;
    e.t += dt;
    const p = Math.min(e.t / e.ms, 1);
    e.fx = e.x + (e.tx - e.x) * p;
    e.fy = e.y + (e.ty - e.y) * p;
    if (p >= 1) {
      e.x = e.tx; e.y = e.ty; e.fx = e.x; e.fy = e.y; e.moving = false;
      if (isHunter) pickHunterDir(e);
      else tryPlayerMove();
    }
  }

  /* ---------- 플레이어 ---------- */
  function tryPlayerMove() {
    // 예약된 방향 우선, 안 되면 진행 방향 유지
    const w = player.want;
    if ((w.x || w.y) && passable(player.x + w.x, player.y + w.y, phase)) {
      startMove(player, w.x, w.y);
      return;
    }
    const d = player.dir;
    if ((d.x || d.y) && passable(player.x + d.x, player.y + d.y, phase)) {
      startMove(player, d.x, d.y);
    }
  }

  /* ---------- 사냥꾼 AI: 70% 추격 / 30% 랜덤, 역주행 최소화 ---------- */
  function pickHunterDir(h) {
    const dirs = [{ x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: -1 }];
    let options = dirs.filter((d) => passable(h.x + d.x, h.y + d.y, phase));
    if (!options.length) return;
    const back = options.filter((d) => !(d.x === -h.dir.x && d.y === -h.dir.y));
    if (back.length) options = back;
    let choice;
    if (Math.random() < 0.7) {
      options.sort((a, b) =>
        (Math.abs(h.x + a.x - player.x) + Math.abs(h.y + a.y - player.y)) -
        (Math.abs(h.x + b.x - player.x) + Math.abs(h.y + b.y - player.y)));
      choice = options[0];
    } else {
      choice = options[(Math.random() * options.length) | 0];
    }
    startMove(h, choice.x, choice.y);
  }

  /* ---------- 게임 라이프사이클 ---------- */
  function reset() {
    phase = "land"; phaseT = 0; timeLeft = TIME_LIMIT;
    score = 0; lives = 3; invincible = 0;
    player = makeEntity(PLAYER_SPAWN, PLAYER_MS);
    hunters = HUNTER_SPAWNS.map((s) => makeEntity(s, HUNTER_MS));
    hunters.forEach(pickHunterDir);
    pellets = new Map();
    for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) {
      const t = at(x, y);
      if (t === "#") continue;
      if (x === PLAYER_SPAWN.x && y === PLAYER_SPAWN.y) continue;
      pellets.set(x + "," + y, t === "W" ? "fish" : t === "L" ? "berry" : "dot");
    }
    updateHud();
  }

  function updateHud() {
    elScore.textContent = "SCORE " + score;
    const best = +localStorage.getItem("wani-game-best") || 0;
    elBest.textContent = best ? "BEST " + best : "";
    elTime.textContent = Math.ceil(timeLeft);
    elLives.textContent = "◆".repeat(lives) + "◇".repeat(3 - lives);
    elPhase.textContent = phase === "land" ? "▲ LAND" : "▼ WATER";
    elPhase.style.color = phase === "land" ? LAND.c1 : WATER.c1;
  }

  function showMsg(html) { elMsg.innerHTML = html; elMsg.hidden = false; }
  function hideMsg() { elMsg.hidden = true; }

  function startScreen() {
    running = false;
    showMsg(`
      <h2>WANI MAZE</h2>
      <pre class="gm-croc">  _(o)_(o)_\n~/  ~ ~ ~  \\~</pre>
      <p>물고기와 열매를 전부 먹으면 클리어!<br>
      사냥꾼을 피하세요 · 8초마다 땅⇄물이 바뀝니다<br>
      <b class="gm-land">▲ LAND</b>에선 땅길만, <b class="gm-water">▼ WATER</b>에선 물길만 통행 가능</p>
      <p class="gm-keys">← ↑ ↓ → / WASD / 스와이프 · ESC 종료</p>
      <button id="gm-start">[ START ]</button>`);
    document.getElementById("gm-start").onclick = begin;
  }

  function begin() {
    reset(); hideMsg();
    running = true; lastT = performance.now();
  }

  function endGame(win) {
    running = false;
    if (win) score += Math.ceil(timeLeft) * 10;
    const best = Math.max(score, +localStorage.getItem("wani-game-best") || 0);
    localStorage.setItem("wani-game-best", best);
    updateHud();
    showMsg(`
      <h2>${win ? "CLEAR!" : "GAME OVER"}</h2>
      <p class="gm-final">SCORE <b>${score}</b>${win ? `<br><span class="gm-bonus">(시간 보너스 +${Math.ceil(timeLeft) * 10})</span>` : ""}</p>
      <p>BEST ${best}</p>
      <button id="gm-retry">[ RETRY ]</button>
      <button id="gm-quit">[ EXIT ]</button>`);
    document.getElementById("gm-retry").onclick = begin;
    document.getElementById("gm-quit").onclick = () => api.close();
  }

  function loseLife() {
    lives--;
    updateHud();
    if (lives <= 0) { endGame(false); return; }
    invincible = 2;
    player.x = player.fx = player.tx = PLAYER_SPAWN.x;
    player.y = player.fy = player.ty = PLAYER_SPAWN.y;
    player.moving = false; player.dir = { x: 0, y: 0 }; player.want = { x: 0, y: 0 };
    hunters = HUNTER_SPAWNS.map((s) => makeEntity(s, HUNTER_MS));
    hunters.forEach(pickHunterDir);
    flashT = 0.4;
  }

  /* ---------- 업데이트 ---------- */
  function update(dt) {
    timeLeft -= dt;
    if (timeLeft <= 0) { timeLeft = 0; updateHud(); endGame(false); return; }
    if (invincible > 0) invincible -= dt;
    if (flashT > 0) flashT -= dt;

    // 페이즈 전환
    phaseT += dt;
    if (phaseT >= PHASE_SEC) {
      phaseT = 0;
      phase = phase === "land" ? "water" : "land";
      flashT = 0.3;
      // 이동 목표 타일이 막히면 이동 취소 (제자리 복귀)
      for (const e of [player, ...hunters]) {
        if (e.moving && !passable(e.tx, e.ty, phase)) {
          e.tx = e.x; e.ty = e.y; e.moving = false; e.fx = e.x; e.fy = e.y;
        }
      }
      hunters.forEach((h) => { if (!h.moving) pickHunterDir(h); });
    }

    if (!player.moving) tryPlayerMove();
    stepEntity(player, dt * 1000, false);
    for (const h of hunters) {
      if (!h.moving) pickHunterDir(h);
      stepEntity(h, dt * 1000, true);
    }

    // 먹이 획득
    const key = player.x + "," + player.y;
    if (!player.moving || (Math.abs(player.fx - player.x) < .2 && Math.abs(player.fy - player.y) < .2)) {
      if (pellets.has(key)) {
        pellets.delete(key);
        score += PELLET_PT;
        if (!pellets.size) { updateHud(); endGame(true); return; }
      }
    }

    // 사냥꾼 충돌 (표시 좌표 기준 근접 판정)
    if (invincible <= 0) {
      for (const h of hunters) {
        if (Math.hypot(h.fx - player.fx, h.fy - player.fy) < 0.6) { loseLife(); break; }
      }
    }
    updateHud();
  }

  /* ---------- 렌더 ---------- */
  function draw() {
    const P = phase === "land" ? LAND : WATER;
    const warn = phaseT > PHASE_SEC - WARN_SEC && (phaseT * 6 | 0) % 2 === 0; // 전환 예고 점멸
    ctx.fillStyle = P.bg;
    ctx.fillRect(0, 0, cvs.width, cvs.height);

    for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) {
      const t = at(x, y);
      const px = offX + x * tile, py = offY + y * tile;
      if (t === "#") {
        ctx.fillStyle = "#0d0d14";
        ctx.fillRect(px + 1, py + 1, tile - 2, tile - 2);
        ctx.strokeStyle = P.c2 + "44";
        ctx.strokeRect(px + 1.5, py + 1.5, tile - 3, tile - 3);
        continue;
      }
      const active = passable(x, y, phase);
      // 페이즈 전용 타일 배경
      if (t === "L") {
        ctx.fillStyle = active ? "rgba(182,255,0,.10)" : "rgba(182,255,0,.03)";
        ctx.fillRect(px, py, tile, tile);
      } else if (t === "W") {
        ctx.fillStyle = active ? "rgba(0,229,255,.10)" : "rgba(0,229,255,.03)";
        ctx.fillRect(px, py, tile, tile);
      }
      if (!active) { // 막힌 길: 빗금
        ctx.strokeStyle = warn ? "rgba(255,255,255,.5)" : "rgba(255,255,255,.14)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(px + 3, py + tile - 3); ctx.lineTo(px + tile - 3, py + 3);
        ctx.moveTo(px + 3, py + 3); ctx.lineTo(px + tile - 3, py + tile - 3);
        ctx.stroke();
        continue;
      }
      // 먹이
      const pel = pellets.get(x + "," + y);
      const cx = px + tile / 2, cy = py + tile / 2;
      if (pel === "dot") {
        ctx.fillStyle = "#e8e8f0";
        ctx.fillRect(cx - 2, cy - 2, 4, 4);
      } else if (pel === "fish") {
        ctx.fillStyle = WATER.c1;
        ctx.fillRect(cx - 5, cy - 3, 7, 6);       // 몸통
        ctx.beginPath();                            // 꼬리
        ctx.moveTo(cx + 2, cy); ctx.lineTo(cx + 6, cy - 4); ctx.lineTo(cx + 6, cy + 4);
        ctx.fill();
        ctx.fillStyle = "#050507"; ctx.fillRect(cx - 3, cy - 1, 2, 2); // 눈
      } else if (pel === "berry") {
        ctx.fillStyle = LAND.c1;
        ctx.fillRect(cx - 4, cy - 3, 8, 7);
        ctx.fillStyle = LAND.c2;
        ctx.fillRect(cx - 1, cy - 6, 2, 3);        // 꼭지
      }
    }

    // 사냥꾼 (모자 + 몸통 픽셀)
    for (const [i, h] of hunters.entries()) {
      const px = offX + h.fx * tile, py = offY + h.fy * tile;
      const body = i === 0 ? "#ff6a00" : "#ff2bd6";
      ctx.fillStyle = body;
      ctx.fillRect(px + 7, py + 12, tile - 14, tile - 16);           // 몸통
      ctx.fillStyle = "#e8d9b0";
      ctx.fillRect(px + 9, py + 8, tile - 18, 6);                    // 얼굴
      ctx.fillStyle = "#3a2b16";
      ctx.fillRect(px + 6, py + 5, tile - 12, 4);                    // 모자챙
      ctx.fillRect(px + 10, py + 1, tile - 20, 5);                   // 모자
      ctx.fillStyle = "#050507";
      ctx.fillRect(px + 10, py + 9, 3, 3); ctx.fillRect(px + tile - 13, py + 9, 3, 3); // 눈
    }

    // 플레이어 악어 (무적 시 점멸)
    if (invincible <= 0 || (performance.now() / 120 | 0) % 2 === 0) {
      const px = offX + player.fx * tile, py = offY + player.fy * tile;
      const d = player.dir;
      ctx.save();
      ctx.translate(px + tile / 2, py + tile / 2);
      if (d.x === -1) ctx.scale(-1, 1);
      if (d.y === 1) ctx.rotate(Math.PI / 2);
      if (d.y === -1) ctx.rotate(-Math.PI / 2);
      ctx.fillStyle = P.c1;
      ctx.fillRect(-tile / 2 + 4, -5, tile - 8, 10);                 // 몸통
      ctx.fillRect(tile / 2 - 10, -3, 8, 6);                         // 주둥이
      ctx.fillStyle = P.c2;
      ctx.fillRect(-tile / 2 + 6, -9, 5, 5); ctx.fillRect(-tile / 2 + 14, -9, 5, 5); // 눈두덩
      ctx.fillStyle = "#050507";
      ctx.fillRect(-tile / 2 + 7, -8, 2, 2); ctx.fillRect(-tile / 2 + 15, -8, 2, 2); // 눈
      ctx.fillStyle = "#fff";
      ctx.fillRect(tile / 2 - 8, -2, 2, 2); ctx.fillRect(tile / 2 - 5, 1, 2, 2);     // 이빨
      ctx.restore();
    }

    // 페이즈 전환 플래시
    if (flashT > 0) {
      ctx.fillStyle = (phase === "land" ? "rgba(182,255,0," : "rgba(0,229,255,") + (flashT * 0.35) + ")";
      ctx.fillRect(0, 0, cvs.width, cvs.height);
    }
  }

  function loop(now) {
    if (!open) return;
    const dt = Math.min((now - lastT) / 1000, 0.05);
    lastT = now;
    if (running) update(dt);
    draw();
    raf = requestAnimationFrame(loop);
  }

  /* ---------- 입력 ---------- */
  const KEYS = {
    ArrowUp: { x: 0, y: -1 }, ArrowDown: { x: 0, y: 1 }, ArrowLeft: { x: -1, y: 0 }, ArrowRight: { x: 1, y: 0 },
    w: { x: 0, y: -1 }, s: { x: 0, y: 1 }, a: { x: -1, y: 0 }, d: { x: 1, y: 0 },
  };
  function onKey(e) {
    if (!open) return;
    if (e.key === "Escape") { api.close(); return; }
    const d = KEYS[e.key];
    if (d) {
      e.preventDefault();
      player.want = d;
      if (!player.moving) tryPlayerMove();
    }
  }
  let touchStart = null;
  function onTouchStart(e) { touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY }; }
  function onTouchEnd(e) {
    if (!touchStart) return;
    const dx = e.changedTouches[0].clientX - touchStart.x;
    const dy = e.changedTouches[0].clientY - touchStart.y;
    touchStart = null;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return; // 탭은 무시
    const d = Math.abs(dx) > Math.abs(dy) ? { x: Math.sign(dx), y: 0 } : { x: 0, y: Math.sign(dy) };
    player.want = d;
    if (!player.moving) tryPlayerMove();
  }

  /* ---------- 캔버스 사이즈 ---------- */
  function resize() {
    const availW = window.innerWidth - 24;
    const availH = window.innerHeight - 90; // HUD 공간
    tile = Math.max(18, Math.min(Math.floor(availW / COLS), Math.floor(availH / ROWS)));
    cvs.width = COLS * tile; cvs.height = ROWS * tile;
    offX = 0; offY = 0;
    ctx.imageSmoothingEnabled = false;
  }

  /* ---------- 공개 API ---------- */
  const api = {
    isOpen: () => open,
    open(push = true) {
      if (open) return;
      open = true;
      if (push) history.pushState({ view: "game" }, "", "#game");
      overlay.hidden = false;
      document.body.style.overflow = "hidden";
      resize();
      reset();
      startScreen();
      window.addEventListener("keydown", onKey);
      window.addEventListener("resize", resize);
      overlay.addEventListener("touchstart", onTouchStart, { passive: true });
      overlay.addEventListener("touchend", onTouchEnd, { passive: true });
      lastT = performance.now();
      raf = requestAnimationFrame(loop);
    },
    close(pop = true) {
      if (!open) return;
      open = false; running = false;
      cancelAnimationFrame(raf);
      overlay.hidden = true;
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", resize);
      overlay.removeEventListener("touchstart", onTouchStart);
      overlay.removeEventListener("touchend", onTouchEnd);
      if (pop && location.hash === "#game") history.back();
    },
  };
  document.getElementById("g-exit").addEventListener("click", () => api.close());
  window.WANI_GAME = api;
})();
