"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { usePrefersReducedMotion } from "@/lib/hooks";
import { useRef } from "react";
import type { SectionId } from "@/data/sections";
import { cn } from "@/lib/utils";

/** Teks latar raksasa transparan yang bergeser horizontal mengikuti scroll. */
function BgWord({ word, target }: { word: string; target: React.RefObject<HTMLElement | null> }) {
  const reduced = usePrefersReducedMotion();
  const { scrollYProgress } = useScroll({ target, offset: ["start end", "end start"] });
  const x = useTransform(scrollYProgress, [0, 1], ["6%", "-14%"]);
  return (
    <motion.div
      aria-hidden
      style={reduced ? undefined : { x }}
      className="text-stroke font-display pointer-events-none absolute -top-4 left-0 text-[28vw] leading-none font-bold whitespace-nowrap uppercase select-none md:-top-10 md:text-[18vw]"
    >
      {word}
    </motion.div>
  );
}

export function Section({
  id,
  bgWord,
  children,
  className,
  innerClassName,
}: {
  id: SectionId;
  bgWord?: string;
  children: React.ReactNode;
  className?: string;
  innerClassName?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  return (
    <section
      id={id}
      ref={ref}
      data-sector={id}
      className={cn("relative overflow-x-clip py-20 md:py-28", className)}
    >
      {bgWord && <BgWord word={bgWord} target={ref} />}
      <div className={cn("relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8", innerClassName)}>
        {children}
      </div>
    </section>
  );
}
