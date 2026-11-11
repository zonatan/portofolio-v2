"use client";

import { ArrowUpRight, Check, Download, Mail, MapPin, Send } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useI18n } from "@/components/providers/LanguageProvider";
import { Button } from "@/components/ui/Button";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { StatusChip } from "@/components/ui/StatusChip";
import { profile } from "@/data/profile";
import { SocialIcon } from "@/components/ui/SocialIcon";
import { EASE } from "@/lib/motion";
import { cn } from "@/lib/utils";

const ENDPOINT = process.env.NEXT_PUBLIC_FORMSPREE_ENDPOINT ?? "";

type Status = "idle" | "sending" | "sent" | "mailto" | "error";
type Fields = { name: string; email: string; message: string };
type Errors = Partial<Record<keyof Fields, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function Comms() {
  const { t } = useI18n();
  const f = t.comms.form;
  const [fields, setFields] = useState<Fields>({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState(false);
  const [status, setStatus] = useState<Status>("idle");

  const validate = (v: Fields): Errors => {
    const e: Errors = {};
    if (v.name.trim().length < 2) e.name = f.errors.name;
    if (!EMAIL_RE.test(v.email.trim())) e.email = f.errors.email;
    if (v.message.trim().length < 10) e.message = f.errors.message;
    return e;
  };

  const update =
    (k: keyof Fields) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const next = { ...fields, [k]: e.target.value };
      setFields(next);
      if (touched) setErrors(validate(next));
    };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setTouched(true);
    const errs = validate(fields);
    setErrors(errs);
    if (Object.keys(errs).length) {
      const first = Object.keys(errs)[0];
      e.currentTarget.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }

    setStatus("sending");
    // Minimal 900ms agar animasi "MENGIRIM TRANSMISI..." terbaca.
    const minDelay = new Promise((r) => setTimeout(r, 900));

    if (!ENDPOINT) {
      await minDelay;
      const subject = encodeURIComponent(`[Portofolio] Pesan dari ${fields.name}`);
      const body = encodeURIComponent(`${fields.message}\n\n— ${fields.name} (${fields.email})`);
      window.location.href = `mailto:${profile.email}?subject=${subject}&body=${body}`;
      setStatus("mailto");
      return;
    }

    try {
      const [res] = await Promise.all([
        fetch(ENDPOINT, {
          method: "POST",
          headers: { Accept: "application/json", "Content-Type": "application/json" },
          body: JSON.stringify(fields),
        }),
        minDelay,
      ]);
      if (!res.ok) throw new Error(String(res.status));
      setStatus("sent");
      setFields({ name: "", email: "", message: "" });
      setTouched(false);
    } catch {
      setStatus("error");
    }
  };

  const inputCls = (err?: string) =>
    cn(
      "clip-corner-sm w-full border bg-abyss/60 px-4 py-3 text-ink placeholder:text-ink-3 transition-colors duration-200 outline-none",
      "focus:border-lime focus:bg-abyss focus-visible:outline-none",
      err ? "border-magenta/70" : "border-violet-dim/50 hover:border-violet/70",
    );

  const done = status === "sent" || status === "mailto";

  return (
    <Section id="kontak" bgWord={t.comms.bg} className="">
      <SectionHeading
        id="kontak"
        label={t.comms.label}
        lines={t.comms.title}
        intro={t.comms.intro}
      />

      <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
        {/* Form */}
        <Reveal className="lg:col-span-7">
          <div className="hud-panel clip-corner relative p-5 sm:p-7">
            <div className="mb-6 flex items-center justify-between gap-3">
              <p className="hud-label text-ink-3">
                <span className="text-lime">TX</span> {"//"} {ENDPOINT ? "FORMSPREE" : "MAILTO"}
              </p>
              <StatusChip tone="lime" pulse>
                {t.hud.online}
              </StatusChip>
            </div>

            <AnimatePresence mode="wait" initial={false}>
              {done ? (
                <motion.div
                  key="done"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.35, ease: EASE }}
                  role="status"
                  className="flex min-h-[22rem] flex-col items-center justify-center text-center"
                >
                  <motion.span
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 260, damping: 16, delay: 0.1 }}
                    className="bg-lime text-abyss clip-corner-sm mb-5 grid h-16 w-16 place-items-center"
                  >
                    <Check size={30} strokeWidth={3} />
                  </motion.span>
                  <p className="font-display text-lime text-4xl font-bold uppercase">{f.success}</p>
                  <p className="text-ink-2 mt-2 max-w-sm">
                    {status === "sent" ? f.successBody : f.mailtoBody}
                  </p>
                  <button
                    type="button"
                    onClick={() => setStatus("idle")}
                    className="hud-label text-violet-soft hover:text-ink mt-6 underline-offset-4 hover:underline"
                  >
                    {f.again}
                  </button>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  noValidate
                  onSubmit={onSubmit}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-5"
                >
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field id="name" label={f.name} error={errors.name}>
                      <input
                        id="name"
                        name="name"
                        autoComplete="name"
                        value={fields.name}
                        onChange={update("name")}
                        placeholder={f.namePh}
                        aria-invalid={!!errors.name}
                        aria-describedby={errors.name ? "name-err" : undefined}
                        className={inputCls(errors.name)}
                      />
                    </Field>
                    <Field id="email" label={f.email} error={errors.email}>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        value={fields.email}
                        onChange={update("email")}
                        placeholder={f.emailPh}
                        aria-invalid={!!errors.email}
                        aria-describedby={errors.email ? "email-err" : undefined}
                        className={inputCls(errors.email)}
                      />
                    </Field>
                  </div>
                  <Field id="message" label={f.message} error={errors.message}>
                    <textarea
                      id="message"
                      name="message"
                      rows={6}
                      value={fields.message}
                      onChange={update("message")}
                      placeholder={f.messagePh}
                      aria-invalid={!!errors.message}
                      aria-describedby={errors.message ? "message-err" : undefined}
                      className={cn(inputCls(errors.message), "resize-y")}
                    />
                  </Field>

                  {status === "error" && (
                    <p role="alert" className="text-magenta text-sm">
                      {f.error}
                    </p>
                  )}

                  {/* Tombol → progress bar saat mengirim */}
                  <div className="relative h-12">
                    <AnimatePresence mode="wait" initial={false}>
                      {status === "sending" ? (
                        <motion.div
                          key="sending"
                          role="status"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="clip-corner-sm border-lime/40 bg-abyss absolute inset-0 overflow-hidden border"
                        >
                          <motion.div
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 0.92 }}
                            transition={{ duration: 0.9, ease: EASE }}
                            className="bg-lime/20 absolute inset-0 origin-left"
                          />
                          <span className="hud-label text-lime relative flex h-full items-center justify-center">
                            {f.sending}
                          </span>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="btn"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          <Button type="submit" className="w-full sm:w-auto">
                            <Send size={15} aria-hidden />
                            {f.submit}
                          </Button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </Reveal>

        {/* Saluran langsung & sosial */}
        <RevealGroup className="space-y-4 lg:col-span-5">
          <RevealItem className="hud-panel clip-corner-tr p-5 sm:p-6">
            <p className="hud-label text-ink-3 mb-3">{t.comms.direct}</p>
            <a
              href={`mailto:${profile.email}`}
              className="group text-ink hover:text-lime flex items-center gap-3 text-lg font-medium break-all transition-colors"
            >
              <Mail
                size={18}
                className="text-violet-soft group-hover:text-lime shrink-0"
                aria-hidden
              />
              {profile.email}
            </a>
          </RevealItem>

          <RevealItem className="hud-panel clip-corner-tr p-5 sm:p-6">
            <p className="hud-label text-ink-3 mb-3">{t.comms.socials}</p>
            <ul className="space-y-2">
              {profile.socials.map((s) => {
                const live = !!s.url;
                return (
                  <li key={s.key}>
                    {live ? (
                      <a
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group border-violet-dim/40 hover:border-lime/60 hover:bg-raised flex items-center justify-between gap-3 border px-4 py-3 transition-colors"
                      >
                        <span className="flex min-w-0 items-center gap-3">
                          <SocialIcon
                            name={s.key}
                            className="text-violet-soft group-hover:text-lime shrink-0 transition-colors"
                          />
                          <span className="min-w-0">
                            <span className="block font-medium">{s.label}</span>
                            <span className="text-ink-3 block truncate font-mono text-xs">
                              {s.handle}
                            </span>
                          </span>
                        </span>
                        <ArrowUpRight
                          size={16}
                          aria-hidden
                          className="text-ink-3 group-hover:text-lime shrink-0 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                        />
                      </a>
                    ) : (
                      <span
                        aria-disabled="true"
                        className="border-violet-dim/25 text-ink-3 flex cursor-not-allowed items-center justify-between gap-3 border px-4 py-3"
                      >
                        <span className="flex items-center gap-3 font-medium">
                          <SocialIcon name={s.key} />
                          {s.label}
                        </span>
                        <StatusChip tone="magenta">{t.hud.soon}</StatusChip>
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          </RevealItem>

          <RevealItem className="hud-panel clip-corner-tr flex flex-wrap items-center justify-between gap-4 p-5 sm:p-6">
            <div>
              <p className="hud-label text-ink-3 mb-1">{t.comms.location}</p>
              <p className="flex items-center gap-2 font-medium">
                <MapPin size={16} className="text-lime" aria-hidden />
                Manado, ID
              </p>
              <p className="hud-label text-ink-3 mt-1 text-[0.625rem]">{profile.coordinates}</p>
            </div>
            <Button href={profile.cv} variant="secondary" size="sm" download>
              <Download size={14} aria-hidden />
              {t.comms.cv}
            </Button>
          </RevealItem>
        </RevealGroup>
      </div>
    </Section>
  );
}

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="hud-label text-ink-2 mb-2 block">
        {label} <span className="text-lime">*</span>
      </label>
      {children}
      <AnimatePresence>
        {error && (
          <motion.p
            id={`${id}-err`}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="text-magenta mt-1.5 text-xs"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
