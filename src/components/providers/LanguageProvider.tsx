"use client";

import { createContext, useCallback, useContext, useEffect, useSyncExternalStore } from "react";
import { defaultLocale, dictionaries, type Dictionary } from "@/data/i18n";
import type { Locale, Localized } from "@/data/types";

const STORAGE_KEY = "zs-locale";
const listeners = new Set<() => void>();

function readLocale(): Locale {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v === "en" || v === "id" ? v : defaultLocale;
  } catch {
    return defaultLocale;
  }
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

type Ctx = {
  locale: Locale;
  t: Dictionary;
  setLocale: (l: Locale) => void;
  /** Ambil teks dua bahasa dari data (`{ id, en }`). */
  l: (v: Localized) => string;
};

const LanguageContext = createContext<Ctx | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const locale = useSyncExternalStore(subscribe, readLocale, () => defaultLocale);

  const setLocale = useCallback((next: Locale) => {
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* storage diblokir — abaikan */
    }
    listeners.forEach((cb) => cb());
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const l = useCallback((v: Localized) => v[locale], [locale]);

  return (
    <LanguageContext.Provider value={{ locale, t: dictionaries[locale], setLocale, l }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useI18n harus dipakai di dalam <LanguageProvider>");
  return ctx;
}
