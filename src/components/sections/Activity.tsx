"use client";

import { ArrowUpRight, Flame, GitBranch, Lock, Star, Trophy as TrophyIcon } from "lucide-react";
import Image from "next/image";
import { motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { SiGithub } from "react-icons/si";
import { useI18n } from "@/components/providers/LanguageProvider";
import { CountUp } from "@/components/ui/AnimatedText";
import { BeamBorder } from "@/components/ui/BeamBorder";
import { CornerBrackets } from "@/components/ui/CornerBrackets";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { StatusChip } from "@/components/ui/StatusChip";
import { devlog, type DevlogTag } from "@/data/devlog";
import type { ContributionDay, GitHubData } from "@/lib/server/github";
import { EASE, VIEWPORT } from "@/lib/motion";
import type { Rank, Trophy } from "@/lib/trophies";
import { cn } from "@/lib/utils";

const LEVEL_FILL = ["#1d1833", "#3b2a7a", "#6d4fd0", "#a78bfa", "#c6ff3d"];
const LANG_COLOR: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  PHP: "#4f5d95",
  Blade: "#f7523f",
  Python: "#3572a5",
  HTML: "#e34c26",
  CSS: "#563d7c",
  "C#": "#178600",
  Dart: "#00b4ab",
  Java: "#b07219",
  Kotlin: "#a97bff",
};
const TAG_TONE: Record<DevlogTag, "lime" | "violet" | "magenta" | "muted"> = {
  release: "lime",
  progress: "violet",
  learn: "magenta",
  fix: "muted",
};
const RANK_STYLE: Record<Rank, string> = {
  S: "text-lime [text-shadow:0_0_18px_rgb(198_255_61/0.6)]",
  A: "text-violet-soft [text-shadow:0_0_14px_rgb(167_139_250/0.5)]",
  B: "text-violet",
  C: "text-ink-2",
};

/** Format tanggal deterministik (sama di server & browser). */
function fmtDate(iso: string, months: string[]) {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  return `${d} ${months[m - 1]} ${y}`;
}

/** Susun hari menjadi kolom minggu (Minggu = baris 0). */
function toWeeks(days: ContributionDay[]) {
  if (!days.length) return [];
  const first = new Date(days[0].date + "T00:00:00Z").getUTCDay();
  const padded: (ContributionDay | null)[] = [...Array(first).fill(null), ...days];
  const weeks: (ContributionDay | null)[][] = [];
  for (let i = 0; i < padded.length; i += 7) weeks.push(padded.slice(i, i + 7));
  return weeks;
}

/* ------------------------------------------------------------------ */
function Heatmap({ days }: { days: ContributionDay[] }) {
  const { t } = useI18n();
  const g = t.activity.github;
  const weeks = useMemo(() => toWeeks(days), [days]);
  const [hover, setHover] = useState<ContributionDay | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Di layar kecil, mulai dari minggu terbaru (paling kanan)
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollLeft = el.scrollWidth;
  }, []);

  const CELL = 11;
  const GAP = 3;
  const W = weeks.length * (CELL + GAP);
  const H = 7 * (CELL + GAP) + 18;

  const monthLabels: { x: number; label: string }[] = [];
  weeks.forEach((w, i) => {
    const d = w.find(Boolean);
    if (!d) return;
    const m = Number(d.date.slice(5, 7)) - 1;
    const prev = weeks[i - 1]?.find(Boolean);
    if ((!prev || Number(prev.date.slice(5, 7)) - 1 !== m) && i < weeks.length - 2) {
      monthLabels.push({ x: i * (CELL + GAP), label: g.months[m] });
    }
  });

  return (
    <div>
      <div ref={scrollRef} className="hud-scroll overflow-x-auto pb-2 md:pb-0">
        <div className="relative min-w-[600px] md:min-w-0">
          {/* Garis scan menyapu heatmap */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 top-[18px] overflow-hidden"
          >
            <div className="hm-scan absolute inset-0">
              <div className="from-lime/0 via-lime/10 to-lime/35 border-lime/80 absolute top-0 right-0 h-full w-20 border-r bg-linear-to-r shadow-[4px_0_14px_rgb(198_255_61/0.5)]" />
            </div>
          </div>
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="relative block w-full"
            role="img"
            aria-label={g.yearTotal}
            onPointerLeave={() => setHover(null)}
          >
            {monthLabels.map((m) => (
              <text
                key={m.x}
                x={m.x}
                y={10}
                fontSize="9"
                fontFamily="var(--font-jetbrains), monospace"
                fill="#847ea0"
              >
                {m.label}
              </text>
            ))}
            {weeks.map((w, i) => (
              <motion.g
                key={i}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={VIEWPORT}
                transition={{ duration: 0.25, delay: i * 0.012 }}
              >
                {w.map((d, j) =>
                  d ? (
                    <rect
                      key={d.date}
                      x={i * (CELL + GAP)}
                      y={18 + j * (CELL + GAP)}
                      width={CELL}
                      height={CELL}
                      rx={2}
                      fill={LEVEL_FILL[d.level] ?? LEVEL_FILL[0]}
                      stroke={hover?.date === d.date ? "#f1eefc" : "none"}
                      strokeWidth={1.5}
                      onPointerEnter={() => setHover(d)}
                    >
                      <title>{`${d.count ? `${d.count} ${g.contribOn}` : g.none} ${fmtDate(d.date, g.months)}`}</title>
                    </rect>
                  ) : null,
                )}
              </motion.g>
            ))}
          </svg>
        </div>
      </div>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
        <p className="text-ink-2 min-h-[1.25rem] font-mono text-xs" aria-live="polite">
          {hover ? (
            hover.count ? (
              <>
                <span className="text-lime">{hover.count}</span> {g.contribOn}{" "}
                {fmtDate(hover.date, g.months)}
              </>
            ) : (
              `${g.none} ${fmtDate(hover.date, g.months)}`
            )
          ) : (
            g.hover
          )}
        </p>
        <div className="text-ink-3 flex items-center gap-1.5 font-mono text-[0.625rem] uppercase">
          {g.less}
          {LEVEL_FILL.map((c) => (
            <span key={c} className="h-2.5 w-2.5 rounded-[2px]" style={{ background: c }} />
          ))}
          {g.more}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
function Languages({ data }: { data: GitHubData }) {
  const { t } = useI18n();
  const total = data.languages.reduce((s, l) => s + l.count, 0);
  if (!total) return null;
  const top = data.languages.slice(0, 5);
  const rest = total - top.reduce((s, l) => s + l.count, 0);
  const items = rest > 0 ? [...top, { name: "Other", count: rest }] : top;

  return (
    <div className="mt-6">
      <p className="hud-label text-ink-3 mb-3">{t.activity.github.languages}</p>
      <div className="bg-raised flex h-2.5 w-full overflow-hidden rounded-full">
        {items.map((l, i) => (
          <motion.span
            key={l.name}
            className="h-full origin-left"
            style={{
              width: `${(l.count / total) * 100}%`,
              background: LANG_COLOR[l.name] ?? "#5b3fb8",
            }}
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={VIEWPORT}
            transition={{ duration: 0.5, ease: EASE, delay: 0.1 + i * 0.08 }}
          />
        ))}
      </div>
      <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
        {items.map((l) => (
          <li
            key={l.name}
            className="text-ink-2 flex items-center gap-1.5 font-mono text-[0.6875rem]"
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{ background: LANG_COLOR[l.name] ?? "#5b3fb8" }}
            />
            {l.name}
            <span className="text-ink-3">{Math.round((l.count / total) * 100)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ------------------------------------------------------------------ */
function GitHubPanel({ data }: { data: GitHubData | null }) {
  const { t } = useI18n();
  const g = t.activity.github;

  if (!data || (!data.days.length && !data.repos.length && !data.avatarUrl)) {
    return (
      <div className="hud-panel clip-corner relative p-6">
        <BeamBorder />
        <p className="text-ink-2 py-10 text-center text-sm">{g.unavailable}</p>
      </div>
    );
  }

  const s = data.stats;
  const stats = [
    { label: g.totalAll, value: s.totalAllTime, accent: true },
    {
      label: g.current,
      value: s.currentStreak,
      suffix: ` ${g.days}`,
      flame: (s.currentStreak ?? 0) > 0,
    },
    { label: g.longest, value: s.longestStreak, suffix: ` ${g.days}` },
    { label: g.activeYear, value: s.activeDaysYear },
    { label: g.repos, value: data.publicRepos },
    { label: g.stars, value: data.totalStars },
  ];

  return (
    <div className="hud-panel clip-corner relative p-5 sm:p-6">
      <BeamBorder duration={9} />
      {/* Profil */}
      <div className="flex items-start gap-4">
        {data.avatarUrl && (
          <a
            href={data.url}
            target="_blank"
            rel="noopener noreferrer"
            className="relative shrink-0 p-1.5"
            aria-label={g.open}
          >
            <CornerBrackets size="h-3 w-3" color="border-lime" />
            {/* Border gradien berputar */}
            <span className="clip-corner-sm relative block h-16 w-16 overflow-hidden p-[2px] sm:h-20 sm:w-20">
              <span
                aria-hidden
                className="spin-slow absolute -inset-1/2 bg-[conic-gradient(from_0deg,#c6ff3d,transparent_25%,#8b5cf6_50%,transparent_75%,#c6ff3d)]"
              />
              <span className="clip-corner-sm bg-raised relative block h-full w-full overflow-hidden">
                <Image
                  src={data.avatarUrl}
                  alt={data.name ?? data.login}
                  fill
                  unoptimized
                  sizes="80px"
                  className="object-cover"
                />
              </span>
            </span>
          </a>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <a
              href={data.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group text-ink hover:text-lime flex min-w-0 items-center gap-2 transition-colors"
            >
              <SiGithub size={16} aria-hidden className="shrink-0" />
              <span className="font-display text-2xl leading-none font-bold uppercase sm:truncate">
                {data.name ?? data.login}
              </span>
              <ArrowUpRight
                size={14}
                aria-hidden
                className="shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </a>
            <StatusChip tone="lime" pulse>
              {g.live}
            </StatusChip>
          </div>
          <p className="text-violet-soft mt-1 font-mono text-xs">@{data.login}</p>
          {data.bio && <p className="text-ink-2 mt-2 text-sm leading-relaxed">{data.bio}</p>}
          <p className="text-ink-3 mt-2 flex flex-wrap gap-x-3 gap-y-1 font-mono text-[0.6875rem]">
            <span>
              <span className="text-ink">{data.followers ?? 0}</span> {g.followers}
            </span>
            <span>
              <span className="text-ink">{data.following ?? 0}</span> {g.following}
            </span>
            {data.createdAt && (
              <span>
                {g.joined} {fmtDate(data.createdAt, g.months)}
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Statistik */}
      <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {stats.map((st) => (
          <div key={st.label} className="border-violet-dim/30 bg-abyss/40 border p-3">
            <dt className="hud-label text-ink-3 flex items-center gap-1.5 text-[0.625rem]">
              {st.flame && <Flame size={11} className="text-magenta" aria-hidden />}
              {st.label}
            </dt>
            <dd
              className={cn(
                "font-display mt-1 text-3xl leading-none font-bold",
                st.accent ? "text-lime" : "text-ink",
              )}
            >
              {st.value === null || st.value === undefined ? (
                "—"
              ) : (
                <CountUp to={st.value} suffix={st.suffix ?? ""} />
              )}
            </dd>
          </div>
        ))}
      </dl>

      {/* Heatmap 1 tahun */}
      {data.days.length > 0 && (
        <div className="mt-6">
          <p className="hud-label text-ink-3 mb-3">
            <span className="text-lime">{s.totalYear ?? 0}</span> {g.yearTotal}
          </p>
          <Heatmap days={data.days} />
        </div>
      )}

      <Languages data={data} />

      {/* Repo terbaru */}
      {data.repos.length > 0 && (
        <div className="mt-6">
          <p className="hud-label text-ink-3 mb-3">{g.recent}</p>
          <ul className="grid gap-3 sm:grid-cols-2">
            {data.repos.map((r, i) => (
              <motion.li
                key={r.name}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={VIEWPORT}
                transition={{ duration: 0.35, ease: EASE, delay: i * 0.06 }}
              >
                <a
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group border-violet-dim/30 hover:border-lime/50 hover:bg-raised flex h-full flex-col border p-4 transition-colors"
                >
                  <span className="text-ink group-hover:text-lime flex items-center gap-2 font-mono text-sm font-semibold transition-colors">
                    <GitBranch size={14} aria-hidden className="text-violet-soft shrink-0" />
                    <span className="truncate">{r.name}</span>
                  </span>
                  <span className="text-ink-2 mt-1.5 line-clamp-2 text-xs leading-relaxed">
                    {r.description || g.noDesc}
                  </span>
                  <span className="text-ink-3 mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 pt-3 font-mono text-[0.6875rem]">
                    {r.language && (
                      <span className="flex items-center gap-1.5">
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ background: LANG_COLOR[r.language] ?? "#a78bfa" }}
                        />
                        {r.language}
                      </span>
                    )}
                    {r.stars > 0 && (
                      <span className="flex items-center gap-1">
                        <Star size={11} aria-hidden /> {r.stars}
                      </span>
                    )}
                    <span>
                      {g.updatedAt} {fmtDate(r.pushedAt, g.months)}
                    </span>
                  </span>
                </a>
              </motion.li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
function TrophyPanel({ data, trophies }: { data: GitHubData | null; trophies: Trophy[] }) {
  const { t } = useI18n();
  const g = t.activity.github;
  if (!data) return null;

  return (
    <div className="hud-panel clip-corner-tr relative p-5 sm:p-6">
      <BeamBorder shape="tr" duration={6.5} delay={0.2} />
      <p className="hud-label text-lime mb-4 flex items-center gap-2">
        <TrophyIcon size={13} aria-hidden /> {g.trophies}
      </p>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {trophies.map((tr, i) => {
          const locked = tr.rank === null;
          return (
            <motion.li
              key={tr.key}
              initial={{ opacity: 0, scale: 0.92 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={VIEWPORT}
              transition={{ duration: 0.35, ease: EASE, delay: i * 0.06 }}
              style={{ "--d": `${i * 0.8}s` } as React.CSSProperties}
              className={cn(
                "clip-corner-sm relative flex flex-col items-center border px-2 pt-3 pb-2.5 text-center",
                !locked && "trophy-shine",
                locked
                  ? "border-violet-dim/25 bg-abyss/30"
                  : tr.rank === "S"
                    ? "border-lime/50 bg-lime/5"
                    : "border-violet-dim/50 bg-raised/60",
              )}
              title={`${g.trophyDesc[tr.key]}: ${tr.value}`}
            >
              <span
                className={cn(
                  "font-display flex h-10 items-center text-4xl leading-none font-bold",
                  locked ? "text-ink-mute" : RANK_STYLE[tr.rank as Rank],
                  tr.rank === "S" && "rank-pulse",
                )}
              >
                {locked ? <Lock size={24} aria-hidden /> : tr.rank}
              </span>
              <span className="text-ink mt-1 font-mono text-[0.6875rem] font-semibold tracking-[0.1em] uppercase">
                {locked ? g.locked : g.trophyNames[tr.key]}
              </span>
              <span className="text-ink-3 font-mono text-[0.625rem]">
                {g.trophyDesc[tr.key]}: <span className="text-ink-2">{tr.value}</span>
              </span>
              <span className="bg-abyss mt-2 h-1 w-full overflow-hidden rounded-full">
                <motion.span
                  className={cn("block h-full origin-left", locked ? "bg-ink-mute" : "bg-lime")}
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: tr.progress }}
                  viewport={VIEWPORT}
                  transition={{ duration: 0.6, ease: EASE, delay: 0.2 + i * 0.06 }}
                />
              </span>
              <span className="text-ink-3 mt-1 font-mono text-[0.5625rem] tracking-[0.12em] uppercase">
                {tr.next ? `${g.next} ${tr.next.rank} · ${tr.next.at}` : g.maxed}
              </span>
            </motion.li>
          );
        })}
      </ul>

      {/* Achievement resmi GitHub */}
      <div className="border-violet-dim/30 mt-6 border-t pt-5">
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
          <p className="hud-label text-lime">{g.achievements}</p>
          <a
            href={`${data.url}?tab=achievements`}
            target="_blank"
            rel="noopener noreferrer"
            className="hud-label text-ink-3 hover:text-ink text-[0.625rem] transition-colors"
          >
            {g.achievementsNote} ↗
          </a>
        </div>
        {data.achievements.length ? (
          <ul className="flex flex-wrap gap-4">
            {data.achievements.map((a, i) => (
              <motion.li
                key={a.slug}
                initial={{ opacity: 0, y: 10, rotate: -8 }}
                whileInView={{ opacity: 1, y: 0, rotate: 0 }}
                viewport={VIEWPORT}
                transition={{ type: "spring", stiffness: 260, damping: 16, delay: 0.2 + i * 0.1 }}
                className="group flex w-20 flex-col items-center text-center"
              >
                <span
                  className="badge-float relative"
                  style={{ "--d": `${i * 0.4}s` } as React.CSSProperties}
                >
                  <Image
                    src={a.image}
                    alt={a.name}
                    width={64}
                    height={64}
                    unoptimized
                    className="h-16 w-16 drop-shadow-[0_6px_14px_rgb(139_92_246/0.35)] transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6"
                  />
                  {a.tier && (
                    <span className="bg-lime text-abyss absolute -right-1 bottom-0 rounded-full px-1.5 font-mono text-[0.625rem] font-bold">
                      {a.tier}
                    </span>
                  )}
                </span>
                <span className="text-ink-2 mt-1.5 font-mono text-[0.625rem] leading-tight">
                  {a.name}
                </span>
              </motion.li>
            ))}
          </ul>
        ) : (
          <p className="text-ink-3 text-sm">{g.noAchievements}</p>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
function PatchNotes() {
  const { t, l } = useI18n();
  const d = t.activity.devlog;
  return (
    <div className="hud-panel clip-corner-tr relative p-5 sm:p-6">
      <BeamBorder shape="tr" duration={8} delay={0.4} />
      <p className="hud-label text-lime mb-5">{d.title}</p>
      <ol className="space-y-5">
        {devlog.map((e, i) => (
          <motion.li
            key={e.version + e.date}
            initial={{ opacity: 0, x: 16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={VIEWPORT}
            transition={{ duration: 0.4, ease: EASE, delay: i * 0.08 }}
            className={cn("border-l-2 pl-4", i === 0 ? "border-lime" : "border-violet-dim/50")}
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-ink font-mono text-xs font-bold tracking-[0.14em]">
                {e.version}
              </span>
              <StatusChip tone={TAG_TONE[e.tag]}>{d.tags[e.tag]}</StatusChip>
              <span className="hud-label text-ink-3 ml-auto text-[0.625rem]">{e.date}</span>
            </div>
            <h3 className="font-display mt-2 text-2xl leading-tight font-bold uppercase">
              {l(e.title)}
            </h3>
            <ul className="mt-2 space-y-1.5">
              {e.notes.map((n, k) => (
                <li key={k} className="text-ink-2 flex gap-2 text-sm leading-relaxed">
                  <span className="text-lime font-mono" aria-hidden>
                    +
                  </span>
                  {l(n)}
                </li>
              ))}
            </ul>
          </motion.li>
        ))}
      </ol>
    </div>
  );
}

/* ------------------------------------------------------------------ */
export function Activity({ github, trophies }: { github: GitHubData | null; trophies: Trophy[] }) {
  const { t } = useI18n();
  return (
    <Section id="aktivitas" bgWord={t.activity.bg}>
      <SectionHeading
        id="aktivitas"
        label={t.activity.label}
        lines={t.activity.title}
        intro={t.activity.intro}
      />
      <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
        <Reveal className="min-w-0 lg:col-span-7">
          <GitHubPanel data={github} />
        </Reveal>
        <div className="space-y-6 lg:col-span-5">
          <Reveal>
            <TrophyPanel data={github} trophies={trophies} />
          </Reveal>
          <Reveal>
            <PatchNotes />
          </Reveal>
        </div>
      </div>
    </Section>
  );
}
