import { cn } from "@/lib/utils";

/** Interpolasi warna sisi emblem: belakang gelap → depan terang. */
function depthColor(t: number) {
  const a = [28, 21, 56]; // #1c1538
  const b = [91, 63, 184]; // #5b3fb8
  const c = a.map((v, i) => Math.round(v + (b[i] - v) * t));
  return `rgb(${c[0]} ${c[1]} ${c[2]})`;
}

/**
 * Emblem monogram "ZS" 3D (CSS 3D murni, tanpa library).
 * Dibuat dari tumpukan lapisan SVG di sumbu Z sehingga terlihat tebal, lalu bergoyang
 * dan sesekali berputar penuh (animasi `emblem-spin` di globals.css).
 *
 * @param layers      jumlah lapisan (lebih banyak = sisi lebih halus)
 * @param depth       jarak antar lapisan dalam px (total tebal = layers × depth)
 * @param perspective jarak kamera; kecilkan untuk logo kecil agar efek 3D tetap terasa
 */
export function Emblem3D({
  className,
  layers = 10,
  depth = 0.8,
  perspective = 160,
  label = "ZS",
}: {
  className?: string;
  layers?: number;
  depth?: number;
  perspective?: number;
  label?: string;
}) {
  return (
    <span
      role="img"
      aria-label={label}
      className={cn("pointer-events-none inline-block", className)}
      style={{ perspective }}
    >
      <span
        className="emblem-spin relative block h-full w-full"
        style={{ transformStyle: "preserve-3d" }}
      >
        {Array.from({ length: layers }).map((_, i) => {
          const t = i / (layers - 1);
          const front = i === layers - 1;
          const back = i === 0;
          const side = depthColor(t);
          // dibulatkan agar HTML server & browser identik
          const z = Math.round((i - (layers - 1) / 2) * depth * 100) / 100;
          return (
            <svg
              key={i}
              viewBox="0 0 48 48"
              fill="none"
              aria-hidden
              className="absolute inset-0 h-full w-full"
              style={{ transform: `translateZ(${z}px)` }}
            >
              <path
                d="M10 2H38L46 10V38L38 46H10L2 38V10Z"
                fill={front ? "rgb(139 92 246 / 0.14)" : back ? "rgb(16 14 26 / 0.95)" : "none"}
                stroke={front ? "#a78bfa" : side}
                strokeWidth={2.2}
              />
              <path
                d="M12 15H24L13 33H24"
                stroke={front ? "#c6ff3d" : side}
                strokeWidth={3.6}
                strokeLinecap="square"
                strokeLinejoin="miter"
              />
              <path
                d="M37 15H28V24H36V33H27"
                stroke={front ? "#f1eefc" : side}
                strokeWidth={3.6}
                strokeLinecap="square"
                strokeLinejoin="miter"
              />
            </svg>
          );
        })}
      </span>
    </span>
  );
}
