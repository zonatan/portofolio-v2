"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

/**
 * Lapisan efek animasi di atas foto (taruh di dalam wadah foto yang `relative overflow-hidden`):
 * - glitch: sesekali foto "tersendat" — irisan bergeser dengan warna digital
 * - scan:   garis scan lime menyapu dari atas ke bawah secara berkala
 * - shine:  kilau holografik melintas secara berkala
 * Glitch dipicu timer (bukan animasi CSS terus-menerus) & hanya saat foto terlihat — hemat CPU.
 * Semua mati otomatis untuk prefers-reduced-motion.
 */
export function PhotoFX({
  src,
  sizes,
  objectClass = "object-cover",
  glitch = false,
  scan = false,
  shine = false,
  delay = 0,
}: {
  src?: string;
  sizes?: string;
  objectClass?: string;
  glitch?: boolean;
  scan?: boolean;
  shine?: boolean;
  /** Geser jadwal animasi (detik) agar beberapa foto tidak serempak. */
  delay?: number;
}) {
  const style = { "--d": `${delay}s` } as React.CSSProperties;
  const glitchRef = useRef<HTMLDivElement>(null);

  // Picu glitch singkat tiap ~7 detik, hanya saat foto terlihat & tab aktif
  useEffect(() => {
    const el = glitchRef.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let visible = false;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(el);
    let off: ReturnType<typeof setTimeout> | undefined;
    const fire = () => {
      if (!visible || document.hidden) return;
      el.classList.add("glitching");
      off = setTimeout(() => el.classList.remove("glitching"), 360);
    };
    let interval: ReturnType<typeof setInterval> | undefined;
    const start = setTimeout(
      () => {
        fire();
        interval = setInterval(fire, 7000);
      },
      5000 + delay * 1000,
    );
    return () => {
      io.disconnect();
      clearTimeout(start);
      clearTimeout(off);
      if (interval) clearInterval(interval);
    };
  }, [delay]);

  return (
    <>
      {glitch && src && (
        <div ref={glitchRef} aria-hidden className="pointer-events-none absolute inset-0">
          <Image
            src={src}
            alt=""
            aria-hidden
            fill
            loading="eager"
            sizes={sizes}
            className={`glitch-a pointer-events-none ${objectClass}`}
          />
          <Image
            src={src}
            alt=""
            aria-hidden
            fill
            loading="eager"
            sizes={sizes}
            className={`glitch-b pointer-events-none ${objectClass}`}
          />
        </div>
      )}
      {scan && (
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className="photo-scan via-lime/25 absolute inset-x-0 top-0 h-[12%] bg-linear-to-b from-transparent to-transparent"
            style={style}
          >
            <div className="bg-lime absolute inset-x-0 top-1/2 h-px shadow-[0_0_14px_rgb(198_255_61/0.9)]" />
          </div>
        </div>
      )}
      {shine && (
        <div
          aria-hidden
          className="photo-shine pointer-events-none absolute inset-0"
          style={style}
        />
      )}
    </>
  );
}
