"use client";

import { Briefcase, GraduationCap, Trophy, Users } from "lucide-react";
import { motion, useScroll, useSpring } from "motion/react";
import { usePrefersReducedMotion } from "@/lib/hooks";
import { useRef } from "react";
import { useI18n } from "@/components/providers/LanguageProvider";
import { RevealItem } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { timeline } from "@/data/timeline";
import type { TimelineItem } from "@/data/types";
import { EASE } from "@/lib/motion";
import { pad2 } from "@/lib/utils";

const icons: Record<TimelineItem["type"], typeof Briefcase> = {
  work: Briefcase,
  competition: Trophy,
  team: Users,
  education: GraduationCap,
};

export function QuestLog() {
  const { t, l } = useI18n();
  const listRef = useRef<HTMLOListElement>(null);
  const reduced = usePrefersReducedMotion();
  const { scrollYProgress } = useScroll({ target: listRef, offset: ["start 75%", "end 55%"] });
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 24 });

  return (
    <Section id="quest" bgWord={t.quest.bg}>
      <SectionHeading id="quest" label={t.quest.label} lines={t.quest.title} />

      <ol ref={listRef} className="relative mx-auto max-w-4xl">
        {/* Rel timeline + progress yang terisi saat scroll */}
        <span
          aria-hidden
          className="bg-violet-dim/35 absolute top-2 bottom-2 left-[15px] w-px md:left-[calc(9rem+15px)]"
        />
        <motion.span
          aria-hidden
          style={{ scaleY: reduced ? 1 : progress }}
          className="from-lime via-violet-soft to-violet absolute top-2 bottom-2 left-[15px] w-px origin-top bg-linear-to-b md:left-[calc(9rem+15px)]"
        />

        {timeline.map((item, i) => {
          const Icon = icons[item.type];
          return (
            <li
              key={item.id}
              className="relative grid grid-cols-[32px_1fr] gap-x-5 pb-10 last:pb-0 md:grid-cols-[9rem_32px_1fr]"
            >
              <p className="hud-label text-ink-2 hidden pt-2 text-right md:block">{item.period}</p>

              {/* Node yang menyala */}
              <motion.span
                aria-hidden
                initial={{ scale: 0.6, opacity: 0.4 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true, margin: "0px 0px -35% 0px" }}
                transition={{ duration: 0.4, ease: EASE }}
                className="relative z-10 mt-1 grid h-8 w-8 place-items-center"
              >
                <motion.span
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true, margin: "0px 0px -35% 0px" }}
                  transition={{ duration: 0.4 }}
                  className="bg-lime/20 absolute inset-0 rotate-45 shadow-[0_0_20px_rgb(198_255_61/0.55)]"
                />
                <span className="border-lime bg-abyss absolute inset-1.5 rotate-45 border" />
                <Icon size={12} className="text-lime relative" />
              </motion.span>

              <RevealItem
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.15 }}
                className="hud-panel clip-corner-tr p-5 sm:p-6"
              >
                <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="hud-label text-lime">Q-{pad2(timeline.length - i)}</span>
                  <span className="hud-label text-violet-soft">{t.quest.types[item.type]}</span>
                  <span className="hud-label text-ink-2 md:hidden">· {item.period}</span>
                </div>
                <h3 className="font-display text-3xl leading-none font-bold uppercase">
                  {l(item.title)}
                </h3>
                <p className="text-ink-2 mt-1 font-medium">{item.org}</p>
                <p className="text-ink-2 mt-3 leading-relaxed">{l(item.description)}</p>
              </RevealItem>
            </li>
          );
        })}
      </ol>
    </Section>
  );
}
