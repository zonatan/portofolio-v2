/**
 * BUG HUNTER — mini-game shooter 2D orisinal (canvas, tanpa library).
 * Pemain: pesawat bermotif monogram ZS. Musuh: "bug" pixel yang turun bergelombang.
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

type Enemy = {
  x: number;
  y: number;
  baseX: number;
  t: number;
  amp: number;
  freq: number;
  speed: number;
  hp: number;
  big: boolean;
  w: number;
  h: number;
  label: string;
  flash: number;
};
type Bullet = { x: number; y: number; vy: number; enemy: boolean };
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
  onOver: (score: number) => void;
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
  let score = 0;
  let lives = 3;
  let wave = 1;
  let toSpawn = 0;
  let spawnTimer = 0;
  let waveBanner = 0;
  let enemies: Enemy[] = [];
  let bullets: Bullet[] = [];
  let particles: Particle[] = [];
  let stars: Star[] = [];
  let animT = 0;

  const scale = () => Math.max(0.7, Math.min(1.25, W / 800)); // ukuran sprite relatif lebar

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
    enemies = [];
    bullets = [];
    particles = [];
    px = targetX = W / 2;
    invuln = 1.2;
    startWave();
    cb.onHud(score, wave, lives);
  }

  function startWave() {
    toSpawn = 6 + wave * 3;
    spawnTimer = 0.4;
    waveBanner = 1.6;
  }

  function spawn() {
    const s = scale();
    const big = wave >= 2 && Math.random() < Math.min(0.12 + wave * 0.03, 0.35);
    const w = (big ? 10 : 8) * 4 * s;
    const h = 8 * 4 * s;
    const baseX = w + Math.random() * (W - w * 2);
    enemies.push({
      x: baseX,
      y: -h,
      baseX,
      t: Math.random() * 6,
      amp: 20 + Math.random() * 50 * s,
      freq: 1 + Math.random() * 1.5,
      speed: (big ? 34 : 48) + wave * 7 + Math.random() * 18,
      hp: big ? 3 : 1,
      big,
      w,
      h,
      label: LABELS[(Math.random() * LABELS.length) | 0],
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

  function hitPlayer() {
    if (invuln > 0) return;
    lives -= 1;
    invuln = 1.6;
    if (!opts.reduced) shake = 0.35;
    burst(px, H - 50, COL.magenta, 28, 240);
    cb.onHud(score, wave, lives);
    if (lives <= 0) {
      running = false;
      cancelAnimationFrame(raf);
      burst(px, H - 50, COL.lime, 50, 320);
      draw();
      cb.onOver(score);
    }
  }

  function update(dt: number) {
    animT += dt;
    const s = scale();
    const playerY = H - 50 * s;

    // gerak pemain (pointer = target, keyboard = langsung)
    const speed = 520 * s;
    if (keys.left) targetX -= speed * dt;
    if (keys.right) targetX += speed * dt;
    targetX = Math.min(Math.max(targetX, 22 * s), W - 22 * s);
    px += (targetX - px) * Math.min(1, dt * 14);

    // tembak otomatis
    cooldown -= dt;
    if (cooldown <= 0) {
      bullets.push({ x: px, y: playerY - 22 * s, vy: -720, enemy: false });
      if (wave >= 4) {
        bullets.push({ x: px - 14 * s, y: playerY - 8 * s, vy: -680, enemy: false });
        bullets.push({ x: px + 14 * s, y: playerY - 8 * s, vy: -680, enemy: false });
      }
      cooldown = 0.22;
    }

    // spawn
    if (toSpawn > 0) {
      spawnTimer -= dt;
      if (spawnTimer <= 0) {
        spawn();
        toSpawn -= 1;
        spawnTimer = Math.max(0.28, 0.9 - wave * 0.06) * (0.6 + Math.random() * 0.8);
      }
    } else if (enemies.length === 0) {
      wave += 1;
      score += 50;
      cb.onHud(score, wave, lives);
      startWave();
    }
    if (waveBanner > 0) waveBanner -= dt;

    // musuh
    for (const e of enemies) {
      e.t += dt;
      e.y += e.speed * dt;
      e.x = Math.min(Math.max(e.baseX + Math.sin(e.t * e.freq) * e.amp, e.w / 2), W - e.w / 2);
      if (e.flash > 0) e.flash -= dt;
      const fireChance = (0.0015 + wave * 0.0009) * (e.big ? 2.5 : 1);
      if (e.y > 0 && e.y < H * 0.7 && Math.random() < fireChance) {
        bullets.push({ x: e.x, y: e.y + e.h / 2, vy: 260 + wave * 15, enemy: true });
      }
    }
    // musuh lolos ke bawah = server kena
    for (const e of enemies) {
      if (e.y - e.h / 2 > H) {
        e.hp = -1;
        hitPlayer();
      } else if (
        Math.abs(e.x - px) < (e.w + 34 * s) / 2 &&
        Math.abs(e.y - playerY) < (e.h + 30 * s) / 2
      ) {
        e.hp = -1;
        burst(e.x, e.y, COL.violetSoft);
        hitPlayer();
      }
    }

    // peluru
    for (const b of bullets) b.y += b.vy * dt;
    for (const b of bullets) {
      if (b.enemy) {
        if (Math.abs(b.x - px) < 18 * s && Math.abs(b.y - playerY) < 18 * s) {
          b.y = -9999;
          hitPlayer();
        }
        continue;
      }
      for (const e of enemies) {
        if (e.hp > 0 && Math.abs(b.x - e.x) < e.w / 2 && Math.abs(b.y - e.y) < e.h / 2) {
          e.hp -= 1;
          e.flash = 0.08;
          b.y = -9999;
          if (e.hp <= 0) {
            score += e.big ? 30 : 10;
            burst(e.x, e.y, e.big ? COL.magenta : COL.violetSoft, e.big ? 30 : 16);
            burst(e.x, e.y, COL.lime, 6, 120);
            cb.onHud(score, wave, lives);
          } else burst(b.x, b.y, COL.lime, 4, 90);
          break;
        }
      }
    }
    bullets = bullets.filter((b) => b.y > -40 && b.y < H + 40);
    enemies = enemies.filter((e) => e.hp > 0);

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
    ctx.fillStyle = "rgba(198,255,61,0.85)";
    ctx.beginPath();
    ctx.moveTo(...p(-5, 14));
    ctx.lineTo(...p(0, 14 + flame));
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
    ctx.restore();
  }

  function draw() {
    const s = scale();
    ctx.save();
    ctx.fillStyle = COL.bg;
    ctx.fillRect(0, 0, W, H);
    if (shake > 0) ctx.translate((Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10);

    // grid + bintang
    ctx.strokeStyle = COL.grid;
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
    ctx.font = `${Math.round(10 * s)}px ui-monospace, Consolas, monospace`;
    ctx.textAlign = "center";
    for (const e of enemies) {
      const color = e.flash > 0 ? COL.ink : e.big ? COL.magenta : COL.violetSoft;
      sprite(e.big ? (frame ? BIG_A : BIG_B) : frame ? BUG_A : BUG_B, e.x, e.y, 4 * s, color);
      ctx.fillStyle = COL.ink3;
      ctx.fillText(e.label, e.x, e.y + e.h / 2 + 12 * s);
      if (e.big) {
        for (let i = 0; i < 3; i++) {
          ctx.fillStyle = i < e.hp ? COL.lime : "rgba(132,126,160,0.35)";
          ctx.fillRect(e.x - 13 * s + i * 9 * s, e.y - e.h / 2 - 8 * s, 7 * s, 3 * s);
        }
      }
    }

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
      ctx.fillStyle = COL.lime;
      ctx.font = `700 ${Math.round(14 * s)}px ui-monospace, Consolas, monospace`;
      ctx.fillText(`— WAVE ${String(wave).padStart(2, "0")} —`, W / 2, H * 0.42);
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
