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
  bio: {
    id: "Saya adalah mahasiswa Teknik Informatika Universitas Negeri Manado (UNIMA) dengan minat utama pada pengembangan solusi perangkat lunak yang aplikatif dan berdampak. Saya memiliki pengalaman dalam membangun sistem informasi berbasis Laravel dan Filament, mengembangkan model computer vision dengan Python, serta mengelola penerapan dan keamanan server secara mandiri. Dalam setiap proyek, saya menjunjung tinggi kualitas desain dan keandalan kode. Saat ini, saya tengah mengembangkan integrasi Large Language Model (LLM) lokal pada sistem informasi sebagai bagian dari penelitian tugas akhir.",
    en: "I am an Informatics Engineering student at Universitas Negeri Manado (UNIMA) with a primary interest in building practical, impactful software solutions. I have experience developing information systems with Laravel and Filament, building computer vision models with Python, and independently managing server deployment and security. In every project, I hold design quality and code reliability to a high standard. I am currently developing a local Large Language Model (LLM) integration for an information system as part of my undergraduate thesis research.",
  } satisfies Localized,
  bio2: {
    id: "Berdomisili di Manado, Sulawesi Utara. Terbuka untuk peluang magang, proyek lepas, dan kolaborasi penelitian.",
    en: "Based in Manado, North Sulawesi. Open to internship opportunities, freelance projects, and research collaborations.",
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
