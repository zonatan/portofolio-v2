"use client";

import { MapPin } from "lucide-react";
import { useI18n } from "@/components/providers/LanguageProvider";
import { CountUp } from "@/components/ui/AnimatedText";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { StatusChip } from "@/components/ui/StatusChip";
import { focusAreas, profile } from "@/data/profile";
import { projects } from "@/data/projects";
import { PlayerCard } from "./PlayerCard";

export function Profile() {
  const { t, l } = useI18n();
  const s = t.profile.stats;

  const stats = [
    { label: s.year, value: <CountUp to={profile.studyYear} pad={2} />, sub: "UNIMA" },
    { label: s.projects, value: <CountUp to={projects.length} pad={2} />, sub: "MISSIONS" },
    {
      label: s.location,
      value: <span className="text-4xl">MANADO</span>,
      sub: "SULAWESI UTARA",
    },
    {
      label: s.status,
      value: <span className="text-lime text-4xl">{profile.openToWork ? "ONLINE" : "AFK"}</span>,
      sub: profile.openToWork ? s.statusValue : s.statusClosed,
    },
  ];

  return (
    <Section id="profil" bgWord={t.profile.bg}>
      <SectionHeading id="profil" label={t.profile.label} lines={t.profile.title} />

      <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
        {/* Kartu pemain */}
        <Reveal className="mx-auto w-full max-w-sm lg:col-span-5 lg:max-w-none">
          <PlayerCard />
        </Reveal>

        {/* Bio + statistik */}
        <div className="lg:col-span-7">
          <Reveal>
            <p className="text-ink text-lg leading-relaxed md:text-xl">{l(profile.bio)}</p>
            <p className="text-ink-2 mt-4 leading-relaxed">{l(profile.bio2)}</p>
            <p className="text-ink-2 mt-4 flex items-center gap-2 text-sm">
              <MapPin size={14} className="text-lime" aria-hidden />
              {profile.location}
              <span className="hud-label text-ink-3 ml-1">· {profile.coordinates}</span>
            </p>
          </Reveal>

          <Reveal className="mt-8">
            <p className="hud-label text-ink-3 mb-3">{t.profile.focus}</p>
            <ul className="flex flex-wrap gap-2">
              {focusAreas.map((f) => (
                <li key={f.id}>
                  <StatusChip tone="violet">{l(f)}</StatusChip>
                </li>
              ))}
            </ul>
          </Reveal>

          <RevealGroup as="ul" className="mt-10 grid grid-cols-2 gap-3 sm:gap-4">
            {stats.map((st, i) => (
              <RevealItem
                as="li"
                key={i}
                className="hud-panel clip-corner-tr group hover:bg-raised p-4 transition-colors sm:p-5"
              >
                <p className="hud-label text-ink-3">{st.label}</p>
                <p className="font-display text-ink mt-2 text-5xl leading-none font-bold sm:text-6xl">
                  {st.value}
                </p>
                <p className="hud-label text-violet-soft mt-2 truncate text-[0.625rem]">{st.sub}</p>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </div>
    </Section>
  );
}
