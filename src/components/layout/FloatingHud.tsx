"use client";

import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { useState } from "react";
import { useI18n } from "@/components/providers/LanguageProvider";
import { scrollToTarget } from "@/components/providers/SmoothScroll";
import { Monogram } from "@/components/ui/Monogram";
import { sectionNumber, sections } from "@/data/sections";
import { useActiveSection } from "@/lib/activeSection";
import { useElementVisible } from "@/lib/hooks";
import { EASE } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * Widget mengambang: HUD "Sektor saat ini" (kiri bawah, md+) dan back-to-top (kanan bawah).
 * Keduanya otomatis tersembunyi saat footer terlihat sehingga tidak menutupi konten.
 */
export function FloatingHud() {
  const { t } = useI18n();
  const active = useActiveSection();
  const footerVisible = useElementVisible("footer");
  const [pastHero, setPastHero] = useState(false);
  const [scrollingUp, setScrollingUp] = useState(false);
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (v) => {
    setPastHero(v > 560);
    const delta = v - (scrollY.getPrevious() ?? v);
    if (Math.abs(delta) > 4) setScrollingUp(delta < 0);
  });

  const current = sections.find((s) => s.id === active) ?? sections[0];
  const showSector = !footerVisible;
  // Back-to-top hanya muncul saat menggulir ke atas (tidak menghalangi saat membaca) & footer tak terlihat.
  const showTop = pastHero && scrollingUp && !footerVisible;

  return (
    <>
      {/* HUD sektor saat ini — strip vertikal tipis di gutter kiri agar tidak menutupi konten */}
      <motion.div
        aria-hidden
        initial={false}
        animate={{ opacity: showSector ? 1 : 0 }}
        transition={{ duration: 0.3, ease: EASE }}
        className="pointer-events-none fixed bottom-6 left-1.5 z-40 hidden md:block lg:left-2.5"
      >
        <div className="flex rotate-180 items-center gap-3 [writing-mode:vertical-rl]">
          <span className="relative flex h-2 w-2">
            <span className="bg-lime absolute inline-flex h-full w-full animate-ping rounded-full opacity-50" />
            <span className="bg-lime relative inline-flex h-2 w-2 rounded-full" />
          </span>
          <span className="hud-label text-ink-3 text-[0.625rem]">{t.hud.sector}</span>
          <span className="bg-violet-dim/60 h-6 w-px" />
          <div className="relative h-[12.5rem] w-4 overflow-hidden">
            <AnimatePresence initial={false} mode="popLayout">
              <motion.span
                key={current.id}
                /* container diputar 180°: y negatif = masuk dari bawah, y positif = keluar ke atas */
                initial={{ y: "-100%", opacity: 0 }}
                animate={{
                  y: "0%",
                  opacity: 1,
                  x: [0, -2, 2, -1, 0],
                  textShadow: [
                    "0 2px #ff3d9a, 0 -2px #8b5cf6",
                    "0 -2px #ff3d9a, 0 2px #8b5cf6",
                    "0 1px #ff3d9a, 0 -1px #8b5cf6",
                    "0 0 rgba(0,0,0,0), 0 0 rgba(0,0,0,0)",
                  ],
                }}
                exit={{ y: "100%", opacity: 0 }}
                transition={{
                  duration: 0.3,
                  ease: EASE,
                  x: { duration: 0.18 },
                  textShadow: { duration: 0.2 },
                }}
                className="hud-label text-ink-2 absolute inset-0 text-[0.625rem] whitespace-nowrap"
              >
                <span className="text-lime">{sectionNumber(current.id)}</span> {"//"} {current.hud}
              </motion.span>
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* Back to top */}
      <motion.button
        type="button"
        aria-label={t.a11y.backToTop}
        tabIndex={showTop ? 0 : -1}
        aria-hidden={!showTop}
        data-cursor="hover"
        onClick={() => scrollToTarget(0)}
        initial={false}
        animate={{ opacity: showTop ? 1 : 0, y: showTop ? 0 : 20, scale: showTop ? 1 : 0.9 }}
        whileHover={{ y: -3 }}
        whileTap={{ scale: 0.94 }}
        transition={{ duration: 0.3, ease: EASE }}
        className={cn(
          "hud-panel clip-corner-sm group bg-surface text-violet-soft fixed right-4 bottom-4 z-40 grid h-12 w-12 place-items-center md:right-6 md:bottom-6",
          !showTop && "pointer-events-none",
        )}
      >
        <Monogram className="h-7 w-7 transition-transform duration-200 group-hover:-translate-y-0.5" />
      </motion.button>
    </>
  );
}
