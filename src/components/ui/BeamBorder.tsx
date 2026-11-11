"use client";

import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { VIEWPORT } from "@/lib/motion";

const BEAMS = [
  { color: "#c6ff3d", glow: "rgb(198 255 61 / 0.75)", length: 140, phase: 0 },
  { color: "#a78bfa", glow: "rgb(139 92 246 / 0.8)", length: 100, phase: 0.5 },
] as const;

/** Satu segmen jalur border: titik awal, arah (derajat, searah jarum jam), panjang. */
type Segment = { x: number; y: number; angle: number; len: number };

const RAIL = 10; // tebal rel (px) — ruang untuk glow di sisi dalam panel
const SQRT2 = Math.SQRT2;

/**
 * Jalur border searah jarum jam, TERMASUK potongan miring di sudut,
 * agar sinar tidak "hilang" saat melewati sudut terpotong.
 * "corner" = sudut kiri-atas & kanan-bawah terpotong 14px (clip-corner)
 * "tr"     = sudut kanan-atas terpotong 18px (clip-corner-tr)
 */
function buildPath(shape: "corner" | "tr", w: number, h: number): Segment[] {
  if (shape === "corner") {
    const c = 14;
    return [
      { x: c, y: 0, angle: 0, len: w - c }, // atas →
      { x: w, y: 0, angle: 90, len: h - c }, // kanan ↓
      { x: w, y: h - c, angle: 135, len: c * SQRT2 }, // miring kanan-bawah ↙
      { x: w - c, y: h, angle: 180, len: w - c }, // bawah ←
      { x: 0, y: h, angle: 270, len: h - c }, // kiri ↑
      { x: 0, y: c, angle: 315, len: c * SQRT2 }, // miring kiri-atas ↗
    ];
  }
  const c = 18;
  return [
    { x: 0, y: 0, angle: 0, len: w - c }, // atas →
    { x: w - c, y: 0, angle: 45, len: c * SQRT2 }, // miring kanan-atas ↘
    { x: w, y: c, angle: 90, len: h - c }, // kanan ↓
    { x: w, y: h, angle: 180, len: w }, // bawah ←
    { x: 0, y: h, angle: 270, len: h }, // kiri ↑
  ];
}

/**
 * Border animasi untuk panel HUD:
 * 1) garis outline "tergambar" mengelilingi panel saat terlihat (SVG, sekali jalan),
 * 2) sinar tajam berekor berjalan mengitari tepi panel, ikut berbelok di sudut miring.
 *
 * Tiap segmen punya "rel" yang diputar sesuai arah segmen; sinar meluncur di dalamnya
 * memakai transform (Web Animations API) dengan kecepatan konstan → diproses GPU.
 * Animasi berhenti otomatis saat panel di luar layar.
 */
export function BeamBorder({
  shape = "corner",
  duration = 7,
  delay = 0,
}: {
  shape?: "corner" | "tr";
  /** Detik untuk satu putaran penuh. */
  duration?: number;
  delay?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const host = ref.current?.parentElement;
    if (!host) return;
    const ro = new ResizeObserver(() => setSize({ w: host.offsetWidth, h: host.offsetHeight }));
    ro.observe(host);
    return () => ro.disconnect();
  }, []);

  const { w, h } = size;
  const segments = w && h ? buildPath(shape, w, h).filter((s) => s.len > 0) : [];
  const perimeter = segments.reduce((s, seg) => s + seg.len, 0);

  // Jalankan sinar dengan Web Animations API (transform → compositor/GPU)
  useEffect(() => {
    const root = ref.current;
    if (!root || perimeter <= 0) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const cycle = duration * 1000;
    const speed = perimeter / cycle; // px per ms
    const anims: Animation[] = [];

    BEAMS.forEach((beam, bi) => {
      let elapsed = 0; // waktu kepala sinar tiba di awal segmen ini
      segments.forEach((seg, si) => {
        const bar = root.querySelector<HTMLElement>(`[data-beam="${bi}-${si}"]`);
        if (bar) {
          const L = beam.length;
          const end = Math.min((seg.len + L) / speed / cycle, 0.999); // kepala masuk → ekor keluar
          anims.push(
            bar.animate(
              [
                { transform: `translateX(${-L}px)`, offset: 0 },
                { transform: `translateX(${seg.len}px)`, offset: end },
                { transform: `translateX(${seg.len}px)`, offset: 1 },
              ],
              {
                duration: cycle,
                iterations: Infinity,
                easing: "linear",
                fill: "both",
                delay: (delay + 1.2) * 1000 + elapsed + beam.phase * cycle - cycle,
              },
            ),
          );
        }
        elapsed += seg.len / speed;
      });
    });

    // Jeda saat panel di luar layar
    const io = new IntersectionObserver(
      ([e]) => anims.forEach((a) => (e.isIntersecting ? a.play() : a.pause())),
      { rootMargin: "100px" },
    );
    io.observe(root);
    return () => {
      io.disconnect();
      anims.forEach((a) => a.cancel());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [w, h, shape, duration, delay]);

  const o = 1; // inset agar garis outline tidak terpotong clip-path
  const d =
    shape === "corner"
      ? `M${14} ${o}H${w - o}V${h - 14}L${w - 14} ${h - o}H${o}V${14}Z`
      : `M${o} ${o}H${w - 18}L${w - o} ${18}V${h - o}H${o}Z`;

  return (
    <span ref={ref} aria-hidden className="pointer-events-none absolute inset-0 z-[1]">
      {w > 0 && (
        <>
          {/* 1. Outline tergambar (sekali jalan, lalu statis) */}
          <svg
            className="absolute inset-0 h-full w-full overflow-visible"
            viewBox={`0 0 ${w} ${h}`}
            preserveAspectRatio="none"
          >
            <motion.path
              d={d}
              fill="none"
              stroke="rgb(167 139 250 / 0.55)"
              strokeWidth={1}
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={VIEWPORT}
              transition={{ duration: 1.4, ease: [0.65, 0, 0.35, 1], delay }}
            />
          </svg>

          {/* 2. Rel per segmen (diputar sesuai arah) + sinar tajam berekor.
              Sumbu Y lokal rel selalu mengarah ke DALAM panel, jadi sinar menempel di tepi. */}
          {segments.map((seg, si) => (
            <span
              key={si}
              className="absolute overflow-hidden"
              style={{
                left: seg.x,
                top: seg.y,
                width: seg.len,
                height: RAIL,
                transform: `rotate(${seg.angle}deg)`,
                transformOrigin: "0 0",
              }}
            >
              {BEAMS.map((beam, bi) => (
                <span
                  key={bi}
                  data-beam={`${bi}-${si}`}
                  className="absolute top-0 left-0 will-change-transform"
                  style={{
                    width: beam.length,
                    height: 2,
                    background: `linear-gradient(90deg, transparent, ${beam.color} 85%, #fff)`,
                    boxShadow: `0 0 8px 1px ${beam.glow}`,
                    transform: "translateX(-9999px)",
                  }}
                />
              ))}
            </span>
          ))}
        </>
      )}
    </span>
  );
}
