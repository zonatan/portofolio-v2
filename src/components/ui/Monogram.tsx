import { cn } from "@/lib/utils";

/**
 * Monogram original "ZS" — oktagon bersudut + huruf Z & S geometris.
 * `draw` mengaktifkan animasi stroke (dipakai boot loader).
 */
export function Monogram({
  className,
  draw = false,
  title = "ZS",
}: {
  className?: string;
  draw?: boolean;
  title?: string;
}) {
  const stroke = draw ? "boot-stroke" : undefined;
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      className={cn("block", className)}
      role="img"
      aria-label={title}
    >
      <path
        d="M10 2H38L46 10V38L38 46H10L2 38V10Z"
        pathLength={1}
        className={stroke}
        stroke="currentColor"
        strokeOpacity={0.55}
        strokeWidth={1.5}
      />
      <path
        d="M12 15H24L13 33H24"
        pathLength={1}
        className={stroke}
        stroke="#c6ff3d"
        strokeWidth={3}
        strokeLinecap="square"
        strokeLinejoin="miter"
        style={draw ? { animationDelay: "0.12s" } : undefined}
      />
      <path
        d="M37 15H28V24H36V33H27"
        pathLength={1}
        className={stroke}
        stroke="currentColor"
        strokeWidth={3}
        strokeLinecap="square"
        strokeLinejoin="miter"
        style={draw ? { animationDelay: "0.24s" } : undefined}
      />
    </svg>
  );
}
