/**
 * BUG HUNTER — mini-game shooter 2D orisinal (canvas, tanpa library).
 * Pemain: pesawat bermotif monogram ZS. Musuh: "bug" pixel yang turun bergelombang.
 *
 * v2: kesulitan naik bertahap, 6 buff yang dijatuhkan bug, combo (pengali skor s/d ×4),
 *     senjata naik level di wave 3 & 6, dan boss "KERNEL PANIC" tiap 5 wave.
 *     Jika aturan skor diubah, sesuaikan juga maxScoreFor() di src/lib/server/leaderboard.ts.
 */

const COL = {
  bg: "#08070d",
  grid: "rgba(139,92,246,0.08)",
  violet: "#8b5cf6",
  violetSoft: "#a78bfa",
  violetDim: "#5b3fb8",
  lime: "#c6ff3d",
  magenta: "#ff3d9a",
  ink: "#f1eefc",
  ink3: "#847ea0",
};

// Sprite pixel (X = piksel terisi). Dua frame untuk animasi kaki.
const BUG_A = [
  "..X..X..",
  "...XX...",
  ".XXXXXX.",
  "XX.XX.XX",
  "XXXXXXXX",
  ".X.XX.X.",
  "X......X",
  ".X....X.",
];
const BUG_B = [
  "..X..X..",
  "...XX...",
  ".XXXXXX.",
  "XX.XX.XX",
  "XXXXXXXX",
  ".X.XX.X.",
  ".X....X.",
  "X......X",
];
const BIG_A = [
  "...XXXX...",
  ".XXXXXXXX.",
  "XXX.XX.XXX",
  "XXXXXXXXXX",
  "XX.XXXX.XX",
  ".XXXXXXXX.",
  "X.X.XX.X.X",
  ".X......X.",
];
const BIG_B = [
  "...XXXX...",
  ".XXXXXXXX.",
  "XXX.XX.XXX",
  "XXXXXXXXXX",
  "XX.XXXX.XX",
  ".XXXXXXXX.",
  ".X.X..X.X.",
  "X........X",
];
const LABELS = ["404", "NULL", "NaN", "CORS", "500", "LEAK", "SEGV", "undef"];

/** Buff yang bisa dijatuhkan bug. Nama & warna dipakai juga oleh legenda di Arcade.tsx. */
export const BUFFS = {
  spread: { tag: "MT", name: "MULTI-THREAD", color: "#c6ff3d" },
  rapid: { tag: "OC", name: "OVERCLOCK", color: "#ffc53d" },
  shield: { tag: "FW", name: "FIREWALL", color: "#3dd6ff" },
  heal: { tag: "+1", name: "PATCH", color: "#ff6b8b" },
  slow: { tag: "DB", name: "DEBUG MODE", color: "#a78bfa" },
  bomb: { tag: "HF", name: "HOTFIX", color: "#f1eefc" },
} as const;
export type BuffKind = keyof typeof BUFFS;
const DROP_WEIGHTS: [BuffKind, number][] = [
  ["spread", 24],
  ["rapid", 24],
  ["shield", 20],
  ["heal", 12],
  ["slow", 13],
  ["bomb", 7],
];

const MAX_LIVES = 5;
const BOSS_EVERY = 5;

type Enemy = {
  x: number;
  y: number;
  baseX: number;
  t: number;
  amp: number;
  freq: number;
  speed: number;
  hp: number;
  maxHp: number;
  big: boolean;
  boss: boolean;
  fireT: number;
  w: number;
  h: number;
  label: string;
  flash: number;
};
type Bullet = { x: number; y: number; vx: number; vy: number; enemy: boolean };
type Drop = { x: number; y: number; kind: BuffKind; t: number };
type Toast = { text: string; color: string; t: number };
type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  color: string;
  size: number;
};
type Star = { x: number; y: number; z: number };

export type GameCallbacks = {
  onHud: (score: number, wave: number, lives: number) => void;
  onOver: (score: number, wave: number) => void;
};

export function createGame(
  canvas: HTMLCanvasElement,
  cb: GameCallbacks,
  opts: { reduced: boolean },
) {
  const ctx = canvas.getContext("2d")!;
  let W = 0;
  let H = 0;
  let dpr = 1;
  let raf = 0;
  let last = 0;
  let running = false;

  // state
  let px = 0;
  let targetX = 0;
  let keys = { left: false, right: false };
  let cooldown = 0;
  let invuln = 0;
  let shake = 0;
  let flash = 0;
  let score = 0;
  let lives = 3;
  let wave = 1;
  let toSpawn = 0;
  let spawnTimer = 0;
  let waveBanner = 0;
  let combo = 0;
  let comboT = 0;
  let shield = 0;
  let buffs = { spread: 0, rapid: 0, slow: 0 };
  let enemies: Enemy[] = [];
  let bullets: Bullet[] = [];
  let drops: Drop[] = [];
  let toasts: Toast[] = [];
  let particles: Particle[] = [];
  let stars: Star[] = [];
  let animT = 0;

  const scale = () => Math.max(0.7, Math.min(1.25, W / 800)); // ukuran sprite relatif lebar
  const isBossWave = () => wave % BOSS_EVERY === 0;
  const multiplier = () => Math.min(4, 1 + Math.floor(combo / 8));
  const slowF = () => (buffs.slow > 0 ? 0.5 : 1);

  function resize() {
    const r = canvas.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = Math.max(1, r.width);
    H = Math.max(1, r.height);
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (!stars.length)
      stars = Array.from({ length: 70 }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        z: Math.random(),
      }));
    px = Math.min(Math.max(px || W / 2, 24), W - 24);
    targetX = px;
    if (!running) draw();
  }

  function reset() {
    score = 0;
    lives = 3;
    wave = 1;
    combo = 0;
    comboT = 0;
    shield = 0;
    flash = 0;
    buffs = { spread: 0, rapid: 0, slow: 0 };
    enemies = [];
    bullets = [];
    drops = [];
    toasts = [];
    particles = [];
    px = targetX = W / 2;
    invuln = 1.2;
    startWave();
    cb.onHud(score, wave, lives);
  }

  function startWave() {
    if (isBossWave()) {
      toSpawn = 3 + wave;
      spawnBoss();
    } else {
      toSpawn = 5 + wave * 3;
    }
    spawnTimer = 0.6;
    waveBanner = 1.8;
  }

  function spawn() {
    const s = scale();
    const big = wave >= 2 && Math.random() < Math.min(0.1 + wave * 0.03, 0.35);
    const w = (big ? 10 : 8) * 4 * s;
    const h = 8 * 4 * s;
    const baseX = w + Math.random() * (W - w * 2);
    // Wave awal: goyangan kecil & lambat supaya mudah dibidik
    const ease = Math.min(1, 0.45 + wave * 0.15);
    enemies.push({
      x: baseX,
      y: -h,
      baseX,
      t: Math.random() * 6,
      amp: (14 + Math.random() * 40 * s) * ease,
      freq: 1 + Math.random() * 1.4,
      speed: (big ? 30 : 40) + (wave - 1) * 6 + Math.random() * 14,
      hp: big ? 3 : 1,
      maxHp: big ? 3 : 1,
      big,
      boss: false,
      fireT: 0,
      w,
      h,
      label: LABELS[(Math.random() * LABELS.length) | 0],
      flash: 0,
    });
  }

  function spawnBoss() {
    const s = scale();
    const w = 10 * 4 * s * 2;
    const h = 8 * 4 * s * 2;
    const hp = 26 + wave * 3;
    enemies.push({
      x: W / 2,
      y: -h,
      baseX: W / 2,
      t: 0,
      amp: Math.max(40, W / 2 - w),
      freq: 0.55,
      speed: 46,
      hp,
      maxHp: hp,
      big: true,
      boss: true,
      fireT: 2,
      w,
      h,
      label: "KERNEL PANIC",
      flash: 0,
    });
  }

  function burst(x: number, y: number, color: string, n = 16, power = 180) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const v = power * (0.3 + Math.random());
      particles.push({
        x,
        y,
        vx: Math.cos(a) * v,
        vy: Math.sin(a) * v,
        life: 0,
        max: 0.4 + Math.random() * 0.5,
        color,
        size: 2 + Math.random() * 3,
      });
    }
  }

  function toast(text: string, color: string) {
    toasts.push({ text, color, t: 1.4 });
    if (toasts.length > 3) toasts.shift();
  }

  function pickDrop(): BuffKind {
    const pool = DROP_WEIGHTS.filter(([k]) => k !== "heal" || lives < MAX_LIVES);
    let r = Math.random() * pool.reduce((n, [, w]) => n + w, 0);
    for (const [k, w] of pool) if ((r -= w) <= 0) return k;
    return "spread";
  }

  function killEnemy(e: Enemy) {
    e.hp = 0;
    combo += 1;
    comboT = 2.2;
    score += (e.boss ? 250 : e.big ? 30 : 10) * multiplier();
    burst(e.x, e.y, e.boss || e.big ? COL.magenta : COL.violetSoft, e.boss ? 70 : e.big ? 30 : 16);
    burst(e.x, e.y, COL.lime, e.boss ? 30 : 6, e.boss ? 260 : 120);
    if (e.boss) {
      if (!opts.reduced) shake = 0.5;
      toast("KERNEL PATCHED", COL.lime);
    }
    // Peluang menjatuhkan buff
    const n = e.boss ? 2 : Math.random() < (e.big ? 0.3 : 0.1) ? 1 : 0;
    for (let i = 0; i < n; i++)
      drops.push({ x: e.x + (i - (n - 1) / 2) * 34, y: e.y, kind: pickDrop(), t: 0 });
    cb.onHud(score, wave, lives);
  }

  function applyBuff(kind: BuffKind) {
    const b = BUFFS[kind];
    if (kind === "spread") buffs.spread = 9;
    else if (kind === "rapid") buffs.rapid = 9;
    else if (kind === "slow") buffs.slow = 6;
    else if (kind === "shield") shield = 14;
    else if (kind === "heal") {
      lives = Math.min(MAX_LIVES, lives + 1);
      cb.onHud(score, wave, lives);
    } else if (kind === "bomb") {
      flash = 0.3;
      if (!opts.reduced) shake = 0.3;
      for (const e of enemies) {
        if (e.hp <= 0 || e.y < -e.h / 2) continue;
        if (e.boss) {
          e.hp -= 10;
          e.flash = 0.15;
          if (e.hp <= 0) killEnemy(e);
        } else killEnemy(e);
      }
      bullets = bullets.filter((x) => !x.enemy);
    }
    burst(px, H - 50 * scale(), b.color, 18, 160);
    toast(`+ ${b.name}`, b.color);
  }

  function hitPlayer() {
    if (invuln > 0) return;
    if (shield > 0) {
      // Firewall menahan satu serangan
      shield = 0;
      invuln = 1;
      burst(px, H - 50 * scale(), BUFFS.shield.color, 24, 220);
      toast("FIREWALL DOWN", BUFFS.shield.color);
      return;
    }
    lives -= 1;
    combo = 0;
    invuln = 1.6;
    if (!opts.reduced) shake = 0.35;
    burst(px, H - 50, COL.magenta, 28, 240);
    cb.onHud(score, wave, lives);
    if (lives <= 0) {
      running = false;
      cancelAnimationFrame(raf);
      burst(px, H - 50, COL.lime, 50, 320);
      draw();
      cb.onOver(score, wave);
    }
  }

  function fire(playerY: number, s: number) {
    const shot = (dx: number, dy: number, vx: number) =>
      bullets.push({ x: px + dx * s, y: playerY + dy * s, vx, vy: -720, enemy: false });
    // Level senjata naik otomatis: wave 3 → ganda, wave 6 → tiga arah
    if (wave >= 6) {
      shot(0, -22, 0);
      shot(-12, -8, -40);
      shot(12, -8, 40);
    } else if (wave >= 3) {
      shot(-6, -18, 0);
      shot(6, -18, 0);
    } else shot(0, -22, 0);
    if (buffs.spread > 0) {
      shot(-8, -12, -230);
      shot(8, -12, 230);
    }
    cooldown = buffs.rapid > 0 ? 0.1 : 0.2;
  }

  function update(dt: number) {
    animT += dt;
    const s = scale();
    const playerY = H - 50 * s;
    const sf = slowF();

    // gerak pemain (pointer = target, keyboard = langsung)
    const speed = 520 * s;
    if (keys.left) targetX -= speed * dt;
    if (keys.right) targetX += speed * dt;
    targetX = Math.min(Math.max(targetX, 22 * s), W - 22 * s);
    px += (targetX - px) * Math.min(1, dt * 14);

    // tembak otomatis
    cooldown -= dt;
    if (cooldown <= 0) fire(playerY, s);

    // timer buff & combo
    buffs.spread = Math.max(0, buffs.spread - dt);
    buffs.rapid = Math.max(0, buffs.rapid - dt);
    buffs.slow = Math.max(0, buffs.slow - dt);
    shield = Math.max(0, shield - dt);
    if (comboT > 0) {
      comboT -= dt;
      if (comboT <= 0) combo = 0;
    }

    // spawn
    if (toSpawn > 0) {
      spawnTimer -= dt;
      if (spawnTimer <= 0) {
        spawn();
        toSpawn -= 1;
        spawnTimer = Math.max(0.3, 1.05 - wave * 0.06) * (0.6 + Math.random() * 0.8);
      }
    } else if (enemies.length === 0) {
      wave += 1;
      score += 50;
      cb.onHud(score, wave, lives);
      if (wave === 3 || wave === 6) toast("WEAPON UPGRADE", COL.lime);
      startWave();
    }
    if (waveBanner > 0) waveBanner -= dt;

    // Laju tembakan musuh per detik: wave 1 tidak menembak sama sekali
    const fireRate = wave < 2 ? 0 : 0.04 + (wave - 2) * 0.035;
    for (const e of enemies) {
      e.t += dt * sf;
      if (e.flash > 0) e.flash -= dt;
      if (e.boss) {
        // Boss turun lalu melayang kiri-kanan di atas, menembak 3 arah
        if (e.y < H * 0.2) e.y += e.speed * dt * sf;
        e.x = W / 2 + Math.sin(e.t * e.freq) * e.amp;
        e.fireT -= dt * sf;
        if (e.fireT <= 0 && e.y > 0) {
          for (const vx of [-110, 0, 110])
            bullets.push({ x: e.x, y: e.y + e.h / 2, vx, vy: 210, enemy: true });
          e.fireT = Math.max(0.9, 1.7 - wave * 0.04);
        }
        continue;
      }
      e.y += e.speed * dt * sf;
      e.x = Math.min(Math.max(e.baseX + Math.sin(e.t * e.freq) * e.amp, e.w / 2), W - e.w / 2);
      const chance = fireRate * (e.big ? 2.2 : 1) * dt * sf;
      if (e.y > 0 && e.y < H * 0.65 && Math.random() < chance) {
        bullets.push({ x: e.x, y: e.y + e.h / 2, vx: 0, vy: 200 + wave * 12, enemy: true });
      }
    }
    // musuh lolos ke bawah = server kena
    for (const e of enemies) {
      if (e.boss) continue;
      if (e.y - e.h / 2 > H) {
        e.hp = -1;
        hitPlayer();
      } else if (
        Math.abs(e.x - px) < (e.w + 24 * s) / 2 &&
        Math.abs(e.y - playerY) < (e.h + 20 * s) / 2
      ) {
        e.hp = -1;
        burst(e.x, e.y, COL.violetSoft);
        hitPlayer();
      }
    }

    // peluru
    for (const b of bullets) {
      const f = b.enemy ? sf : 1;
      b.x += b.vx * dt * f;
      b.y += b.vy * dt * f;
    }
    for (const b of bullets) {
      if (b.enemy) {
        if (Math.abs(b.x - px) < 13 * s && Math.abs(b.y - playerY) < 14 * s) {
          b.y = -9999;
          hitPlayer();
        }
        continue;
      }
      for (const e of enemies) {
        // Hitbox sedikit lebih lebar dari sprite agar tembakan terasa adil
        if (e.hp > 0 && Math.abs(b.x - e.x) < e.w / 2 + 4 * s && Math.abs(b.y - e.y) < e.h / 2) {
          e.hp -= 1;
          e.flash = 0.08;
          b.y = -9999;
          if (e.hp <= 0) killEnemy(e);
          else burst(b.x, b.y, COL.lime, 4, 90);
          break;
        }
      }
    }
    bullets = bullets.filter((b) => b.y > -40 && b.y < H + 40 && b.x > -40 && b.x < W + 40);
    enemies = enemies.filter((e) => e.hp > 0);

    // buff jatuh → ambil dengan menyentuhnya
    for (const d of drops) {
      d.t += dt;
      d.y += 95 * dt;
      if (Math.abs(d.x - px) < 28 * s && Math.abs(d.y - playerY) < 28 * s) {
        d.y = H + 999;
        applyBuff(d.kind);
      }
    }
    drops = drops.filter((d) => d.y < H + 30);
    for (const t of toasts) t.t -= dt;
    toasts = toasts.filter((t) => t.t > 0);
    if (flash > 0) flash -= dt;

    // partikel & bintang
    for (const p of particles) {
      p.life += dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vx *= 0.96;
      p.vy *= 0.96;
    }
    particles = particles.filter((p) => p.life < p.max);
    for (const st of stars) {
      st.y += (20 + st.z * 70) * dt;
      if (st.y > H) {
        st.y = 0;
        st.x = Math.random() * W;
      }
    }
    if (invuln > 0) invuln -= dt;
    if (shake > 0) shake -= dt;
  }

  function sprite(rows: string[], x: number, y: number, px: number, color: string) {
    ctx.fillStyle = color;
    const w = rows[0].length * px;
    const h = rows.length * px;
    for (let r = 0; r < rows.length; r++)
      for (let c = 0; c < rows[r].length; c++)
        if (rows[r][c] === "X")
          ctx.fillRect(x - w / 2 + c * px, y - h / 2 + r * px, px - 0.5, px - 0.5);
  }

  function drawShip(x: number, y: number, s: number) {
    const p = (dx: number, dy: number) => [x + dx * s, y + dy * s] as const;
    ctx.save();
    // api pendorong
    const flame = 6 + Math.sin(animT * 40) * 3;
    ctx.fillStyle = buffs.rapid > 0 ? "rgba(255,197,61,0.9)" : "rgba(198,255,61,0.85)";
    ctx.beginPath();
    ctx.moveTo(...p(-5, 14));
    ctx.lineTo(...p(0, 14 + flame * (buffs.rapid > 0 ? 1.6 : 1)));
    ctx.lineTo(...p(5, 14));
    ctx.fill();
    // badan oktagon bersayap
    ctx.beginPath();
    const pts = [
      p(0, -22),
      p(9, -8),
      p(21, 4),
      p(21, 13),
      p(9, 10),
      p(0, 15),
      p(-9, 10),
      p(-21, 13),
      p(-21, 4),
      p(-9, -8),
    ];
    ctx.moveTo(...pts[0]);
    pts.slice(1).forEach((q) => ctx.lineTo(...q));
    ctx.closePath();
    ctx.fillStyle = "#18152a";
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = COL.violetSoft;
    ctx.stroke();
    // kokpit "Z" lime
    ctx.strokeStyle = COL.lime;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(...p(-5, -6));
    ctx.lineTo(...p(5, -6));
    ctx.lineTo(...p(-5, 4));
    ctx.lineTo(...p(5, 4));
    ctx.stroke();
    // perisai firewall
    if (shield > 0) {
      const blink = shield < 2.5 && Math.floor(animT * 8) % 2 === 0;
      if (!blink) {
        ctx.strokeStyle = BUFFS.shield.color;
        ctx.globalAlpha = 0.55 + Math.sin(animT * 6) * 0.2;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y - 3 * s, 30 * s, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 0.08;
        ctx.fillStyle = BUFFS.shield.color;
        ctx.fill();
      }
    }
    ctx.restore();
  }

  /** Kapsul buff: kotak bersudut dengan kode 2 huruf, berdenyut. */
  function drawDrop(d: Drop, s: number) {
    const b = BUFFS[d.kind];
    const w = 30 * s;
    const h = 20 * s;
    const pulse = 1 + Math.sin(d.t * 8) * 0.08;
    ctx.save();
    ctx.translate(d.x, d.y);
    ctx.scale(pulse, pulse);
    ctx.globalAlpha = 0.18;
    ctx.fillStyle = b.color;
    ctx.fillRect(-w / 2 - 4, -h / 2 - 4, w + 8, h + 8);
    ctx.globalAlpha = 1;
    ctx.fillStyle = "#100e1a";
    ctx.strokeStyle = b.color;
    ctx.lineWidth = 2;
    const c = 5 * s;
    ctx.beginPath();
    ctx.moveTo(-w / 2 + c, -h / 2);
    ctx.lineTo(w / 2, -h / 2);
    ctx.lineTo(w / 2, h / 2 - c);
    ctx.lineTo(w / 2 - c, h / 2);
    ctx.lineTo(-w / 2, h / 2);
    ctx.lineTo(-w / 2, -h / 2 + c);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = b.color;
    ctx.font = `700 ${Math.round(11 * s)}px ui-monospace, Consolas, monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(b.tag, 0, 1);
    ctx.restore();
  }

  /** HUD di dalam kanvas: buff aktif (kiri atas), combo (kanan atas), HP boss (tengah). */
  function drawOverlayHud(s: number) {
    ctx.save();
    ctx.font = `700 ${Math.round(10 * s)}px ui-monospace, Consolas, monospace`;
    ctx.textBaseline = "middle";
    ctx.textAlign = "left";
    // HP boss di paling atas → isi HUD lain digeser ke bawah
    const boss = enemies.find((e) => e.boss);
    const top = boss ? 30 * s : 0;
    if (boss) {
      ctx.fillStyle = "rgba(255,61,154,0.18)";
      ctx.fillRect(18, 12, W - 36, 5);
      ctx.fillStyle = COL.magenta;
      ctx.fillRect(18, 12, (W - 36) * Math.max(0, boss.hp / boss.maxHp), 5);
      ctx.fillText("KERNEL PANIC", 18, 12 + 16 * s);
    }
    const active: [string, string, number, number][] = [];
    if (shield > 0) active.push([BUFFS.shield.name, BUFFS.shield.color, shield, 14]);
    if (buffs.spread > 0) active.push([BUFFS.spread.name, BUFFS.spread.color, buffs.spread, 9]);
    if (buffs.rapid > 0) active.push([BUFFS.rapid.name, BUFFS.rapid.color, buffs.rapid, 9]);
    if (buffs.slow > 0) active.push([BUFFS.slow.name, BUFFS.slow.color, buffs.slow, 6]);
    active.forEach(([name, color, left, total], i) => {
      const y = top + 22 + i * 18 * s;
      ctx.fillStyle = color;
      ctx.fillText(name, 18, y);
      const bx = 18 + 96 * s;
      ctx.fillStyle = "rgba(132,126,160,0.3)";
      ctx.fillRect(bx, y - 2, 56 * s, 4);
      ctx.fillStyle = color;
      ctx.fillRect(bx, y - 2, 56 * s * (left / total), 4);
    });

    const m = multiplier();
    if (combo >= 3) {
      ctx.textAlign = "right";
      ctx.fillStyle = m > 1 ? COL.lime : COL.ink3;
      ctx.font = `700 ${Math.round((m > 1 ? 14 : 11) * s)}px ui-monospace, Consolas, monospace`;
      ctx.fillText(`COMBO ${combo}${m > 1 ? `  ×${m}` : ""}`, W - 18, top + 24);
    }

    // notifikasi singkat (buff diambil, upgrade, dll.)
    ctx.textAlign = "center";
    toasts.forEach((t, i) => {
      ctx.globalAlpha = Math.min(1, t.t * 2);
      ctx.fillStyle = t.color;
      ctx.font = `700 ${Math.round(12 * s)}px ui-monospace, Consolas, monospace`;
      ctx.fillText(t.text, W / 2, H * 0.55 - (1.4 - t.t) * 30 - i * 20 * s);
    });
    ctx.restore();
  }

  function draw() {
    const s = scale();
    ctx.save();
    ctx.fillStyle = COL.bg;
    ctx.fillRect(0, 0, W, H);
    if (shake > 0) ctx.translate((Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10);

    // grid + bintang
    ctx.strokeStyle = buffs.slow > 0 ? "rgba(167,139,250,0.16)" : COL.grid;
    ctx.lineWidth = 1;
    const g = 40;
    const off = (animT * 30) % g;
    ctx.beginPath();
    for (let x = 0; x < W; x += g) {
      ctx.moveTo(x + 0.5, 0);
      ctx.lineTo(x + 0.5, H);
    }
    for (let y = off; y < H; y += g) {
      ctx.moveTo(0, y + 0.5);
      ctx.lineTo(W, y + 0.5);
    }
    ctx.stroke();
    for (const st of stars) {
      ctx.fillStyle = st.z > 0.7 ? "rgba(241,238,252,0.8)" : "rgba(167,139,250,0.45)";
      ctx.fillRect(st.x, st.y, 1 + st.z * 1.5, 1 + st.z * 1.5);
    }

    // garis server di bawah
    ctx.fillStyle = "rgba(255,61,154,0.12)";
    ctx.fillRect(0, H - 6, W, 6);
    ctx.fillStyle = COL.magenta;
    ctx.fillRect(0, H - 2, W, 2);

    // musuh
    const frame = Math.floor(animT * 4) % 2 === 0;
    ctx.textAlign = "center";
    for (const e of enemies) {
      const color = e.flash > 0 ? COL.ink : e.big ? COL.magenta : COL.violetSoft;
      const px4 = 4 * s * (e.boss ? 2 : 1);
      sprite(e.big ? (frame ? BIG_A : BIG_B) : frame ? BUG_A : BUG_B, e.x, e.y, px4, color);
      if (e.boss) continue;
      ctx.font = `${Math.round(10 * s)}px ui-monospace, Consolas, monospace`;
      ctx.fillStyle = COL.ink3;
      ctx.fillText(e.label, e.x, e.y + e.h / 2 + 12 * s);
      if (e.big) {
        for (let i = 0; i < 3; i++) {
          ctx.fillStyle = i < e.hp ? COL.lime : "rgba(132,126,160,0.35)";
          ctx.fillRect(e.x - 13 * s + i * 9 * s, e.y - e.h / 2 - 8 * s, 7 * s, 3 * s);
        }
      }
    }

    // buff yang jatuh
    for (const d of drops) drawDrop(d, s);

    // peluru
    for (const b of bullets) {
      if (b.enemy) {
        ctx.fillStyle = "rgba(255,61,154,0.3)";
        ctx.fillRect(b.x - 4, b.y - 6, 8, 12);
        ctx.fillStyle = COL.magenta;
        ctx.fillRect(b.x - 2, b.y - 4, 4, 8);
      } else {
        ctx.fillStyle = "rgba(198,255,61,0.25)";
        ctx.fillRect(b.x - 3, b.y - 10, 6, 20);
        ctx.fillStyle = COL.lime;
        ctx.fillRect(b.x - 1.5, b.y - 8, 3, 16);
      }
    }

    // partikel
    for (const p of particles) {
      ctx.globalAlpha = 1 - p.life / p.max;
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
    }
    ctx.globalAlpha = 1;

    // pemain (berkedip saat kebal)
    if (lives > 0 && (invuln <= 0 || Math.floor(animT * 12) % 2 === 0)) drawShip(px, H - 50 * s, s);

    // banner wave
    if (running && waveBanner > 0) {
      ctx.globalAlpha = Math.min(1, waveBanner);
      ctx.fillStyle = isBossWave() ? COL.magenta : COL.lime;
      ctx.font = `700 ${Math.round(14 * s)}px ui-monospace, Consolas, monospace`;
      ctx.textAlign = "center";
      const label = isBossWave() ? "BOSS WAVE" : "WAVE";
      ctx.fillText(`— ${label} ${String(wave).padStart(2, "0")} —`, W / 2, H * 0.42);
      ctx.globalAlpha = 1;
    }

    if (running) drawOverlayHud(s);

    // kilatan layar saat HOTFIX
    if (flash > 0) {
      ctx.globalAlpha = Math.min(0.55, flash * 2);
      ctx.fillStyle = COL.ink;
      ctx.fillRect(0, 0, W, H);
      ctx.globalAlpha = 1;
    }
    ctx.restore();
  }

  function loop(now: number) {
    if (!running) return;
    const dt = Math.min(0.033, (now - last) / 1000 || 0);
    last = now;
    update(dt);
    if (running) {
      draw();
      raf = requestAnimationFrame(loop);
    }
  }

  function run() {
    running = true;
    last = performance.now();
    raf = requestAnimationFrame(loop);
  }

  resize();

  return {
    start() {
      reset();
      run();
    },
    pause() {
      running = false;
      cancelAnimationFrame(raf);
      draw();
    },
    resume() {
      if (!running && lives > 0) run();
    },
    get running() {
      return running;
    },
    setTargetFromClient(clientX: number) {
      const r = canvas.getBoundingClientRect();
      targetX = clientX - r.left;
    },
    setKey(k: "left" | "right", v: boolean) {
      keys = { ...keys, [k]: v };
    },
    resize,
    destroy() {
      running = false;
      cancelAnimationFrame(raf);
    },
  };
}

export type Game = ReturnType<typeof createGame>;
