import Image from "next/image";

/**
 * Lapisan efek animasi di atas foto (taruh di dalam wadah foto yang `relative overflow-hidden`):
 * - glitch: sesekali foto "tersendat" — irisan bergeser dengan warna digital
 * - scan:   garis scan lime menyapu dari atas ke bawah secara berkala
 * - shine:  kilau holografik melintas secara berkala
 * Semua murni CSS (lihat globals.css) dan mati otomatis untuk prefers-reduced-motion.
 */
export function PhotoFX({
  src,
  sizes,
  objectClass = "object-cover",
  glitch = false,
  scan = false,
  shine = false,
  delay = 0,
}: {
  src?: string;
  sizes?: string;
  objectClass?: string;
  glitch?: boolean;
  scan?: boolean;
  shine?: boolean;
  /** Geser jadwal animasi (detik) agar beberapa foto tidak serempak. */
  delay?: number;
}) {
  const style = { "--d": `${delay}s` } as React.CSSProperties;
  return (
    <>
      {glitch && src && (
        <>
          <Image
            src={src}
            alt=""
            aria-hidden
            fill
            loading="eager"
            sizes={sizes}
            className={`glitch-a pointer-events-none ${objectClass}`}
            style={style}
          />
          <Image
            src={src}
            alt=""
            aria-hidden
            fill
            loading="eager"
            sizes={sizes}
            className={`glitch-b pointer-events-none ${objectClass}`}
            style={style}
          />
        </>
      )}
      {scan && (
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className="photo-scan via-lime/25 absolute inset-x-0 top-0 h-[12%] bg-linear-to-b from-transparent to-transparent"
            style={style}
          >
            <div className="bg-lime absolute inset-x-0 top-1/2 h-px shadow-[0_0_14px_rgb(198_255_61/0.9)]" />
          </div>
        </div>
      )}
      {shine && (
        <div
          aria-hidden
          className="photo-shine pointer-events-none absolute inset-0"
          style={style}
        />
      )}
    </>
  );
}
