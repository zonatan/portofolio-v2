/** Teks dua bahasa. `id` = Bahasa Indonesia, `en` = English. */
export type Localized = { id: string; en: string };

export type Locale = "id" | "en";

export type ProjectCategory = "web" | "ai" | "cv" | "devops" | "uiux" | "vr" | "automation";

export type ProjectStatus = "done" | "progress" | "archived";

export type Project = {
  slug: string;
  title: string;
  /** Kategori pertama dipakai sebagai label utama kartu. */
  category: ProjectCategory[];
  status: ProjectStatus;
  year: string;
  summary: Localized;
  description: Localized;
  role: Localized;
  tech: string[];
  /** Path gambar cover (16:9). Boleh .svg / .jpg / .png / .webp. */
  cover: string;
  /** Galeri gambar tambahan (16:9). */
  gallery: string[];
  /** Kosongkan (undefined) jika belum ada → tombol tampil "SEGERA" dan nonaktif. */
  demoUrl?: string;
  repoUrl?: string;
  featured: boolean;
};

export type SkillGroupKey = "frontend" | "backend" | "aicv" | "devops" | "design";

export type Skill = {
  name: string;
  /** Kunci ikon di `src/components/ui/TechIcon.tsx`. */
  icon: string;
  /** 1–5 */
  level: 1 | 2 | 3 | 4 | 5;
  note: Localized;
};

export type SkillGroup = {
  key: SkillGroupKey;
  skills: Skill[];
};

export type TimelineItem = {
  id: string;
  period: string;
  title: Localized;
  org: string;
  description: Localized;
  type: "work" | "competition" | "team" | "education";
};
