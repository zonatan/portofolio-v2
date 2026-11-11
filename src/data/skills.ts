import type { SkillGroup } from "./types";

/**
 * Skill ("LOADOUT"). level: 1 (dasar) – 5 (mahir).
 * TODO: ganti — sesuaikan level & catatan dengan kemampuan kamu yang sebenarnya.
 * Ikon yang tersedia lihat `src/components/ui/TechIcon.tsx`.
 */
export const skillGroups: SkillGroup[] = [
  {
    key: "frontend",
    skills: [
      {
        name: "Tailwind CSS",
        icon: "tailwind",
        level: 4,
        note: {
          id: "Dipakai di hampir semua proyek web.",
          en: "Used in nearly every web project.",
        },
      },
      {
        name: "HTML & CSS",
        icon: "html",
        level: 4,
        note: { id: "Layout responsif & aksesibel.", en: "Responsive, accessible layouts." },
      },
      {
        name: "JavaScript",
        icon: "javascript",
        level: 3,
        note: { id: "Interaksi UI & integrasi API.", en: "UI interactions & API integration." },
      },
      {
        name: "Next.js / React",
        icon: "nextjs",
        level: 2,
        note: {
          id: "Sedang didalami — situs ini salah satunya.",
          en: "Currently leveling up — this site is one result.",
        },
      },
    ],
  },
  {
    key: "backend",
    skills: [
      {
        name: "Laravel",
        icon: "laravel",
        level: 4,
        note: {
          id: "Stack utama untuk sistem informasi.",
          en: "Main stack for information systems.",
        },
      },
      {
        name: "Filament",
        icon: "filament",
        level: 4,
        note: { id: "Panel admin cepat & rapi.", en: "Fast, clean admin panels." },
      },
      {
        name: "PHP",
        icon: "php",
        level: 4,
        note: {
          id: "Dasar dari semua proyek Laravel.",
          en: "Foundation of every Laravel project.",
        },
      },
      {
        name: "MySQL",
        icon: "mysql",
        level: 3,
        note: { id: "Desain skema & query relasional.", en: "Schema design & relational queries." },
      },
    ],
  },
  {
    key: "aicv",
    skills: [
      {
        name: "Python",
        icon: "python",
        level: 4,
        note: { id: "CV, otomasi, dan bot.", en: "CV, automation, and bots." },
      },
      {
        name: "OpenCV",
        icon: "opencv",
        level: 3,
        note: {
          id: "Pengolahan citra & video real-time.",
          en: "Real-time image & video processing.",
        },
      },
      {
        name: "MediaPipe",
        icon: "mediapipe",
        level: 3,
        note: { id: "Deteksi tangan & pose.", en: "Hand & pose detection." },
      },
      {
        name: "Ollama / LLM",
        icon: "ollama",
        level: 3,
        note: { id: "Integrasi LLM lokal ke aplikasi.", en: "Integrating local LLMs into apps." },
      },
    ],
  },
  {
    key: "devops",
    skills: [
      {
        name: "Linux",
        icon: "linux",
        level: 4,
        note: { id: "Administrasi server sehari-hari.", en: "Day-to-day server administration." },
      },
      {
        name: "Nginx",
        icon: "nginx",
        level: 3,
        note: { id: "Reverse proxy, SSL, virtual host.", en: "Reverse proxy, SSL, virtual hosts." },
      },
      {
        name: "Git",
        icon: "git",
        level: 3,
        note: { id: "Versioning & kolaborasi tim.", en: "Versioning & team collaboration." },
      },
      {
        name: "VPS Hardening",
        icon: "server",
        level: 3,
        note: { id: "Firewall, SSH key, backup.", en: "Firewall, SSH keys, backups." },
      },
    ],
  },
  {
    key: "design",
    skills: [
      {
        name: "Figma",
        icon: "figma",
        level: 4,
        note: { id: "Wireframe sampai prototipe.", en: "Wireframes to prototypes." },
      },
      {
        name: "UI/UX",
        icon: "palette",
        level: 3,
        note: { id: "User flow & desain antarmuka.", en: "User flows & interface design." },
      },
      {
        name: "Unity (VR)",
        icon: "unity",
        level: 2,
        note: { id: "Dipakai untuk proyek skripsi VR.", en: "Used for my VR thesis project." },
      },
    ],
  },
];
