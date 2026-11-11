/**
 * Generator aset placeholder.
 *   node scripts/generate-assets.mjs           → buat file yang BELUM ada saja
 *   node scripts/generate-assets.mjs --force   → timpa semua placeholder
 *
 * Menghasilkan:
 *  - public/images/profile/foto-utama.svg, foto-about.svg
 *  - public/images/profile/foto-utama.webp (dari fotosaya.jpeg di root, jika ada)
 *  - public/images/projects/<slug>/cover.svg, 1.svg, 2.svg (slug dibaca dari src/data/projects.ts)
 *  - public/og-image.svg + public/og-image.png (1200x630)
 *  - public/cv/CV-Zonatan-Sihombing.pdf (placeholder 1 halaman)
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const pub = join(root, "public");
const FORCE = process.argv.includes("--force");

const C = {
  abyss: "#08070d",
  surface: "#100e1a",
  raised: "#18152a",
  violet: "#8b5cf6",
  violetSoft: "#a78bfa",
  violetDim: "#5b3fb8",
  lime: "#c6ff3d",
  magenta: "#ff3d9a",
  ink: "#f1eefc",
  ink2: "#a9a3c4",
  ink3: "#847ea0",
};
const DISPLAY = "'Arial Narrow', 'Roboto Condensed', Arial, sans-serif";
const MONO = "Consolas, 'Courier New', monospace";

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function write(file, content, { always = false } = {}) {
  const full = join(pub, file);
  if (existsSync(full) && !FORCE && !always) {
    console.log(`  skip  ${file} (sudah ada)`);
    return false;
  }
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, content);
  console.log(`  tulis ${file}`);
  return true;
}

/** SVG placeholder bertema HUD. */
function placeholder({ w, h, title, sub, tag = "PLACEHOLDER // GANTI SAYA", seed = 0 }) {
  const b = Math.round(Math.min(w, h) * 0.06); // panjang bracket
  const m = Math.round(Math.min(w, h) * 0.05); // margin
  // Font menyesuaikan panjang judul agar tidak keluar bingkai
  const titleSize = Math.round(Math.min(w * 0.075, h * 0.12, (w - m * 4) / (title.length * 0.55)));
  const hue = seed % 2 === 0 ? C.violet : C.magenta;
  const gx = 30 + ((seed * 17) % 40);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <pattern id="g" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M40 0H0V40" fill="none" stroke="${C.violet}" stroke-opacity="0.12" stroke-width="1"/>
    </pattern>
    <radialGradient id="glow" cx="${gx}%" cy="35%" r="70%">
      <stop offset="0" stop-color="${hue}" stop-opacity="0.35"/>
      <stop offset="0.6" stop-color="${C.violetDim}" stop-opacity="0.08"/>
      <stop offset="1" stop-color="${C.abyss}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0.55" stop-color="${C.abyss}" stop-opacity="0"/>
      <stop offset="1" stop-color="${C.abyss}" stop-opacity="0.85"/>
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="${C.surface}"/>
  <rect width="${w}" height="${h}" fill="url(#glow)"/>
  <rect width="${w}" height="${h}" fill="url(#g)"/>
  <rect width="${w}" height="${h}" fill="url(#fade)"/>
  <g stroke="${C.lime}" stroke-width="3" fill="none">
    <path d="M${m} ${m + b}V${m}H${m + b}"/>
    <path d="M${w - m - b} ${m}H${w - m}V${m + b}"/>
    <path d="M${m} ${h - m - b}V${h - m}H${m + b}"/>
    <path d="M${w - m - b} ${h - m}H${w - m}V${h - m - b}"/>
  </g>
  <g stroke="${C.violetSoft}" stroke-opacity="0.5" stroke-width="1.5">
    <path d="M${w / 2 - 22} ${h / 2}H${w / 2 + 22}M${w / 2} ${h / 2 - 22}V${h / 2 + 22}"/>
  </g>
  <circle cx="${w / 2}" cy="${h / 2}" r="${Math.min(w, h) * 0.16}" fill="none" stroke="${C.violet}" stroke-opacity="0.35" stroke-dasharray="6 8"/>
  <text x="${w - m - 8}" y="${m + b + 30}" text-anchor="end" font-family="${MONO}" font-size="${Math.max(14, Math.round(w / 70))}" letter-spacing="3" fill="${C.ink3}">${esc(tag)}</text>
  <text x="${w / 2}" y="${h - m - titleSize * 0.9}" text-anchor="middle" font-family="${DISPLAY}" font-weight="700" font-size="${titleSize}" fill="${C.ink}">${esc(title)}</text>
  <text x="${w / 2}" y="${h - m - titleSize * 0.25}" text-anchor="middle" font-family="${MONO}" font-size="${Math.max(13, Math.round(w / 80))}" letter-spacing="4" fill="${C.lime}">${esc(sub)}</text>
</svg>
`;
}

function projectSlugs() {
  const src = readFileSync(join(root, "src/data/projects.ts"), "utf8");
  const re = /slug:\s*"([^"]+)",\s*\n\s*title:\s*"([^"]+)"/g;
  const out = [];
  let mt;
  while ((mt = re.exec(src))) out.push({ slug: mt[1], title: mt[2] });
  return out;
}

function ogSvg() {
  const w = 1200;
  const h = 630;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <pattern id="g" width="48" height="48" patternUnits="userSpaceOnUse">
      <path d="M48 0H0V48" fill="none" stroke="${C.violet}" stroke-opacity="0.12"/>
    </pattern>
    <radialGradient id="glow" cx="80%" cy="20%" r="80%">
      <stop offset="0" stop-color="${C.violet}" stop-opacity="0.45"/>
      <stop offset="0.45" stop-color="${C.magenta}" stop-opacity="0.12"/>
      <stop offset="1" stop-color="${C.abyss}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="${C.abyss}"/>
  <rect width="${w}" height="${h}" fill="url(#glow)"/>
  <rect width="${w}" height="${h}" fill="url(#g)"/>
  <g transform="translate(980 70) scale(3.4)" fill="none" stroke-linecap="square">
    <path d="M10 2H38L46 10V38L38 46H10L2 38V10Z" stroke="${C.violetSoft}" stroke-opacity="0.6" stroke-width="1.5"/>
    <path d="M12 15H24L13 33H24" stroke="${C.lime}" stroke-width="3"/>
    <path d="M37 15H28V24H36V33H27" stroke="${C.violetSoft}" stroke-width="3"/>
  </g>
  <text x="80" y="110" font-family="${MONO}" font-size="20" letter-spacing="5" fill="${C.lime}">PLAYER ENTRY // MANADO</text>
  <text x="80" y="290" font-family="${DISPLAY}" font-weight="700" font-size="150" fill="${C.ink}">ZONATAN</text>
  <text x="80" y="430" font-family="${DISPLAY}" font-weight="700" font-size="150" fill="${C.violetSoft}">SIHOMBING</text>
  <text x="80" y="500" font-family="Arial, sans-serif" font-size="30" fill="${C.ink2}">Web Developer · Computer Vision · Server · UI/UX</text>
  <rect x="80" y="540" width="250" height="40" fill="${C.lime}"/>
  <text x="96" y="567" font-family="${MONO}" font-size="18" font-weight="700" letter-spacing="3" fill="${C.abyss}">OPEN TO WORK</text>
  <text x="1120" y="567" text-anchor="end" font-family="${MONO}" font-size="18" letter-spacing="3" fill="${C.ink3}">1.4748° N, 124.8421° E</text>
</svg>
`;
}

/** PDF minimal 1 halaman (A4) — tanpa dependensi tambahan. */
function cvPdf() {
  const lines = [
    ["F2", 26, 72, 770, "ZONATAN SIHOMBING"],
    ["F1", 12, 72, 748, "Web Developer & Computer Vision Enthusiast  -  Manado, Indonesia"],
    ["F1", 11, 72, 712, "CV PLACEHOLDER - GANTI FILE INI DENGAN CV ASLI KAMU."],
    ["F1", 11, 72, 694, "Lokasi file: public/cv/CV-Zonatan-Sihombing.pdf"],
    ["F2", 14, 72, 650, "PENDIDIKAN"],
    ["F1", 11, 72, 630, "Teknik Informatika - Universitas Negeri Manado (UNIMA)"],
    ["F2", 14, 72, 590, "PENGALAMAN"],
    ["F1", 11, 72, 570, "- Magang - Diskominfo Kota Tomohon"],
    ["F1", 11, 72, 552, "- Peserta Gemastik - TourMind AI"],
    ["F1", 11, 72, 534, "- Tim STROM - KRTI 2026"],
    ["F2", 14, 72, 494, "SKILL"],
    ["F1", 11, 72, 474, "Laravel, Filament, Tailwind, PHP, MySQL, Python, OpenCV, MediaPipe,"],
    ["F1", 11, 72, 456, "Linux, Nginx, Git, Figma, Unity, Ollama (LLM lokal)"],
  ];
  const content = [
    "1 1 1 rg 0 0 595 842 re f",
    "0.545 0.361 0.965 rg 72 790 120 4 re f",
    "BT",
    "0.031 0.027 0.051 rg",
    ...lines.map(
      ([f, s, x, y, t]) =>
        `/${f} ${s} Tf 1 0 0 1 ${x} ${y} Tm (${t.replace(/[()\\]/g, "\\$&")}) Tj`,
    ),
    "ET",
  ].join("\n");
  const objs = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>",
    `<< /Length ${Buffer.byteLength(content, "latin1")} >>\nstream\n${content}\nendstream`,
  ];
  let pdf = "%PDF-1.4\n";
  const offsets = [];
  objs.forEach((o, i) => {
    offsets.push(Buffer.byteLength(pdf, "latin1"));
    pdf += `${i + 1} 0 obj\n${o}\nendobj\n`;
  });
  const xref = Buffer.byteLength(pdf, "latin1");
  pdf += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n`;
  offsets.forEach((off) => (pdf += `${String(off).padStart(10, "0")} 00000 n \n`));
  pdf += `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return Buffer.from(pdf, "latin1");
}

async function main() {
  console.log("Membuat aset placeholder...");

  write(
    "images/profile/foto-utama.svg",
    placeholder({ w: 800, h: 1000, title: "FOTO PROFIL", sub: "GANTI SAYA · 4:5", seed: 1 }),
  );
  write(
    "images/profile/foto-about.svg",
    placeholder({ w: 800, h: 800, title: "FOTO ABOUT", sub: "GANTI SAYA · 1:1", seed: 2 }),
  );

  // Foto asli → WebP terkompresi (4:5)
  const photo = join(root, "fotosaya.jpeg");
  const webp = join(pub, "images/profile/foto-utama.webp");
  if (existsSync(photo) && (FORCE || !existsSync(webp))) {
    await sharp(photo)
      .rotate()
      .resize(720, 900, { fit: "cover", position: "north" })
      .webp({ quality: 76 })
      .toFile(webp);
    console.log("  tulis images/profile/foto-utama.webp (dari fotosaya.jpeg)");
  } else if (!existsSync(webp)) {
    // Tidak ada foto asli → render placeholder SVG ke WebP agar path default tetap valid
    await sharp(
      Buffer.from(
        placeholder({ w: 800, h: 1000, title: "FOTO PROFIL", sub: "GANTI SAYA · 4:5", seed: 1 }),
      ),
    )
      .webp()
      .toFile(webp);
    console.log("  tulis images/profile/foto-utama.webp (placeholder)");
  }

  // Foto kartu flip di section Profil (depan: fotosaya2.jpeg, belakang: fotosaya.jpeg)
  const front = join(root, "fotosaya2.jpeg");
  const frontOut = join(pub, "images/profile/foto-about.webp");
  if (existsSync(front) && (FORCE || !existsSync(frontOut))) {
    const m = await sharp(front).metadata();
    const h = Math.min(m.height, Math.round(m.width * 1.25));
    await sharp(front)
      .rotate()
      .extract({ left: 0, top: Math.min(90, m.height - h), width: m.width, height: h })
      .resize(720, 900)
      .webp({ quality: 78 })
      .toFile(frontOut);
    console.log("  tulis images/profile/foto-about.webp (dari fotosaya2.jpeg)");
  }
  const backOut = join(pub, "images/profile/foto-about-back.webp");
  if (existsSync(photo) && (FORCE || !existsSync(backOut))) {
    await sharp(photo)
      .rotate()
      .resize(720, 900, { fit: "cover", position: "attention" })
      .webp({ quality: 72 })
      .toFile(backOut);
    console.log("  tulis images/profile/foto-about-back.webp (dari fotosaya.jpeg)");
  }

  // Placeholder proyek hanya dibuat jika belum ada gambar sama sekali
  // (ilustrasi proyek dibuat oleh scripts/generate-project-art.mjs dan tidak ditimpa di sini).
  projectSlugs().forEach(({ slug, title }, i) => {
    if (existsSync(join(pub, "images/projects", slug, "cover.svg"))) return;
    const n = String(i + 1).padStart(2, "0");
    write(
      `images/projects/${slug}/cover.svg`,
      placeholder({
        w: 1600,
        h: 900,
        title: title.toUpperCase(),
        sub: `PROJECT ${n} — COVER`,
        tag: `MISSION ${n} // PLACEHOLDER`,
        seed: i,
      }),
    );
    write(
      `images/projects/${slug}/1.svg`,
      placeholder({
        w: 1600,
        h: 900,
        title: title.toUpperCase(),
        sub: `PROJECT ${n} — GALERI 1`,
        tag: `MISSION ${n} // GANTI SAYA`,
        seed: i + 1,
      }),
    );
    write(
      `images/projects/${slug}/2.svg`,
      placeholder({
        w: 1600,
        h: 900,
        title: title.toUpperCase(),
        sub: `PROJECT ${n} — GALERI 2`,
        tag: `MISSION ${n} // GANTI SAYA`,
        seed: i + 2,
      }),
    );
  });

  const og = ogSvg();
  write("og-image.svg", og);
  const ogPng = join(pub, "og-image.png");
  if (FORCE || !existsSync(ogPng)) {
    await sharp(Buffer.from(og)).png({ compressionLevel: 9 }).toFile(ogPng);
    console.log("  tulis og-image.png");
  }

  write("cv/CV-Zonatan-Sihombing.pdf", cvPdf());
  console.log("Selesai.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
