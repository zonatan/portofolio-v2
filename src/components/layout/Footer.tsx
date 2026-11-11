"use client";

import { ArrowUp } from "lucide-react";
import { useI18n } from "@/components/providers/LanguageProvider";
import { scrollToTarget } from "@/components/providers/SmoothScroll";
import { Monogram } from "@/components/ui/Monogram";
import { SocialIcon } from "@/components/ui/SocialIcon";
import { profile } from "@/data/profile";

const year = new Date().getFullYear();

export function Footer() {
  const { t } = useI18n();
  return (
    <footer id="footer" className="border-violet-dim/30 bg-surface/50 relative border-t">
      <div className="mx-auto flex max-w-7xl flex-col gap-10 px-4 py-14 sm:px-6 md:flex-row md:items-end md:justify-between lg:px-8">
        <div className="max-w-md">
          <p className="hud-label text-lime mb-5">{t.footer.label}</p>
          <div className="flex items-center gap-4">
            <Monogram className="text-violet-soft h-14 w-14" />
            <div>
              <p className="font-display text-3xl leading-none font-bold uppercase">
                {profile.name}
              </p>
              <p className="hud-label text-ink-3 mt-1">
                {profile.playerId} · {profile.coordinates}
              </p>
            </div>
          </div>
          <p className="text-ink-2 mt-5">{t.footer.tagline}</p>
          <ul className="mt-5 flex flex-wrap gap-2">
            {profile.socials.map((s) => (
              <li key={s.key}>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-cursor="hover"
                  className="clip-corner-sm border-violet-dim/40 text-ink-2 hover:border-lime hover:text-lime inline-flex h-10 items-center gap-2 border px-3 font-mono text-xs transition-colors"
                >
                  <SocialIcon name={s.key} size={15} />
                  {s.handle}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col items-start gap-4 md:items-end">
          <button
            type="button"
            onClick={() => scrollToTarget(0)}
            data-cursor="hover"
            className="group hud-panel clip-corner-sm text-violet-soft hover:text-ink inline-flex h-12 items-center gap-3 px-5 font-mono text-xs font-semibold tracking-[0.16em] uppercase transition-colors"
          >
            <ArrowUp
              size={16}
              className="transition-transform duration-200 group-hover:-translate-y-0.5"
            />
            {t.footer.back}
          </button>
          <p className="hud-label text-ink-3">
            © {year} {profile.name}. {t.footer.rights}
          </p>
          <p className="hud-label text-ink-3">{t.footer.built}</p>
        </div>
      </div>
    </footer>
  );
}
