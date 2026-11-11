"use client";

import { motion, type HTMLMotionProps } from "motion/react";
import { revealVariants, staggerContainer, VIEWPORT } from "@/lib/motion";

type Props = HTMLMotionProps<"div"> & { as?: "div" | "li" | "ul" | "article" };

/** Satu elemen: fade + naik 24px + blur → tajam saat ~15% terlihat. */
export function Reveal({ children, as = "div", ...rest }: Props) {
  const Comp = motion[as] as typeof motion.div;
  return (
    <Comp
      data-reveal
      variants={revealVariants}
      initial="hidden"
      whileInView="visible"
      viewport={VIEWPORT}
      {...rest}
    >
      {children}
    </Comp>
  );
}

/** Container yang men-stagger anak `<RevealItem>`. */
export function RevealGroup({
  children,
  stagger,
  delay,
  as = "div",
  ...rest
}: Props & { stagger?: number; delay?: number }) {
  const Comp = motion[as] as typeof motion.div;
  return (
    <Comp
      variants={staggerContainer(stagger, delay)}
      initial="hidden"
      whileInView="visible"
      viewport={VIEWPORT}
      {...rest}
    >
      {children}
    </Comp>
  );
}

export function RevealItem({ children, as = "div", ...rest }: Props) {
  const Comp = motion[as] as typeof motion.div;
  return (
    <Comp data-reveal variants={revealVariants} {...rest}>
      {children}
    </Comp>
  );
}
