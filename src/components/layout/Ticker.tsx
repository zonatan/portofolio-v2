import { tickerItems } from "@/data/profile";

/** Ticker tech stack yang berjalan terus; berhenti saat di-hover. */
export function Ticker() {
  const row = (hidden: boolean) => (
    <ul aria-hidden={hidden || undefined} className="flex shrink-0 items-center">
      {tickerItems.map((item) => (
        <li
          key={item}
          className="font-display text-ink-2 flex items-center text-2xl font-semibold tracking-wider uppercase md:text-3xl"
        >
          <span className="px-6">{item}</span>
          <span aria-hidden className="bg-lime/80 h-1.5 w-1.5 rotate-45" />
        </li>
      ))}
    </ul>
  );
  return (
    <div className="marquee border-violet-dim/30 bg-surface/60 relative overflow-hidden border-y py-3">
      <div className="from-abyss pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-linear-to-r to-transparent" />
      <div className="from-abyss pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-linear-to-l to-transparent" />
      <div className="marquee-track animate-marquee flex w-max">
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}
