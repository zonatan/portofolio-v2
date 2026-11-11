"use client";

import { Crown, Medal, Trophy } from "lucide-react";
import { motion } from "motion/react";
import { useI18n } from "@/components/providers/LanguageProvider";
import { BeamBorder, type Beam } from "@/components/ui/BeamBorder";
import { EASE } from "@/lib/motion";
import { cn, pad2 } from "@/lib/utils";

export type ScoreEntry = { name: string; score: number; wave: number; at: string };
export const TOP_N = 10;

/** Skor layak masuk Hall of Fame? */
export function qualifies(entries: ScoreEntry[] | null, score: number) {
  if (!entries || score <= 0) return false;
  return entries.length < TOP_N || score > entries[entries.length - 1].score;
}

// Konstanta modul → referensi stabil untuk BeamBorder
const GOLD_BEAMS: Beam[] = [
  { color: "#ffd166", glow: "rgb(255 209 102 / 0.85)", length: 150, phase: 0 },
  { color: "#fff1c2", glow: "rgb(255 236 179 / 0.7)", length: 80, phase: 0.5 },
];
const SILVER_BEAMS: Beam[] = [
  { color: "#d2d6fb", glow: "rgb(210 214 251 / 0.7)", length: 110, phase: 0 },
];

/**
 * Tingkatan podium — tiap peringkat punya efek berbeda:
 * #1 emas: dua sinar berjalan, aura berdenyut, kilau melintas, mahkota melayang, percikan naik.
 * #2 perak: satu sinar berjalan lebih pelan, aura & kilau lebih lembut.
 * #3 perunggu: border berdenyut.
 */
const TIERS = [
  {
    color: "#ffd166",
    soft: "rgb(255 209 102 / 0.16)",
    line: "rgb(255 209 102 / 0.45)",
    beams: GOLD_BEAMS,
    duration: 4.5,
    step: "h-16 sm:h-24",
    order: "order-2",
  },
  {
    color: "#d2d6fb",
    soft: "rgb(210 214 251 / 0.12)",
    line: "rgb(210 214 251 / 0.4)",
    beams: SILVER_BEAMS,
    duration: 7,
    step: "h-11 sm:h-16",
    order: "order-1",
  },
  {
    color: "#ff9f5a",
    soft: "rgb(255 159 90 / 0.12)",
    line: "rgb(255 159 90 / 0.4)",
    beams: null,
    duration: 0,
    step: "h-7 sm:h-10",
    order: "order-3",
  },
] as const;

// Posisi percikan di kartu juara (tetap, agar render server & klien identik)
const SPARKS = [
  { left: "14%", d: "0s" },
  { left: "32%", d: "1.1s" },
  { left: "52%", d: "0.5s" },
  { left: "70%", d: "1.7s" },
  { left: "86%", d: "0.8s" },
];

function PodiumCard({
  rank,
  entry,
  highlight,
}: {
  rank: 0 | 1 | 2;
  entry?: ScoreEntry;
  highlight?: string;
}) {
  const { t } = useI18n();
  const lb = t.arcade.lb;
  const tier = TIERS[rank];
  const first = rank === 0;
  const mine = !!entry && entry.name === highlight;
  const Icon = first ? Crown : Medal;

  return (
    <motion.li
      initial={{ opacity: 0, y: 48 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.7, ease: EASE, delay: [0.35, 0.2, 0.05][rank] }}
      className={cn("flex min-w-0 flex-col justify-end", tier.order)}
    >
      <div className="relative">
        {/* Aura berdenyut di belakang kartu (#1 & #2) */}
        {entry && rank < 2 && (
          <div
            aria-hidden
            className="podium-aura pointer-events-none absolute -inset-6"
            style={{
              background: `radial-gradient(closest-side, ${tier.soft}, transparent)`,
              ["--d" as string]: rank === 1 ? "1.2s" : "0s",
            }}
          />
        )}

        <div
          className={cn(
            "clip-corner relative overflow-hidden border px-2 pb-3 text-center sm:px-4 sm:pb-4",
            first ? "pt-6 sm:pt-9" : "pt-4 sm:pt-6",
            entry && rank < 2 && "trophy-shine",
          )}
          style={{
            borderColor: entry ? tier.line : "rgb(91 63 184 / 0.3)",
            background: entry
              ? `linear-gradient(180deg, ${tier.soft}, rgb(8 7 13 / 0.85) 70%)`
              : "rgb(8 7 13 / 0.5)",
            ["--d" as string]: rank === 1 ? "2.4s" : "0s",
          }}
        >
          {entry && tier.beams && (
            <BeamBorder
              duration={tier.duration}
              delay={0.3 + rank * 0.3}
              beams={tier.beams}
              outline={tier.line}
            />
          )}
          {entry && rank === 2 && (
            <span
              aria-hidden
              className="podium-pulse pointer-events-none absolute inset-0 border-2"
              style={{ borderColor: tier.color }}
            />
          )}

          {/* Nomor raksasa transparan */}
          <span
            aria-hidden
            className="font-display pointer-events-none absolute -top-3 right-1 text-7xl leading-none font-bold opacity-[0.07] sm:text-8xl"
            style={{ color: tier.color }}
          >
            {rank + 1}
          </span>

          {/* Percikan naik (juara 1) */}
          {entry &&
            first &&
            SPARKS.map((s) => (
              <span
                key={s.left}
                aria-hidden
                className="podium-spark pointer-events-none absolute bottom-6 h-1 w-1"
                style={{ left: s.left, background: tier.color, ["--d" as string]: s.d }}
              />
            ))}

          <span
            className={cn("mx-auto mb-2 grid place-items-center", entry && first && "badge-float")}
            style={{ color: entry ? tier.color : "rgb(110 104 137)" }}
          >
            <Icon size={first ? 30 : 22} strokeWidth={1.75} aria-hidden />
          </span>
          <p
            className="truncate font-mono text-[0.5625rem] tracking-[0.2em] sm:text-[0.625rem]"
            style={{ color: entry ? tier.color : undefined }}
          >
            {lb.tiers[rank]}
          </p>
          <p
            className={cn(
              "font-display mt-1 truncate leading-none font-bold tracking-wide uppercase",
              first ? "text-xl sm:text-4xl" : "text-lg sm:text-3xl",
              entry ? "text-ink" : "text-ink-3",
            )}
            title={entry?.name}
          >
            {entry?.name ?? "———"}
          </p>
          {entry ? (
            <>
              <p
                className={cn(
                  "mt-2 font-mono font-semibold tabular-nums",
                  first ? "text-lg sm:text-2xl" : "text-base sm:text-xl",
                )}
                style={{ color: tier.color }}
              >
                {String(entry.score).padStart(5, "0")}
              </p>
              <p className="text-ink-3 mt-0.5 font-mono text-[0.625rem] tracking-wider">
                {t.arcade.wave} {pad2(entry.wave)}
                {mine && <span className="text-lime ml-2">· {lb.you}</span>}
              </p>
            </>
          ) : (
            <p className="text-ink-3 mt-2 text-[0.6875rem] leading-snug">{lb.vacant}</p>
          )}
        </div>
      </div>

      {/* Anak tangga podium */}
      <div
        aria-hidden
        className={cn(
          "clip-corner-sm mt-2 flex items-center justify-center border-t-2",
          tier.step,
        )}
        style={{
          borderColor: entry ? tier.color : "rgb(91 63 184 / 0.4)",
          background: `linear-gradient(180deg, ${entry ? tier.soft : "rgb(91 63 184 / 0.08)"}, transparent)`,
        }}
      >
        <span
          className="font-display text-2xl font-bold sm:text-4xl"
          style={{ color: entry ? tier.color : "rgb(110 104 137)" }}
        >
          {rank + 1}
        </span>
      </div>
    </motion.li>
  );
}

/** Papan skor "HALL OF FAME": podium 3 besar + daftar peringkat 4–10. */
export function Leaderboard({
  entries,
  state,
  highlight,
}: {
  entries: ScoreEntry[] | null;
  state: "loading" | "ready" | "offline";
  highlight?: string;
}) {
  const { t } = useI18n();
  const lb = t.arcade.lb;
  const rows = entries ?? [];
  const rest = rows.slice(3);

  return (
    <div className="hud-panel clip-corner-tr mt-4 p-4 sm:p-6">
      <div className="mb-6 flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-lime flex items-center gap-2 font-mono text-xs font-semibold tracking-[0.18em] uppercase">
          <Trophy size={15} aria-hidden /> {lb.title}
        </p>
        <p className="hud-label text-ink-3">{lb.sub}</p>
      </div>

      {state === "loading" && <p className="hud-label text-ink-3 py-4">{lb.loading}</p>}
      {state === "offline" && <p className="text-ink-3 py-4 text-sm">{lb.offline}</p>}

      {state === "ready" && (
        <>
          {rows.length === 0 && <p className="text-ink-2 mb-6 text-sm">{lb.empty}</p>}

          {/* Podium: tampilan 2 – 1 – 3 */}
          <ol className="mx-auto grid max-w-3xl grid-cols-3 items-end gap-2 sm:gap-4">
            {([0, 1, 2] as const).map((r) => (
              <PodiumCard key={r} rank={r} entry={rows[r]} highlight={highlight} />
            ))}
          </ol>

          {rest.length > 0 && (
            <div className="mt-8">
              <p className="hud-label text-ink-3 mb-2">{lb.rest}</p>
              <ol>
                {rest.map((e, i) => (
                  <motion.li
                    key={e.name}
                    initial={{ opacity: 0, x: -16 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, ease: EASE, delay: i * 0.06 }}
                    className={cn(
                      "group border-violet-dim/25 flex items-center gap-3 border-b border-l-2 px-3 py-2.5 font-mono text-sm transition-colors duration-200",
                      highlight === e.name
                        ? "border-l-lime bg-lime/8"
                        : "hover:bg-raised/60 border-l-transparent hover:border-l-violet-soft",
                    )}
                  >
                    <span className="text-violet-soft w-7 shrink-0 tabular-nums">
                      {pad2(i + 4)}
                    </span>
                    <span
                      className={cn(
                        "min-w-0 flex-1 truncate tracking-wider transition-transform duration-200 group-hover:translate-x-1",
                        highlight === e.name ? "text-lime" : "text-ink",
                      )}
                    >
                      {e.name}
                      {highlight === e.name && (
                        <span className="text-lime ml-2 text-xs">· {lb.you}</span>
                      )}
                    </span>
                    <span className="text-ink-3 hidden text-xs sm:inline">
                      {t.arcade.wave} {pad2(e.wave)}
                    </span>
                    <span className="text-ink w-16 text-right font-semibold tabular-nums">
                      {String(e.score).padStart(5, "0")}
                    </span>
                  </motion.li>
                ))}
              </ol>
            </div>
          )}
        </>
      )}
    </div>
  );
}
