/** Urutan & ID section. Nomor dihitung otomatis supaya selalu berurutan 01–05. */
export const sections = [
  { id: "beranda", hud: "PLAYER ENTRY", navKey: "home" },
  { id: "profil", hud: "PLAYER PROFILE", navKey: "profile" },
  { id: "loadout", hud: "LOADOUT", navKey: "loadout" },
  { id: "misi", hud: "MISSIONS", navKey: "missions" },
  { id: "quest", hud: "QUEST LOG", navKey: "quest" },
  { id: "aktivitas", hud: "ACTIVITY FEED", navKey: "activity" },
  { id: "kontak", hud: "COMMS CHANNEL", navKey: "comms" },
  { id: "buku-tamu", hud: "PLAYER LOG", navKey: "guestbook" },
  { id: "arcade", hud: "BONUS STAGE", navKey: "arcade" },
] as const;

export type SectionId = (typeof sections)[number]["id"];
export type NavKey = (typeof sections)[number]["navKey"];

/** "00" untuk hero, lalu "01".."05". */
export const sectionNumber = (id: SectionId) =>
  String(sections.findIndex((s) => s.id === id)).padStart(2, "0");
