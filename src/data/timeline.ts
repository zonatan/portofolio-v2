import type { TimelineItem } from "./types";

/** Pengalaman ("QUEST LOG"), urut dari yang terbaru. */
export const timeline: TimelineItem[] = [
  {
    id: "strom-krti",
    period: "2026", // TODO: ganti — periode
    title: { id: "Anggota Tim STROM", en: "STROM Team Member" },
    org: "KRTI 2026 — Kontes Robot Terbang Indonesia",
    description: {
      // TODO: ganti — peran di tim
      id: "Bergabung dengan tim STROM untuk KRTI 2026. TODO: jelaskan peran dan kontribusi kamu.",
      en: "Joined team STROM for KRTI 2026. TODO: describe your role and contribution.",
    },
    type: "team",
  },
  {
    id: "magang-diskominfo",
    period: "2025", // TODO: ganti — periode, mis. "Jul – Sep 2025"
    title: { id: "Magang — Pengembang Web", en: "Web Developer Intern" },
    org: "Diskominfo Kota Tomohon",
    description: {
      id: "Membangun SIM Notulen & Tindak Lanjut Rapat untuk membantu pencatatan dan pemantauan hasil rapat dinas.",
      en: "Built a meeting minutes & follow-up management system to help record and track agency meeting outcomes.",
    },
    type: "work",
  },
  {
    id: "gemastik",
    period: "2025", // TODO: ganti — periode
    title: { id: "Peserta Gemastik", en: "Gemastik Participant" },
    org: "Gemastik — TourMind AI",
    description: {
      id: "Mengembangkan TourMind AI, sistem prediksi dan optimalisasi pengelolaan wisata Kota Tomohon, bersama tim.",
      en: "Developed TourMind AI, a prediction and optimization system for Tomohon tourism management, with my team.",
    },
    type: "competition",
  },
  {
    id: "kuliah-unima",
    period: "2022 — Sekarang", // TODO: ganti — tahun masuk
    title: { id: "Mahasiswa Teknik Informatika", en: "Informatics Engineering Student" },
    org: "Universitas Negeri Manado (UNIMA)",
    description: {
      id: "Mendalami rekayasa perangkat lunak, computer vision, dan jaringan, sambil aktif mengerjakan proyek nyata di luar kelas.",
      en: "Studying software engineering, computer vision, and networking while actively building real projects outside class.",
    },
    type: "education",
  },
];
