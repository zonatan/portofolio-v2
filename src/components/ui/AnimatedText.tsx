"use client";

import { animate, useInView } from "motion/react";
import { usePrefersReducedMotion } from "@/lib/hooks";
import { useEffect, useRef } from "react";
import { EASE } from "@/lib/motion";
import { cn } from "@/lib/utils";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&/<>*";

/**
 * Efek decode: huruf acak → huruf asli per karakter (~600ms).
 * Teks asli selalu ada untuk screen reader & tanpa JS.
 */
export function ScrambleText({
  text,
  start,
  duration = 600,
  delay = 0,
  className,
}: {
  text: string;
  start: boolean;
  duration?: number;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!start || reduced) {
      el.textContent = text;
      return;
    }
    let raf = 0;
    let t0 = 0;
    const len = text.length;
    const tick = (now: number) => {
      if (!t0) t0 = now;
      const elapsed = now - t0 - delay;
      if (elapsed < 0) {
        el.textContent = text.replace(/[^\s]/g, () => GLYPHS[(Math.random() * GLYPHS.length) | 0]);
        raf = requestAnimationFrame(tick);
        return;
      }
      const p = Math.min(1, elapsed / duration);
      let out = "";
      for (let i = 0; i < len; i++) {
        const c = text[i];
        const resolveAt = 0.25 + (i / len) * 0.75;
        out += c === " " || p >= resolveAt ? c : GLYPHS[(Math.random() * GLYPHS.length) | 0];
      }
      el.textContent = out;
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [start, text, duration, delay, reduced]);

  return (
    <span className={cn("relative inline-block", className)}>
      <span className="sr-only">{text}</span>
      <span ref={ref} aria-hidden>
        {text}
      </span>
    </span>
  );
}

/** Teks mengetik sendiri dengan kursor berkedip. */
export function Typewriter({
  text,
  start,
  speed = 28,
  delay = 0,
  className,
  cursor = true,
}: {
  text: string;
  start: boolean;
  speed?: number;
  delay?: number;
  className?: string;
  cursor?: boolean;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reduced) {
      el.textContent = text;
      return;
    }
    if (!start) {
      el.textContent = "";
      return;
    }
    let i = 0;
    let interval: ReturnType<typeof setInterval> | undefined;
    const timeout = setTimeout(() => {
      interval = setInterval(() => {
        i++;
        el.textContent = text.slice(0, i);
        if (i >= text.length) clearInterval(interval);
      }, speed);
    }, delay);
    return () => {
      clearTimeout(timeout);
      if (interval) clearInterval(interval);
    };
  }, [start, text, speed, delay, reduced]);

  return (
    <span className={cn("inline-flex items-center", className)}>
      <span className="sr-only">{text}</span>
      <span ref={ref} aria-hidden>
        {text}
      </span>
      {cursor && (
        <span
          aria-hidden
          className="animate-blink bg-lime/80 ml-0.5 inline-block h-[1em] w-[0.5em]"
        />
      )}
    </span>
  );
}

/** Angka count-up saat terlihat. Nilai final ada di HTML awal (tetap terbaca tanpa JS). */
export function CountUp({
  to,
  pad = 0,
  duration = 1.1,
  className,
  suffix = "",
}: {
  to: number;
  pad?: number;
  duration?: number;
  className?: string;
  suffix?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const reduced = usePrefersReducedMotion();
  const fmt = (n: number) => String(Math.round(n)).padStart(pad, "0") + suffix;

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;
    if (!inView) {
      el.textContent = fmt(0);
      return;
    }
    const controls = animate(0, to, {
      duration,
      ease: EASE,
      onUpdate: (v) => {
        el.textContent = fmt(v);
      },
    });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, to, duration, reduced]);

  return (
    <span ref={ref} className={cn("tabular-nums", className)}>
      {fmt(to)}
    </span>
  );
}
