import type { Localized } from "./types";

export type DevlogTag = "release" | "progress" | "learn" | "fix";

export type DevlogEntry = {
  /** Label versi/judul singkat, mis. "v2.0" atau "SKRIPSI". */
  version: string;
  /** Tanggal tampilan bebas, mis. "11 NOV 2026" atau "NOV 2026". */
  date: string;
  tag: DevlogTag;
  title: Localized;
  notes: Localized[];
};

/**
 * PATCH NOTES / DEVLOG — urutkan dari yang TERBARU.
 * Cara menambah: salin satu objek, taruh paling atas, lalu ubah isinya.
 * TODO: ganti — sesuaikan entri skripsi dengan progres aslimu.
 */
export const devlog: DevlogEntry[] = [
  {
    version: "v2.0",
    date: "11 NOV 2026",
    tag: "release",
    title: { id: "Peluncuran portofolio v2", en: "Portfolio v2 launch" },
    notes: [
      {
        id: "Desain baru bertema HUD/game dengan Next.js, Tailwind CSS, dan Motion.",
        en: "New HUD/game-themed design built with Next.js, Tailwind CSS, and Motion.",
      },
      {
        id: "Kartu foto 3D yang bisa dibalik, Attribute Radar, dan mini-game Bug Hunter.",
        en: "Flippable 3D photo card, Attribute Radar, and the Bug Hunter mini-game.",
      },
      {
        id: "Statistik GitHub live dan Patch Notes ini.",
        en: "Live GitHub stats and these Patch Notes.",
      },
    ],
  },
  {
    version: "SKRIPSI",
    date: "2026",
    tag: "progress",
    title: {
      id: "Skripsi: AI Asisten Gereja (SIGER KAIROS)",
      en: "Thesis: AI Church Assistant (SIGER KAIROS)",
    },
    notes: [
      {
        id: "Mengembangkan asisten tanya-jawab jemaat berbasis LLM lokal (Ollama + Qwen 2.5).",
        en: "Building a congregation Q&A assistant on a local LLM (Ollama + Qwen 2.5).",
      },
      {
        id: "Data jemaat tetap di server sendiri — tidak dikirim ke layanan pihak ketiga.",
        en: "Congregation data stays on our own server — never sent to third-party services.",
      },
    ],
  },
];
