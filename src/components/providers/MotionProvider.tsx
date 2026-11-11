"use client";

import { MotionConfig } from "motion/react";

/** Menghormati prefers-reduced-motion: animasi transform/layout dimatikan, opacity tetap. */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
