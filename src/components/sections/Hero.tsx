"use client";

import { ArrowDown, Download } from "lucide-react";
import Image from "next/image";
import { motion, useMotionValue, useScroll, useSpring, useTransform } from "motion/react";
import { useEffect, useRef } from "react";
import { useI18n } from "@/components/providers/LanguageProvider";
import { ScrambleText, Typewriter } from "@/components/ui/AnimatedText";
import { Button } from "@/components/ui/Button";
import { BeamBorder } from "@/components/ui/BeamBorder";
import { CornerBrackets } from "@/components/ui/CornerBrackets";
import { PhotoFX } from "@/components/ui/PhotoFX";
import { SocialIcon } from "@/components/ui/SocialIcon";
import { StatusChip } from "@/components/ui/StatusChip";
import { profile } from "@/data/profile";
import { useAnimPause, useBootDone, useFinePointer, usePrefersReducedMotion } from "@/lib/hooks";
import { EASE, revealVariants, staggerContainer } from "@/lib/motion";
import { BLUR_DATA_URL } from "@/lib/utils";

export function Hero() {
  const { t, l } = useI18n();
  const booted = useBootDone();
  const fine = useFinePointer();
  const reduced = usePrefersReducedMotion();
  const state = booted ? "visible" : "hidden";

  // Parallax scroll
  const { scrollY } = useScroll();
  const photoY = useTransform(scrollY, [0, 900], [0, -70]);
  const wordY = useTransform(scrollY, [0, 900], [0, 140]);
  const gridY = useTransform(scrollY, [0, 900], [0, 60]);

  // Parallax mouse (desktop saja, maks ±12px)
  const mx = useSpring(useMotionValue(0), { stiffness: 80, damping: 20 });
  const my = useSpring(useMotionValue(0), { stiffness: 80, damping: 20 });
  const photoMx = useTransform(mx, (v) => v * 12);
  const photoMy = useTransform(my, (v) => v * 12);
  const wordMx = useTransform(mx, (v) => v * -8);
  const gridMx = useTransform(mx, (v) => v * 5);
  const gridMy = useTransform(my, (v) => v * 5);

  // Jeda animasi CSS & parallax mouse saat hero di luar layar
  const sectionRef = useRef<HTMLElement>(null);
  useAnimPause(sectionRef);

  useEffect(() => {
    if (!fine) {
      mx.set(0);
      my.set(0);
      return;
    }
    const onMove = (e: PointerEvent) => {
      if (sectionRef.current?.hasAttribute("data-anim")) return;
      mx.set((e.clientX / window.innerWidth) * 2 - 1);
      my.set((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [fine, mx, my]);

  const still = reduced;

  return (
    <section
      ref={sectionRef}
      id="beranda"
      data-sector="beranda"
      className="relative flex min-h-[100svh] items-center overflow-hidden pt-24 pb-20 md:pt-28"
    >
      {/* Grid hero (bergerak paling lambat) */}
      <motion.div
        aria-hidden
        style={still ? undefined : { y: gridY, x: gridMx }}
        className="pointer-events-none absolute -inset-10 will-change-transform"
      >
        <motion.div
          style={still ? undefined : { y: gridMy }}
          className="h-full w-full bg-[linear-gradient(rgb(139_92_246/0.09)_1px,transparent_1px),linear-gradient(90deg,rgb(139_92_246/0.09)_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_70%_60%_at_60%_40%,#000,transparent)] bg-[size:88px_88px] will-change-transform"
        />
      </motion.div>

      {/* Teks latar raksasa */}
      <motion.div
        aria-hidden
        style={still ? undefined : { y: wordY, x: wordMx }}
        className="text-stroke font-display pointer-events-none absolute right-[-4vw] bottom-[6vh] text-[34vw] leading-none font-bold uppercase will-change-transform select-none md:text-[22vw]"
      >
        PLAYER
      </motion.div>

      <div className="relative mx-auto grid w-full max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-12 lg:gap-8 lg:px-8">
        {/* Kiri: teks */}
        <motion.div
          className="order-2 lg:order-1 lg:col-span-7"
          variants={staggerContainer(0.08, 0.25)}
          initial="hidden"
          animate={state}
        >
          <motion.div
            data-reveal
            variants={revealVariants}
            className="mb-6 flex flex-wrap items-center gap-x-4 gap-y-2"
          >
            <span className="hud-label text-lime">{t.hero.tag}</span>
            <span className="hud-label text-ink-3">
              <Typewriter text={profile.coordinates} start={booted} delay={250} />
            </span>
          </motion.div>

          <p className="text-ink-2 mb-2 font-mono text-sm tracking-[0.2em] uppercase">
            {t.hero.greeting}
          </p>
          <h1 className="font-display leading-[0.82] font-bold uppercase">
            <span className="block text-[clamp(4rem,15vw,9.5rem)] tracking-tight">
              <ScrambleText text={t.hero.line1} start={booted} />
            </span>
            <span className="text-violet-soft block text-[clamp(4rem,15vw,9.5rem)] tracking-tight">
              <ScrambleText text={t.hero.line2} start={booted} delay={150} />
            </span>
          </h1>

          <motion.div
            data-reveal
            variants={revealVariants}
            className="mt-5 flex flex-wrap items-center gap-3"
          >
            <span className="font-display text-ink text-2xl font-semibold tracking-wide uppercase md:text-3xl">
              {l(profile.role)}
            </span>
          </motion.div>

          <motion.p
            data-reveal
            variants={revealVariants}
            className="text-ink-2 mt-5 max-w-xl text-base leading-relaxed md:text-lg"
          >
            {t.hero.lead}
          </motion.p>

          <motion.div
            data-reveal
            variants={revealVariants}
            className="mt-8 flex flex-wrap items-center gap-3 sm:gap-4"
          >
            <Button href="#misi">{t.hero.ctaPrimary}</Button>
            <Button href={profile.cv} variant="secondary" download>
              <Download size={15} aria-hidden />
              {t.hero.ctaSecondary}
            </Button>
          </motion.div>

          <motion.div
            data-reveal
            variants={revealVariants}
            className="mt-8 flex flex-wrap items-center gap-2"
          >
            {profile.openToWork && (
              <StatusChip tone="lime" pulse>
                {t.hero.status}
              </StatusChip>
            )}
            <StatusChip tone="muted">{profile.university}</StatusChip>
            <span aria-hidden className="bg-violet-dim/50 mx-1 hidden h-5 w-px sm:block" />
            <ul className="flex items-center gap-1.5">
              {profile.socials.map((s) => (
                <li key={s.key}>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${s.label} — ${s.handle}`}
                    data-cursor="hover"
                    className="clip-corner-sm border-violet-dim/50 text-ink-2 hover:border-lime hover:text-lime grid h-9 w-9 place-items-center border transition-colors"
                  >
                    <SocialIcon name={s.key} size={15} />
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>
        </motion.div>

        {/* Kanan: foto dalam bingkai HUD */}
        <div className="order-1 mx-auto w-full max-w-[15rem] sm:max-w-xs lg:order-2 lg:col-span-5 lg:max-w-none lg:pl-6">
          <motion.div style={still ? undefined : { y: photoY }} className="will-change-transform">
            <motion.div
              style={still ? undefined : { x: photoMx, y: photoMy }}
              className="relative will-change-transform"
            >
              {/* Glow bernapas di belakang foto */}
              <div
                aria-hidden
                className="animate-breathe absolute -inset-8 rounded-full bg-[radial-gradient(closest-side,rgb(139_92_246/0.65),rgb(255_61_154/0.3)_55%,transparent)] blur-2xl"
              />

              {/* Foto tampil sejak paint pertama (baik untuk LCP); hanya bracket & scan yang beranimasi */}
              <div className="relative p-3">
                <CornerBrackets active={booted} size="h-8 w-8" color="border-lime" delay={0.1} />

                <div className="clip-corner bg-raised relative z-[1] aspect-[4/5] overflow-hidden">
                  <Image
                    src={profile.photo}
                    alt={t.hero.photoAlt}
                    fill
                    preload
                    sizes="(min-width: 1024px) 40vw, (min-width: 640px) 384px, 304px"
                    placeholder="blur"
                    blurDataURL={BLUR_DATA_URL}
                    className="object-cover object-[50%_35%]"
                  />
                  <div aria-hidden className="scanlines absolute inset-0" />
                  <div
                    aria-hidden
                    className="from-abyss/80 to-violet/10 absolute inset-0 bg-linear-to-t via-transparent"
                  />
                  {/* Efek foto: glitch digital berkala + garis scan berulang */}
                  <PhotoFX
                    src={profile.photo}
                    sizes="(min-width: 1024px) 40vw, (min-width: 640px) 384px, 304px"
                    objectClass="object-cover object-[50%_35%]"
                    glitch
                    scan
                    delay={1}
                  />
                  <BeamBorder duration={8} delay={0.6} />
                  {/* Garis scan menyapu sekali */}
                  {booted && !still && (
                    <motion.div
                      aria-hidden
                      initial={{ y: "-10%", opacity: 0 }}
                      animate={{ y: "1000%", opacity: [0, 1, 1, 0] }}
                      transition={{ duration: 1.3, ease: [0.65, 0, 0.35, 1], delay: 0.5 }}
                      className="via-lime/40 to-lime/0 absolute inset-x-0 top-0 h-[10%] bg-linear-to-b from-transparent"
                    >
                      <div className="bg-lime absolute inset-x-0 bottom-1/2 h-px shadow-[0_0_12px_rgb(198_255_61/0.9)]" />
                    </motion.div>
                  )}

                  {/* Label HUD di atas foto */}
                  <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-3 sm:p-4">
                    <span className="hud-label bg-abyss/70 text-ink px-2 py-1 whitespace-nowrap backdrop-blur-sm">
                      PLAYER ID: <span className="text-lime">{profile.playerId}</span>
                    </span>
                    <span className="hud-label bg-abyss/70 text-lime hidden items-center gap-1.5 px-2 py-1 backdrop-blur-sm sm:flex">
                      <span className="bg-lime h-1.5 w-1.5 animate-pulse rounded-full" />
                      {t.hud.live}
                    </span>
                  </div>
                  <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4">
                    <p className="font-display text-3xl leading-none font-bold uppercase">
                      {profile.nickname}
                    </p>
                    <p className="hud-label text-ink-2 mt-1">{profile.playerId} · MANADO, ID</p>
                    <div className="mt-3 grid grid-cols-[auto_1fr] items-center gap-x-3 gap-y-1.5">
                      <span className="hud-label text-ink-2 text-[0.625rem]">HP</span>
                      <div className="bg-violet-dim/40 h-1">
                        <motion.div
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: booted ? 0.92 : 0 }}
                          transition={{ duration: 0.9, ease: EASE, delay: 0.6 }}
                          className="bg-lime h-full origin-left"
                        />
                      </div>
                      <span className="hud-label text-ink-2 text-[0.625rem]">XP</span>
                      <div className="bg-violet-dim/40 h-1">
                        <motion.div
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: booted ? 0.68 : 0 }}
                          transition={{ duration: 0.9, ease: EASE, delay: 0.75 }}
                          className="bg-violet h-full origin-left"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Indikator scroll */}
      <motion.a
        href="#profil"
        initial={{ opacity: 0 }}
        animate={{ opacity: booted ? 1 : 0 }}
        transition={{ delay: 1, duration: 0.5 }}
        className="hud-label text-ink-3 hover:text-ink absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 transition-colors md:flex"
      >
        {t.hero.scroll}
        <ArrowDown size={14} className="animate-bounce" aria-hidden />
      </motion.a>
    </section>
  );
}
