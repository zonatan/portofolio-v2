import type { GitHubData } from "@/lib/server/github";

export type Rank = "S" | "A" | "B" | "C";

export type Trophy = {
  key: "contributor" | "builder" | "streak" | "polyglot" | "veteran" | "influencer";
  value: number;
  rank: Rank | null; // null = terkunci
  /** Target rank berikutnya (null jika sudah S). */
  next: { rank: Rank; at: number } | null;
  /** 0–1 progres menuju rank berikutnya. */
  progress: number;
};

/** Ambang batas per rank: [C, B, A, S]. Ubah di sini jika ingin lebih mudah/sulit. */
const TIERS: Record<Trophy["key"], [number, number, number, number]> = {
  contributor: [1, 100, 500, 1000], // total kontribusi sepanjang masa
  builder: [1, 10, 30, 60], // repo publik
  streak: [3, 7, 30, 100], // streak terpanjang (hari)
  polyglot: [1, 3, 5, 8], // jumlah bahasa di repo
  veteran: [0.5, 1, 3, 5], // umur akun (tahun)
  influencer: [1, 10, 50, 200], // followers
};
const RANKS: Rank[] = ["C", "B", "A", "S"];

export function computeTrophies(d: GitHubData): Trophy[] {
  const years = d.createdAt ? (Date.now() - new Date(d.createdAt).getTime()) / 31_557_600_000 : 0;
  const values: Record<Trophy["key"], number> = {
    contributor: d.stats.totalAllTime ?? 0,
    builder: d.publicRepos ?? 0,
    streak: d.stats.longestStreak ?? 0,
    polyglot: d.languages.length,
    veteran: Math.round(years * 10) / 10,
    influencer: d.followers ?? 0,
  };

  return (Object.keys(TIERS) as Trophy["key"][]).map((key) => {
    const tiers = TIERS[key];
    const value = values[key];
    let idx = -1;
    tiers.forEach((th, i) => value >= th && (idx = i));
    const rank = idx >= 0 ? RANKS[idx] : null;
    const nextIdx = idx + 1;
    const next = nextIdx < tiers.length ? { rank: RANKS[nextIdx], at: tiers[nextIdx] } : null;
    const prevAt = idx >= 0 ? tiers[idx] : 0;
    const progress = next ? Math.max(0, Math.min(1, (value - prevAt) / (next.at - prevAt))) : 1;
    return { key, value, rank, next, progress };
  });
}
