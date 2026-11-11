"use client";

import { motion, useMotionValue, useSpring } from "motion/react";
import { useRef } from "react";
import { useFinePointer } from "@/lib/hooks";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost";

type Props = {
  children: React.ReactNode;
  variant?: Variant;
  href?: string;
  external?: boolean;
  download?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  type?: "button" | "submit";
  disabled?: boolean;
  className?: string;
  ariaLabel?: string;
  magnetic?: boolean;
  size?: "md" | "sm";
};

const styles: Record<Variant, string> = {
  primary: "bg-lime text-abyss",
  secondary: "hud-panel text-violet-soft group-hover:text-ink group-hover:bg-violet/10",
  ghost: "text-ink-2 group-hover:text-ink",
};

/** Glow di wrapper (tidak ter-clip) memakai drop-shadow. */
const glow: Record<Variant, string> = {
  primary: "hover:drop-shadow-[0_0_14px_rgb(198_255_61/0.45)]",
  secondary: "hover:drop-shadow-[0_0_14px_rgb(139_92_246/0.6)]",
  ghost: "",
};

/**
 * Tombol HUD: sudut terpotong, magnetic (desktop), kilatan cahaya saat hover, efek press saat klik.
 */
export function Button({
  children,
  variant = "primary",
  href,
  external,
  download,
  onClick,
  type = "button",
  disabled,
  className,
  ariaLabel,
  magnetic = true,
  size = "md",
}: Props) {
  const ref = useRef<HTMLElement>(null);
  const fine = useFinePointer();
  const x = useSpring(useMotionValue(0), { stiffness: 220, damping: 18, mass: 0.4 });
  const y = useSpring(useMotionValue(0), { stiffness: 220, damping: 18, mass: 0.4 });

  const onMove = (e: React.PointerEvent) => {
    if (!fine || !magnetic || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * 0.25);
    y.set((e.clientY - (r.top + r.height / 2)) * 0.35);
  };
  const reset = () => {
    x.set(0);
    y.set(0);
  };

  const cls = cn(
    "group relative inline-flex shrink-0 transition-[filter] duration-200",
    glow[variant],
    disabled && "cursor-not-allowed opacity-50",
    className,
  );
  const inner = (
    <span
      className={cn(
        "sweep clip-corner-sm inline-flex w-full items-center justify-center gap-2 font-mono font-semibold tracking-[0.14em] whitespace-nowrap uppercase transition-colors duration-200",
        size === "md" ? "h-12 px-6 text-xs" : "h-10 px-4 text-[0.6875rem]",
        styles[variant],
      )}
    >
      {children}
    </span>
  );

  const motionProps = {
    style: { x, y },
    onPointerMove: onMove,
    onPointerLeave: reset,
    whileTap: disabled ? undefined : { scale: 0.97 },
    "data-cursor": "hover",
  };

  if (href && !disabled) {
    return (
      <motion.a
        ref={ref as React.Ref<HTMLAnchorElement>}
        href={href}
        className={cls}
        aria-label={ariaLabel}
        onClick={onClick}
        download={download || undefined}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        {...motionProps}
      >
        {inner}
      </motion.a>
    );
  }

  return (
    <motion.button
      ref={ref as React.Ref<HTMLButtonElement>}
      type={type}
      className={cls}
      aria-label={ariaLabel}
      onClick={onClick}
      disabled={disabled}
      {...motionProps}
    >
      {inner}
    </motion.button>
  );
}
