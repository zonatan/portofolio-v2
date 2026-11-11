"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";

function subscribeMedia(query: string) {
  return (cb: () => void) => {
    const mql = window.matchMedia(query);
    mql.addEventListener("change", cb);
    return () => mql.removeEventListener("change", cb);
  };
}

/** Media query reaktif. Di server selalu `false`. */
export function useMediaQuery(query: string) {
  const subscribe = useMemo(() => subscribeMedia(query), [query]);
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
}

/** Perangkat dengan pointer presisi + hover (desktop/laptop). Efek berat hanya aktif di sini. */
export function useFinePointer() {
  const fine = useMediaQuery("(hover: hover) and (pointer: fine) and (min-width: 1024px)");
  const reduced = usePrefersReducedMotion();
  return fine && !reduced;
}

export function usePrefersReducedMotion() {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}

const BOOT_EVENT = "zs:boot-done";

export function markBootDone() {
  document.documentElement.classList.add("booted");
  window.dispatchEvent(new Event(BOOT_EVENT));
}

function subscribeBoot(cb: () => void) {
  window.addEventListener(BOOT_EVENT, cb);
  return () => window.removeEventListener(BOOT_EVENT, cb);
}

/** `true` setelah boot loader selesai (atau langsung, jika loader dilewati). */
export function useBootDone() {
  return useSyncExternalStore(
    subscribeBoot,
    () => document.documentElement.classList.contains("booted"),
    () => false,
  );
}

/** Mengamati apakah elemen dengan id tertentu sedang terlihat. */
export function useElementVisible(id: string, rootMargin = "0px") {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = document.getElementById(id);
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), {
      rootMargin,
    });
    io.observe(el);
    return () => io.disconnect();
  }, [id, rootMargin]);
  return visible;
}

/**
 * Menjeda semua animasi CSS di dalam elemen saat elemen di luar layar
 * (set atribut `data-anim="off"` → lihat globals.css). Tanpa re-render React.
 */
export function useAnimPause(ref: React.RefObject<HTMLElement | null>, margin = "200px") {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) el.removeAttribute("data-anim");
        else el.setAttribute("data-anim", "off");
      },
      { rootMargin: margin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, margin]);
}
