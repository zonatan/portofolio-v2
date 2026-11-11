"use client";

import { motion } from "motion/react";
import { useState } from "react";
import { useI18n } from "@/components/providers/LanguageProvider";
import { skillGroups } from "@/data/skills";
import { EASE, VIEWPORT } from "@/lib/motion";
import { cn } from "@/lib/utils";

const CX = 160;
const CY = 156;
const R = 104;
const round = (n: number) => Math.round(n * 100) / 100; // hindari hydration mismatch

/** Titik pada sumbu ke-i (0 = atas, searah jarum jam) dengan jari-jari r. */
function pt(i: number, r: number, n: number) {
  const a = (-90 + (360 / n) * i) * (Math.PI / 180);
  return [round(CX + Math.cos(a) * r), round(CY + Math.sin(a) * r)] as const;
}
const poly = (pts: ReadonlyArray<readonly [number, number]>) =>
  pts.map((p) => p.join(",")).join(" ");

/**
 * "Attribute Radar" — grafik statistik karakter ala RPG.
 * Nilai = rata-rata level skill per kelompok di `src/data/skills.ts` (otomatis).
 */
export function StatRadar() {
  const { t } = useI18n();
  const [active, setActive] = useState<number | null>(null);

  const stats = skillGroups.map((g) => {
    const avg = g.skills.reduce((s, k) => s + k.level, 0) / g.skills.length;
    return {
      key: g.key,
      label: g.key === "aicv" ? "AI / CV" : t.loadout.groups[g.key],
      value: Math.round(avg * 10) / 10,
      count: g.skills.length,
    };
  });
  const n = stats.length;
  const overall = Math.round((stats.reduce((s, x) => s + x.value, 0) / n) * 10) / 10;
  const dataPts = stats.map((s, i) => pt(i, (R * s.value) / 5, n));
  const sel = active !== null ? stats[active] : null;

  return (
    <div className="hud-panel clip-corner p-5 sm:p-6">
      <div className="flex items-center justify-between">
        <p className="hud-label text-lime">{t.loadout.radar.title}</p>
        <p className="hud-label text-ink-3">ZS-01</p>
      </div>

      {/* Daftar nilai untuk pembaca layar */}
      <ul className="sr-only">
        {stats.map((s) => (
          <li key={s.key}>
            {s.label}: {t.loadout.level} {s.value} / 5
          </li>
        ))}
      </ul>

      <svg viewBox="-44 0 408 300" className="mx-auto mt-2 block w-full max-w-[24rem]" aria-hidden>
        {/* cincin putus-putus berputar pelan */}
        <g
          className="radar-ring"
          style={{ transformOrigin: `${CX}px ${CY}px`, transformBox: "view-box" }}
        >
          <circle
            cx={CX}
            cy={CY}
            r={R + 18}
            fill="none"
            stroke="rgb(139 92 246 / 0.3)"
            strokeDasharray="2 8"
          />
        </g>

        {/* grid level 1–5 */}
        {[1, 2, 3, 4, 5].map((l) => (
          <polygon
            key={l}
            points={poly(stats.map((_, i) => pt(i, (R * l) / 5, n)))}
            fill={l === 5 ? "rgb(24 21 42 / 0.6)" : "none"}
            stroke={l === 5 ? "rgb(139 92 246 / 0.45)" : "rgb(139 92 246 / 0.16)"}
            strokeWidth={1}
          />
        ))}
        {/* sumbu */}
        {stats.map((_, i) => {
          const [x, y] = pt(i, R, n);
          return (
            <line
              key={i}
              x1={CX}
              y1={CY}
              x2={x}
              y2={y}
              stroke={active === i ? "#c6ff3d" : "rgb(139 92 246 / 0.25)"}
              strokeWidth={active === i ? 1.5 : 1}
            />
          );
        })}

        {/* area data: tumbuh dari tengah saat terlihat */}
        <motion.polygon
          points={poly(dataPts)}
          fill="rgb(139 92 246 / 0.28)"
          stroke="#a78bfa"
          strokeWidth={2}
          strokeLinejoin="round"
          style={{ transformOrigin: `${CX}px ${CY}px`, transformBox: "view-box" }}
          initial={{ scale: 0, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={VIEWPORT}
          transition={{ duration: 0.8, ease: EASE, delay: 0.15 }}
        />

        {/* titik nilai + label */}
        {stats.map((s, i) => {
          const [x, y] = dataPts[i];
          const [lx, ly] = pt(i, R + 34, n);
          const anchor = Math.abs(lx - CX) < 6 ? "middle" : lx > CX ? "start" : "end";
          const on = active === i;
          return (
            <g key={s.key}>
              <motion.circle
                cx={x}
                cy={y}
                r={on ? 6 : 4}
                fill={on ? "#c6ff3d" : "#f1eefc"}
                stroke="#08070d"
                strokeWidth={2}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={VIEWPORT}
                transition={{ duration: 0.3, delay: 0.7 + i * 0.08 }}
              />
              <text
                x={lx}
                y={ly - 4}
                textAnchor={anchor}
                fontSize="10"
                fontFamily="var(--font-jetbrains), monospace"
                letterSpacing="1.5"
                fill={on ? "#c6ff3d" : "#a9a3c4"}
              >
                {s.label.toUpperCase()}
              </text>
              <text
                x={lx}
                y={ly + 12}
                textAnchor={anchor}
                fontSize="15"
                fontWeight="700"
                fontFamily="var(--font-teko), sans-serif"
                fill={on ? "#c6ff3d" : "#f1eefc"}
              >
                {s.value.toFixed(1)}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Legend interaktif (hover / fokus untuk menyorot atribut) */}
      <div className="mt-3 flex flex-wrap justify-center gap-1.5">
        {stats.map((s, i) => (
          <button
            key={s.key}
            type="button"
            onPointerEnter={() => setActive(i)}
            onPointerLeave={() => setActive(null)}
            onFocus={() => setActive(i)}
            onBlur={() => setActive(null)}
            aria-label={`${s.label}: ${t.loadout.level} ${s.value}`}
            className={cn(
              "clip-corner-sm border px-2.5 py-1 font-mono text-[0.625rem] tracking-[0.14em] uppercase transition-colors",
              active === i
                ? "border-lime/60 bg-lime/10 text-lime"
                : "border-violet-dim/40 text-ink-2 hover:text-ink",
            )}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="border-violet-dim/30 mt-4 flex items-end justify-between border-t pt-4">
        <div>
          <p className="hud-label text-ink-3">{sel ? sel.label : t.loadout.radar.overall}</p>
          <p className="text-ink-2 mt-1 text-xs">
            {sel
              ? `${sel.count} ${t.loadout.radar.skills} · ${t.loadout.levelNames[Math.round(sel.value)]}`
              : t.loadout.radar.hint}
          </p>
        </div>
        <p className="font-display text-lime text-5xl leading-none font-bold tabular-nums">
          {(sel ? sel.value : overall).toFixed(1)}
        </p>
      </div>
    </div>
  );
}
