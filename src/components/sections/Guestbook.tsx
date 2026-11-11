"use client";

import { Check, MessageSquarePlus, Send } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/components/providers/LanguageProvider";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { StatusChip } from "@/components/ui/StatusChip";
import { EASE } from "@/lib/motion";
import { cn } from "@/lib/utils";

const ROLES = ["visitor", "dev", "recruiter", "student"] as const;
type Role = (typeof ROLES)[number];
type Entry = { id: string; name: string; role: Role; message: string; at: string };
type ErrKey = "name" | "message" | "link" | "rate" | "fail";

const ROLE_TONE: Record<Role, "lime" | "violet" | "magenta" | "muted"> = {
  visitor: "muted",
  dev: "violet",
  recruiter: "lime",
  student: "magenta",
};

/** "3 menit lalu" / "3 minutes ago" sesuai bahasa. */
function timeAgo(iso: string, locale: string) {
  const sec = Math.round((new Date(iso).getTime() - Date.now()) / 1000);
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  const steps: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 31536000],
    ["month", 2592000],
    ["week", 604800],
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
  ];
  for (const [unit, s] of steps)
    if (Math.abs(sec) >= s) return rtf.format(Math.round(sec / s), unit);
  return rtf.format(0, "second");
}

/** Buku tamu "Player Log": pengunjung meninggalkan pesan singkat yang langsung tampil. */
export function Guestbook() {
  const { t, locale } = useI18n();
  const g = t.guestbook;
  const rootRef = useRef<HTMLDivElement>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [state, setState] = useState<"loading" | "ready" | "offline">("loading");
  const [fields, setFields] = useState({ name: "", role: "visitor" as Role, message: "" });
  const [honey, setHoney] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<ErrKey | null>(null);
  const [fresh, setFresh] = useState<string>();

  // Ambil log sekali saat section mendekati layar
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        fetch("/api/guestbook/", { cache: "no-store" })
          .then((r) => (r.ok ? r.json() : Promise.reject()))
          .then((d: { entries: Entry[] }) => {
            setEntries(d.entries);
            setState("ready");
          })
          .catch(() => setState("offline"));
      },
      { rootMargin: "400px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = fields.name.trim();
    const message = fields.message.trim();
    if (name.length < 2 || name.length > 24) return setError("name");
    if (message.length < 3 || message.length > 160) return setError("message");
    setError(null);
    setStatus("sending");
    try {
      const res = await fetch("/api/guestbook/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, role: fields.role, message, website: honey }),
      });
      if (!res.ok) {
        const d = (await res.json().catch(() => ({}))) as { error?: string };
        const known: ErrKey[] = ["name", "message", "link", "rate"];
        setError(known.includes(d.error as ErrKey) ? (d.error as ErrKey) : "fail");
        setStatus("idle");
        return;
      }
      const d = (await res.json()) as { entries: Entry[] };
      setEntries(d.entries);
      setState("ready");
      setFresh(d.entries.find((x) => x.name === name && x.message === message)?.id);
      setFields((f) => ({ ...f, message: "" }));
      setStatus("sent");
    } catch {
      setError("fail");
      setStatus("idle");
    }
  };

  const inputCls = (err: boolean) =>
    cn(
      "clip-corner-sm w-full border bg-abyss/60 px-4 py-3 text-ink placeholder:text-ink-3 transition-colors duration-200 outline-none",
      "focus:border-lime focus:bg-abyss",
      err ? "border-magenta/70" : "border-violet-dim/50 hover:border-violet/70",
    );

  return (
    <Section id="buku-tamu" bgWord={g.bg}>
      <SectionHeading id="buku-tamu" label={g.label} lines={g.title} intro={g.intro} />

      <div ref={rootRef} className="grid gap-6 lg:grid-cols-12 lg:gap-10">
        {/* Form */}
        <Reveal className="lg:col-span-5">
          <div className="hud-panel clip-corner relative p-5 sm:p-7">
            <p className="hud-label text-ink-3 mb-6 flex items-center gap-2">
              <MessageSquarePlus size={14} className="text-lime" aria-hidden />
              <span className="text-lime">NEW ENTRY</span> {"//"} {g.label}
            </p>

            <AnimatePresence mode="wait" initial={false}>
              {status === "sent" ? (
                <motion.div
                  key="sent"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3, ease: EASE }}
                  role="status"
                  className="flex min-h-[18rem] flex-col items-center justify-center text-center"
                >
                  <span className="bg-lime text-abyss clip-corner-sm mb-4 grid h-14 w-14 place-items-center">
                    <Check size={26} strokeWidth={3} />
                  </span>
                  <p className="text-ink-2 max-w-xs">{g.form.success}</p>
                  <button
                    type="button"
                    onClick={() => setStatus("idle")}
                    className="hud-label text-violet-soft hover:text-lime mt-5 transition-colors"
                  >
                    {g.form.again}
                  </button>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={submit}
                  noValidate
                  className="space-y-5"
                >
                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                    <div>
                      <label htmlFor="gb-name" className="hud-label text-ink-2 mb-2 block">
                        {g.form.name} <span className="text-lime">*</span>
                      </label>
                      <input
                        id="gb-name"
                        value={fields.name}
                        maxLength={24}
                        autoComplete="nickname"
                        onChange={(e) => setFields((f) => ({ ...f, name: e.target.value }))}
                        placeholder={g.form.namePh}
                        aria-invalid={error === "name"}
                        className={inputCls(error === "name")}
                      />
                    </div>
                    <div>
                      <label htmlFor="gb-role" className="hud-label text-ink-2 mb-2 block">
                        {g.form.role}
                      </label>
                      <select
                        id="gb-role"
                        value={fields.role}
                        onChange={(e) => setFields((f) => ({ ...f, role: e.target.value as Role }))}
                        className={cn(inputCls(false), "appearance-none")}
                      >
                        {ROLES.map((r) => (
                          <option key={r} value={r} className="bg-surface">
                            {g.roles[r]}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="gb-msg"
                      className="hud-label text-ink-2 mb-2 flex justify-between"
                    >
                      <span>
                        {g.form.message} <span className="text-lime">*</span>
                      </span>
                      <span className="text-ink-3 tabular-nums">{fields.message.length}/160</span>
                    </label>
                    <textarea
                      id="gb-msg"
                      rows={3}
                      maxLength={160}
                      value={fields.message}
                      onChange={(e) => setFields((f) => ({ ...f, message: e.target.value }))}
                      placeholder={g.form.messagePh}
                      aria-invalid={error === "message" || error === "link"}
                      className={cn(
                        inputCls(error === "message" || error === "link"),
                        "resize-none",
                      )}
                    />
                  </div>

                  {/* Honeypot: disembunyikan dari manusia, diisi oleh bot */}
                  <input
                    type="text"
                    name="website"
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden
                    value={honey}
                    onChange={(e) => setHoney(e.target.value)}
                    className="absolute -left-[9999px] h-0 w-0 opacity-0"
                  />

                  {error && (
                    <p role="alert" className="text-magenta text-sm">
                      {g.errors[error]}
                    </p>
                  )}

                  <Button
                    type="submit"
                    disabled={status === "sending"}
                    className="w-full sm:w-auto"
                  >
                    <Send size={15} aria-hidden />
                    {status === "sending" ? g.form.sending : g.form.submit}
                  </Button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </Reveal>

        {/* Feed */}
        <Reveal className="lg:col-span-7">
          <div className="hud-panel clip-corner-tr flex h-full flex-col p-5 sm:p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <p className="hud-label text-ink-3">
                <span className="text-lime">RX</span> {"//"} {g.feed}
              </p>
              {state === "ready" && (
                <span className="hud-label text-ink-3 tabular-nums">
                  {entries.length} {g.entries}
                </span>
              )}
            </div>

            {state === "loading" && <p className="hud-label text-ink-3 py-6">{g.loading}</p>}
            {state === "offline" && <p className="text-ink-3 py-6 text-sm">{g.offline}</p>}
            {state === "ready" && entries.length === 0 && (
              <p className="text-ink-2 py-6 text-sm">{g.empty}</p>
            )}

            {state === "ready" && entries.length > 0 && (
              <ul className="hud-scroll -mr-2 max-h-[26rem] space-y-3 overflow-y-auto pr-2">
                <AnimatePresence initial={false}>
                  {entries.map((e) => (
                    <motion.li
                      key={e.id}
                      layout="position"
                      initial={{ opacity: 0, y: -12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35, ease: EASE }}
                      className={cn(
                        "bg-abyss/40 border-l-2 px-4 py-3",
                        e.id === fresh ? "border-lime" : "border-violet-dim/50",
                      )}
                    >
                      <div className="mb-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                        <span className="text-ink font-medium break-all">{e.name}</span>
                        <StatusChip tone={ROLE_TONE[e.role] ?? "muted"}>
                          {g.roles[e.role] ?? e.role}
                        </StatusChip>
                        <time
                          dateTime={e.at}
                          className="hud-label text-ink-3 ml-auto text-[0.625rem]"
                        >
                          {timeAgo(e.at, locale)}
                        </time>
                      </div>
                      <p className="text-ink-2 text-sm leading-relaxed break-words">{e.message}</p>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
            )}
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
