import { Ticker } from "@/components/layout/Ticker";
import { Activity } from "@/components/sections/Activity";
import { Arcade } from "@/components/sections/arcade/Arcade";
import { Comms } from "@/components/sections/Comms";
import { Guestbook } from "@/components/sections/Guestbook";
import { Hero } from "@/components/sections/Hero";
import { Loadout } from "@/components/sections/Loadout";
import { Missions } from "@/components/sections/missions/Missions";
import { Profile } from "@/components/sections/Profile";
import { QuestLog } from "@/components/sections/QuestLog";
import { profile } from "@/data/profile";
import { getGitHubData } from "@/lib/server/github";
import { computeTrophies } from "@/lib/trophies";

// Halaman diperbarui otomatis tiap 1 jam (data GitHub live).
export const revalidate = 3600;

export default async function Home() {
  const github = await getGitHubData(profile.githubUsername).catch(() => null);
  // Trophy dihitung di server agar nilainya sama persis saat hydration
  const trophies = github ? computeTrophies(github) : [];

  return (
    <>
      <Hero />
      <Ticker />
      <Profile />
      <Loadout />
      <Missions />
      <Ticker />
      <QuestLog />
      <Activity github={github} trophies={trophies} />
      <Comms />
      <Guestbook />
      <Arcade />
    </>
  );
}
