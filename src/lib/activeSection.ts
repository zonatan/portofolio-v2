"use client";

import { useSyncExternalStore } from "react";
import { sections, type SectionId } from "@/data/sections";

/** Satu IntersectionObserver bersama untuk melacak section aktif (dipakai navbar & HUD). */
let active: SectionId = "beranda";
let observer: IntersectionObserver | null = null;
const listeners = new Set<() => void>();

function ensureObserver() {
  if (observer || typeof window === "undefined") return;
  observer = new IntersectionObserver(
    (entries) => {
      const hit = entries.find((e) => e.isIntersecting);
      if (!hit) return;
      const id = hit.target.id as SectionId;
      if (id !== active) {
        active = id;
        listeners.forEach((l) => l());
      }
    },
    { rootMargin: "-40% 0px -55% 0px", threshold: 0 },
  );
  sections.forEach((s) => {
    const el = document.getElementById(s.id);
    if (el) observer!.observe(el);
  });
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  ensureObserver();
  return () => {
    listeners.delete(cb);
    if (listeners.size === 0) {
      observer?.disconnect();
      observer = null;
    }
  };
}

export function useActiveSection() {
  return useSyncExternalStore(
    subscribe,
    () => active,
    () => "beranda" as SectionId,
  );
}
