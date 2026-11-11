"use client";

import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import { motion, useSpring } from "motion/react";
import { useRef } from "react";
import { useI18n } from "@/components/providers/LanguageProvider";
import { CornerBrackets } from "@/components/ui/CornerBrackets";
import { StatusChip } from "@/components/ui/StatusChip";
import type { Project } from "@/data/types";
import { useFinePointer } from "@/lib/hooks";
import { BLUR_DATA_URL, cn, pad2 } from "@/lib/utils";

export const statusTone = { done: "lime", progress: "violet", archived: "muted" } as const;

/** Kartu misi: tilt 3D (maks 6°), border bersinar mengikuti kursor, cover zoom halus. */
export function ProjectCard({
  project,
  index,
  onOpen,
  hideCover,
}: {
  project: Project;
  index: number;
  onOpen: (slug: string, el: HTMLElement) => void;
  hideCover: boolean;
}) {
  const { t, l } = useI18n();
  const fine = useFinePointer();
  const ref = useRef<HTMLDivElement>(null);
  const rx = useSpring(0, { stiffness: 200, damping: 20 });
  const ry = useSpring(0, { stiffness: 200, damping: 20 });

  const onMove = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    el.style.setProperty("--mx", `${x}px`);
    el.style.setProperty("--my", `${y}px`);
    if (!fine) return;
    ry.set((x / r.width - 0.5) * 12);
    rx.set(-(y / r.height - 0.5) * 12);
  };
  const reset = () => {
    rx.set(0);
    ry.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={reset}
      style={fine ? { rotateX: rx, rotateY: ry, transformPerspective: 900 } : undefined}
      className="hud-panel clip-corner group relative flex h-full flex-col"
    >
      <div className="glow-fill" aria-hidden />
      <div className="glow-border" aria-hidden />

      <div className="relative m-2 mb-0">
        <CornerBrackets size="h-4 w-4" color="border-violet-soft/80" className="m-1" />
        {hideCover ? (
          <div className="clip-corner bg-raised aspect-video" />
        ) : (
          <motion.div
            layoutId={`cover-${project.slug}`}
            className="clip-corner bg-raised relative aspect-video overflow-hidden"
          >
            <Image
              src={project.cover}
              alt=""
              fill
              sizes="(min-width: 1280px) 400px, (min-width: 640px) 50vw, 100vw"
              placeholder="blur"
              blurDataURL={BLUR_DATA_URL}
              className="object-cover transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]"
            />
            <div aria-hidden className="scanlines absolute inset-0 opacity-60" />
          </motion.div>
        )}
        <div className="clip-corner-sm bg-abyss/85 absolute top-3 left-3 flex flex-wrap gap-1.5 p-1 backdrop-blur-sm">
          <StatusChip tone={statusTone[project.status]}>
            {t.missions.status[project.status]}
          </StatusChip>
          {project.featured && <StatusChip tone="magenta">{t.missions.featured}</StatusChip>}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="hud-label text-ink-3 mb-2 flex items-center gap-2">
          <span className="text-lime">M-{pad2(index + 1)}</span>
          <span aria-hidden>{"//"}</span>
          <span className="truncate">
            {project.category.map((c) => t.missions.filters[c]).join(" · ")}
          </span>
          <span className="ml-auto">{project.year}</span>
        </div>
        <h3 className="font-display text-3xl leading-[0.95] font-bold uppercase">
          <button
            type="button"
            data-cursor="hover"
            onClick={(e) => {
              reset();
              onOpen(project.slug, e.currentTarget);
            }}
            className="text-left after:absolute after:inset-0 after:z-10 focus-visible:outline-none"
          >
            {project.title}
          </button>
        </h3>
        <p className="text-ink-2 mt-3 text-sm leading-relaxed">{l(project.summary)}</p>
        <div className="mt-auto flex items-end justify-between gap-3 pt-5">
          <ul className="flex flex-wrap gap-1.5">
            {project.tech.slice(0, 3).map((tech) => (
              <li
                key={tech}
                className="border-violet-dim/40 text-ink-2 border px-2 py-0.5 font-mono text-[0.625rem] tracking-wider uppercase"
              >
                {tech}
              </li>
            ))}
            {project.tech.length > 3 && (
              <li className="text-ink-3 px-1 py-0.5 font-mono text-[0.625rem]">
                +{project.tech.length - 3}
              </li>
            )}
          </ul>
          <span
            aria-hidden
            className={cn(
              "border-violet-dim/60 text-violet-soft grid h-9 w-9 shrink-0 place-items-center border transition-all duration-200",
              "group-hover:border-lime group-hover:bg-lime group-hover:text-abyss",
            )}
          >
            <ArrowUpRight size={16} />
          </span>
        </div>
      </div>
      {/* Focus ring untuk tombol yang membentang di seluruh kartu */}
      <span
        aria-hidden
        className="outline-lime pointer-events-none absolute inset-[3px] z-20 hidden outline-2 group-has-[button:focus-visible]:block"
      />
    </motion.div>
  );
}
