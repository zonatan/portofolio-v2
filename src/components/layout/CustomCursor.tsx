"use client";

import { motion, useMotionValue, useSpring } from "motion/react";
import { useEffect, useState } from "react";
import { useFinePointer } from "@/lib/hooks";
import { cn } from "@/lib/utils";

const INTERACTIVE = 'a,button,[role="button"],input,textarea,select,label,[data-cursor="hover"]';

/** Cursor kustom (desktop saja): titik + crosshair yang membesar di atas elemen interaktif. */
export function CustomCursor() {
  const enabled = useFinePointer();
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const rx = useSpring(x, { stiffness: 500, damping: 40, mass: 0.4 });
  const ry = useSpring(y, { stiffness: 500, damping: 40, mass: 0.4 });
  const [hover, setHover] = useState(false);
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    if (!enabled) return;
    const root = document.documentElement;
    root.classList.add("has-cursor");
    const move = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      setHidden(false);
      setHover(!!(e.target as Element | null)?.closest?.(INTERACTIVE));
    };
    const leave = () => setHidden(true);
    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerleave", leave);
    return () => {
      root.classList.remove("has-cursor");
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerleave", leave);
    };
  }, [enabled, x, y]);

  if (!enabled) return null;

  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none fixed inset-0 z-[90] transition-opacity duration-200",
        hidden && "opacity-0",
      )}
    >
      <motion.div
        style={{ x, y }}
        className="bg-lime absolute top-0 left-0 -mt-[3px] -ml-[3px] h-1.5 w-1.5"
      />
      <motion.div style={{ x: rx, y: ry }} className="absolute top-0 left-0">
        <motion.div
          animate={{ scale: hover ? 1.6 : 1, rotate: hover ? 45 : 0 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className={cn(
            "relative -mt-4 -ml-4 h-8 w-8 rounded-full border transition-colors duration-200",
            hover ? "border-lime/80" : "border-violet-soft/60",
          )}
        >
          <span className="text-violet-soft absolute top-1/2 -left-1.5 h-px w-2 bg-current" />
          <span className="text-violet-soft absolute top-1/2 -right-1.5 h-px w-2 bg-current" />
          <span className="text-violet-soft absolute -top-1.5 left-1/2 h-2 w-px bg-current" />
          <span className="text-violet-soft absolute -bottom-1.5 left-1/2 h-2 w-px bg-current" />
        </motion.div>
      </motion.div>
    </div>
  );
}
