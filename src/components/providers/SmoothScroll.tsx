"use client";

import Lenis from "lenis";
import { useEffect } from "react";

let instance: Lenis | null = null;

/** Akses instance Lenis (null jika reduced-motion / belum siap). */
export const getLenis = () => instance;

/** Scroll ke elemen/posisi — memakai Lenis jika aktif, jika tidak pakai scroll native. */
export function scrollToTarget(target: string | number) {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (instance) {
    instance.start();
    instance.scrollTo(target, {
      duration: 1.1,
      force: true,
    });
    return;
  }
  if (typeof target === "number") {
    window.scrollTo({ top: target, behavior: reduced ? "auto" : "smooth" });
  } else {
    document.querySelector(target)?.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
  }
}

export function SmoothScroll() {
  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    let raf = 0;

    const start = () => {
      if (instance || mql.matches) return;
      instance = new Lenis({ lerp: 0.12, wheelMultiplier: 1 });
      const loop = (time: number) => {
        instance?.raf(time);
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      instance?.destroy();
      instance = null;
    };
    const onChange = () => (mql.matches ? stop() : start());

    // Klik link internal (#section): scroll halus + pindahkan fokus untuk pengguna keyboard.
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey) return;
      const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]');
      const hash = a?.getAttribute("href");
      if (!a || !hash || hash === "#") return;
      const el = document.querySelector<HTMLElement>(hash);
      if (!el) return;
      e.preventDefault();
      requestAnimationFrame(() => {
        scrollToTarget(hash === "#beranda" ? 0 : hash);
        if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "-1");
        el.focus({ preventScroll: true });
      });
    };

    document.documentElement.classList.add("hydrated");
    start();
    mql.addEventListener("change", onChange);
    document.addEventListener("click", onClick);
    return () => {
      mql.removeEventListener("change", onChange);
      document.removeEventListener("click", onClick);
      stop();
    };
  }, []);

  return null;
}
