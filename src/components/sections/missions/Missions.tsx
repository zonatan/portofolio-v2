"use client";

import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { useCallback, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { useI18n } from "@/components/providers/LanguageProvider";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { projects } from "@/data/projects";
import type { ProjectCategory } from "@/data/types";
import { EASE, transition, VIEWPORT } from "@/lib/motion";
import { cn, pad2 } from "@/lib/utils";
import { ProjectCard } from "./ProjectCard";
import dynamic from "next/dynamic";

// Modal dimuat terpisah (lazy) agar bundle awal lebih ringan.
const ProjectModal = dynamic(() => import("./ProjectModal").then((m) => m.ProjectModal), {
  ssr: false,
});

type Filter = "all" | ProjectCategory;
const FILTERS: Filter[] = ["all", "web", "ai", "cv", "devops", "uiux", "vr", "automation"];

/* ---- Sinkronisasi ?project=slug di URL (bisa dibagikan) ---- */
const URL_EVENT = "zs:url";
function subscribeUrl(cb: () => void) {
  window.addEventListener("popstate", cb);
  window.addEventListener(URL_EVENT, cb);
  return () => {
    window.removeEventListener("popstate", cb);
    window.removeEventListener(URL_EVENT, cb);
  };
}
const readSlug = () => new URLSearchParams(window.location.search).get("project");

function setSlugInUrl(slug: string | null) {
  const url = new URL(window.location.href);
  if (slug) {
    url.searchParams.set("project", slug);
    url.hash = "";
    window.history.pushState({ zsModal: true }, "", url);
  } else if (window.history.state?.zsModal) {
    window.history.back(); // memicu popstate
    return;
  } else {
    url.searchParams.delete("project");
    window.history.replaceState(null, "", url);
  }
  window.dispatchEvent(new Event(URL_EVENT));
}

export function Missions() {
  const { t } = useI18n();
  const [filter, setFilter] = useState<Filter>("all");
  const slug = useSyncExternalStore(subscribeUrl, readSlug, () => null);
  const opener = useRef<HTMLElement | null>(null);

  const active = projects.find((p) => p.slug === slug) ?? null;

  const list = useMemo(
    () => (filter === "all" ? projects : projects.filter((p) => p.category.includes(filter))),
    [filter],
  );
  const counts = useMemo(() => {
    const c: Record<string, number> = { all: projects.length };
    projects.forEach((p) => p.category.forEach((cat) => (c[cat] = (c[cat] ?? 0) + 1)));
    return c;
  }, []);

  const open = useCallback((s: string, el: HTMLElement) => {
    opener.current = el;
    setSlugInUrl(s);
  }, []);
  const close = useCallback(() => {
    setSlugInUrl(null);
    requestAnimationFrame(() => opener.current?.focus({ preventScroll: true }));
  }, []);

  return (
    <Section id="misi" bgWord={t.missions.bg}>
      <SectionHeading
        id="misi"
        label={t.missions.label}
        lines={t.missions.title}
        intro={t.missions.intro}
      />

      {/* Filter kategori */}
      <Reveal className="mb-8">
        <div role="toolbar" aria-label="Filter" className="flex flex-wrap gap-2">
          {FILTERS.filter((f) => counts[f]).map((f) => {
            const on = filter === f;
            return (
              <button
                key={f}
                type="button"
                aria-pressed={on}
                onClick={() => setFilter(f)}
                className={cn(
                  "clip-corner-sm relative flex h-10 items-center gap-2 px-4 font-mono text-[0.6875rem] font-semibold tracking-[0.14em] whitespace-nowrap uppercase transition-colors duration-200",
                  on ? "text-abyss" : "bg-surface/80 text-ink-2 hover:bg-raised hover:text-ink",
                )}
              >
                {on && (
                  <motion.span
                    layoutId="filter-pill"
                    transition={transition.layout}
                    className="bg-lime absolute inset-0"
                  />
                )}
                <span className="relative">{t.missions.filters[f]}</span>
                <span
                  className={cn("relative text-[0.625rem]", on ? "text-abyss/70" : "text-ink-3")}
                >
                  {pad2(counts[f])}
                </span>
              </button>
            );
          })}
        </div>
        <p className="hud-label text-ink-3 mt-4" aria-live="polite">
          {pad2(list.length)} {t.missions.count}
        </p>
      </Reveal>

      <LayoutGroup>
        <motion.ul
          layout
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={VIEWPORT}
          transition={{ duration: 0.45, ease: EASE }}
          data-reveal
          className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3"
        >
          <AnimatePresence mode="popLayout" initial={false}>
            {list.map((p) => (
              <motion.li
                key={p.slug}
                layout
                initial={{ opacity: 0, scale: 0.94, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.94, transition: { duration: 0.2, ease: EASE } }}
                transition={{ ...transition.layout, opacity: { duration: 0.3 } }}
              >
                <ProjectCard
                  project={p}
                  index={projects.indexOf(p)}
                  onOpen={open}
                  hideCover={active?.slug === p.slug}
                />
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>

        <AnimatePresence>
          {active && <ProjectModal key={active.slug} project={active} onClose={close} />}
        </AnimatePresence>
      </LayoutGroup>

      {list.length === 0 && <p className="text-ink-2">{t.missions.empty}</p>}
    </Section>
  );
}
