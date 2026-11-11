"use client";

import { motion } from "motion/react";
import { EASE } from "@/lib/motion";
import { cn } from "@/lib/utils";

const corners = [
  { pos: "left-0 top-0 border-l-2 border-t-2", from: { x: -14, y: -14 } },
  { pos: "right-0 top-0 border-r-2 border-t-2", from: { x: 14, y: -14 } },
  { pos: "bottom-0 left-0 border-b-2 border-l-2", from: { x: -14, y: 14 } },
  { pos: "bottom-0 right-0 border-b-2 border-r-2", from: { x: 14, y: 14 } },
];

/**
 * Corner bracket di 4 sudut. Jika `animate` di-set, bracket bergerak masuk dari luar.
 * `active` = undefined → selalu tampil (statis).
 */
export function CornerBrackets({
  active,
  size = "h-5 w-5",
  color = "border-violet-soft",
  className,
  delay = 0,
}: {
  active?: boolean;
  size?: string;
  color?: string;
  className?: string;
  delay?: number;
}) {
  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-0 z-10", className)}>
      {corners.map((c, i) => (
        <motion.span
          key={i}
          className={cn("absolute", size, color, c.pos)}
          initial={active === undefined ? false : { ...c.from, opacity: 0 }}
          animate={
            active === undefined || active ? { x: 0, y: 0, opacity: 1 } : { ...c.from, opacity: 0 }
          }
          transition={{ duration: 0.55, ease: EASE, delay: delay + i * 0.05 }}
        />
      ))}
    </div>
  );
}
