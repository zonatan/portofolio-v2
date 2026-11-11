import type { Localized } from "./types";

export type SocialLink = {
  key: "github" | "linkedin" | "instagram";
  label: string;
  /** Username yang ditampilkan. */
  handle: string;
  /** Kosongkan ("") jika belum ada → tampil "SEGERA" dan tombol nonaktif. */
  url: string;
};

export const profile = {
  name: "Zonatan Sihombing",
  nickname: "Zonatan",
  monogram: "ZS",
  playerId: "ZS-01",
  role: {
    id: "Web Developer & Computer Vision Enthusiast",
    en: "Web Developer & Computer Vision Enthusiast",
  } satisfies Localized,
  university: "Universitas Negeri Manado (UNIMA)",
  major: { id: "Teknik Informatika", en: "Informatics Engineering" } satisfies Localized,
  location: "Manado, Sulawesi Utara, Indonesia",
  coordinates: "1.4748° N, 124.8421° E",
  // TODO: ganti — tahun angkatan / semester kuliah
  studyYear: 4,
  email: "zonatan.sh03@gmail.com",
  openToWork: true,
  // TODO: ganti — bio singkat sesuai gaya kamu
  bio: {
    id: "Saya mahasiswa Teknik Informatika UNIMA yang suka membangun sesuatu dari nol sampai benar-benar dipakai orang: dari sistem informasi berbasis Laravel & Filament, model computer vision dengan Python, hingga men-deploy dan mengamankan server sendiri. Saya senang menggabungkan desain yang rapi dengan kode yang bisa dipertanggungjawabkan, dan belakangan banyak bereksperimen mengintegrasikan AI/LLM lokal ke aplikasi nyata.",
    en: "I'm an Informatics Engineering student at UNIMA who likes building things from scratch until people actually use them: Laravel & Filament information systems, computer vision models in Python, and deploying and hardening my own servers. I enjoy pairing clean design with accountable code, and lately I've been experimenting with integrating local AI/LLMs into real applications.",
  } satisfies Localized,
  // TODO: ganti — kalimat kedua bio (opsional)
  bio2: {
    id: "Berbasis di Manado, Sulawesi Utara. Terbuka untuk magang, proyek freelance, dan kolaborasi riset.",
    en: "Based in Manado, North Sulawesi. Open to internships, freelance projects, and research collaborations.",
  } satisfies Localized,
  /** Foto hero (rasio 4:5). Ganti file atau ubah path ini. */
  photo: "/images/profile/foto-utama.webp",
  /** Foto section profil — sisi DEPAN kartu flip (rasio 4:5). */
  photoAbout: "/images/profile/foto-about.webp",
  /** Sisi BELAKANG kartu flip (rasio 4:5). */
  photoAboutBack: "/images/profile/foto-about-back.webp",
  // TODO: ganti — kutipan / motto di balik kartu
  quote: {
    id: "Kode yang baik bukan yang paling rumit, tapi yang benar-benar dipakai dan bisa dirawat.",
    en: "Good code isn't the most complex — it's the code people actually use and can maintain.",
  } satisfies Localized,
  /** File CV (PDF). */
  cv: "/cv/CV-Zonatan-Sihombing.pdf",
  /** Username GitHub untuk section Aktivitas (statistik live). */
  githubUsername: "zonatan",
  socials: [
    { key: "github", label: "GitHub", handle: "zonatan", url: "https://github.com/zonatan" },
    {
      key: "linkedin",
      label: "LinkedIn",
      handle: "in/zonatan",
      url: "https://www.linkedin.com/in/zonatan/",
    },
    {
      key: "instagram",
      label: "Instagram",
      handle: "@zonatansihombing_",
      url: "https://www.instagram.com/zonatansihombing_/",
    },
  ] as SocialLink[],
};

/** Fokus utama, tampil sebagai chip di section profil. */
export const focusAreas: Localized[] = [
  { id: "Web Development", en: "Web Development" },
  { id: "Computer Vision", en: "Computer Vision" },
  { id: "Server / VPS", en: "Server / VPS" },
  { id: "UI/UX Design", en: "UI/UX Design" },
  { id: "Integrasi AI", en: "AI Integration" },
];

/** Isi ticker berjalan di antara section. */
export const tickerItems = [
  "LARAVEL",
  "FILAMENT",
  "TAILWIND",
  "PYTHON",
  "OPENCV",
  "MEDIAPIPE",
  "NEXT.JS",
  "MYSQL",
  "NGINX",
  "LINUX",
  "OLLAMA",
  "FIGMA",
  "UNITY",
];
