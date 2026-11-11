"use client";

import { Menu, X } from "lucide-react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useSpring } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/components/providers/LanguageProvider";
import { Button } from "@/components/ui/Button";
import { Emblem3D } from "@/components/ui/Emblem3D";
import { profile } from "@/data/profile";
import { sections } from "@/data/sections";
import { useActiveSection } from "@/lib/activeSection";
import { EASE, EASE_IN_OUT, transition } from "@/lib/motion";
import { cn, pad2 } from "@/lib/utils";

// Buku tamu & bonus stage (arcade) tidak masuk menu agar navigasi tetap ringkas.
const navSections = sections.filter(
  (s) => s.id !== "beranda" && s.id !== "buku-tamu" && s.id !== "arcade",
);

function LangToggle({ className }: { className?: string }) {
  const { locale, setLocale, t } = useI18n();
  return (
    <div
      role="group"
      aria-label={t.a11y.langSwitch}
      className={cn(
        "clip-corner-sm border-violet-dim/60 bg-surface/70 flex h-10 items-center border p-0.5 font-mono text-[0.6875rem] font-semibold tracking-[0.14em]",
        className,
      )}
    >
      {(["id", "en"] as const).map((l) => (
        <button
          key={l}
          type="button"
          aria-pressed={locale === l}
          onClick={() => setLocale(l)}
          className={cn(
            "relative h-full px-2.5 uppercase transition-colors",
            locale === l ? "text-abyss" : "text-ink-2 hover:text-ink",
          )}
        >
          {locale === l && (
            <motion.span
              layoutId="lang-pill"
              className="bg-violet-soft absolute inset-0"
              transition={transition.layout}
            />
          )}
          <span className="relative">{l}</span>
        </button>
      ))}
    </div>
  );
}

export function Navbar() {
  const { t } = useI18n();
  const active = useActiveSection();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  const { scrollY, scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 200, damping: 30, restDelta: 0.001 });
  useMotionValueEvent(scrollY, "change", (v) => setScrolled(v > 24));

  // Menu mobile: kunci scroll, Esc menutup, fokus masuk ke menu.
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const first = menuRef.current?.querySelector<HTMLElement>("a,button");
    first?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      {/* Garis progress scroll (ungu → lime) */}
      <motion.div
        aria-hidden
        style={{ scaleX: progress }}
        className="from-violet via-violet-soft to-lime fixed inset-x-0 top-0 z-[70] h-[2px] origin-left bg-linear-to-r"
      />

      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 border-b transition-[background-color,border-color] duration-300",
          scrolled || open
            ? "border-violet-dim/30 bg-abyss/92"
            : "border-transparent bg-transparent",
        )}
      >
        <nav
          aria-label={t.a11y.primaryNav}
          className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8"
        >
          <a
            href="#beranda"
            className="group flex items-center gap-3"
            data-cursor="hover"
            onClick={() => setOpen(false)}
          >
            <Emblem3D className="h-9 w-9" />
            <span className="hidden flex-col leading-none sm:flex">
              <span className="font-display text-xl font-bold tracking-wide">
                {profile.nickname.toUpperCase()}
              </span>
              <span className="hud-label text-ink-3 text-[0.625rem]">{profile.playerId}</span>
            </span>
          </a>

          <ul className="hidden items-center gap-0.5 lg:flex">
            {navSections.map((s, i) => {
              const isActive = active === s.id;
              return (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    aria-current={isActive ? "true" : undefined}
                    data-cursor="hover"
                    className={cn(
                      "relative flex h-10 items-center gap-1.5 px-3 font-mono text-[0.6875rem] font-medium tracking-[0.16em] whitespace-nowrap uppercase transition-colors xl:px-4",
                      isActive ? "text-ink" : "text-ink-2 hover:text-ink",
                    )}
                  >
                    <span
                      className={cn("transition-colors", isActive ? "text-lime" : "text-ink-3")}
                    >
                      {pad2(i + 1)}
                    </span>
                    {t.nav[s.navKey]}
                    {isActive && (
                      <motion.span
                        layoutId="nav-indicator"
                        transition={transition.layout}
                        className="bg-lime absolute inset-x-3 -bottom-[13px] h-[2px] shadow-[0_0_10px_rgb(198_255_61/0.7)] xl:inset-x-4"
                      />
                    )}
                  </a>
                </li>
              );
            })}
          </ul>

          <div className="flex items-center gap-2 sm:gap-3">
            <LangToggle />
            <div className="hidden md:block">
              <Button href="#kontak" size="sm">
                {t.nav.cta}
              </Button>
            </div>
            <button
              ref={toggleRef}
              type="button"
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? t.a11y.menuClose : t.a11y.menuOpen}
              onClick={() => setOpen((v) => !v)}
              className="clip-corner-sm border-violet-dim/60 bg-surface/70 text-ink grid h-10 w-10 place-items-center border lg:hidden"
            >
              {open ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </nav>
      </header>

      {/* Menu mobile fullscreen — dibuka dengan clip-path melingkar */}
      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            ref={menuRef}
            role="dialog"
            aria-modal="true"
            aria-label={t.a11y.primaryNav}
            initial={{ clipPath: "circle(0% at calc(100% - 36px) 32px)" }}
            animate={{ clipPath: "circle(150% at calc(100% - 36px) 32px)" }}
            exit={{ clipPath: "circle(0% at calc(100% - 36px) 32px)" }}
            transition={{ duration: 0.6, ease: EASE_IN_OUT }}
            className="bg-abyss/97 fixed inset-0 top-16 z-40 flex flex-col justify-between overflow-y-auto px-6 pt-8 pb-10 backdrop-blur-lg lg:hidden"
          >
            <ul className="flex flex-col gap-1">
              {navSections.map((s, i) => (
                <motion.li
                  key={s.id}
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.45, ease: EASE, delay: 0.15 + i * 0.06 }}
                >
                  <a
                    href={`#${s.id}`}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "border-violet-dim/25 font-display flex items-baseline gap-4 border-b py-3 text-5xl font-bold uppercase",
                      active === s.id ? "text-lime" : "text-ink",
                    )}
                  >
                    <span className="text-ink-3 font-mono text-xs font-normal tracking-[0.2em]">
                      {pad2(i + 1)}
                    </span>
                    {t.nav[s.navKey]}
                  </a>
                </motion.li>
              ))}
            </ul>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.3 }}
              className="mt-10 flex flex-col gap-4"
            >
              <Button
                href="#kontak"
                onClick={() => setOpen(false)}
                className="w-full"
                magnetic={false}
              >
                {t.nav.cta}
              </Button>
              <p className="hud-label text-ink-3">{profile.coordinates}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
