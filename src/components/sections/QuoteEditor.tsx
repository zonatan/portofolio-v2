"use client";

import { Lock, X } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useI18n } from "@/components/providers/LanguageProvider";
import { getLenis } from "@/components/providers/SmoothScroll";
import { Button } from "@/components/ui/Button";
import { EASE } from "@/lib/motion";
import { cn } from "@/lib/utils";

const QUOTE_API = "/api/quote/";
const MAX = 180;

type ErrorKey = "errPin" | "errLocked" | "errLength" | "errStorage" | "errServer";

function errorFor(status: number, code?: string): ErrorKey {
  if (code === "pin" || status === 401) return "errPin";
  if (code === "locked" || status === 429) return "errLocked";
  if (code === "length" || code === "text") return "errLength";
  if (code === "storage" || status === 503) return "errStorage";
  return "errServer";
}

/** Dialog 2 langkah: masukkan PIN → ubah kutipan. PIN diverifikasi di server. */
export function QuoteEditor({
  current,
  onSaved,
  onClose,
}: {
  current: string;
  onSaved: (text: string) => void;
  onClose: () => void;
}) {
  const { t } = useI18n();
  const q = t.profile.quoteEdit;
  const [step, setStep] = useState<"pin" | "edit">("pin");
  const [pin, setPin] = useState("");
  const [text, setText] = useState(current);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<ErrorKey | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Kunci scroll, Esc menutup, fokus ke input pertama
  useEffect(() => {
    const lenis = getLenis();
    lenis?.stop();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
      lenis?.start();
    };
  }, [onClose]);

  useEffect(() => {
    panelRef.current?.querySelector<HTMLElement>("input,textarea")?.focus();
  }, [step]);

  const post = async (body: Record<string, string>) => {
    const res = await fetch(QUOTE_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    return { res, data };
  };

  const submitPin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length !== 4) return setError("errPin");
    setBusy(true);
    setError(null);
    try {
      const { res, data } = await post({ pin });
      if (res.ok) setStep("edit");
      else {
        setError(errorFor(res.status, data.error));
        setPin("");
      }
    } catch {
      setError("errServer");
    } finally {
      setBusy(false);
    }
  };

  const submitText = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = text.replace(/\s+/g, " ").trim();
    if (clean.length < 3 || clean.length > MAX) return setError("errLength");
    setBusy(true);
    setError(null);
    try {
      const { res, data } = await post({ pin, text: clean });
      if (res.ok) {
        onSaved(data.text ?? clean);
        onClose();
      } else {
        const key = errorFor(res.status, data.error);
        setError(key);
        if (key === "errPin") setStep("pin");
      }
    } catch {
      setError("errServer");
    } finally {
      setBusy(false);
    }
  };

  const input =
    "clip-corner-sm w-full border border-violet-dim/50 bg-abyss/70 px-4 py-3 text-ink outline-none transition-colors placeholder:text-ink-3 focus:border-lime";

  return createPortal(
    <div className="fixed inset-0 z-[85] flex items-center justify-center p-4">
      <motion.div
        aria-hidden
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={onClose}
        className="bg-abyss/80 absolute inset-0 backdrop-blur-md"
      />
      <motion.div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="quote-edit-title"
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35, ease: EASE }}
        data-lenis-prevent
        className="hud-panel clip-corner bg-surface relative w-full max-w-md p-6"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label={t.a11y.close}
          className="text-ink-3 hover:text-lime absolute top-4 right-4 transition-colors"
        >
          <X size={18} />
        </button>

        {step === "pin" ? (
          <form onSubmit={submitPin}>
            <p className="hud-label text-lime mb-2 flex items-center gap-2">
              <Lock size={12} aria-hidden /> SECURE // QUOTE
            </p>
            <h2 id="quote-edit-title" className="font-display text-4xl font-bold uppercase">
              {q.pinTitle}
            </h2>
            <p className="text-ink-2 mt-2 text-sm">{q.pinHint}</p>
            <label htmlFor="quote-pin" className="hud-label text-ink-2 mt-6 mb-2 block">
              {q.pinLabel}
            </label>
            <input
              id="quote-pin"
              type="password"
              inputMode="numeric"
              autoComplete="off"
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
              aria-invalid={!!error}
              aria-describedby={error ? "quote-err" : undefined}
              className={cn(input, "text-center font-mono text-2xl tracking-[0.6em]")}
              placeholder="••••"
            />
            {error && (
              <p id="quote-err" role="alert" className="text-magenta mt-3 text-sm">
                {q[error]}
              </p>
            )}
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="ghost" onClick={onClose} magnetic={false} size="sm">
                {q.cancel}
              </Button>
              <Button type="submit" size="sm" disabled={busy || pin.length !== 4} magnetic={false}>
                {busy ? q.checking : q.next}
              </Button>
            </div>
          </form>
        ) : (
          <form onSubmit={submitText}>
            <p className="hud-label text-lime mb-2">ACCESS GRANTED</p>
            <h2 id="quote-edit-title" className="font-display text-4xl font-bold uppercase">
              {q.editTitle}
            </h2>
            <p className="text-ink-2 mt-2 text-sm">{q.editHint}</p>
            <label
              htmlFor="quote-text"
              className="hud-label text-ink-2 mt-6 mb-2 flex justify-between"
            >
              <span>{q.label}</span>
              <span className={cn(text.length > MAX && "text-magenta")}>
                {text.length}/{MAX}
              </span>
            </label>
            <textarea
              id="quote-text"
              rows={4}
              maxLength={MAX + 20}
              value={text}
              onChange={(e) => setText(e.target.value)}
              aria-invalid={!!error}
              aria-describedby={error ? "quote-err" : undefined}
              className={cn(input, "resize-none")}
            />
            {error && (
              <p id="quote-err" role="alert" className="text-magenta mt-3 text-sm">
                {q[error]}
              </p>
            )}
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="ghost" onClick={onClose} magnetic={false} size="sm">
                {q.cancel}
              </Button>
              <Button type="submit" size="sm" disabled={busy} magnetic={false}>
                {busy ? q.saving : q.save}
              </Button>
            </div>
          </form>
        )}
      </motion.div>
    </div>,
    document.body,
  );
}
