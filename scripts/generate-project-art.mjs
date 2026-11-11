/**
 * Ilustrasi orisinal untuk setiap proyek (cover + 2 galeri, 1600x900 SVG).
 *   node scripts/generate-project-art.mjs
 *
 * Ini ilustrasi/mockup bertema HUD — BUKAN screenshot asli.
 * Ganti dengan screenshot proyek kamu sendiri jika sudah ada (lihat README).
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const W = 1600;
const H = 900;

const C = {
  abyss: "#08070d",
  surface: "#100e1a",
  raised: "#18152a",
  panel: "#141124",
  line: "#2a2445",
  violet: "#8b5cf6",
  violetSoft: "#a78bfa",
  violetDim: "#5b3fb8",
  lime: "#c6ff3d",
  magenta: "#ff3d9a",
  ink: "#f1eefc",
  ink2: "#a9a3c4",
  ink3: "#847ea0",
  red: "#ff5c7a",
  green: "#3ddc97",
};
const SANS = "'Segoe UI', Inter, Roboto, Arial, sans-serif";
const MONO = "Consolas, 'JetBrains Mono', 'Courier New', monospace";
const DISPLAY = "'Arial Narrow', 'Roboto Condensed', 'Segoe UI', Arial, sans-serif";

/* ---------- primitif ---------- */
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const t = (x, y, s, o = {}) =>
  `<text x="${x}" y="${y}" font-family="${o.font ?? SANS}" font-size="${o.size ?? 18}" font-weight="${o.weight ?? 400}" fill="${o.fill ?? C.ink}"${o.anchor ? ` text-anchor="${o.anchor}"` : ""}${o.ls ? ` letter-spacing="${o.ls}"` : ""}${o.op ? ` opacity="${o.op}"` : ""}>${esc(s)}</text>`;
const mono = (x, y, s, o = {}) => t(x, y, s, { font: MONO, size: 14, ls: 2, fill: C.ink3, ...o });
const r = (x, y, w, h, o = {}) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${o.r ?? 0}" fill="${o.fill ?? "none"}"${o.stroke ? ` stroke="${o.stroke}" stroke-width="${o.sw ?? 1}"` : ""}${o.op != null ? ` opacity="${o.op}"` : ""}${o.dash ? ` stroke-dasharray="${o.dash}"` : ""}/>`;
const circle = (cx, cy, rad, o = {}) =>
  `<circle cx="${cx}" cy="${cy}" r="${rad}" fill="${o.fill ?? "none"}"${o.stroke ? ` stroke="${o.stroke}" stroke-width="${o.sw ?? 1}"` : ""}${o.op != null ? ` opacity="${o.op}"` : ""}/>`;
const path = (d, o = {}) =>
  `<path d="${d}" fill="${o.fill ?? "none"}" stroke="${o.stroke ?? "none"}" stroke-width="${o.sw ?? 2}"${o.dash ? ` stroke-dasharray="${o.dash}"` : ""} stroke-linecap="round" stroke-linejoin="round"${o.op != null ? ` opacity="${o.op}"` : ""}/>`;
const poly = (pts) =>
  pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join("");

/** Sudut terpotong (gaya HUD). */
const cut = (x, y, w, h, c = 14) =>
  `M${x + c} ${y}H${x + w}V${y + h - c}L${x + w - c} ${y + h}H${x}V${y + c}Z`;
const panel = (x, y, w, h, o = {}) =>
  path(cut(x, y, w, h, o.c ?? 14), {
    fill: o.fill ?? C.panel,
    stroke: o.stroke ?? C.line,
    sw: 1.5,
  });

/** Jendela aplikasi dengan title bar. */
function win(x, y, w, h, title, o = {}) {
  return [
    `<g filter="url(#shadow)">${panel(x, y, w, h, { fill: o.fill ?? C.surface, stroke: o.stroke ?? "#3a2f66" })}</g>`,
    r(x + 1, y + 1, w - 2, 44, { fill: C.raised }),
    path(`M${x} ${y + 45}H${x + w}`, { stroke: C.line, sw: 1.5 }),
    circle(x + 26, y + 23, 6, { fill: C.magenta, op: 0.85 }),
    circle(x + 46, y + 23, 6, { fill: C.violetSoft, op: 0.7 }),
    circle(x + 66, y + 23, 6, { fill: C.lime, op: 0.8 }),
    mono(x + 92, y + 28, title, { size: 13, fill: C.ink2 }),
  ].join("");
}

function chip(x, y, label, color = C.lime, o = {}) {
  const w = o.w ?? label.length * 9 + 26;
  return (
    path(cut(x, y, w, 26, 6), { fill: color, op: 0.14, stroke: color, sw: 1 }) +
    mono(x + w / 2, y + 18, label, {
      size: 12,
      fill: color,
      anchor: "middle",
      ls: 1.5,
      weight: 700,
    })
  );
}

function bars(x, y, w, h, values, o = {}) {
  const max = Math.max(...values);
  const gap = o.gap ?? 10;
  const bw = (w - gap * (values.length - 1)) / values.length;
  return values
    .map((v, i) => {
      const bh = (v / max) * h;
      const hi = o.highlight === i;
      return r(x + i * (bw + gap), y + h - bh, bw, bh, {
        fill: hi ? C.lime : `url(#${o.grad ?? "barGrad"})`,
        r: 3,
      });
    })
    .join("");
}

function linePts(x, y, w, h, values, min, max) {
  return values.map((v, i) => [
    x + (i / (values.length - 1)) * w,
    y + h - ((v - min) / (max - min)) * h,
  ]);
}

function gridLines(x, y, w, h, rows = 4) {
  let s = "";
  for (let i = 0; i <= rows; i++)
    s += path(`M${x} ${y + (h / rows) * i}H${x + w}`, { stroke: C.line, sw: 1, op: 0.7 });
  return s;
}

/** Kerangka gambar: latar, glow, grid, label misi. */
function frame(content, { n, title, glow = C.violet, glowX = 70, glowY = 20 }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" xml:space="preserve" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<defs>
  <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse"><path d="M48 0H0V48" fill="none" stroke="${C.violet}" stroke-opacity="0.09"/></pattern>
  <radialGradient id="glow" cx="${glowX}%" cy="${glowY}%" r="75%"><stop offset="0" stop-color="${glow}" stop-opacity="0.32"/><stop offset="0.5" stop-color="${C.violetDim}" stop-opacity="0.08"/><stop offset="1" stop-color="${C.abyss}" stop-opacity="0"/></radialGradient>
  <radialGradient id="glow2" cx="5%" cy="100%" r="60%"><stop offset="0" stop-color="${C.magenta}" stop-opacity="0.14"/><stop offset="1" stop-color="${C.abyss}" stop-opacity="0"/></radialGradient>
  <linearGradient id="barGrad" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="${C.violetDim}"/><stop offset="1" stop-color="${C.violetSoft}"/></linearGradient>
  <linearGradient id="limeGrad" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="${C.violet}"/><stop offset="1" stop-color="${C.lime}"/></linearGradient>
  <linearGradient id="areaV" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.violet}" stop-opacity="0.45"/><stop offset="1" stop-color="${C.violet}" stop-opacity="0"/></linearGradient>
  <linearGradient id="areaL" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.lime}" stop-opacity="0.25"/><stop offset="1" stop-color="${C.lime}" stop-opacity="0"/></linearGradient>
  <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1d1440"/><stop offset="1" stop-color="${C.abyss}"/></linearGradient>
  <filter id="shadow" x="-10%" y="-10%" width="120%" height="130%"><feDropShadow dx="0" dy="18" stdDeviation="22" flood-color="#000" flood-opacity="0.55"/></filter>
  <filter id="neon" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
</defs>
<rect width="${W}" height="${H}" fill="${C.abyss}"/>
<rect width="${W}" height="${H}" fill="url(#glow)"/>
<rect width="${W}" height="${H}" fill="url(#glow2)"/>
<rect width="${W}" height="${H}" fill="url(#grid)"/>
${content}
${mono(W - 48, H - 36, `M-${n} // ${title}`, { anchor: "end", size: 13, fill: C.ink3 })}
</svg>
`;
}

/* ---------- komponen mockup ---------- */

function chatBubble(x, y, w, lines, who) {
  const h = 24 + lines.length * 26;
  const ai = who === "ai";
  const bx = ai ? x : x + w * 0.18;
  const bw = w * 0.82;
  let s = path(cut(bx, y, bw, h, 10), {
    fill: ai ? C.raised : C.violet,
    op: ai ? 1 : 0.9,
    stroke: ai ? C.line : "none",
  });
  lines.forEach(
    (ln, i) => (s += t(bx + 18, y + 34 + i * 26, ln, { size: 18, fill: ai ? C.ink : "#fff" })),
  );
  return { s, h };
}

function handLandmarks(cx, cy, scale = 1, color = C.lime) {
  // 21 titik tangan terbuka (koordinat relatif)
  const P = [
    [0, 0],
    [-62, -30],
    [-104, -72],
    [-128, -116],
    [-146, -150],
    [-44, -150],
    [-52, -222],
    [-56, -268],
    [-58, -306],
    [0, -160],
    [2, -240],
    [4, -292],
    [6, -334],
    [40, -150],
    [50, -222],
    [56, -268],
    [60, -302],
    [76, -126],
    [96, -180],
    [108, -214],
    [118, -244],
  ].map(([x, y]) => [cx + x * scale, cy + y * scale]);
  const bones = [
    [0, 1, 2, 3, 4],
    [0, 5, 6, 7, 8],
    [9, 10, 11, 12],
    [13, 14, 15, 16],
    [0, 17, 18, 19, 20],
    [5, 9, 13, 17],
  ];
  let s = "";
  bones.forEach(
    (b) => (s += path(poly(b.map((i) => P[i])), { stroke: C.violetSoft, sw: 3 * scale + 1 })),
  );
  P.forEach(([x, y], i) => {
    const tip = [4, 8, 12, 16, 20].includes(i);
    s += circle(x, y, (tip ? 9 : 6) * scale + 1, {
      fill: tip ? color : C.ink,
      stroke: C.abyss,
      sw: 2,
    });
  });
  return `<g filter="url(#neon)">${s}</g>`;
}

function phone(x, y, w, h, inner) {
  return (
    `<g filter="url(#shadow)">${r(x, y, w, h, { r: 38, fill: "#0c0a16", stroke: "#3a2f66", sw: 3 })}</g>` +
    r(x + 12, y + 12, w - 24, h - 24, { r: 28, fill: C.surface }) +
    r(x + w / 2 - 44, y + 22, 88, 20, { r: 10, fill: "#0c0a16" }) +
    `<g>${inner(x + 12, y + 12, w - 24, h - 24)}</g>`
  );
}

function silhouette(cx, cy, s = 1, stroke = C.violetSoft) {
  // kepala + bahu bergaya wireframe
  return (
    path(
      `M${cx - 170 * s} ${cy + 260 * s}C${cx - 160 * s} ${cy + 150 * s} ${cx - 90 * s} ${cy + 120 * s} ${cx} ${cy + 118 * s}C${cx + 90 * s} ${cy + 120 * s} ${cx + 160 * s} ${cy + 150 * s} ${cx + 170 * s} ${cy + 260 * s}`,
      { stroke, sw: 3, fill: C.raised },
    ) +
    `<ellipse cx="${cx}" cy="${cy}" rx="${88 * s}" ry="${112 * s}" fill="${C.raised}" stroke="${stroke}" stroke-width="3"/>` +
    path(`M${cx - 40 * s} ${cy - 10 * s}h22M${cx + 18 * s} ${cy - 10 * s}h22`, {
      stroke: C.ink2,
      sw: 4,
    }) +
    path(`M${cx - 26 * s} ${cy + 52 * s}Q${cx} ${cy + 70 * s} ${cx + 26 * s} ${cy + 52 * s}`, {
      stroke: C.ink2,
      sw: 3,
    })
  );
}

/* ================================================================
   SCENES
   ================================================================ */
const scenes = {};

/* 1. SIGER KAIROS */
scenes["siger-kairos"] = (n, title) => {
  const sidebar = (x, y, h, active) => {
    const items = ["Dashboard", "Jemaat", "Ibadah", "Pelayanan", "Pengumuman", "AI Asisten"];
    let s =
      r(x, y, 210, h, { fill: C.panel }) +
      t(x + 24, y + 48, "SIGER KAIROS", { font: DISPLAY, size: 26, weight: 700 });
    s += mono(x + 24, y + 72, "GSJA KAIROS MANADO", { size: 10, ls: 1.5 });
    items.forEach((it, i) => {
      const yy = y + 110 + i * 48;
      if (i === active)
        s +=
          r(x + 12, yy - 26, 186, 40, { fill: C.violet, op: 0.22, r: 4 }) +
          r(x + 12, yy - 26, 3, 40, { fill: C.lime });
      s += r(x + 28, yy - 14, 16, 16, {
        r: 4,
        fill: i === active ? C.lime : C.ink3,
        op: i === active ? 1 : 0.5,
      });
      s += t(x + 56, yy, it, {
        size: 17,
        fill: i === active ? C.ink : C.ink2,
        weight: i === active ? 600 : 400,
      });
    });
    return s;
  };

  const dash = () => {
    const x = 70,
      y = 90,
      w = 1040,
      h = 700;
    let s = win(x, y, w, h, "admin.sigerkairos.id/dashboard");
    s += sidebar(x + 1, y + 46, h - 47, 0);
    const mx = x + 240;
    s +=
      t(mx, y + 100, "Dashboard", { size: 30, weight: 700 }) +
      mono(mx, y + 126, "MINGGU KE-46 · 2026", { size: 12 });
    [
      ["JEMAAT", "412"],
      ["IBADAH/MGG", "6"],
      ["PELAYANAN", "18"],
      ["PENGUMUMAN", "9"],
    ].forEach(([k, v], i) => {
      const cx = mx + i * 196;
      s += panel(cx, y + 150, 180, 110, { fill: C.raised });
      s += mono(cx + 18, y + 182, k, { size: 11 });
      s += t(cx + 18, y + 236, v, {
        font: DISPLAY,
        size: 48,
        weight: 700,
        fill: i === 0 ? C.lime : C.ink,
      });
    });
    s += panel(mx, y + 285, 770, 380, { fill: C.raised });
    s +=
      t(mx + 24, y + 325, "Kehadiran Ibadah", { size: 20, weight: 600 }) +
      mono(mx + 600, y + 325, "12 MINGGU", { size: 11 });
    s += gridLines(mx + 24, y + 350, 720, 280);
    s += bars(mx + 24, y + 350, 720, 280, [62, 70, 66, 74, 80, 77, 85, 82, 90, 88, 95, 99], {
      highlight: 11,
      gap: 16,
    });
    return s;
  };

  const chat = (x, y, w, h, full = false) => {
    let s = win(x, y, w, h, "AI ASISTEN GEREJA");
    s +=
      circle(x + 40, y + 86, 18, { fill: C.lime, op: 0.18, stroke: C.lime }) +
      t(x + 40, y + 92, "AI", { anchor: "middle", size: 14, weight: 700, fill: C.lime });
    s +=
      t(x + 70, y + 84, "Asisten Gereja", { size: 19, weight: 600 }) +
      mono(x + 70, y + 104, "QWEN 2.5 · LOCAL · ONLINE", { size: 10, fill: C.lime });
    let yy = y + 135;
    const msgs = full
      ? [
          ["u", ["Jadwal ibadah pemuda minggu ini?"]],
          [
            "ai",
            [
              "Ibadah Pemuda: Sabtu, 18.00 WITA",
              'di Gedung Utama. Tema: "Berakar',
              'dan Bertumbuh".',
            ],
          ],
          ["u", ["Siapa pelayan musiknya?"]],
          ["ai", ["Tim Musik B — koordinator Kak Rina.", "Mau saya kirim pengingat ke tim?"]],
          ["u", ["Iya, kirim ke grup pelayanan."]],
        ]
      : [
          ["u", ["Jadwal ibadah pemuda", "minggu ini?"]],
          ["ai", ["Sabtu, 18.00 WITA di Gedung", 'Utama. Tema: "Berakar dan', 'Bertumbuh".']],
          ["u", ["Siapa pelayan musiknya?"]],
        ];
    msgs.forEach(([who, lines]) => {
      const b = chatBubble(x + 24, yy, w - 48, lines, who);
      s += b.s;
      yy += b.h + 16;
    });
    // typing
    s += path(cut(x + 24, yy, 96, 44, 8), { fill: C.raised, stroke: C.line });
    [0, 1, 2].forEach(
      (i) => (s += circle(x + 50 + i * 20, yy + 22, 5, { fill: C.violetSoft, op: 0.5 + i * 0.2 })),
    );
    s += path(cut(x + 24, y + h - 70, w - 48, 48, 8), { fill: C.abyss, stroke: C.line });
    s += t(x + 44, y + h - 39, "Tanya apa saja tentang gereja…", { size: 16, fill: C.ink3 });
    s += r(x + w - 74, y + h - 62, 34, 32, { fill: C.lime, r: 4 });
    s += path(`M${x + w - 64} ${y + h - 46}l14 0m-6 -6l6 6l-6 6`, { stroke: C.abyss, sw: 2.5 });
    return s;
  };

  const cover = frame(dash() + chat(1010, 230, 520, 600), { n, title });
  const g1 = frame(
    chat(640, 60, 860, 780, true) +
      mono(110, 140, "LLM LOKAL", { fill: C.lime }) +
      t(110, 190, "Data jemaat", { font: DISPLAY, size: 54, weight: 700 }) +
      t(110, 248, "tetap di server", { font: DISPLAY, size: 54, weight: 700, fill: C.violetSoft }) +
      t(110, 300, "sendiri.", { font: DISPLAY, size: 54, weight: 700, fill: C.violetSoft }),
    { n, title, glowX: 50 },
  );

  const sched = () => {
    const x = 120,
      y = 90,
      w = 1360,
      h = 700;
    let s = win(x, y, w, h, "admin.sigerkairos.id/ibadah");
    s += t(x + 40, y + 110, "Jadwal Ibadah & Pelayanan", { size: 32, weight: 700 });
    s += chip(x + w - 220, y + 86, "+ TAMBAH JADWAL", C.lime);
    const cols = ["HARI", "IBADAH", "WAKTU", "TEMPAT", "PELAYAN", "STATUS"];
    const cx = [40, 220, 520, 700, 930, 1160];
    s += r(x + 20, y + 150, w - 40, 50, { fill: C.raised });
    cols.forEach((c, i) => (s += mono(x + cx[i], y + 181, c, { size: 12 })));
    const rows = [
      ["Minggu", "Ibadah Raya 1", "07.00", "Gedung Utama", "Tim Musik A", "TERJADWAL"],
      ["Minggu", "Ibadah Raya 2", "10.00", "Gedung Utama", "Tim Musik B", "TERJADWAL"],
      ["Rabu", "Doa Syafaat", "18.30", "Ruang Doa", "Pdt. Samuel", "TERJADWAL"],
      ["Jumat", "Ibadah Kaum Wanita", "16.00", "Aula", "Ibu Grace", "DRAF"],
      ["Sabtu", "Ibadah Pemuda", "18.00", "Gedung Utama", "Tim Musik B", "TERJADWAL"],
      ["Sabtu", "Sekolah Minggu", "09.00", "Kelas Anak", "Kak Rina", "SELESAI"],
    ];
    rows.forEach((row, ri) => {
      const yy = y + 250 + ri * 66;
      s += path(`M${x + 20} ${yy + 24}H${x + w - 20}`, { stroke: C.line, sw: 1 });
      row.forEach((v, i) => {
        if (i === 5) {
          const col = v === "TERJADWAL" ? C.lime : v === "DRAF" ? C.magenta : C.violetSoft;
          s += chip(x + cx[i], yy - 20, v, col);
        } else
          s += t(x + cx[i], yy, v, {
            size: 19,
            fill: i === 1 ? C.ink : C.ink2,
            weight: i === 1 ? 600 : 400,
          });
      });
    });
    return s;
  };
  return [cover, g1, frame(sched(), { n, title })];
};

/* 2. TOURMIND AI */
scenes["tourmind-ai"] = (n, title) => {
  const actual = [21, 24, 23, 28, 31, 30, 36, 38, 35, 41];
  const pred = [41, 44, 48.2];
  const chart = (x, y, w, h) => {
    let s = gridLines(x, y, w, h, 5);
    const all = [...actual, ...pred];
    const pts = linePts(x, y, w, h, all, 15, 52);
    const a = pts.slice(0, actual.length);
    const p = pts.slice(actual.length - 1);
    s += path(poly(a) + `L${a.at(-1)[0]} ${y + h}L${x} ${y + h}Z`, { fill: "url(#areaV)" });
    // pita kepercayaan
    const up = p.map(([px, py], i) => [px, py - i * 22]);
    const lo = p.map(([px, py], i) => [px, py + i * 22]);
    s += path(poly([...up, ...lo.reverse()]) + "Z", { fill: C.lime, op: 0.12 });
    s += path(poly(a), { stroke: C.violetSoft, sw: 4 });
    s += path(poly(p), { stroke: C.lime, sw: 4, dash: "12 10" });
    a.forEach(
      ([px, py]) => (s += circle(px, py, 5, { fill: C.abyss, stroke: C.violetSoft, sw: 3 })),
    );
    const last = p.at(-1);
    s +=
      circle(last[0], last[1], 9, { fill: C.lime }) +
      circle(last[0], last[1], 18, { stroke: C.lime, op: 0.5, sw: 2 });
    const months = [
      "MAR",
      "APR",
      "MEI",
      "JUN",
      "JUL",
      "AGU",
      "SEP",
      "OKT",
      "NOV",
      "DES",
      "JAN",
      "FEB",
      "MAR",
    ];
    months.forEach(
      (m, i) =>
        (s += mono(x + (i / (months.length - 1)) * w, y + h + 32, m, {
          size: 11,
          anchor: "middle",
        })),
    );
    return s;
  };
  const dash = () => {
    const x = 70,
      y = 80,
      w = 1460,
      h = 740;
    let s = win(x, y, w, h, "tourmind.ai/dashboard — Kota Tomohon");
    s += t(x + 40, y + 110, "Prediksi Kunjungan Wisatawan", { size: 30, weight: 700 });
    s += mono(x + 40, y + 138, "MODEL: GRADIENT BOOSTING · MAPE 8.4%", { size: 12, fill: C.lime });
    s += panel(x + 40, y + 170, 960, 530, { fill: C.raised });
    s += t(x + 70, y + 215, "Kunjungan / bulan (ribu)", { size: 17, fill: C.ink2 });
    s +=
      path(`M${x + 690} ${y + 208}h28`, { stroke: C.violetSoft, sw: 4 }) +
      mono(x + 726, y + 213, "AKTUAL", { size: 11 });
    s +=
      path(`M${x + 820} ${y + 208}h28`, { stroke: C.lime, sw: 4, dash: "8 6" }) +
      mono(x + 856, y + 213, "PREDIKSI", { size: 11 });
    s += chart(x + 80, y + 250, 880, 380);
    // panel kanan
    s += panel(x + 1030, y + 170, 390, 170, { fill: C.raised });
    s += mono(x + 1056, y + 206, "PREDIKSI MAR 2027", { size: 11 });
    s += t(x + 1056, y + 280, "48.2K", { font: DISPLAY, size: 76, weight: 700, fill: C.lime });
    s += chip(x + 1280, y + 238, "+17.6%", C.lime);
    s += panel(x + 1030, y + 360, 390, 340, { fill: C.raised });
    s += mono(x + 1056, y + 396, "TOP DESTINASI", { size: 11 });
    [
      ["Danau Linow", 0.92],
      ["Bukit Doa Mahawu", 0.74],
      ["Kawah Lokon", 0.58],
      ["Pasar Beriman", 0.47],
      ["Taman Kelong", 0.33],
    ].forEach(([d, v], i) => {
      const yy = y + 440 + i * 52;
      s += t(x + 1056, yy, d, { size: 17 });
      s +=
        r(x + 1056, yy + 12, 330, 6, { fill: C.line, r: 3 }) +
        r(x + 1056, yy + 12, 330 * v, 6, { fill: i === 0 ? C.lime : C.violet, r: 3 });
    });
    return s;
  };
  const map = () => {
    let s = "";
    // garis kontur abstrak
    for (let i = 0; i < 9; i++) {
      s += path(
        `M${-50} ${180 + i * 80}C${400} ${120 + i * 70} ${800} ${300 + i * 60} ${1650} ${150 + i * 85}`,
        { stroke: C.violetDim, sw: 1.5, op: 0.45 },
      );
    }
    const spots = [
      [520, 330, 120, "Danau Linow", "12.4K"],
      [880, 250, 90, "Bukit Doa Mahawu", "9.8K"],
      [1120, 470, 70, "Kawah Lokon", "7.1K"],
      [700, 560, 60, "Pasar Beriman", "5.9K"],
      [1300, 640, 45, "Taman Kelong", "3.2K"],
    ];
    spots.forEach(([x, y, rad, name, v], i) => {
      s +=
        circle(x, y, rad * 1.6, { fill: i === 0 ? C.lime : C.violet, op: 0.08 }) +
        circle(x, y, rad, { fill: i === 0 ? C.lime : C.violet, op: 0.16 });
      s += circle(x, y, 10, { fill: i === 0 ? C.lime : C.violetSoft, stroke: C.abyss, sw: 3 });
      s += panel(x + 24, y - 56, 230, 74, { fill: C.surface, c: 8 });
      s +=
        t(x + 42, y - 24, name, { size: 18, weight: 600 }) +
        mono(x + 42, y + 2, `${v} / BULAN`, { size: 11, fill: i === 0 ? C.lime : C.ink3 });
    });
    s +=
      mono(80, 120, "HEATMAP KUNJUNGAN", { fill: C.lime }) +
      t(80, 170, "Kota Tomohon", { font: DISPLAY, size: 56, weight: 700 });
    return s;
  };
  const recs = () => {
    let s =
      mono(110, 150, "REKOMENDASI OTOMATIS", { fill: C.lime }) +
      t(110, 210, "Apa yang perlu disiapkan", { font: DISPLAY, size: 58, weight: 700 }) +
      t(110, 268, "minggu depan?", { font: DISPLAY, size: 58, weight: 700, fill: C.violetSoft });
    const cards = [
      [
        "PETUGAS",
        "Tambah 4 petugas",
        "Danau Linow · Sabtu–Minggu",
        "Lonjakan +32% diprediksi",
        C.lime,
      ],
      [
        "PROMOSI",
        "Dorong promosi",
        "Kawah Lokon · Kamis",
        "Kunjungan di bawah rata-rata",
        C.violetSoft,
      ],
      [
        "PARKIR",
        "Buka parkir cadangan",
        "Bukit Doa · Minggu pagi",
        "Kapasitas 94% terisi",
        C.magenta,
      ],
    ];
    cards.forEach(([tag, head, where, why, col], i) => {
      const x = 110 + i * 470,
        y = 360;
      s += `<g filter="url(#shadow)">${panel(x, y, 440, 400, { fill: C.surface })}</g>`;
      s += chip(x + 30, y + 30, tag, col);
      s += t(x + 30, y + 130, head, { font: DISPLAY, size: 40, weight: 700 });
      s += t(x + 30, y + 175, where, { size: 19, fill: C.ink2 });
      s += path(`M${x + 30} ${y + 220}H${x + 410}`, { stroke: C.line });
      s += mono(x + 30, y + 260, "ALASAN", { size: 11 }) + t(x + 30, y + 292, why, { size: 19 });
      s +=
        r(x + 30, y + 330, 380, 8, { fill: C.line, r: 4 }) +
        r(x + 30, y + 330, 380 * (0.9 - i * 0.18), 8, { fill: col, r: 4 });
      s += mono(x + 30, y + 368, `KEYAKINAN ${Math.round((0.9 - i * 0.18) * 100)}%`, { size: 11 });
    });
    return s;
  };
  return [
    frame(dash(), { n, title, glow: C.violet }),
    frame(map(), { n, title, glow: C.lime, glowX: 35, glowY: 40 }),
    frame(recs(), { n, title }),
  ];
};

/* 3. VR KEBUDAYAAN MINAHASA */
scenes["vr-kebudayaan-minahasa"] = (n, title) => {
  const floor = (hz = 560) => {
    let s = r(0, 0, W, hz, { fill: "url(#sky)" });
    for (let i = -14; i <= 14; i++)
      s += path(`M${W / 2} ${hz}L${W / 2 + i * 160} ${H + 40}`, {
        stroke: C.violet,
        sw: 1.2,
        op: 0.4,
      });
    for (let k = 1; k < 9; k++) {
      const y = hz + Math.pow(k / 8, 1.8) * (H - hz + 40);
      s += path(`M0 ${y}H${W}`, { stroke: C.violet, sw: 1.2, op: 0.15 + k * 0.04 });
    }
    s += path(`M0 ${hz}H${W}`, { stroke: C.lime, sw: 2, op: 0.6 });
    // bukit
    s += path(
      `M0 ${hz}L180 ${hz - 120}L360 ${hz - 40}L560 ${hz - 170}L760 ${hz - 60}L980 ${hz - 150}L1180 ${hz - 50}L1400 ${hz - 140}L1600 ${hz - 60}V${hz}Z`,
      { fill: "#130f26", stroke: C.violetDim, sw: 1.5 },
    );
    return s;
  };
  // Rumah panggung (wireframe)
  const house = (cx, base, s = 1) => {
    const w = 420 * s,
      hb = 150 * s,
      stilt = 130 * s;
    const x = cx - w / 2,
      yb = base - stilt;
    let g = "";
    for (let i = 0; i < 6; i++)
      g += path(`M${x + 30 * s + i * ((w - 60 * s) / 5)} ${yb}V${base}`, {
        stroke: C.violetSoft,
        sw: 4,
      });
    g += path(`M${x - 20 * s} ${yb}H${x + w + 20 * s}`, { stroke: C.violetSoft, sw: 5 });
    g += r(x, yb - hb, w, hb, { fill: C.raised, stroke: C.violetSoft, sw: 3 });
    for (let i = 1; i < 4; i++)
      g += r(x + i * (w / 4) - 26 * s, yb - hb + 40 * s, 52 * s, 70 * s, {
        stroke: C.lime,
        sw: 2,
        fill: C.lime,
        op: 0.6,
      });
    g += path(
      `M${x - 50 * s} ${yb - hb}L${cx} ${yb - hb - 190 * s}L${x + w + 50 * s} ${yb - hb}Z`,
      { fill: "#1b1436", stroke: C.violetSoft, sw: 3 },
    );
    g += path(
      `M${cx - 90 * s} ${yb - hb - 80 * s}L${cx} ${yb - hb - 150 * s}L${cx + 90 * s} ${yb - hb - 80 * s}`,
      { stroke: C.magenta, sw: 2 },
    );
    // tangga
    g += path(
      `M${cx - 40 * s} ${base}L${cx - 10 * s} ${yb}M${cx + 40 * s} ${base}L${cx + 70 * s} ${yb}`,
      { stroke: C.ink2, sw: 3 },
    );
    for (let k = 1; k < 5; k++)
      g += path(`M${cx - 40 * s + k * 7.5 * s} ${base - k * 26 * s}H${cx + 40 * s + k * 7.5 * s}`, {
        stroke: C.ink2,
        sw: 2,
      });
    return `<g filter="url(#neon)">${g}</g>`;
  };
  const headsetHud = () => {
    let s = path(
      `M120 120Q120 70 170 70H700M900 70H1430Q1480 70 1480 120V300M1480 600V780Q1480 830 1430 830H900M700 830H170Q120 830 120 780V600M120 300V120`,
      { stroke: C.lime, sw: 3, op: 0.7 },
    );
    s +=
      circle(W / 2, 420, 26, { stroke: C.lime, sw: 2 }) +
      path(`M${W / 2 - 46} 420h22M${W / 2 + 24} 420h22M${W / 2} 374v22M${W / 2} 444v22`, {
        stroke: C.lime,
        sw: 2,
      });
    s +=
      mono(170, 120, "VR · MINAHASA HERITAGE", { fill: C.lime }) +
      mono(1430, 120, "FPS 72", { anchor: "end" });
    return s;
  };
  const cover = frame(
    floor() +
      house(W / 2, 640, 1.05) +
      headsetHud() +
      panel(170, 640, 420, 120, { fill: C.surface }) +
      mono(196, 676, "OBJEK TERDETEKSI", { size: 11, fill: C.lime }) +
      t(196, 724, "Rumah Panggung Woloan", { size: 24, weight: 600 }) +
      chip(1180, 680, "TEKAN UNTUK INFO", C.lime),
    { n, title },
  );

  const quiz = () => {
    let s = floor(620) + house(1260, 700, 0.6);
    const x = 140,
      y = 110;
    s += `<g filter="url(#shadow)">${panel(x, y, 880, 680, { fill: C.surface })}</g>`;
    s +=
      mono(x + 40, y + 56, "KUIS BUDAYA · SOAL 03/10", { fill: C.lime }) +
      chip(x + 650, y + 34, "DIACAK", C.magenta);
    s +=
      r(x + 40, y + 80, 800, 6, { fill: C.line, r: 3 }) +
      r(x + 40, y + 80, 240, 6, { fill: C.lime, r: 3 });
    s +=
      t(x + 40, y + 160, "Apa nama tarian perang", { font: DISPLAY, size: 50, weight: 700 }) +
      t(x + 40, y + 214, "tradisional Minahasa?", { font: DISPLAY, size: 50, weight: 700 });
    const opts = [
      ["A", "Maengket", false],
      ["B", "Kabasaran", true],
      ["C", "Tor-tor", false],
      ["D", "Katrili", false],
    ];
    opts.forEach(([k, v, ok], i) => {
      const yy = y + 270 + i * 94;
      s += path(cut(x + 40, yy, 800, 76, 10), {
        fill: ok ? C.lime : C.raised,
        op: ok ? 0.15 : 1,
        stroke: ok ? C.lime : C.line,
        sw: ok ? 2 : 1,
      });
      s += r(x + 64, yy + 20, 36, 36, {
        fill: ok ? C.lime : C.abyss,
        stroke: ok ? "none" : C.line,
        r: 4,
      });
      s += t(x + 82, yy + 45, k, {
        anchor: "middle",
        weight: 700,
        fill: ok ? C.abyss : C.ink2,
        size: 18,
      });
      s += t(x + 124, yy + 46, v, { size: 24, weight: ok ? 700 : 400, fill: ok ? C.lime : C.ink });
      if (ok) s += mono(x + 810, yy + 46, "BENAR +10", { anchor: "end", fill: C.lime, size: 13 });
    });
    return s;
  };

  const fy = () => {
    let s =
      mono(110, 130, "ALGORITMA", { fill: C.lime }) +
      t(110, 196, "Fisher–Yates Shuffle", { font: DISPLAY, size: 64, weight: 700 });
    s += t(110, 240, "Setiap urutan soal punya peluang sama — adil & tidak bisa ditebak.", {
      size: 21,
      fill: C.ink2,
    });
    const rows = [
      ["i = 4, j = 1", ["Q1", "Q2", "Q3", "Q4", "Q5"], [1, 4]],
      ["i = 3, j = 0", ["Q1", "Q5", "Q3", "Q4", "Q2"], [0, 3]],
      ["i = 2, j = 2", ["Q4", "Q5", "Q3", "Q1", "Q2"], [2, 2]],
      ["HASIL", ["Q4", "Q5", "Q3", "Q1", "Q2"], null],
    ];
    rows.forEach(([lab, arr, sw], ri) => {
      const y = 320 + ri * 130;
      s += mono(110, y + 52, lab, { fill: ri === 3 ? C.lime : C.ink3 });
      arr.forEach((q, i) => {
        const x = 330 + i * 120;
        const hot = sw && sw.includes(i);
        const done = sw ? i > 4 - ri : true;
        s += path(cut(x, y, 100, 84, 8), {
          fill: hot ? C.violet : done && ri === 3 ? C.lime : C.raised,
          op: hot ? 0.35 : done && ri === 3 ? 0.18 : 1,
          stroke: hot ? C.violetSoft : ri === 3 ? C.lime : C.line,
          sw: hot ? 2 : 1,
        });
        s += t(x + 50, y + 52, q, {
          anchor: "middle",
          font: MONO,
          size: 24,
          weight: 700,
          fill: ri === 3 ? C.lime : C.ink,
        });
      });
      if (sw && sw[0] !== sw[1]) {
        const x1 = 330 + sw[0] * 120 + 50,
          x2 = 330 + sw[1] * 120 + 50;
        s += path(`M${x1} ${y - 4}Q${(x1 + x2) / 2} ${y - 40} ${x2} ${y - 4}`, {
          stroke: C.magenta,
          sw: 2.5,
        });
      }
    });
    const cx = 1000,
      cy = 320;
    s += `<g filter="url(#shadow)">${panel(cx, cy, 500, 380, { fill: C.surface })}</g>`;
    s += mono(cx + 28, cy + 40, "QuizShuffle.cs", { size: 12, fill: C.ink2 });
    const code = [
      ["for", " (int i = n - 1; i > 0; i--)"],
      ["{", ""],
      ["  int", " j = Random.Range(0, i + 1);"],
      ["  ", "(a[i], a[j]) = (a[j], a[i]);"],
      ["}", ""],
    ];
    code.forEach(([k, rest], i) => {
      s +=
        t(cx + 28, cy + 100 + i * 46, k, { font: MONO, size: 20, fill: C.magenta }) +
        t(cx + 28 + k.length * 12, cy + 100 + i * 46, rest, { font: MONO, size: 20, fill: C.ink });
    });
    s += mono(cx + 28, cy + 340, "O(n) · TANPA BIAS", { fill: C.lime });
    return s;
  };
  return [cover, frame(quiz(), { n, title }), frame(fy(), { n, title, glow: C.magenta })];
};

/* 4. SIM NOTULEN */
scenes["sim-notulen-rapat"] = (n, title) => {
  const editor = () => {
    const x = 80,
      y = 80,
      w = 1440,
      h = 740;
    let s = win(x, y, w, h, "notulen.tomohon.go.id/rapat/2026-11-04");
    s += r(x + 1, y + 46, 360, h - 47, { fill: C.panel });
    s += mono(x + 28, y + 90, "DAFTAR RAPAT", { size: 11 });
    const meets = [
      ["Rapat Koordinasi SPBE", "04 NOV", true],
      ["Evaluasi Website Dinas", "28 OKT", false],
      ["Persiapan Smart City", "21 OKT", false],
      ["Rapat Anggaran TIK", "14 OKT", false],
      ["Sosialisasi Keamanan Data", "07 OKT", false],
    ];
    meets.forEach(([m, d, on], i) => {
      const yy = y + 120 + i * 92;
      if (on)
        s +=
          r(x + 14, yy, 332, 80, { fill: C.violet, op: 0.2, r: 4 }) +
          r(x + 14, yy, 3, 80, { fill: C.lime });
      s += t(x + 32, yy + 34, m, { size: 18, weight: on ? 600 : 400, fill: on ? C.ink : C.ink2 });
      s += mono(x + 32, yy + 60, d + " 2026", { size: 11 });
    });
    const dx = x + 410;
    s += mono(dx, y + 100, "NOTULEN · NO. 045/DISKOMINFO/XI/2026", { size: 12, fill: C.lime });
    s += t(dx, y + 150, "Rapat Koordinasi SPBE", { font: DISPLAY, size: 52, weight: 700 });
    s += t(dx, y + 188, "Selasa, 04 November 2026 · Ruang Rapat Lt. 2 · 12 peserta", {
      size: 18,
      fill: C.ink2,
    });
    s += path(`M${dx} ${y + 215}H${x + w - 40}`, { stroke: C.line });
    s += mono(dx, y + 255, "PEMBAHASAN", { size: 12 });
    [0.95, 0.88, 0.72, 0.9, 0.6].forEach(
      (v, i) => (s += r(dx, y + 278 + i * 26, 980 * v, 10, { fill: C.ink3, op: 0.35, r: 5 })),
    );
    s +=
      mono(dx, y + 440, "TINDAK LANJUT", { size: 12 }) +
      chip(dx + 180, y + 420, "3/5 SELESAI", C.lime);
    const acts = [
      ["Integrasi SSO aplikasi dinas", "Bid. Aptika", "SELESAI", C.lime],
      ["Audit keamanan website", "Bid. Persandian", "PROSES", C.violetSoft],
      ["Pelatihan admin OPD", "Bid. IKP", "BELUM", C.magenta],
    ];
    acts.forEach(([a, b, st, col], i) => {
      const yy = y + 470 + i * 72;
      s += path(cut(dx, yy, 990, 60, 8), { fill: C.raised, stroke: C.line });
      s += r(dx + 20, yy + 20, 20, 20, {
        r: 4,
        fill: st === "SELESAI" ? C.lime : "none",
        stroke: col,
        sw: 2,
      });
      if (st === "SELESAI")
        s += path(`M${dx + 25} ${yy + 30}l4 4l8 -9`, { stroke: C.abyss, sw: 2.5 });
      s +=
        t(dx + 60, yy + 37, a, { size: 19 }) +
        mono(dx + 560, yy + 36, b.toUpperCase(), { size: 11 });
      s += chip(dx + 850, yy + 17, st, col, { w: 110 });
    });
    return s;
  };
  const kanban = () => {
    let s =
      mono(100, 120, "PAPAN TINDAK LANJUT", { fill: C.lime }) +
      t(100, 180, "Keputusan rapat → aksi nyata", { font: DISPLAY, size: 56, weight: 700 });
    const cols = [
      ["BELUM", C.magenta, ["Pelatihan admin OPD", "Update SOP layanan"]],
      [
        "PROSES",
        C.violetSoft,
        ["Audit keamanan website", "Migrasi server email", "Survei kepuasan"],
      ],
      ["SELESAI", C.lime, ["Integrasi SSO", "Backup harian DB"]],
    ];
    cols.forEach(([name, col, cards], i) => {
      const x = 100 + i * 480,
        y = 240;
      s += panel(x, y, 450, 590, { fill: C.surface });
      s +=
        circle(x + 32, y + 40, 6, { fill: col }) +
        mono(x + 50, y + 45, name, { fill: col, size: 13 }) +
        mono(x + 410, y + 45, String(cards.length), { anchor: "end" });
      cards.forEach((c, k) => {
        const yy = y + 80 + k * 160;
        s += path(cut(x + 20, yy, 410, 140, 10), { fill: C.raised, stroke: C.line });
        s += t(x + 44, yy + 46, c, { size: 21, weight: 600 });
        s += mono(x + 44, yy + 76, ["BID. APTIKA", "BID. IKP", "BID. PERSANDIAN"][(i + k) % 3], {
          size: 11,
        });
        s +=
          r(x + 44, yy + 100, 260, 6, { fill: C.line, r: 3 }) +
          r(x + 44, yy + 100, 260 * [0.1, 0.55, 1][i], 6, { fill: col, r: 3 });
        s += mono(x + 404, yy + 108, `${7 + k * 3} NOV`, { anchor: "end", size: 11 });
      });
    });
    return s;
  };
  const report = () => {
    let s =
      mono(100, 120, "LAPORAN", { fill: C.lime }) +
      t(100, 180, "Progres tindak lanjut per bidang", { font: DISPLAY, size: 56, weight: 700 });
    [
      ["Aplikasi Informatika", 0.82, 14],
      ["Informasi & Komunikasi Publik", 0.64, 9],
      ["Persandian & Statistik", 0.71, 7],
      ["Sekretariat", 0.5, 6],
    ].forEach(([b, v, total], i) => {
      const y = 260 + i * 140;
      s += panel(100, y, 1400, 116, { fill: C.surface });
      s +=
        t(140, y + 50, b, { size: 24, weight: 600 }) +
        mono(140, y + 84, `${Math.round(v * total)}/${total} TINDAK LANJUT`, { size: 12 });
      s +=
        r(700, y + 48, 640, 18, { fill: C.line, r: 9 }) +
        r(700, y + 48, 640 * v, 18, { fill: i === 0 ? C.lime : C.violet, r: 9 });
      s += t(1450, y + 66, `${Math.round(v * 100)}%`, {
        anchor: "end",
        font: DISPLAY,
        size: 40,
        weight: 700,
        fill: i === 0 ? C.lime : C.ink,
      });
    });
    return s;
  };
  return [
    frame(editor(), { n, title }),
    frame(kanban(), { n, title }),
    frame(report(), { n, title, glow: C.lime }),
  ];
};

/* 5. KAFE PAAZ VPS */
scenes["kafe-paaz-vps"] = (n, title) => {
  const term = (x, y, w, h, lines, ttl = "root@paaz-vps: ~") => {
    let s = win(x, y, w, h, ttl, { fill: "#0b0915" });
    lines.forEach(([kind, txt], i) => {
      const yy = y + 90 + i * 34;
      if (kind === "$")
        s +=
          t(x + 30, yy, "$", { font: MONO, size: 19, fill: C.lime }) +
          t(x + 54, yy, txt, { font: MONO, size: 19 });
      else if (kind === "ok")
        s += t(x + 30, yy, "✔ " + txt, { font: MONO, size: 18, fill: C.green });
      else if (kind === "#") s += t(x + 30, yy, txt, { font: MONO, size: 18, fill: C.ink3 });
      else s += t(x + 30, yy, txt, { font: MONO, size: 18, fill: C.ink2 });
    });
    return s;
  };
  const coverLines = [
    ["#", "# hardening server"],
    ["$", "adduser deploy && usermod -aG sudo deploy"],
    ["$", "sed -i 's/PermitRootLogin yes/no/' sshd_config"],
    ["$", "ufw allow OpenSSH && ufw allow 'Nginx Full'"],
    ["ok", "Firewall is active and enabled on system startup"],
    ["$", "apt install nginx mysql-server php8.3-fpm"],
    ["$", "certbot --nginx -d kafepaaz.id"],
    ["ok", "Congratulations! HTTPS is enabled"],
    ["$", "php artisan optimize && php artisan migrate --force"],
    ["ok", "Deployment selesai · 0 downtime"],
    ["$", "crontab -l | grep backup"],
    ["", "0 2 * * * /opt/scripts/backup-db.sh"],
  ];
  const stack = (x, y) => {
    let s = "";
    [
      ["NGINX", "reverse proxy · SSL", C.lime],
      ["PHP 8.3-FPM", "Laravel app", C.violetSoft],
      ["MYSQL 8", "database", C.violetSoft],
      ["UBUNTU 24.04", "UFW · fail2ban · SSH key", C.magenta],
    ].forEach(([a, b, col], i) => {
      const yy = y + i * 128;
      s += `<g filter="url(#shadow)">${panel(x, yy, 400, 104, { fill: C.surface })}</g>`;
      s += r(x, yy + 14, 4, 76, { fill: col });
      s +=
        t(x + 30, yy + 50, a, { font: DISPLAY, size: 34, weight: 700 }) +
        mono(x + 30, yy + 80, b.toUpperCase(), { size: 11 });
      s += circle(x + 366, yy + 52, 8, { fill: C.green });
    });
    return s;
  };
  const cover = frame(
    term(70, 90, 980, 720, coverLines) +
      stack(1110, 120) +
      mono(1110, 660, "UPTIME 99.9% · LOAD 0.21", { fill: C.lime }),
    { n, title },
  );

  const conf = () => {
    const x = 220,
      y = 70,
      w = 1160,
      h = 760;
    let s = win(x, y, w, h, "/etc/nginx/sites-available/kafepaaz.conf", { fill: "#0b0915" });
    const code = [
      ["k", "server {"],
      ["", "    listen 443 ssl http2;"],
      ["", "    server_name kafepaaz.id;"],
      ["", "    root /var/www/kafepaaz/public;"],
      ["", ""],
      ["c", "    # keamanan"],
      ["", '    add_header X-Frame-Options "SAMEORIGIN";'],
      ["", '    add_header X-Content-Type-Options "nosniff";'],
      ["", "    server_tokens off;"],
      ["", ""],
      ["k", "    location ~ \\.php$ {"],
      ["", "        fastcgi_pass unix:/run/php/php8.3-fpm.sock;"],
      ["", "        include fastcgi_params;"],
      ["k", "    }"],
      ["k", "}"],
    ];
    code.forEach(([k, line], i) => {
      const yy = y + 100 + i * 40;
      s += t(x + 30, yy, String(i + 1).padStart(2, " "), { font: MONO, size: 18, fill: C.ink3 });
      s += t(x + 80, yy, line, {
        font: MONO,
        size: 20,
        fill: k === "k" ? C.violetSoft : k === "c" ? C.ink3 : C.ink,
      });
    });
    s +=
      r(x + 1, y + h - 40, w - 2, 39, { fill: C.violet, op: 0.25 }) +
      mono(x + 24, y + h - 14, "nginx -t  →  syntax is ok · test is successful", {
        size: 13,
        fill: C.lime,
      });
    return s;
  };
  const arch = () => {
    let s =
      mono(100, 120, "ARSITEKTUR", { fill: C.lime }) +
      t(100, 180, "LEMP stack yang di-hardening", { font: DISPLAY, size: 56, weight: 700 });
    const nodes = [
      [100, "PENGUNJUNG", "browser / mobile"],
      [470, "CLOUDFLARE DNS", "kafepaaz.id"],
      [840, "NGINX", "443 · SSL · gzip"],
      [1210, "PHP-FPM", "Laravel 11"],
    ];
    nodes.forEach(([x, a, b], i) => {
      s += `<g filter="url(#shadow)">${panel(x, 330, 300, 150, { fill: C.surface, stroke: i === 2 ? C.lime : C.line })}</g>`;
      s +=
        t(x + 30, 400, a, {
          font: DISPLAY,
          size: 32,
          weight: 700,
          fill: i === 2 ? C.lime : C.ink,
        }) + mono(x + 30, 436, b.toUpperCase(), { size: 11 });
      if (i < 3)
        s +=
          path(`M${x + 310} 405H${x + 360}`, { stroke: C.violetSoft, sw: 3 }) +
          path(`M${x + 350} 397l10 8l-10 8`, { stroke: C.violetSoft, sw: 3 });
    });
    s += path(`M1360 490V580`, { stroke: C.violetSoft, sw: 3, dash: "8 8" });
    s +=
      `<g filter="url(#shadow)">${panel(1210, 590, 300, 140, { fill: C.surface })}</g>` +
      t(1240, 660, "MYSQL 8", { font: DISPLAY, size: 32, weight: 700 }) +
      mono(1240, 694, "LOCALHOST ONLY", { size: 11, fill: C.magenta });
    s += panel(100, 590, 1060, 140, { fill: C.raised });
    ["UFW: 22, 80, 443", "SSH key · root login off", "fail2ban aktif", "Backup DB 02.00"].forEach(
      (x, i) => {
        s +=
          circle(140 + i * 260, 660, 7, { fill: C.lime }) + t(158 + i * 260, 666, x, { size: 18 });
      },
    );
    return s;
  };
  return [cover, frame(conf(), { n, title, glow: C.lime }), frame(arch(), { n, title })];
};

/* 6. GESTURE CONTROLLED SLIDES */
scenes["gesture-controlled-slides"] = (n, title) => {
  const cam = (x, y, w, h, label) => {
    let s = `<g filter="url(#shadow)">${panel(x, y, w, h, { fill: "#0d0b18" })}</g>`;
    s +=
      r(x + 24, y + 24, 12, 12, { fill: C.red, r: 6 }) +
      mono(x + 46, y + 35, "REC · WEBCAM 0 · 30 FPS", { size: 12, fill: C.ink2 });
    s += handLandmarks(x + w * 0.5, y + h * 0.86, (h / 900) * 1.55);
    s += path(
      `M${x + w * 0.5 - 200} ${y + h * 0.17}h-40v40M${x + w * 0.5 + 200} ${y + h * 0.17}h40v40M${x + w * 0.5 - 200} ${y + h * 0.93}h-40v-40M${x + w * 0.5 + 200} ${y + h * 0.93}h40v-40`,
      { stroke: C.lime, sw: 3 },
    );
    s += chip(x + 24, y + h - 50, label, C.lime);
    return s;
  };
  const slide = (x, y, w, h, num) => {
    let s = `<g filter="url(#shadow)">${panel(x, y, w, h, { fill: C.ink })}</g>`;
    s +=
      r(x + 30, y + 30, w * 0.5, 22, { fill: C.violet, r: 4 }) +
      r(x + 30, y + 72, w * 0.7, 12, { fill: "#c9c3e0", r: 4 }) +
      r(x + 30, y + 96, w * 0.6, 12, { fill: "#c9c3e0", r: 4 });
    s += r(x + 30, y + 130, w - 60, h - 170, { fill: "#e4e0f5", r: 6 });
    s += mono(x + w - 24, y + h - 16, `${num}/12`, { anchor: "end", size: 12, fill: "#6e6889" });
    return s;
  };
  const cover = frame(
    cam(70, 90, 860, 720, "SWIPE → SLIDE BERIKUTNYA") +
      slide(1000, 170, 520, 300, "05") +
      path(`M1180 540h160`, { stroke: C.lime, sw: 4 }) +
      path(`M1325 525l18 15l-18 15`, { stroke: C.lime, sw: 4 }) +
      slide(1000, 600, 260, 160, "04") +
      `<g opacity="0.4">${slide(1290, 600, 230, 160, "06")}</g>`,
    { n, title },
  );
  const map = () => {
    let s =
      mono(100, 120, "PEMETAAN GESTUR", { fill: C.lime }) +
      t(100, 180, "Tangan sebagai remote", { font: DISPLAY, size: 56, weight: 700 });
    const items = [
      ["SWIPE KANAN", "Slide berikutnya"],
      ["SWIPE KIRI", "Slide sebelumnya"],
      ["TELUNJUK", "Laser pointer"],
      ["KEPALAN", "Jeda / hitamkan layar"],
    ];
    items.forEach(([g, a], i) => {
      const x = 100 + i * 360,
        y = 270;
      s += `<g filter="url(#shadow)">${panel(x, y, 330, 540, { fill: C.surface, stroke: i === 0 ? C.lime : C.line })}</g>`;
      s += handLandmarks(x + 165, y + 380, 0.75, i === 0 ? C.lime : C.violetSoft);
      if (i < 2) {
        const dir = i === 0 ? 1 : -1;
        s +=
          path(`M${x + 165 - 70 * dir} ${y + 70}h${140 * dir}`, { stroke: C.lime, sw: 3 }) +
          path(`M${x + 165 + 70 * dir - 12 * dir} ${y + 60}l${12 * dir} 10l${-12 * dir} 10`, {
            stroke: C.lime,
            sw: 3,
          });
      }
      s +=
        t(x + 30, y + 470, g, {
          font: DISPLAY,
          size: 32,
          weight: 700,
          fill: i === 0 ? C.lime : C.ink,
        }) + t(x + 30, y + 506, a, { size: 18, fill: C.ink2 });
    });
    return s;
  };
  const present = () => {
    let s = slide(160, 90, 1280, 660, "07");
    s +=
      circle(980, 470, 16, { fill: C.red, op: 0.9 }) +
      circle(980, 470, 34, { stroke: C.red, sw: 2, op: 0.5 });
    s += `<g transform="translate(1180 520)">${panel(0, 0, 330, 300, { fill: C.surface })}${handLandmarks(165, 270, 0.62)}${mono(20, 34, "MODE POINTER", { size: 11, fill: C.lime })}</g>`;
    return s;
  };
  return [cover, frame(map(), { n, title }), frame(present(), { n, title, glow: C.lime })];
};

/* 7. FACE RECOGNITION ATTENDANCE */
scenes["face-recognition-attendance"] = (n, title) => {
  const cam = (x, y, w, h) => {
    let s = `<g filter="url(#shadow)">${panel(x, y, w, h, { fill: "#0d0b18" })}</g>`;
    s +=
      r(x + 24, y + 24, 12, 12, { fill: C.red, r: 6 }) +
      mono(x + 46, y + 35, "CAM 01 · PINTU MASUK", { size: 12, fill: C.ink2 });
    const cx = x + w / 2,
      cy = y + h * 0.45;
    s += silhouette(cx, cy, 1.3);
    // bounding box
    s += `<g filter="url(#neon)">${r(cx - 150, cy - 170, 300, 360, { stroke: C.lime, sw: 3 })}</g>`;
    s += r(cx - 150, cy - 212, 300, 42, { fill: C.lime });
    s += t(cx - 136, cy - 184, "ZONATAN · 0.97", {
      font: MONO,
      size: 19,
      weight: 700,
      fill: C.abyss,
    });
    [
      [-40, -10],
      [40, -10],
      [0, 30],
      [-26, 70],
      [26, 70],
    ].forEach(([dx, dy]) => (s += circle(cx + dx * 1.3, cy + dy * 1.3, 5, { fill: C.lime })));
    s += chip(x + 24, y + h - 50, "✔ HADIR · 07:42 WITA", C.lime);
    return s;
  };
  const log = (x, y, w, h) => {
    let s = `<g filter="url(#shadow)">${panel(x, y, w, h, { fill: C.surface })}</g>`;
    s += mono(x + 28, y + 44, "LOG KEHADIRAN · HARI INI", { size: 12, fill: C.lime });
    s +=
      t(x + 28, y + 110, "38/42", { font: DISPLAY, size: 72, weight: 700 }) +
      mono(x + 210, y + 104, "HADIR", { size: 12 });
    const ppl = [
      ["Zonatan S.", "07:42"],
      ["Maria K.", "07:39"],
      ["Kevin T.", "07:35"],
      ["Grace L.", "07:31"],
      ["Rendy P.", "07:28"],
      ["Nadia W.", "07:24"],
    ];
    ppl.forEach(([nm, tm], i) => {
      const yy = y + 160 + i * 66;
      s += path(`M${x + 28} ${yy - 22}H${x + w - 28}`, { stroke: C.line });
      s += circle(x + 50, yy + 8, 16, {
        fill: i === 0 ? C.lime : C.violetDim,
        op: i === 0 ? 0.3 : 0.6,
      });
      s +=
        t(x + 80, yy + 15, nm, { size: 19, weight: i === 0 ? 700 : 400 }) +
        mono(x + w - 28, yy + 14, tm, { anchor: "end", size: 13, fill: i === 0 ? C.lime : C.ink3 });
    });
    return s;
  };
  const table = () => {
    const x = 100,
      y = 80,
      w = 1400,
      h = 740;
    let s = win(x, y, w, h, "absensi/rekap — November 2026");
    s += t(x + 40, y + 110, "Rekap Kehadiran", { size: 32, weight: 700 });
    ["NAMA", "MASUK", "PULANG", "METODE", "KEYAKINAN", "STATUS"].forEach(
      (c, i) => (s += mono(x + 40 + i * 225, y + 170, c, { size: 12 })),
    );
    const rows = [
      ["Zonatan S.", "07:42", "16:05", "WAJAH", 0.97, "HADIR"],
      ["Maria K.", "07:39", "16:01", "WAJAH", 0.95, "HADIR"],
      ["Kevin T.", "08:16", "16:10", "WAJAH", 0.93, "TERLAMBAT"],
      ["Grace L.", "07:31", "15:58", "WAJAH", 0.96, "HADIR"],
      ["Rendy P.", "—", "—", "—", 0, "IZIN"],
      ["Nadia W.", "07:24", "16:02", "WAJAH", 0.94, "HADIR"],
    ];
    rows.forEach((row, ri) => {
      const yy = y + 230 + ri * 74;
      s += path(`M${x + 30} ${yy - 30}H${x + w - 30}`, { stroke: C.line });
      row.forEach((v, i) => {
        const cx = x + 40 + i * 225;
        if (i === 4)
          s += v
            ? r(cx, yy - 10, 150, 8, { fill: C.line, r: 4 }) +
              r(cx, yy - 10, 150 * v, 8, { fill: C.violetSoft, r: 4 }) +
              mono(cx + 160, yy - 2, v.toFixed(2), { size: 12 })
            : mono(cx, yy, "—");
        else if (i === 5)
          s += chip(
            cx,
            yy - 22,
            v,
            v === "HADIR" ? C.lime : v === "IZIN" ? C.violetSoft : C.magenta,
            { w: 120 },
          );
        else
          s += t(cx, yy, v, {
            size: 19,
            weight: i === 0 ? 600 : 400,
            fill: i === 0 ? C.ink : C.ink2,
          });
      });
    });
    return s;
  };
  const pipe = () => {
    let s =
      mono(100, 120, "PIPELINE", { fill: C.lime }) +
      t(100, 180, "Dari kamera ke daftar hadir", { font: DISPLAY, size: 56, weight: 700 });
    const st = [
      ["CAPTURE", "frame webcam"],
      ["DETECT", "lokasi wajah"],
      ["ENCODE", "vektor 128-D"],
      ["MATCH", "jarak < 0.5"],
      ["LOG", "simpan + waktu"],
    ];
    st.forEach(([a, b], i) => {
      const x = 100 + i * 290;
      s += `<g filter="url(#shadow)">${panel(x, 360, 250, 230, { fill: C.surface, stroke: i === 3 ? C.lime : C.line })}</g>`;
      s +=
        mono(x + 26, 400, `0${i + 1}`, { fill: C.lime }) +
        t(x + 26, 480, a, { font: DISPLAY, size: 40, weight: 700 }) +
        t(x + 26, 520, b, { size: 18, fill: C.ink2 });
      if (i < 4)
        s +=
          path(`M${x + 256} 475h28`, { stroke: C.violetSoft, sw: 3 }) +
          path(`M${x + 276} 467l8 8l-8 8`, { stroke: C.violetSoft, sw: 3 });
    });
    // vektor dekoratif
    for (let i = 0; i < 40; i++)
      s += r(100 + i * 35, 660, 24, 24 + ((i * 37) % 70), {
        fill: i % 7 === 0 ? C.lime : C.violet,
        op: 0.25 + ((i * 13) % 50) / 100,
      });
    return s;
  };
  return [
    frame(cam(70, 90, 900, 720) + log(1010, 90, 520, 720), { n, title }),
    frame(table(), { n, title }),
    frame(pipe(), { n, title, glow: C.lime }),
  ];
};

/* 8. STOCK MONITOR BOT */
scenes["stock-monitor-bot"] = (n, title) => {
  const candles = (x, y, w, h, count = 34, seed = 3) => {
    let s = gridLines(x, y, w, h, 5);
    let v = 50,
      rnd = seed;
    const rand = () => (rnd = (rnd * 9301 + 49297) % 233280) / 233280;
    const cw = w / count;
    const pts = [];
    const data = [];
    for (let i = 0; i < count; i++) {
      const o = v;
      v = v + (rand() - 0.42) * 12;
      const c = v;
      data.push([o, c, Math.max(o, c) + rand() * 6, Math.min(o, c) - rand() * 6]);
    }
    const lo0 = Math.min(...data.map((d) => d[3])),
      hi0 = Math.max(...data.map((d) => d[2]));
    const Y = (p) => y + h - 20 - ((p - lo0) / (hi0 - lo0)) * (h - 40);
    for (let i = 0; i < count; i++) {
      const [o, c, hi, lo] = data[i];
      const up = c >= o;
      const col = up ? C.lime : C.magenta;
      s += path(`M${x + i * cw + cw / 2} ${Y(hi)}V${Y(lo)}`, { stroke: col, sw: 2 });
      s += r(
        x + i * cw + cw * 0.2,
        Y(Math.max(o, c)),
        cw * 0.6,
        Math.max(3, Math.abs(Y(o) - Y(c))),
        { fill: col, op: up ? 0.9 : 0.75 },
      );
      pts.push([x + i * cw + cw / 2, Y(c)]);
    }
    s += path(poly(pts), { stroke: C.violetSoft, sw: 2, op: 0.6 });
    return { s, last: pts.at(-1) };
  };
  const tg = (x, y, w, h, msgs) => {
    let s = `<g filter="url(#shadow)">${panel(x, y, w, h, { fill: C.surface })}</g>`;
    s += r(x + 1, y + 1, w - 2, 72, { fill: C.raised });
    s +=
      circle(x + 44, y + 37, 20, { fill: C.violet }) +
      t(x + 44, y + 44, "SM", { anchor: "middle", size: 15, weight: 700 });
    s +=
      t(x + 76, y + 33, "Stock Monitor Bot", { size: 19, weight: 600 }) +
      mono(x + 76, y + 55, "BOT · ONLINE", { size: 10, fill: C.lime });
    let yy = y + 100;
    msgs.forEach((lines) => {
      const hh = 26 + lines.length * 28;
      s += path(cut(x + 24, yy, w - 90, hh, 10), { fill: C.raised, stroke: C.line });
      lines.forEach(
        ([txt, col, bold], i) =>
          (s += t(x + 44, yy + 38 + i * 28, txt, {
            size: 18,
            fill: col ?? C.ink,
            weight: bold ? 700 : 400,
            font: i === 0 ? MONO : SANS,
          })),
      );
      yy += hh + 16;
    });
    return s;
  };
  const cover = () => {
    const x = 70,
      y = 90,
      w = 1000,
      h = 720;
    let s = win(x, y, w, h, "watchlist · BBCA · 1D");
    s +=
      t(x + 40, y + 110, "BBCA", { font: DISPLAY, size: 56, weight: 700 }) +
      t(x + 200, y + 110, "10.050", { font: DISPLAY, size: 56, weight: 700, fill: C.lime }) +
      chip(x + 400, y + 78, "+2.1%", C.lime);
    s += mono(x + 40, y + 140, "ILUSTRASI · BUKAN DATA PASAR ASLI", { size: 11 });
    const c = candles(x + 40, y + 180, w - 80, 480);
    s += c.s;
    s += path(`M${x + 40} ${c.last[1]}H${x + w - 40}`, { stroke: C.lime, sw: 1.5, dash: "6 6" });
    s += tg(1110, 180, 420, 560, [
      [
        ["▲ ALERT", C.lime, true],
        ["BBCA menembus 10.000", C.ink],
        ["Harga: 10.050 (+2.1%)", C.ink2],
      ],
      [
        ["▼ TURUN", C.magenta, true],
        ["NVDA −3.4% dalam 1 jam", C.ink],
        ["Volume 1.8× rata-rata", C.ink2],
      ],
      [
        ["◷ RINGKASAN 16.00", C.violetSoft, true],
        ["IHSG +0.8% · 7 naik, 3 turun", C.ink],
      ],
    ]);
    return s;
  };
  const chat = () =>
    tg(640, 60, 860, 780, [
      [
        ["/watch BBCA 10000", C.violetSoft, true],
        ["Siap! Saya pantau BBCA dan kabari", C.ink],
        ["saat menyentuh 10.000.", C.ink],
      ],
      [
        ["▲ ALERT · 09:31", C.lime, true],
        ["BBCA menembus 10.000 → 10.050", C.ink],
        ["Perubahan harian +2.1%", C.ink2],
      ],
      [
        ["/list", C.violetSoft, true],
        ["BBCA · BBRI · TLKM · AAPL · NVDA", C.ink],
      ],
      [
        ["◷ RINGKASAN 16.00", C.violetSoft, true],
        ["5 saham dipantau · 2 alert hari ini", C.ink],
      ],
    ]) +
    mono(110, 140, "TELEGRAM BOT API", { fill: C.lime }) +
    t(110, 196, "Alert langsung", { font: DISPLAY, size: 54, weight: 700 }) +
    t(110, 252, "ke HP.", { font: DISPLAY, size: 54, weight: 700, fill: C.violetSoft });
  const watch = () => {
    const x = 100,
      y = 80,
      w = 1400,
      h = 740;
    let s = win(x, y, w, h, "watchlist");
    s +=
      t(x + 40, y + 110, "Watchlist", { size: 32, weight: 700 }) +
      mono(x + 220, y + 106, "ILUSTRASI", { size: 11 });
    ["KODE", "BURSA", "HARGA", "PERUBAHAN", "TREN 7 HARI", "TARGET ALERT"].forEach(
      (c, i) => (s += mono(x + 40 + i * 225, y + 170, c, { size: 12 })),
    );
    const rows = [
      ["BBCA", "IDX", "10.050", 2.1],
      ["BBRI", "IDX", "4.320", -0.9],
      ["TLKM", "IDX", "2.880", 0.7],
      ["AAPL", "NASDAQ", "231.40", 1.2],
      ["NVDA", "NASDAQ", "128.90", -3.4],
      ["MSFT", "NASDAQ", "418.20", 0.4],
    ];
    rows.forEach(([k, ex, p, ch], ri) => {
      const yy = y + 230 + ri * 74;
      const col = ch >= 0 ? C.lime : C.magenta;
      s += path(`M${x + 30} ${yy - 30}H${x + w - 30}`, { stroke: C.line });
      s +=
        t(x + 40, yy, k, { font: MONO, size: 21, weight: 700 }) +
        mono(x + 265, yy, ex, { size: 13 }) +
        t(x + 490, yy, p, { font: MONO, size: 20 });
      s += t(x + 715, yy, `${ch >= 0 ? "+" : ""}${ch}%`, {
        font: MONO,
        size: 20,
        fill: col,
        weight: 700,
      });
      const sp = [0, 1, 2, 3, 4, 5, 6].map((i) => [
        x + 940 + i * 26,
        yy - 8 - Math.sin(i + ri) * 10 - (ch > 0 ? i * 2 : -i * 2),
      ]);
      s += path(poly(sp), { stroke: col, sw: 2.5 });
      s += chip(
        x + 1165,
        yy - 22,
        ri % 2 ? "≤ TURUN 3%" : "≥ TARGET",
        ri % 2 ? C.magenta : C.violetSoft,
        { w: 150 },
      );
    });
    return s;
  };
  return [
    frame(cover(), { n, title, glow: C.lime }),
    frame(chat(), { n, title }),
    frame(watch(), { n, title }),
  ];
};

/* 9. TANILINK */
scenes["tanilink"] = (n, title) => {
  const home = (x, y, w, h) => {
    let s =
      mono(x + 22, y + 60, "HALO, PAK JOHN", { size: 10, fill: C.ink3 }) +
      t(x + 22, y + 92, "Hasil panen hari ini", { size: 20, weight: 700 });
    s +=
      path(cut(x + 22, y + 110, w - 44, 40, 8), { fill: C.raised, stroke: C.line }) +
      t(x + 40, y + 136, "Cari tomat, cabai, cengkih…", { size: 13, fill: C.ink3 });
    const items = [
      ["Tomat", "Rp 9.000/kg", C.magenta],
      ["Cabai Rawit", "Rp 38.000/kg", C.red],
      ["Wortel", "Rp 12.000/kg", "#ffa94d"],
      ["Daun Bawang", "Rp 15.000/ikat", C.green],
    ];
    items.forEach(([nm, pr, col], i) => {
      const cx = x + 22 + (i % 2) * ((w - 56) / 2 + 12),
        cy = y + 172 + Math.floor(i / 2) * 190;
      const cw = (w - 56) / 2;
      s += path(cut(cx, cy, cw, 176, 10), { fill: C.raised, stroke: C.line });
      s +=
        circle(cx + cw / 2, cy + 58, 36, { fill: col, op: 0.85 }) +
        circle(cx + cw / 2 - 10, cy + 46, 9, { fill: "#fff", op: 0.35 });
      s +=
        t(cx + 14, cy + 130, nm, { size: 15, weight: 600 }) +
        t(cx + 14, cy + 154, pr, { size: 12, fill: C.lime, font: MONO });
    });
    s += r(x, y + h - 64, w, 64, { fill: C.raised });
    ["Beranda", "Pasar", "Pesanan", "Akun"].forEach(
      (l, i) =>
        (s += t(x + (w / 4) * i + w / 8, y + h - 26, l, {
          size: 12,
          anchor: "middle",
          fill: i === 0 ? C.lime : C.ink3,
        })),
    );
    return s;
  };
  const detail = (x, y, w, h) => {
    let s = r(x, y, w, 300, { fill: C.raised });
    s +=
      circle(x + w / 2, y + 160, 90, { fill: C.magenta, op: 0.85 }) +
      circle(x + w / 2 - 30, y + 125, 22, { fill: "#fff", op: 0.3 });
    s +=
      t(x + 22, y + 350, "Tomat Segar", { size: 24, weight: 700 }) +
      t(x + 22, y + 380, "Kel. Tani Rurukan · Tomohon", { size: 13, fill: C.ink2 });
    s +=
      t(x + 22, y + 430, "Rp 9.000", { size: 28, weight: 700, fill: C.lime, font: MONO }) +
      mono(x + 175, y + 428, "/ KG", { size: 11 });
    ["Stok 320 kg", "Panen 2 hari lalu", "Kirim 1 hari"].forEach(
      (b, i) => (s += chip(x + 22, y + 460 + i * 36, b.toUpperCase(), C.violetSoft, { w: w - 44 })),
    );
    s +=
      path(cut(x + 22, y + h - 86, w - 44, 56, 10), { fill: C.lime }) +
      t(x + w / 2, y + h - 50, "Pesan Sekarang", {
        anchor: "middle",
        weight: 700,
        fill: C.abyss,
        size: 17,
      });
    return s;
  };
  const track = (x, y, w, h) => {
    let s =
      mono(x + 22, y + 60, "PESANAN #TL-2031", { size: 10, fill: C.ink3 }) +
      t(x + 22, y + 92, "Lacak pengiriman", { size: 20, weight: 700 });
    const steps = [
      ["Dipesan", "08:10", true],
      ["Dikemas petani", "09:30", true],
      ["Dalam perjalanan", "11:05", true],
      ["Tiba di tujuan", "est. 14:00", false],
    ];
    steps.forEach(([a, b, done], i) => {
      const yy = y + 160 + i * 110;
      if (i < 3)
        s += path(`M${x + 44} ${yy + 12}V${yy + 110}`, { stroke: done ? C.lime : C.line, sw: 3 });
      s += circle(x + 44, yy, 12, {
        fill: done ? C.lime : C.raised,
        stroke: done ? "none" : C.line,
        sw: 2,
      });
      s +=
        t(x + 74, yy + 6, a, { size: 16, weight: done ? 600 : 400, fill: done ? C.ink : C.ink3 }) +
        mono(x + 74, yy + 30, b.toUpperCase(), { size: 10 });
    });
    s += path(cut(x + 22, y + h - 150, w - 44, 120, 10), { fill: C.raised, stroke: C.line });
    s +=
      t(x + 42, y + h - 108, "Kurir: Pak Ferdy", { size: 15, weight: 600 }) +
      t(x + 42, y + h - 80, "Mitra logistik lokal", { size: 12, fill: C.ink2 });
    s += chip(x + 42, y + h - 66, "HUBUNGI", C.lime, { w: 110 });
    return s;
  };
  const cover = frame(
    phone(150, 60, 400, 800, detail) +
      phone(600, 30, 400, 840, home) +
      phone(1050, 60, 400, 800, track),
    { n, title, glowX: 50, glowY: 50 },
  );
  const flow = () => {
    let s =
      mono(100, 120, "USER FLOW", { fill: C.lime }) +
      t(100, 180, "Petani → pembeli, tanpa perantara panjang", {
        font: DISPLAY,
        size: 52,
        weight: 700,
      });
    const nodes = [
      ["Buka aplikasi", 100, 300],
      ["Cari komoditas", 420, 300],
      ["Lihat detail & stok", 740, 300],
      ["Pesan & bayar", 1060, 300],
      ["Petani konfirmasi", 1060, 560],
      ["Kurir lokal kirim", 740, 560],
      ["Diterima + ulasan", 420, 560],
    ];
    nodes.forEach(([a, x, y], i) => {
      s += `<g filter="url(#shadow)">${panel(x, y, 280, 140, { fill: C.surface, stroke: i === 3 ? C.lime : C.line })}</g>`;
      s +=
        mono(x + 24, y + 38, `0${i + 1}`, { fill: C.lime }) +
        t(x + 24, y + 92, a, { size: 22, weight: 600 });
    });
    const arrow = (x1, y1, x2, y2) =>
      path(`M${x1} ${y1}L${x2} ${y2}`, { stroke: C.violetSoft, sw: 3 }) +
      circle(x2, y2, 5, { fill: C.violetSoft });
    s +=
      arrow(386, 370, 414, 370) +
      arrow(706, 370, 734, 370) +
      arrow(1026, 370, 1054, 370) +
      arrow(1200, 446, 1200, 554) +
      arrow(1054, 630, 1026, 630) +
      arrow(734, 630, 706, 630);
    s +=
      panel(100, 560, 280, 140, { fill: C.raised }) +
      t(124, 620, "Dashboard petani:", { size: 18, fill: C.ink2 }) +
      t(124, 652, "stok & pendapatan", { size: 18, fill: C.ink2 });
    return s;
  };
  const screens = frame(
    phone(330, 50, 420, 820, home) +
      phone(850, 50, 420, 820, detail) +
      mono(80, 120, "FIGMA PROTOTYPE", { fill: C.lime }),
    { n, title, glow: C.lime, glowX: 50 },
  );
  return [cover, frame(flow(), { n, title }), screens];
};

/* ---------- jalankan ---------- */
const projects = [
  ["siger-kairos", "SIGER KAIROS"],
  ["tourmind-ai", "TOURMIND AI"],
  ["vr-kebudayaan-minahasa", "VR KEBUDAYAAN MINAHASA"],
  ["sim-notulen-rapat", "SIM NOTULEN & TINDAK LANJUT"],
  ["kafe-paaz-vps", "KAFE PAAZ — VPS"],
  ["gesture-controlled-slides", "GESTURE-CONTROLLED SLIDES"],
  ["face-recognition-attendance", "FACE RECOGNITION ATTENDANCE"],
  ["stock-monitor-bot", "STOCK MONITOR BOT"],
  ["tanilink", "TANILINK"],
];

const only = process.argv[2];
projects.forEach(([slug, title], i) => {
  if (only && only !== slug) return;
  const n = String(i + 1).padStart(2, "0");
  const [cover, g1, g2] = scenes[slug](n, title);
  const dir = join(root, "public/images/projects", slug);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "cover.svg"), cover);
  writeFileSync(join(dir, "1.svg"), g1);
  writeFileSync(join(dir, "2.svg"), g2);
  console.log(`  ✓ ${slug}`);
});
