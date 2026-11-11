"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useI18n } from "@/components/providers/LanguageProvider";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { StatRadar } from "./StatRadar";
import { TechIcon } from "@/components/ui/TechIcon";
import { skillGroups } from "@/data/skills";
import type { Skill } from "@/data/types";
import { EASE } from "@/lib/motion";
import { cn, pad2 } from "@/lib/utils";

function SkillSlot({ skill, index }: { skill: Skill; index: number }) {
  const { t, l } = useI18n();
  const [open, setOpen] = useState(false);
  const tipId = `tip-${skill.name.replace(/\W/g, "")}`;

  return (
    <RevealItem as="li" className="relative">
      <div
        tabIndex={0}
        role="group"
        aria-label={`${skill.name}, ${t.loadout.level} ${skill.level}/5`}
        aria-describedby={tipId}
        onPointerEnter={() => setOpen(true)}
        onPointerLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        data-cursor="hover"
        className={cn(
          "hud-panel clip-corner-sm group relative flex h-full flex-col gap-3 p-3 transition-[background-color,filter] duration-200 sm:p-4",
          "hover:bg-raised focus-visible:bg-raised",
        )}
      >
        <div className="flex items-start justify-between">
          <span
            className={cn(
              "border-violet-dim/50 bg-abyss/60 text-violet-soft grid h-10 w-10 place-items-center border transition-colors duration-200",
              "group-hover:border-lime/60 group-hover:text-lime group-focus-visible:text-lime",
            )}
          >
            <TechIcon name={skill.icon} size={20} />
          </span>
          <span className="hud-label text-ink-3 text-[0.625rem]">#{pad2(index + 1)}</span>
        </div>
        <p className="font-display text-xl leading-tight font-semibold uppercase">{skill.name}</p>
        <div className="mt-auto">
          <div className="mb-1.5 flex items-center justify-between">
            <span className="hud-label text-ink-3 text-[0.625rem]">{t.loadout.level}</span>
            <span className="text-lime font-mono text-xs">{skill.level}/5</span>
          </div>
          <div className="bg-violet-dim/30 relative h-1.5" aria-hidden>
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: skill.level / 5 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.6, ease: EASE, delay: 0.15 }}
              className="from-violet to-lime absolute inset-0 origin-left bg-linear-to-r"
            />
            {/* Pemisah segmen */}
            <div className="absolute inset-0 grid grid-cols-5">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} className="border-surface border-r-2 last:border-r-0" />
              ))}
            </div>
          </div>
        </div>
        {/* Glow saat hover */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_0%,rgb(139_92_246/0.25),transparent_60%)] opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100"
        />
      </div>

      {/* Tooltip ala item game */}
      <span id={tipId} className="sr-only">
        {t.loadout.levelNames[skill.level]} — {l(skill.note)}
      </span>
      <AnimatePresence>
        {open && (
          <motion.div
            aria-hidden
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            transition={{ duration: 0.16, ease: EASE }}
            className="pointer-events-none absolute inset-x-0 bottom-[calc(100%+8px)] z-30 sm:inset-x-auto sm:left-1/2 sm:w-56 sm:-translate-x-1/2"
          >
            <div className="clip-corner-sm border-lime/40 bg-abyss/95 border p-3 shadow-[0_10px_40px_-10px_rgb(139_92_246/0.6)] backdrop-blur">
              <div className="flex items-center justify-between gap-2">
                <p className="font-display text-lg leading-none font-semibold uppercase">
                  {skill.name}
                </p>
                <span className="hud-label text-lime text-[0.625rem]">
                  {t.loadout.level} {skill.level}
                </span>
              </div>
              <p className="hud-label text-violet-soft mt-1 text-[0.625rem]">
                {t.loadout.levelNames[skill.level]}
              </p>
              <p className="text-ink-2 mt-2 text-xs leading-relaxed">{l(skill.note)}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </RevealItem>
  );
}

export function Loadout() {
  const { t } = useI18n();
  const offsets = skillGroups.map((_, gi) =>
    skillGroups.slice(0, gi).reduce((sum, g) => sum + g.skills.length, 0),
  );

  return (
    <Section id="loadout" bgWord={t.loadout.bg}>
      {/* Header: judul & deskripsi (kiri) + Attribute Radar (kanan) */}
      <div className="mb-14 grid items-center gap-10 md:mb-16 lg:grid-cols-12 lg:gap-12">
        <SectionHeading
          id="loadout"
          label={t.loadout.label}
          lines={t.loadout.title}
          intro={t.loadout.intro}
          className="mb-0 lg:col-span-7"
        />
        <Reveal className="mx-auto w-full max-w-md lg:col-span-5 lg:max-w-none">
          <StatRadar />
        </Reveal>
      </div>

      <div className="space-y-10">
        {skillGroups.map((group, gi) => (
          <div key={group.key}>
            <Reveal className="mb-4 flex items-center gap-3">
              <h3 className="text-violet-soft font-mono text-xs font-semibold tracking-[0.2em] uppercase">
                {t.loadout.groups[group.key]}
              </h3>
              <span className="from-violet-dim/50 h-px flex-1 bg-linear-to-r to-transparent" />
              <span className="hud-label text-ink-3 text-[0.625rem]">
                {group.skills.length} SLOT
              </span>
            </Reveal>
            <RevealGroup
              as="ul"
              stagger={0.06}
              className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"
            >
              {group.skills.map((skill, i) => (
                <SkillSlot key={skill.name} skill={skill} index={offsets[gi] + i} />
              ))}
            </RevealGroup>
          </div>
        ))}
      </div>
    </Section>
  );
}
