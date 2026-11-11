import { Ticker } from "@/components/layout/Ticker";
import { Arcade } from "@/components/sections/arcade/Arcade";
import { Comms } from "@/components/sections/Comms";
import { Hero } from "@/components/sections/Hero";
import { Loadout } from "@/components/sections/Loadout";
import { Missions } from "@/components/sections/missions/Missions";
import { Profile } from "@/components/sections/Profile";
import { QuestLog } from "@/components/sections/QuestLog";

export default function Home() {
  return (
    <>
      <Hero />
      <Ticker />
      <Profile />
      <Loadout />
      <Missions />
      <Ticker />
      <QuestLog />
      <Comms />
      <Arcade />
    </>
  );
}
