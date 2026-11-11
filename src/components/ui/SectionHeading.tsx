"use client";

import { motion } from "motion/react";
import { sectionNumber, type SectionId } from "@/data/sections";
import {
  lineGrowVariants,
  maskLineVariants,
  revealVariants,
  staggerContainer,
  VIEWPORT,
} from "@/lib/motion";
import { cn } from "@/lib/utils";
import { CountUp } from "./AnimatedText";

/**
 * Judul section: garis memanjang kiri→kanan, label "SECTOR 0X // NAMA",
 * lalu judul muncul per baris dengan efek mask.
 */
export function SectionHeading({
  id,
  label,
  lines,
  intro,
  className,
}: {
  id: SectionId;
  label: string;
  lines: string[];
  intro?: string;
  className?: string;
}) {
  const num = sectionNumber(id);
  return (
    <motion.header
      variants={staggerContainer(0.08)}
      initial="hidden"
      whileInView="visible"
      viewport={VIEWPORT}
      className={cn("mb-12 max-w-3xl md:mb-16", className)}
    >
      <motion.div
        data-reveal
        variants={lineGrowVariants}
        className="from-violet via-violet-dim/60 mb-4 h-px w-full max-w-md origin-left bg-linear-to-r to-transparent"
      />
      <motion.p
        data-reveal
        variants={revealVariants}
        className="hud-label text-ink-3 mb-5 flex items-center gap-2"
      >
        <span className="text-lime">
          SECTOR <CountUp to={Number(num)} pad={2} duration={0.6} />
        </span>
        <span aria-hidden className="text-violet-dim">
          {"//"}
        </span>
        <span className="text-ink-2">{label}</span>
      </motion.p>
      <h2 className="font-display text-5xl leading-[0.88] font-bold uppercase sm:text-6xl lg:text-7xl">
        {lines.map((line, i) => (
          <span key={i} className="block overflow-hidden pb-1">
            <motion.span
              data-reveal
              variants={maskLineVariants}
              className={cn("block", i === 1 && "text-violet-soft")}
            >
              {line}
            </motion.span>
          </span>
        ))}
      </h2>
      {intro && (
        <motion.p
          data-reveal
          variants={revealVariants}
          className="text-ink-2 mt-6 max-w-2xl text-base leading-relaxed md:text-lg"
        >
          {intro}
        </motion.p>
      )}
    </motion.header>
  );
}
