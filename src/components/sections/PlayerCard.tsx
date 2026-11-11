"use client";

import { PenLine, Quote, RotateCw } from "lucide-react";
import Image from "next/image";
import { motion, useSpring } from "motion/react";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/components/providers/LanguageProvider";
import { BeamBorder } from "@/components/ui/BeamBorder";
import { CornerBrackets } from "@/components/ui/CornerBrackets";
import { PhotoFX } from "@/components/ui/PhotoFX";
import { SocialIcon } from "@/components/ui/SocialIcon";
import { profile } from "@/data/profile";
import { useFinePointer } from "@/lib/hooks";
import { BLUR_DATA_URL, cn } from "@/lib/utils";

// Dialog edit dimuat hanya saat dibutuhkan.
const QuoteEditor = dynamic(() => import("./QuoteEditor").then((m) => m.QuoteEditor), {
  ssr: false,
});
const QUOTE_API = "/api/quote/";

const face: React.CSSProperties = {
  backfaceVisibility: "hidden",
  WebkitBackfaceVisibility: "hidden",
};

/**
 * Kartu pemain 3D yang bisa dibalik (klik / tap / tombol).
 * Depan: foto utama profil. Belakang: foto kedua + kutipan, kelas, dan link sosial.
 * Di desktop kartu sedikit miring mengikuti kursor, dengan kilau holografik.
 */
export function PlayerCard() {
  const { t, l } = useI18n();
  const p = t.profile;
  const fine = useFinePointer();
  const [flipped, setFlipped] = useState(false);
  // Kutipan dari server (bisa diubah pengunjung yang tahu PIN). null = pakai kutipan default.
  const [customQuote, setCustomQuote] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    let alive = true;
    fetch(QUOTE_API, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (alive && d?.text) setCustomQuote(d.text);
      })
      .catch(() => {
        /* gagal ambil → tetap kutipan default */
      });
    return () => {
      alive = false;
    };
  }, []);

  const quoteText = customQuote ?? l(profile.quote);
  const ref = useRef<HTMLDivElement>(null);
  const rx = useSpring(0, { stiffness: 160, damping: 18 });
  const ry = useSpring(0, { stiffness: 160, damping: 18 });

  const onMove = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    el.style.setProperty("--gx", `${x * 100}%`);
    el.style.setProperty("--gy", `${y * 100}%`);
    if (!fine) return;
    ry.set((x - 0.5) * 16);
    rx.set(-(y - 0.5) * 16);
  };
  const reset = () => {
    rx.set(0);
    ry.set(0);
  };

  return (
    <div>
      <div className="relative" style={{ perspective: 1400 }}>
        <CornerBrackets size="h-6 w-6" color="border-violet-soft" className="-m-2" />

        <motion.div
          ref={ref}
          onPointerMove={onMove}
          onPointerLeave={reset}
          style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }}
          className="group relative"
        >
          <motion.div
            animate={{ rotateY: flipped ? 180 : 0 }}
            transition={{ type: "spring", stiffness: 55, damping: 12, mass: 1 }}
            style={{ transformStyle: "preserve-3d" }}
            className="relative aspect-[4/5]"
          >
            {/* ===== DEPAN ===== */}
            <button
              type="button"
              onClick={() => setFlipped(true)}
              aria-label={p.flip}
              aria-hidden={flipped}
              tabIndex={flipped ? -1 : 0}
              data-cursor="hover"
              style={face}
              className="clip-corner bg-raised absolute inset-0 overflow-hidden text-left"
            >
              <Image
                src={profile.photoAbout}
                alt={p.photoAlt}
                fill
                sizes="(min-width: 1024px) 36vw, 90vw"
                placeholder="blur"
                blurDataURL={BLUR_DATA_URL}
                className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
              />
              <div aria-hidden className="scanlines absolute inset-0" />
              <div
                aria-hidden
                className="from-abyss/90 absolute inset-0 bg-linear-to-t via-transparent to-transparent"
              />
              {/* Kilau holografik otomatis + sinar border */}
              <PhotoFX shine delay={0.5} />
              <BeamBorder duration={7.5} delay={0.3} />
              {/* Kilau holografik mengikuti kursor */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-0 mix-blend-overlay transition-opacity duration-300 group-hover:opacity-100"
                style={{
                  background:
                    "radial-gradient(circle at var(--gx,50%) var(--gy,50%), rgb(255 255 255 / 0.45), transparent 45%), linear-gradient(115deg, transparent 30%, rgb(198 255 61 / 0.25) 45%, rgb(255 61 154 / 0.25) 55%, transparent 70%)",
                }}
              />
              <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4">
                <span className="hud-label bg-abyss/70 text-ink px-2 py-1 backdrop-blur-sm">
                  PLAYER CARD <span className="text-lime">01/02</span>
                </span>
              </div>
              <div className="absolute inset-x-0 bottom-0 p-5">
                <p className="font-display text-4xl leading-none font-bold uppercase">
                  {profile.name}
                </p>
                <p className="hud-label text-violet-soft mt-2">
                  {profile.playerId} · {l(profile.major)}
                </p>
              </div>
            </button>

            {/* ===== BELAKANG ===== */}
            <div
              aria-hidden={!flipped}
              onClick={(e) => {
                if (!(e.target as HTMLElement).closest("a,button")) setFlipped(false);
              }}
              style={{ ...face, transform: "rotateY(180deg)" }}
              className="clip-corner bg-surface absolute inset-0 overflow-hidden"
            >
              <Image
                src={profile.photoAboutBack}
                alt=""
                fill
                sizes="(min-width: 1024px) 36vw, 90vw"
                placeholder="blur"
                blurDataURL={BLUR_DATA_URL}
                className="object-cover opacity-80 grayscale"
              />
              {/* Duotone ungu–magenta */}
              <div
                aria-hidden
                className="from-violet/70 via-abyss/70 to-magenta/40 absolute inset-0 bg-linear-to-br mix-blend-multiply"
              />
              <div aria-hidden className="bg-abyss/40 absolute inset-0" />
              <div aria-hidden className="scanlines absolute inset-0" />
              <BeamBorder duration={7.5} delay={0.3} />

              <div className="relative flex h-full flex-col p-5 sm:p-6">
                <div className="flex items-center justify-between">
                  <span className="hud-label bg-abyss/70 text-ink px-2 py-1">
                    PLAYER CARD <span className="text-lime">02/02</span>
                  </span>
                  <span className="hud-label text-lime">{profile.nickname.toUpperCase()}</span>
                </div>

                <div className="my-auto">
                  <Quote size={28} className="text-lime mb-3" aria-hidden />
                  <p
                    className={cn(
                      "font-display text-ink leading-[1.05] font-semibold break-words uppercase",
                      quoteText.length > 110 ? "text-2xl sm:text-3xl" : "text-3xl sm:text-4xl",
                    )}
                  >
                    {quoteText}
                  </p>
                </div>

                <dl className="border-violet-soft/30 grid grid-cols-2 gap-3 border-t pt-4">
                  <div>
                    <dt className="hud-label text-ink-2">{p.class}</dt>
                    <dd className="font-display mt-0.5 text-lg font-semibold uppercase">
                      {p.classValue}
                    </dd>
                  </div>
                  <div>
                    <dt className="hud-label text-ink-2">{p.guild}</dt>
                    <dd className="font-display mt-0.5 text-lg font-semibold uppercase">UNIMA</dd>
                  </div>
                </dl>

                <div className="mt-4 flex items-end justify-between">
                  <ul className="flex gap-2">
                    {profile.socials.map((s) => (
                      <li key={s.key}>
                        <a
                          href={s.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          tabIndex={flipped ? 0 : -1}
                          aria-label={`${s.label} — ${s.handle}`}
                          className="clip-corner-sm border-violet-soft/40 bg-abyss/60 text-ink hover:border-lime hover:text-lime grid h-10 w-10 place-items-center border transition-colors"
                        >
                          <SocialIcon name={s.key} size={17} />
                        </a>
                      </li>
                    ))}
                  </ul>
                  {/* Tombol edit tersembunyi: kecil & samar, sengaja tidak mencolok */}
                  <button
                    type="button"
                    onClick={() => setEditing(true)}
                    tabIndex={flipped ? 0 : -1}
                    aria-label={p.quoteEdit.open}
                    title={p.quoteEdit.open}
                    className="text-ink-3 grid h-6 w-6 place-items-center opacity-25 transition-opacity hover:opacity-80 focus-visible:opacity-100"
                  >
                    <PenLine size={11} aria-hidden />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {editing && (
        <QuoteEditor
          current={quoteText}
          onSaved={(text) => setCustomQuote(text)}
          onClose={() => setEditing(false)}
        />
      )}

      {/* Tombol balik kartu */}
      <button
        type="button"
        onClick={() => setFlipped((v) => !v)}
        aria-pressed={flipped}
        data-cursor="hover"
        className={cn(
          "hud-label group/flip mt-5 inline-flex items-center gap-2 transition-colors",
          flipped ? "text-lime" : "text-ink-2 hover:text-ink",
        )}
      >
        <RotateCw
          size={14}
          aria-hidden
          className={cn(
            "transition-transform duration-500",
            flipped ? "rotate-180" : "group-hover/flip:rotate-90",
          )}
        />
        {flipped ? p.flipBack : p.flip}
      </button>
    </div>
  );
}
