"use client";

import { ChevronLeft, ChevronRight, ExternalLink, X } from "lucide-react";
import { SiGithub } from "react-icons/si";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useI18n } from "@/components/providers/LanguageProvider";
import { Button } from "@/components/ui/Button";
import { CornerBrackets } from "@/components/ui/CornerBrackets";
import { StatusChip } from "@/components/ui/StatusChip";
import { TechIcon } from "@/components/ui/TechIcon";
import type { Project } from "@/data/types";
import { EASE, modalBackdrop, modalPanel, transition } from "@/lib/motion";
import { BLUR_DATA_URL, cn, pad2 } from "@/lib/utils";
import { statusTone } from "./ProjectCard";

const FOCUSABLE =
  'a[href],button:not([disabled]),textarea,input,select,[tabindex]:not([tabindex="-1"])';

export function ProjectModal({ project, onClose }: { project: Project; onClose: () => void }) {
  const { t, l } = useI18n();
  const m = t.missions.modal;
  const panelRef = useRef<HTMLDivElement>(null);
  const images = [project.cover, ...project.gallery];
  const [slide, setSlide] = useState(0);
  const [dir, setDir] = useState(1);

  const go = (d: number) => {
    setDir(d);
    setSlide((s) => (s + d + images.length) % images.length);
  };
  const goTo = (i: number) => {
    setDir(i > slide ? 1 : -1);
    setSlide(i);
  };

  // Panah kiri/kanan untuk galeri
  useEffect(() => {
    const onArrow = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onArrow);
    return () => window.removeEventListener("keydown", onArrow);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Kunci scroll, Esc menutup, focus trap.
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.querySelector<HTMLElement>("[data-autofocus]")?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== "Tab" || !panelRef.current) return;
      const nodes = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (n) => n.offsetParent !== null,
      );
      if (!nodes.length) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center sm:p-6">
      <motion.div
        variants={modalBackdrop}
        initial="hidden"
        animate="visible"
        exit="exit"
        onClick={onClose}
        className="bg-abyss/80 absolute inset-0 backdrop-blur-md"
        aria-hidden
      />

      <motion.div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        variants={modalPanel}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="hud-panel clip-corner bg-surface relative max-h-[92svh] w-full max-w-4xl overflow-y-auto overscroll-contain"
      >
        {/* Header bar */}
        <div className="border-violet-dim/30 bg-surface/95 sticky top-0 z-20 flex items-center justify-between gap-3 border-b px-5 py-3 backdrop-blur">
          <p className="hud-label text-ink-3 truncate">
            <span className="text-lime">MISSION FILE</span> {"//"} {project.slug.toUpperCase()}
          </p>
          <button
            type="button"
            data-autofocus
            onClick={onClose}
            aria-label={t.a11y.close}
            className="clip-corner-sm border-violet-dim/60 text-ink-2 hover:border-lime hover:text-lime grid h-9 w-9 shrink-0 place-items-center border transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Cover → galeri (shared element dari kartu) */}
        <div className="relative p-3 sm:p-4">
          <CornerBrackets size="h-6 w-6" color="border-lime/80" className="m-1" />
          <motion.div
            layoutId={`cover-${project.slug}`}
            transition={transition.layout}
            className="clip-corner bg-raised relative aspect-video overflow-hidden"
          >
            <AnimatePresence initial={false} custom={dir} mode="popLayout">
              <motion.div
                key={slide}
                custom={dir}
                initial={{ opacity: 0, x: dir * 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: dir * -40 }}
                transition={{ duration: 0.35, ease: EASE }}
                className="absolute inset-0"
              >
                <Image
                  src={images[slide]}
                  alt={`${project.title} — ${slide === 0 ? "cover" : `${m.gallery} ${slide}`}`}
                  fill
                  sizes="(min-width: 896px) 860px, 100vw"
                  placeholder="blur"
                  blurDataURL={BLUR_DATA_URL}
                  className="object-cover"
                />
              </motion.div>
            </AnimatePresence>
            <div aria-hidden className="scanlines pointer-events-none absolute inset-0" />
          </motion.div>

          {images.length > 1 && (
            <div className="absolute inset-x-6 bottom-6 z-10 flex items-center justify-between sm:inset-x-8 sm:bottom-8">
              <span className="hud-label bg-abyss/75 text-ink px-2 py-1 backdrop-blur-sm">
                {m.gallery} {pad2(slide + 1)}/{pad2(images.length)}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => go(-1)}
                  aria-label={t.a11y.prev}
                  className="clip-corner-sm bg-abyss/80 text-ink hover:text-lime grid h-9 w-9 place-items-center backdrop-blur-sm transition-colors"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => go(1)}
                  aria-label={t.a11y.next}
                  className="clip-corner-sm bg-abyss/80 text-ink hover:text-lime grid h-9 w-9 place-items-center backdrop-blur-sm transition-colors"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Thumbnail galeri */}
        {images.length > 1 && (
          <div className="grid grid-cols-3 gap-2 px-3 sm:gap-3 sm:px-4">
            {images.map((src, i) => (
              <button
                key={src}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`${m.gallery} ${i + 1}`}
                aria-current={slide === i}
                className={cn(
                  "clip-corner-sm relative aspect-video overflow-hidden border transition-[border-color,opacity] duration-200",
                  slide === i
                    ? "border-lime opacity-100"
                    : "border-violet-dim/40 opacity-55 hover:opacity-90",
                )}
              >
                <Image src={src} alt="" fill sizes="280px" className="object-cover" />
              </button>
            ))}
          </div>
        )}

        {/* Isi */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: EASE, delay: 0.15 }}
          className="grid gap-8 px-5 pt-2 pb-7 sm:px-7 md:grid-cols-5"
        >
          <div className="md:col-span-3">
            <div className="mb-3 flex flex-wrap gap-2">
              <StatusChip tone={statusTone[project.status]}>
                {t.missions.status[project.status]}
              </StatusChip>
              {project.category.map((c) => (
                <StatusChip key={c} tone="violet">
                  {t.missions.filters[c]}
                </StatusChip>
              ))}
            </div>
            <h2
              id="modal-title"
              className="font-display text-4xl leading-[0.9] font-bold uppercase sm:text-5xl"
            >
              {project.title}
            </h2>
            <p className="hud-label text-lime mt-6 mb-2">{m.brief}</p>
            <p className="text-ink-2 leading-relaxed">{l(project.description)}</p>
            <p className="hud-label text-lime mt-6 mb-2">{m.role}</p>
            <p className="text-ink leading-relaxed">{l(project.role)}</p>
          </div>

          <aside className="space-y-6 md:col-span-2">
            <div>
              <p className="hud-label text-ink-3 mb-2">{m.year}</p>
              <p className="font-display text-3xl font-semibold">{project.year}</p>
            </div>
            <div>
              <p className="hud-label text-ink-3 mb-3">{m.tech}</p>
              <ul className="flex flex-wrap gap-2">
                {project.tech.map((tech) => (
                  <li
                    key={tech}
                    className="border-violet-dim/50 bg-abyss/40 text-ink-2 flex items-center gap-2 border px-2.5 py-1.5 font-mono text-[0.6875rem] tracking-wider uppercase"
                  >
                    <TechIcon name={tech} size={13} className="text-violet-soft" />
                    {tech}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col gap-3">
              <LinkButton
                href={project.demoUrl}
                label={m.demo}
                soon={m.soon}
                icon={<ExternalLink size={15} aria-hidden />}
                primary
              />
              <LinkButton
                href={project.repoUrl}
                label={m.repo}
                soon={m.soon}
                icon={<SiGithub size={15} aria-hidden />}
              />
            </div>
          </aside>
        </motion.div>
      </motion.div>
    </div>,
    document.body,
  );
}

/** Tombol link. Jika URL belum ada → nonaktif dengan chip "SEGERA" (status jujur). */
function LinkButton({
  href,
  label,
  soon,
  icon,
  primary,
}: {
  href?: string;
  label: string;
  soon: string;
  icon: React.ReactNode;
  primary?: boolean;
}) {
  if (!href) {
    return (
      <div className="flex items-center gap-3">
        <Button variant="secondary" disabled className={cn("flex-1")} magnetic={false}>
          {icon}
          {label}
        </Button>
        <StatusChip tone="magenta">{soon}</StatusChip>
      </div>
    );
  }
  return (
    <Button
      href={href}
      external
      variant={primary ? "primary" : "secondary"}
      className="w-full"
      magnetic={false}
    >
      {icon}
      {label}
    </Button>
  );
}
