import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import sharp from "sharp";
import { profile } from "@/data/profile";
import { SITE_URL } from "@/lib/utils";

/**
 * Kartu pratinjau link (WhatsApp, LinkedIn, Discord, X, dll.) — dibuat otomatis saat build
 * dari data profil + foto hero, jadi selalu ikut berubah kalau profil/foto diganti.
 * Disajikan sebagai JPEG oleh src/app/og-image.jpg/route.ts.
 */
const size = { width: 1200, height: 630 };

const C = {
  bg: "#08070d",
  surface: "#100e1a",
  violet: "#8b5cf6",
  violetSoft: "#a78bfa",
  violetDim: "#5b3fb8",
  lime: "#c6ff3d",
  ink: "#f1eefc",
  ink2: "#a9a3c4",
  ink3: "#6e6889",
};

// Path dibatasi ke subfolder tertentu agar build tidak men-trace seluruh project
const font = (f: string) => readFile(join(process.cwd(), "src", "assets", "og", f));
const publicFile = (f: string) => readFile(join(process.cwd(), "public", f));

export async function renderOgImage() {
  const [teko, mono, inter, photo] = await Promise.all([
    font("teko-latin-700-normal.woff"),
    font("jetbrains-mono-latin-500-normal.woff"),
    font("inter-latin-500-normal.woff"),
    // Satori tidak membaca WebP → ubah foto ke JPEG
    publicFile(profile.photo.replace(/^\//, "")).then((b) =>
      sharp(b).resize(400, 500, { fit: "cover" }).jpeg({ quality: 82 }).toBuffer(),
    ),
  ]);
  const photoSrc = `data:image/jpeg;base64,${photo.toString("base64")}`;
  const host = SITE_URL.replace(/^https?:\/\//, "");
  const tags = ["Laravel", "Filament", "Python", "AI / LLM"];

  const bracket = (pos: Record<string, number>, borders: Record<string, string>) => (
    <div
      style={{ position: "absolute", width: 34, height: 34, display: "flex", ...pos, ...borders }}
    />
  );
  const line = `4px solid ${C.lime}`;

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        background: C.bg,
        backgroundImage: `radial-gradient(circle at 78% 30%, rgba(139,92,246,0.35), transparent 55%), radial-gradient(circle at 10% 100%, rgba(198,255,61,0.10), transparent 45%), linear-gradient(rgba(91,63,184,0.14) 1px, transparent 1px), linear-gradient(90deg, rgba(91,63,184,0.14) 1px, transparent 1px)`,
        backgroundSize: "100% 100%, 100% 100%, 48px 48px, 48px 48px",
        fontFamily: "Inter",
        color: C.ink,
      }}
    >
      {/* Bingkai HUD */}
      <div
        style={{
          position: "absolute",
          inset: 24,
          display: "flex",
          border: `1px solid rgba(139,92,246,0.35)`,
        }}
      />

      {/* Kiri: teks */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 0 0 72px",
          width: 660,
        }}
      >
        <div
          style={{
            display: "flex",
            fontFamily: "Mono",
            fontSize: 20,
            letterSpacing: 5,
            color: C.lime,
          }}
        >
          PLAYER ENTRY {"//"} {profile.playerId}
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            fontFamily: "Teko",
            fontSize: 132,
            lineHeight: 0.82,
            marginTop: 26,
          }}
        >
          <span>ZONATAN</span>
          <span style={{ color: C.violetSoft }}>SIHOMBING</span>
        </div>
        <div style={{ display: "flex", fontSize: 27, color: C.ink2, marginTop: 22 }}>
          Web Developer · Computer Vision · Server
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 26 }}>
          {tags.map((t) => (
            <div
              key={t}
              style={{
                display: "flex",
                fontFamily: "Mono",
                fontSize: 17,
                letterSpacing: 2,
                color: C.violetSoft,
                border: `1px solid rgba(139,92,246,0.55)`,
                background: "rgba(139,92,246,0.10)",
                padding: "7px 14px",
              }}
            >
              {t.toUpperCase()}
            </div>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 22, marginTop: 34 }}>
          {profile.openToWork && (
            <div
              style={{
                display: "flex",
                fontFamily: "Mono",
                fontSize: 19,
                letterSpacing: 4,
                color: C.bg,
                background: C.lime,
                padding: "10px 18px",
              }}
            >
              OPEN TO WORK
            </div>
          )}
          <div style={{ display: "flex", fontFamily: "Mono", fontSize: 20, color: C.ink3 }}>
            {host}
          </div>
        </div>
      </div>

      {/* Kanan: foto dalam bingkai HUD */}
      <div
        style={{
          position: "absolute",
          right: 84,
          top: 75,
          width: 384,
          height: 480,
          display: "flex",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse butuh <img> */}
        <img
          src={photoSrc}
          alt=""
          width={384}
          height={480}
          style={{ objectFit: "cover", border: `2px solid ${C.violetDim}` }}
        />
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: 200,
            display: "flex",
            backgroundImage: `linear-gradient(transparent, rgba(8,7,13,0.92))`,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 20,
            bottom: 18,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <span style={{ fontFamily: "Teko", fontSize: 46, lineHeight: 1 }}>
            {profile.nickname.toUpperCase()}
          </span>
          <span style={{ fontFamily: "Mono", fontSize: 15, letterSpacing: 3, color: C.ink2 }}>
            {profile.playerId} · MANADO, ID
          </span>
        </div>
        {bracket({ left: -14, top: -14 }, { borderLeft: line, borderTop: line })}
        {bracket({ right: -14, top: -14 }, { borderRight: line, borderTop: line })}
        {bracket({ left: -14, bottom: -14 }, { borderLeft: line, borderBottom: line })}
        {bracket({ right: -14, bottom: -14 }, { borderRight: line, borderBottom: line })}
      </div>
    </div>,
    {
      ...size,
      fonts: [
        { name: "Teko", data: teko, weight: 700, style: "normal" },
        { name: "Mono", data: mono, weight: 500, style: "normal" },
        { name: "Inter", data: inter, weight: 500, style: "normal" },
      ],
    },
  );
}
