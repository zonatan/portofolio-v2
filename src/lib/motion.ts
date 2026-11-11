import type { Transition, Variants } from "motion/react";

/**
 * Preset motion bersama — semua animasi memakai nilai dari sini agar konsisten.
 * Easing utama: ease-out tajam. Hanya animasikan transform / opacity (/ clip-path seperlunya).
 */
export const EASE = [0.22, 1, 0.36, 1] as const;
export const EASE_IN_OUT = [0.65, 0, 0.35, 1] as const;

export const DURATION = {
  micro: 0.18,
  reveal: 0.45,
  large: 0.7,
} as const;

export const STAGGER = 0.07;

/** Elemen mulai beranimasi saat ~15% masuk viewport. */
export const VIEWPORT = { once: true, amount: 0.15 } as const;

export const transition = {
  micro: { duration: DURATION.micro, ease: EASE } satisfies Transition,
  reveal: { duration: DURATION.reveal, ease: EASE } satisfies Transition,
  large: { duration: DURATION.large, ease: EASE } satisfies Transition,
  spring: { type: "spring", stiffness: 260, damping: 26, mass: 0.6 } satisfies Transition,
  layout: { type: "spring", stiffness: 380, damping: 34 } satisfies Transition,
};

/** Fade + naik 24px (tanpa filter blur — filter mahal saat scroll). */
export const revealVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: transition.reveal,
  },
};

/** Container yang men-stagger anak-anaknya. */
export const staggerContainer = (stagger = STAGGER, delayChildren = 0): Variants => ({
  hidden: {},
  visible: { transition: { staggerChildren: stagger, delayChildren } },
});

/** Teks naik dari balik garis (dipakai dengan wrapper overflow-hidden). */
export const maskLineVariants: Variants = {
  hidden: { y: "105%" },
  visible: { y: "0%", transition: { duration: DURATION.large, ease: EASE } },
};

/** Garis memanjang dari kiri ke kanan. */
export const lineGrowVariants: Variants = {
  hidden: { scaleX: 0 },
  visible: { scaleX: 1, transition: { duration: DURATION.reveal, ease: EASE } },
};

export const fadeVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: transition.reveal },
};

export const modalBackdrop: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.25, ease: EASE } },
  exit: { opacity: 0, transition: { duration: 0.2, ease: EASE } },
};

export const modalPanel: Variants = {
  hidden: { opacity: 0, y: 32, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1, transition: transition.large },
  exit: { opacity: 0, y: 16, scale: 0.98, transition: { duration: 0.2, ease: EASE } },
};
