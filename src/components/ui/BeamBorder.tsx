"use client";

import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { VIEWPORT } from "@/lib/motion";

/**
 * Border animasi untuk panel HUD:
 * 1) garis outline "tergambar" mengelilingi panel saat terlihat,
 * 2) lalu dua sinar cahaya terus berjalan menyusuri border.
 * Mengikuti bentuk sudut terpotong panel (`clip-corner` / `clip-corner-tr`).
 * Taruh sebagai anak pertama elemen yang `position: relative`.
 */
export function BeamBorder({
  shape = "corner",
  duration = 7,
  delay = 0,
}: {
  shape?: "corner" | "tr";
  duration?: number;
  delay?: number;
}) {
  const ref = useRef<SVGSVGElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const host = ref.current?.parentElement;
    if (!host) return;
    const ro = new ResizeObserver(([e]) => {
      const { width, height } = e.contentRect;
      setSize({ w: Math.round(width), h: Math.round(height) });
    });
    ro.observe(host);
    return () => ro.disconnect();
  }, []);

  const { w, h } = size;
  const o = 1; // inset agar garis tidak terpotong clip-path
  const d =
    shape === "corner"
      ? `M${14} ${o}H${w - o}V${h - 14}L${w - 14} ${h - o}H${o}V${14}Z`
      : `M${o} ${o}H${w - 18}L${w - o} ${18}V${h - o}H${o}Z`;

  return (
    <svg
      ref={ref}
      aria-hidden
      className="pointer-events-none absolute inset-0 z-[1] h-full w-full overflow-visible"
      viewBox={w ? `0 0 ${w} ${h}` : undefined}
    >
      {w > 0 && (
        <>
          {/* 1. Outline tergambar */}
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
          {/* 2. Sinar berjalan — muncul setelah outline selesai */}
          <motion.g
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={VIEWPORT}
            transition={{ duration: 0.6, delay: delay + 1.2 }}
          >
            <path
              d={d}
              pathLength={1000}
              fill="none"
              stroke="#c6ff3d"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeDasharray="150 850"
              className="beam-dash"
              style={{
                animationDuration: `${duration}s`,
                filter: "drop-shadow(0 0 6px rgb(198 255 61 / 0.95))",
              }}
            />
            <path
              d={d}
              pathLength={1000}
              fill="none"
              stroke="#a78bfa"
              strokeWidth={2}
              strokeLinecap="round"
              strokeDasharray="100 900"
              className="beam-dash"
              style={{
                animationDuration: `${duration}s`,
                // setengah putaran di depan sinar lime
                animationDelay: `-${duration / 2}s`,
                filter: "drop-shadow(0 0 4px rgb(139 92 246 / 0.9))",
              }}
            />
          </motion.g>
        </>
      )}
    </svg>
  );
}
