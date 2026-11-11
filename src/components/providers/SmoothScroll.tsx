"use client";

import { useEffect } from "react";

/**
 * Scroll memakai scroll bawaan browser (bukan library smooth-scroll seperti Lenis).
 * Scroll bawaan diproses di thread compositor, terpisah dari JavaScript — jadi tetap
 * mulus walaupun halaman sedang sibuk menjalankan animasi.
 */

/** Scroll halus ke elemen (selector) atau posisi (px). */
export function scrollToTarget(target: string | number) {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const behavior: ScrollBehavior = reduced ? "auto" : "smooth";
  if (typeof target === "number") {
    window.scrollTo({ top: target, behavior });
  } else {
    document.querySelector(target)?.scrollIntoView({ behavior });
  }
}

export function SmoothScroll() {
  useEffect(() => {
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
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return null;
}
