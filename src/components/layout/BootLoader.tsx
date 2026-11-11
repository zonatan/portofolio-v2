"use client";

import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/components/providers/LanguageProvider";
import { Monogram } from "@/components/ui/Monogram";
import { markBootDone } from "@/lib/hooks";
import { cn } from "@/lib/utils";

const SESSION_KEY = "zs-booted";
const BOOT_MS = 950;

/**
 * Boot loader: monogram digambar (stroke), progress bar, teks status berganti,
 * lalu layar terbelah atas/bawah. Total ≤ 1,2 detik, sekali per sesi, bisa di-skip.
 * Animasi dasarnya berjalan via CSS sehingga tetap aman walau JS lambat
 * (ada failsafe CSS yang menyembunyikan loader setelah 2,4 detik).
 */
export function BootLoader() {
  const { t } = useI18n();
  const [phase, setPhase] = useState<"run" | "exit" | "gone">("run");
  const finished = useRef(false);

  useEffect(() => {
    const root = document.documentElement;
    // Script di <head> sudah menandai `boot-skip` jika sesi ini pernah boot / reduced-motion.
    if (root.classList.contains("boot-skip")) {
      finished.current = true;
      markBootDone();
      const id = requestAnimationFrame(() => setPhase("gone"));
      return () => cancelAnimationFrame(id);
    }

    let goneTimer: ReturnType<typeof setTimeout> | undefined;
    const finish = () => {
      if (finished.current) return;
      finished.current = true;
      try {
        sessionStorage.setItem(SESSION_KEY, "1");
      } catch {
        /* abaikan */
      }
      setPhase("exit");
      markBootDone();
      goneTimer = setTimeout(() => setPhase("gone"), 380);
    };

    const timer = setTimeout(finish, BOOT_MS);
    const skip = () => finish();
    window.addEventListener("keydown", skip);
    window.addEventListener("pointerdown", skip);
    return () => {
      clearTimeout(timer);
      if (goneTimer) clearTimeout(goneTimer);
      window.removeEventListener("keydown", skip);
      window.removeEventListener("pointerdown", skip);
    };
  }, []);

  if (phase === "gone") return null;

  const half =
    "absolute left-0 right-0 h-1/2 bg-abyss transition-transform duration-[380ms] ease-[cubic-bezier(0.65,0,0.35,1)]";

  return (
    <div
      id="boot-loader"
      role="status"
      aria-live="polite"
      aria-label={t.boot.steps[1]}
      className="fixed inset-0 z-[100] overflow-hidden"
    >
      <div
        className={cn(
          half,
          "border-violet/30 top-0 border-b",
          phase === "exit" && "-translate-y-full",
        )}
      />
      <div
        className={cn(
          half,
          "border-violet/30 bottom-0 border-t",
          phase === "exit" && "translate-y-full",
        )}
      />

      <div
        className={cn(
          "absolute inset-0 flex flex-col items-center justify-center gap-6 transition-opacity duration-200",
          phase === "exit" && "opacity-0",
        )}
      >
        <Monogram draw className="text-violet-soft h-20 w-20" />
        <div className="w-56">
          <div className="text-ink-2 relative h-4 font-mono text-[0.6875rem] tracking-[0.2em]">
            {t.boot.steps.map((s) => (
              <span key={s} className="boot-step absolute inset-0 text-center">
                {s}
              </span>
            ))}
          </div>
          <div className="bg-violet-dim/30 mt-3 h-[2px] w-full overflow-hidden">
            <div className="boot-bar from-violet to-lime h-full w-full bg-linear-to-r" />
          </div>
        </div>
        <p className="hud-label text-ink-3">{t.boot.skip}</p>
      </div>
    </div>
  );
}
