import { cn } from "@/lib/utils";

type Tone = "lime" | "violet" | "magenta" | "muted";

const tones: Record<Tone, string> = {
  lime: "border-lime/40 bg-lime/10 text-lime",
  violet: "border-violet/50 bg-violet/10 text-violet-soft",
  magenta: "border-magenta/45 bg-magenta/10 text-magenta",
  muted: "border-ink-3/40 bg-raised/80 text-ink-2",
};

export function StatusChip({
  children,
  tone = "violet",
  pulse,
  className,
}: {
  children: React.ReactNode;
  tone?: Tone;
  pulse?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "clip-corner-sm inline-flex items-center gap-1.5 border px-2 py-1 font-mono text-[0.625rem] leading-none font-semibold tracking-[0.18em] whitespace-nowrap uppercase",
        tones[tone],
        className,
      )}
    >
      {pulse && (
        <span aria-hidden className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-60" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-current" />
        </span>
      )}
      {children}
    </span>
  );
}
