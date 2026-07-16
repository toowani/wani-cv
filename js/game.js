/* ============================================================
   WANI MAZE — 이스터에그 악어 미로 게임 v2
   진입: 홈(mode=null)에서 WANI.SYS 로고 3연타

   v2 변경점:
   - 매 판 미로/먹이/스폰 무작위 생성 (양 페이즈 BFS 연결성 검증)
   - 난이도 하향: 사냥꾼 감속, 추격률 55%, 페이즈 10초, 시작 카운트다운
   - 땅/물 통행 가능 여부 시각화 강화 (잔디·물결 vs 어두운 ✕)
   - 칩튠 BGM + 먹이/사망/클리어 효과음 (Web Audio 합성)
   - 게임 중 사이트 오디오 자동 일시정지, 종료 시 복원
   ============================================================ */
(function () {
  "use strict";

  const COLS = 15, ROWS = 13;      // 홀수 (셀 7×6 미로)
  const TIME_LIMIT = 90;           // 초
  const PHASE_SEC = 10;            // 페이즈 전환 주기
  const WARN_SEC = 2.2;            // 전환 예고
  const PLAYER_MS = 140;           // 플레이어 타일 이동(ms)
  const HUNTER_MS = 265;           // 사냥꾼 (플레이어보다 확실히 느림)
  const CHASE_P = 0.55;            // 사냥꾼 추격 확률
  const READY_SEC = 2.0;           // 시작/부활 카운트다운
  const SPECIAL_TILES = 10;        // L/W 특수 타일 개수
  const PELLET_PT = 10;

  const LAND = { c1: "#aad59e", c2: "#c9e5c4", bg: "#101010" };
  const WATER = { c1: "#b8cde6", c2: "#cee1f3", bg: "#0c0c0c" };

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

  /* ============================================================
     SOUND — Web Audio 합성 (파일 없이 칩튠)
     ============================================================ */
  const SND = {
    ctx: null, gain: null, timer: null, step: 0, next: 0,
    ensure() {
      if (!this.ctx) {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.gain = this.ctx.createGain();
        this.gain.gain.value = 0.13;
        this.gain.connect(this.ctx.destination);
      }
      if (this.ctx.state === "suspended") this.ctx.resume();
    },
    tone(f, t0, dur, type = "square", vol = 1, endF = null) {
      const o = this.ctx.createOscillator(), g = this.ctx.createGain();
      o.type = type;
      o.frequency.setValueAtTime(f, t0);
      if (endF) o.frequency.exponentialRampToValueAtTime(endF, t0 + dur);
      g.gain.setValueAtTime(vol, t0);
      g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
      o.connect(g); g.connect(this.gain);
      o.start(t0); o.stop(t0 + dur + 0.02);
    },
    eat() { // 띠링- (볼륨 절반)
      this.ensure(); const t = this.ctx.currentTime;
      this.tone(880, t, 0.06, "square", 0.35);
      this.tone(1318, t + 0.06, 0.09, "square", 0.35);
    },
    death() { // 추락하는 소리
      this.ensure(); const t = this.ctx.currentTime;
      this.tone(440, t, 0.45, "sawtooth", 0.8, 55);
      this.tone(220, t + 0.05, 0.4, "square", 0.4, 40);
    },
    discover() { // 이스터에그 발견 반짝임
      this.ensure(); const t = this.ctx.currentTime;
      [784, 988, 1319, 1760].forEach((f, i) => this.tone(f, t + i * 0.07, 0.1, "square", 0.45));
      this.tone(2093, t + 0.3, 0.3, "triangle", 0.4);
    },
    phase(toWater) { // 페이즈 전환 스윕
      this.ensure(); const t = this.ctx.currentTime;
      if (toWater) this.tone(700, t, 0.25, "triangle", 0.6, 250);
      else this.tone(250, t, 0.25, "triangle", 0.6, 700);
    },
    win() {
      this.ensure(); const t = this.ctx.currentTime;
      [523, 659, 784, 1047, 1319].forEach((f, i) => this.tone(f, t + i * 0.11, 0.14, "square", 0.7));
      this.tone(1568, t + 0.55, 0.4, "square", 0.7);
    },
    over() {
      this.ensure(); const t = this.ctx.currentTime;
      [330, 262, 196, 131].forEach((f, i) => this.tone(f, t + i * 0.16, 0.2, "sawtooth", 0.6));
    },
    /* 16스텝 칩튠 BGM 루프 (룩어헤드 스케줄러) */
    LEAD: [659, 784, 988, 1319, 988, 784, 659, 0, 523, 659, 784, 1047, 784, 988, 880, 0],
    BASS: [110, 0, 165, 0, 131, 0, 165, 0, 110, 0, 165, 0, 147, 0, 196, 0],
    startBgm() {
      this.ensure();
      this.stopBgm();
      this.step = 0;
      this.next = this.ctx.currentTime + 0.05;
      this.timer = setInterval(() => {
        while (this.next < this.ctx.currentTime + 0.25) {
          const s = this.step % 16;
          if (this.LEAD[s]) this.tone(this.LEAD[s], this.next, 0.11, "square", 0.35);
          if (this.BASS[s]) this.tone(this.BASS[s], this.next, 0.13, "triangle", 0.5);
          this.next += 0.145;
          this.step++;
        }
      }, 90);
    },
    stopBgm() { clearInterval(this.timer); this.timer = null; },
  };

  /* ============================================================
     RANDOM MAZE — 백트래커 + 브레이딩 + L/W 배치 (BFS 검증)
     ============================================================ */
  let MAP = [], playerSpawn, hunterSpawns;

  const at = (x, y) => (MAP[y] && MAP[y][x]) || "#";
  function passable(x, y, ph) {
    const t = at(x, y);
    if (t === "#") return false;
    if (t === "L") return ph === "land";
    if (t === "W") return ph === "water";
    return true;
  }
  const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };

  function validateMap(grid, spawn) {
    const pass2 = (x, y, ph) => {
      const t = (grid[y] || [])[x] || "#";
      return t !== "#" && (t === "L" ? ph === "land" : t === "W" ? ph === "water" : true);
    };
    for (const ph of ["land", "water"]) {
      const seen = new Set([spawn.x + "," + spawn.y]);
      const q = [[spawn.x, spawn.y]];
      while (q.length) {
        const [x, y] = q.pop();
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const nx = x + dx, ny = y + dy, k = nx + "," + ny;
          if (!seen.has(k) && pass2(nx, ny, ph)) { seen.add(k); q.push([nx, ny]); }
        }
      }
      for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) {
        if (grid[y][x] !== "#" && pass2(x, y, ph) && !seen.has(x + "," + y)) return false;
      }
    }
    return true;
  }

  function genMap() {
    for (let attempt = 0; attempt < 40; attempt++) {
      const grid = Array.from({ length: ROWS }, () => Array(COLS).fill("#"));
      const CW = (COLS - 1) / 2, CH = (ROWS - 1) / 2; // 7×6 셀
      const tileOf = (c) => ({ x: c.x * 2 + 1, y: c.y * 2 + 1 });

      // 1) 백트래커로 트리 미로
      const visited = new Set(["0,0"]);
      const stack = [{ x: 0, y: 0 }];
      grid[1][1] = ".";
      while (stack.length) {
        const cur = stack[stack.length - 1];
        const nbrs = shuffle([[1, 0], [-1, 0], [0, 1], [0, -1]]
          .map(([dx, dy]) => ({ x: cur.x + dx, y: cur.y + dy }))
          .filter((n) => n.x >= 0 && n.x < CW && n.y >= 0 && n.y < CH && !visited.has(n.x + "," + n.y)));
        if (!nbrs.length) { stack.pop(); continue; }
        const n = nbrs[0];
        visited.add(n.x + "," + n.y);
        const ct = tileOf(cur), nt = tileOf(n);
        grid[(ct.y + nt.y) / 2][(ct.x + nt.x) / 2] = ".";
        grid[nt.y][nt.x] = ".";
        stack.push(n);
      }

      // 2a) 브레이딩: 막다른 셀 100% 제거 — 외나무다리에서도 항상 퇴로 확보
      for (let cy = 0; cy < CH; cy++) for (let cx = 0; cx < CW; cx++) {
        const t = tileOf({ x: cx, y: cy });
        const openWalls = [[1, 0], [-1, 0], [0, 1], [0, -1]]
          .filter(([dx, dy]) => grid[t.y + dy]?.[t.x + dx] === ".");
        if (openWalls.length === 1) {
          const cands = shuffle([[1, 0], [-1, 0], [0, 1], [0, -1]]
            .filter(([dx, dy]) => {
              const wx = t.x + dx, wy = t.y + dy, ox = t.x + dx * 2, oy = t.y + dy * 2;
              return grid[wy]?.[wx] === "#" && grid[oy]?.[ox] === ".";
            }));
          if (cands.length) grid[t.y + cands[0][1]][t.x + cands[0][0]] = ".";
        }
      }
      // 2b) 추가 순환로: 통로 사이 벽 28%를 더 뚫어 도망갈 샛길 생성
      for (let y = 1; y < ROWS - 1; y++) for (let x = 1; x < COLS - 1; x++) {
        if (grid[y][x] !== "#") continue;
        const h = grid[y][x - 1] !== "#" && grid[y][x + 1] !== "#";
        const v = grid[y - 1][x] !== "#" && grid[y + 1][x] !== "#";
        if ((h !== v) && Math.random() < 0.28) grid[y][x] = ".";
      }

      // 3) 스폰 위치 (무작위 통로)
      const corridors = [];
      for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) if (grid[y][x] === ".") corridors.push({ x, y });
      const spawn = corridors[(Math.random() * corridors.length) | 0];

      // 4) L/W 특수 타일 배치 — 하나씩 넣어보고 연결성 깨지면 되돌림
      let placed = 0;
      for (const c of shuffle([...corridors])) {
        if (placed >= SPECIAL_TILES) break;
        if (Math.abs(c.x - spawn.x) + Math.abs(c.y - spawn.y) < 3) continue;
        const type = placed % 2 ? "L" : "W";
        grid[c.y][c.x] = type;
        if (validateMap(grid, spawn)) placed++;
        else grid[c.y][c.x] = ".";
      }

      // 5) 사냥꾼 스폰 — 플레이어와 충분히 먼 상시 통로
      const far = corridors.filter((c) =>
        grid[c.y][c.x] === "." &&
        Math.abs(c.x - spawn.x) + Math.abs(c.y - spawn.y) >= 9);
      if (far.length < 2 || placed < 6) continue; // 재시도

      shuffle(far);
      MAP = grid.map((r) => r.join(""));
      playerSpawn = spawn;
      hunterSpawns = [far[0], far[1]];
      return;
    }
    // 폴백 (사실상 도달 불가): 마지막 시도 그대로 사용
  }

  /* ---------- 게임 상태 ---------- */
  let open = false, running = false, raf = null, lastT = 0;
  let tile = 32, u = 1;
  let phase, phaseT, timeLeft, score, lives, pellets, invincible, readyT, flashT;
  let player, hunters;
  let siteAudioWasPlaying = false;

  function makeEntity(spawn, ms) {
    return { x: spawn.x, y: spawn.y, fx: spawn.x, fy: spawn.y,
      tx: spawn.x, ty: spawn.y, moving: false, t: 0, ms, dir: { x: 1, y: 0 }, want: { x: 0, y: 0 } };
  }
  function startMove(e, dx, dy) {
    e.tx = e.x + dx; e.ty = e.y + dy;
    e.dir = { x: dx, y: dy };
    e.moving = true; e.t = 0;
  }
  function stepEntity(e, dtMs, isHunter) {
    if (!e.moving) return;
    e.t += dtMs;
    const p = Math.min(e.t / e.ms, 1);
    e.fx = e.x + (e.tx - e.x) * p;
    e.fy = e.y + (e.ty - e.y) * p;
    if (p >= 1) {
      e.x = e.tx; e.y = e.ty; e.fx = e.x; e.fy = e.y; e.moving = false;
      if (isHunter) pickHunterDir(e);
      else { eatAt(e.x, e.y); tryPlayerMove(); }
    }
  }

  function tryPlayerMove() {
    const w = player.want;
    if ((w.x || w.y) && passable(player.x + w.x, player.y + w.y, phase)) { startMove(player, w.x, w.y); return; }
    const d = player.dir;
    if ((d.x || d.y) && passable(player.x + d.x, player.y + d.y, phase)) startMove(player, d.x, d.y);
  }

  function pickHunterDir(h) {
    const dirs = [{ x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: -1 }];
    let options = dirs.filter((d) => passable(h.x + d.x, h.y + d.y, phase));
    if (!options.length) return;
    const noBack = options.filter((d) => !(d.x === -h.dir.x && d.y === -h.dir.y));
    if (noBack.length) options = noBack;
    let choice;
    if (Math.random() < CHASE_P) {
      options.sort((a, b) =>
        (Math.abs(h.x + a.x - player.x) + Math.abs(h.y + a.y - player.y)) -
        (Math.abs(h.x + b.x - player.x) + Math.abs(h.y + b.y - player.y)));
      choice = options[0];
    } else choice = options[(Math.random() * options.length) | 0];
    startMove(h, choice.x, choice.y);
  }

  function eatAt(x, y) {
    const key = x + "," + y;
    if (pellets.has(key)) {
      pellets.delete(key);
      score += PELLET_PT;
      SND.eat();
      if (!pellets.size) { updateHud(); endGame(true); }
    }
  }

  /* ---------- 라이프사이클 ---------- */
  function reset() {
    genMap(); // ★ 매 판 새 미로
    phase = "land"; phaseT = 0; timeLeft = TIME_LIMIT;
    score = 0; lives = 3; invincible = 0; flashT = 0; readyT = READY_SEC;
    player = makeEntity(playerSpawn, PLAYER_MS);
    hunters = hunterSpawns.map((s) => makeEntity(s, HUNTER_MS));
    pellets = new Map();
    for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) {
      const t = at(x, y);
      if (t === "#") continue;
      if (x === playerSpawn.x && y === playerSpawn.y) continue;
      pellets.set(x + "," + y, t === "W" ? "fish" : t === "L" ? "berry" : "dot");
    }
    updateHud();
  }

  function updateHud() {
    elScore.textContent = "SCORE " + score;
    const best = +localStorage.getItem("wani-game-best") || 0;
    elBest.textContent = best ? "BEST " + best : "";
    elTime.textContent = Math.ceil(timeLeft);
    elLives.textContent = "◆".repeat(lives) + "◇".repeat(Math.max(0, 3 - lives));
    const remain = Math.ceil(PHASE_SEC - phaseT);
    elPhase.textContent = (phase === "land" ? "▲ LAND " : "▼ WATER ") + remain;
    elPhase.style.color = phase === "land" ? LAND.c1 : WATER.c1;
  }

  function showMsg(html) { elMsg.innerHTML = html; elMsg.hidden = false; }
  function hideMsg() { elMsg.hidden = true; }

  function startScreen() {
    running = false;
    showMsg(`
      <h2>WANI MAZE</h2>
      <pre class="gm-croc">  _(o)_(o)_\n~/  ~ ~ ~  \\~</pre>
      <p>먹이를 전부 먹으면 클리어! 사냥꾼을 피하세요.<br>
      10초마다 세계가 바뀝니다 — 매 판 미로도 새로 생성!<br>
      <b class="gm-land">▲ LAND</b>: 잔디길(열매)만 통행 · <b class="gm-water">▼ WATER</b>: 물길(물고기)만 통행<br>
      어두운 <b style="color:#ff5566">✕</b> 타일은 지금 못 지나가는 길입니다</p>
      <p class="gm-keys">← ↑ ↓ → / WASD / 스와이프 · ESC 종료</p>
      <button id="gm-start">[ START ]</button>`);
    document.getElementById("gm-start").onclick = begin;
  }

  function begin() {
    reset(); hideMsg();
    running = true; lastT = performance.now();
    SND.startBgm();
  }

  function endGame(win) {
    running = false;
    SND.stopBgm();
    if (win) { score += Math.ceil(timeLeft) * 10; SND.win(); } else SND.over();
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
    SND.death();
    updateHud();
    if (lives <= 0) { endGame(false); return; }
    invincible = 2.5;
    readyT = 1.2;
    player.x = player.fx = player.tx = playerSpawn.x;
    player.y = player.fy = player.ty = playerSpawn.y;
    player.moving = false; player.dir = { x: 1, y: 0 }; player.want = { x: 0, y: 0 };
    hunters = hunterSpawns.map((s) => makeEntity(s, HUNTER_MS));
    flashT = 0.4;
  }

  /* ---------- 업데이트 ---------- */
  function update(dt) {
    if (readyT > 0) { readyT -= dt; updateHud(); return; } // 카운트다운 중 정지

    timeLeft -= dt;
    if (timeLeft <= 0) { timeLeft = 0; updateHud(); endGame(false); return; }
    if (invincible > 0) invincible -= dt;
    if (flashT > 0) flashT -= dt;

    phaseT += dt;
    if (phaseT >= PHASE_SEC) {
      phaseT = 0;
      phase = phase === "land" ? "water" : "land";
      SND.phase(phase === "water");
      flashT = 0.35;
      for (const e of [player, ...hunters]) {
        if (e.moving && !passable(e.tx, e.ty, phase)) {
          e.tx = e.x; e.ty = e.y; e.moving = false; e.fx = e.x; e.fy = e.y;
        }
      }
    }

    if (!player.moving) tryPlayerMove();
    stepEntity(player, dt * 1000, false);
    for (const h of hunters) {
      if (!h.moving) pickHunterDir(h);
      stepEntity(h, dt * 1000, true);
    }

    if (invincible <= 0) {
      for (const h of hunters) {
        if (Math.hypot(h.fx - player.fx, h.fy - player.fy) < 0.55) { loseLife(); break; }
      }
    }
    updateHud();
  }

  /* ---------- 렌더 ---------- */
  function drawTile(x, y, now) {
    const t = at(x, y);
    const px = x * tile, py = y * tile;
    const P = phase === "land" ? LAND : WATER;

    if (t === "#") { // 벽 — 확실히 보이게 (밝은 몸체 + 네온 테두리 + 상단 하이라이트)
      ctx.fillStyle = "#20202e";
      ctx.fillRect(px, py, tile, tile);
      ctx.fillStyle = "#31314a";
      ctx.fillRect(px, py, tile, 3);
      ctx.strokeStyle = P.c2 + "aa";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(px + 1, py + 1, tile - 2, tile - 2);
      return;
    }
    const active = passable(x, y, phase);
    const willBlock = active && t !== "." && phaseT > PHASE_SEC - WARN_SEC; // 곧 막힐 타일

    // 통로 공통 바닥 (벽과 명확히 구분)
    ctx.fillStyle = "rgba(232,232,240,.055)";
    ctx.fillRect(px, py, tile, tile);
    if (t === "L") {
      if (active) { // 잔디밭
        ctx.fillStyle = "rgba(255,77,0,.20)";
        ctx.fillRect(px, py, tile, tile);
        ctx.strokeStyle = "rgba(255,77,0,.75)";
        ctx.lineWidth = 1.5;
        for (let i = 0; i < 3; i++) { // 풀잎
          const gx = px + tile * (0.25 + i * 0.25), gy = py + tile * 0.78;
          ctx.beginPath();
          ctx.moveTo(gx, gy); ctx.lineTo(gx - 2 * u, gy - 6 * u);
          ctx.moveTo(gx, gy); ctx.lineTo(gx + 2 * u, gy - 5 * u);
          ctx.stroke();
        }
      }
    } else if (t === "W") {
      if (active) { // 물결
        ctx.fillStyle = "rgba(207,205,198,.18)";
        ctx.fillRect(px, py, tile, tile);
        ctx.strokeStyle = "rgba(207,205,198,.8)";
        ctx.lineWidth = 1.5;
        for (let i = 0; i < 2; i++) {
          const wy = py + tile * (0.35 + i * 0.35);
          ctx.beginPath();
          for (let wx = 0; wx <= tile; wx += 3) {
            const yy = wy + Math.sin((px + wx) * 0.25 + now * 5 + i * 2) * 2.2 * u;
            wx === 0 ? ctx.moveTo(px + wx, yy) : ctx.lineTo(px + wx, yy);
          }
          ctx.stroke();
        }
      }
    }

    if (!active) { // ✕ 막힌 길 — 명확하게
      ctx.fillStyle = "rgba(0,0,0,.55)";
      ctx.fillRect(px, py, tile, tile);
      ctx.strokeStyle = "rgba(255,85,102,.55)";
      ctx.lineWidth = 2.5;
      const m = tile * 0.28;
      ctx.beginPath();
      ctx.moveTo(px + m, py + m); ctx.lineTo(px + tile - m, py + tile - m);
      ctx.moveTo(px + tile - m, py + m); ctx.lineTo(px + m, py + tile - m);
      ctx.stroke();
      return;
    }
    if (willBlock && (now * 4 | 0) % 2 === 0) { // 곧 막힘 경고 점멸
      ctx.strokeStyle = "rgba(255,255,255,.7)";
      ctx.lineWidth = 2;
      ctx.strokeRect(px + 2, py + 2, tile - 4, tile - 4);
    }

    // 먹이
    const pel = pellets.get(x + "," + y);
    if (!pel) return;
    const cx = px + tile / 2, cy = py + tile / 2;
    if (pel === "dot") {
      ctx.fillStyle = "#e8e8f0";
      ctx.fillRect(cx - 2 * u, cy - 2 * u, 4 * u, 4 * u);
    } else if (pel === "fish") {
      ctx.fillStyle = "#7df9ff";
      ctx.fillRect(cx - 5 * u, cy - 3 * u, 7 * u, 6 * u);
      ctx.beginPath();
      ctx.moveTo(cx + 2 * u, cy); ctx.lineTo(cx + 6 * u, cy - 4 * u); ctx.lineTo(cx + 6 * u, cy + 4 * u);
      ctx.fill();
      ctx.fillStyle = "#0f0f0f";
      ctx.fillRect(cx - 3 * u, cy - 1 * u, 2 * u, 2 * u);
    } else if (pel === "berry") {
      ctx.fillStyle = "#d6ff4f";
      ctx.fillRect(cx - 4 * u, cy - 2 * u, 8 * u, 7 * u);
      ctx.fillStyle = "#c9e5c4";
      ctx.fillRect(cx - 1 * u, cy - 6 * u, 2 * u, 4 * u);
    }
  }

  /* 사냥꾼: 사파리 모자 + 조끼 + 소총 */
  function drawHunter(h, idx, now) {
    const px = h.fx * tile, py = h.fy * tile;
    const bob = Math.sin(now * 7 + idx * 3) * 1.2 * u;
    const vest = idx === 0 ? "#aad59e" : "#b8cde6";
    ctx.save();
    ctx.translate(px, py + bob);
    // 다리
    ctx.fillStyle = "#2c2c38";
    ctx.fillRect(10 * u, 26 * u, 4 * u, 5 * u);
    ctx.fillRect(18 * u, 26 * u, 4 * u, 5 * u);
    // 조끼(몸통)
    ctx.fillStyle = vest;
    ctx.fillRect(8 * u, 16 * u, 16 * u, 11 * u);
    ctx.fillStyle = "rgba(0,0,0,.35)"; // 주머니
    ctx.fillRect(10 * u, 21 * u, 4 * u, 4 * u);
    ctx.fillRect(18 * u, 21 * u, 4 * u, 4 * u);
    // 얼굴
    ctx.fillStyle = "#e8c9a0";
    ctx.fillRect(10 * u, 9 * u, 12 * u, 7 * u);
    ctx.fillStyle = "#0f0f0f"; // 눈 (플레이어 쪽을 노려봄)
    const look = Math.sign(player.fx - h.fx) * 1.2 * u;
    ctx.fillRect(12 * u + look, 11 * u, 2.5 * u, 2.5 * u);
    ctx.fillRect(18 * u + look, 11 * u, 2.5 * u, 2.5 * u);
    // 사파리 모자 (넓은 챙)
    ctx.fillStyle = "#7a5b2a";
    ctx.fillRect(6 * u, 7 * u, 20 * u, 3 * u);       // 챙
    ctx.fillRect(10 * u, 2 * u, 12 * u, 6 * u);      // 크라운
    ctx.fillStyle = "#4a3517";
    ctx.fillRect(10 * u, 6 * u, 12 * u, 2 * u);      // 밴드
    // 소총 (대각선)
    ctx.strokeStyle = "#3a3a46";
    ctx.lineWidth = 3 * u;
    ctx.beginPath();
    ctx.moveTo(4 * u, 24 * u); ctx.lineTo(28 * u, 15 * u);
    ctx.stroke();
    ctx.strokeStyle = "#6b4a1f"; // 개머리판
    ctx.lineWidth = 4 * u;
    ctx.beginPath();
    ctx.moveTo(4 * u, 24 * u); ctx.lineTo(9 * u, 22 * u);
    ctx.stroke();
    ctx.restore();
  }

  function drawPlayer(now) {
    if (invincible > 0 && (now * 8 | 0) % 2 === 1) return; // 무적 점멸
    const P = phase === "land" ? LAND : WATER;
    const px = player.fx * tile, py = player.fy * tile;
    const d = player.dir;
    ctx.save();
    ctx.translate(px + tile / 2, py + tile / 2);
    if (d.x === -1) ctx.scale(-1, 1);
    if (d.y === 1) ctx.rotate(Math.PI / 2);
    if (d.y === -1) ctx.rotate(-Math.PI / 2);
    const jaw = Math.abs(Math.sin(now * 6)) * 3 * u; // 오물오물
    ctx.fillStyle = P.c1;
    ctx.fillRect(-tile / 2 + 4 * u, -5 * u, tile - 12 * u, 10 * u);       // 몸통
    ctx.fillRect(tile / 2 - 11 * u, -4 * u - jaw * 0.4, 9 * u, 4 * u);    // 윗턱
    ctx.fillRect(tile / 2 - 11 * u, 1 * u + jaw * 0.4, 9 * u, 3 * u);     // 아랫턱
    ctx.fillStyle = P.c2;
    ctx.fillRect(-tile / 2 + 6 * u, -9 * u, 5 * u, 5 * u);                // 눈두덩
    ctx.fillRect(-tile / 2 + 14 * u, -9 * u, 5 * u, 5 * u);
    ctx.fillStyle = "#0f0f0f";
    ctx.fillRect(-tile / 2 + 7 * u, -8 * u, 2 * u, 2 * u);                // 눈
    ctx.fillRect(-tile / 2 + 15 * u, -8 * u, 2 * u, 2 * u);
    ctx.fillStyle = "#fff";
    ctx.fillRect(tile / 2 - 9 * u, -1 * u, 2 * u, 2 * u);                 // 이빨
    ctx.restore();
  }

  function draw() {
    const now = performance.now() / 1000;
    const P = phase === "land" ? LAND : WATER;
    ctx.fillStyle = P.bg;
    ctx.fillRect(0, 0, cvs.width, cvs.height);

    for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) drawTile(x, y, now);
    for (const [i, h] of hunters.entries()) drawHunter(h, i, now);
    drawPlayer(now);

    if (flashT > 0) {
      ctx.fillStyle = (phase === "land" ? "rgba(255,77,0," : "rgba(207,205,198,") + (flashT * 0.3) + ")";
      ctx.fillRect(0, 0, cvs.width, cvs.height);
    }
    if (running && readyT > 0) { // 시작/부활 카운트다운
      ctx.fillStyle = "rgba(0,0,0,.45)";
      ctx.fillRect(0, 0, cvs.width, cvs.height);
      ctx.fillStyle = "#fff";
      ctx.font = `bold ${28 * u}px 'Pretendard Variable', Pretendard, sans-serif`;
      ctx.textAlign = "center";
      ctx.fillText(readyT > 0.7 ? "READY?" : "GO!", cvs.width / 2, cvs.height / 2);
    }
  }

  function loop(nowMs) {
    if (!open) return;
    const dt = Math.min((nowMs - lastT) / 1000, 0.05);
    lastT = nowMs;
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
      if (!player.moving && running && readyT <= 0) tryPlayerMove();
    }
  }
  let touchStart = null;
  function onTouchStart(e) { touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY }; }
  function onTouchEnd(e) {
    if (!touchStart) return;
    const dx = e.changedTouches[0].clientX - touchStart.x;
    const dy = e.changedTouches[0].clientY - touchStart.y;
    touchStart = null;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return;
    player.want = Math.abs(dx) > Math.abs(dy) ? { x: Math.sign(dx), y: 0 } : { x: 0, y: Math.sign(dy) };
    if (!player.moving && running && readyT <= 0) tryPlayerMove();
  }

  function resize() {
    const availW = window.innerWidth - 24;
    const availH = window.innerHeight - 90;
    tile = Math.max(18, Math.min(Math.floor(availW / COLS), Math.floor(availH / ROWS)));
    u = tile / 32;
    cvs.width = COLS * tile; cvs.height = ROWS * tile;
    ctx.imageSmoothingEnabled = false;
  }

  /* ---------- 공개 API ---------- */
  const api = {
    isOpen: () => open,
    open(push = true) {
      if (open) return;
      open = true;
      if (push) history.pushState({ view: "game" }, "", "#game");
      // 사이트 오디오 일시정지 (게임 BGM과 충돌 방지)
      const siteAudio = document.getElementById("audio-el");
      siteAudioWasPlaying = siteAudio && !siteAudio.paused;
      if (siteAudioWasPlaying) {
        siteAudio.pause();
        const btn = document.getElementById("btn-audio");
        if (btn) btn.textContent = "▶ AUDIO";
      }
      overlay.hidden = false;
      document.body.style.overflow = "hidden";
      resize();
      reset();
      // "이스터에그 발견!" 연출 후 시작 화면
      hideMsg();
      const toast = document.getElementById("egg-toast");
      const first = !localStorage.getItem("wani-egg-found");
      localStorage.setItem("wani-egg-found", "1");
      toast.querySelector(".egg-sub").textContent = first
        ? "숨겨진 게임 「WANI MAZE」를 발견했습니다!"
        : "WANI MAZE — 다시 오셨군요, 사냥꾼들이 기다립니다";
      toast.hidden = false;
      SND.discover();
      setTimeout(() => {
        toast.hidden = true;
        if (open) startScreen();
      }, 1500);
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
      SND.stopBgm();
      cancelAnimationFrame(raf);
      overlay.hidden = true;
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", resize);
      overlay.removeEventListener("touchstart", onTouchStart);
      overlay.removeEventListener("touchend", onTouchEnd);
      // 게임 전에 사이트 오디오가 켜져 있었다면 복원
      if (siteAudioWasPlaying) {
        const siteAudio = document.getElementById("audio-el");
        siteAudio?.play().then(() => {
          const btn = document.getElementById("btn-audio");
          if (btn) btn.textContent = "■ AUDIO";
        }).catch(() => {});
      }
      if (pop && location.hash === "#game") history.back();
    },
  };
  document.getElementById("g-exit").addEventListener("click", () => api.close());
  window.WANI_GAME = api;
})();
