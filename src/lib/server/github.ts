/**
 * Data GitHub untuk section Aktivitas (HANYA dipanggil di server).
 * - Profil & repo: GitHub REST API (publik).
 * - Kontribusi harian per tahun: halaman publik github.com/users/<user>/contributions.
 * - Achievement resmi: halaman profil publik github.com/<user>.
 * Semua di-cache ~1 jam (ISR). Opsional: env GITHUB_TOKEN untuk batas API lebih longgar.
 */

export type GitHubRepo = {
  name: string;
  description: string | null;
  language: string | null;
  stars: number;
  pushedAt: string;
  url: string;
};
export type ContributionDay = { date: string; level: number; count: number };
export type GitHubAchievement = { slug: string; name: string; image: string; tier: string | null };
export type LanguageStat = { name: string; count: number };

export type GitHubData = {
  login: string;
  name: string | null;
  bio: string | null;
  avatarUrl: string | null;
  url: string;
  followers: number | null;
  following: number | null;
  publicRepos: number | null;
  createdAt: string | null;
  totalStars: number;
  languages: LanguageStat[];
  repos: GitHubRepo[];
  /** 53 minggu terakhir (untuk heatmap). */
  days: ContributionDay[];
  stats: {
    totalAllTime: number | null;
    totalYear: number | null;
    activeDaysYear: number | null;
    currentStreak: number | null;
    longestStreak: number | null;
  };
  achievements: GitHubAchievement[];
};

const REVALIDATE = 3600;
const UA = "portofolio-zonatan";

function apiHeaders(): HeadersInit {
  const h: Record<string, string> = { Accept: "application/vnd.github+json", "User-Agent": UA };
  if (process.env.GITHUB_TOKEN) h.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  return h;
}

async function getJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, {
      headers: apiHeaders(),
      next: { revalidate: REVALIDATE },
      signal: AbortSignal.timeout(8000),
    });
    return res.ok ? ((await res.json()) as T) : null;
  } catch {
    return null;
  }
}

async function getHtml(url: string, extra: Record<string, string> = {}): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": UA, ...extra },
      next: { revalidate: REVALIDATE },
      signal: AbortSignal.timeout(8000),
    });
    return res.ok ? await res.text() : null;
  } catch {
    return null;
  }
}

/** Kontribusi harian satu tahun kalender. */
async function getYear(user: string, year: number): Promise<ContributionDay[]> {
  const html = await getHtml(
    `https://github.com/users/${user}/contributions?from=${year}-01-01&to=${year}-12-31`,
    { "X-Requested-With": "XMLHttpRequest" },
  );
  if (!html) return [];
  const cells = new Map<string, { date: string; level: number }>();
  for (const m of html.matchAll(
    /data-date="(\d{4}-\d{2}-\d{2})"\s+id="([^"]+)"\s+data-level="(\d)"/g,
  )) {
    cells.set(m[2], { date: m[1], level: Number(m[3]) });
  }
  const counts = new Map<string, number>();
  for (const m of html.matchAll(/for="([^"]+)"[^>]*>\s*(No|\d[\d,]*) contributions? on/g)) {
    counts.set(m[1], m[2] === "No" ? 0 : Number(m[2].replace(/,/g, "")));
  }
  return [...cells.entries()].map(([id, c]) => ({
    ...c,
    count: counts.get(id) ?? (c.level > 0 ? 1 : 0),
  }));
}

/** Achievement resmi dari sidebar profil publik. */
async function getAchievements(user: string): Promise<GitHubAchievement[]> {
  const html = await getHtml(`https://github.com/${user}`, { Accept: "text/html" });
  if (!html) return [];
  const out = new Map<string, GitHubAchievement>();
  const re =
    /<a href="\/[^"?]+\?achievement=([a-z0-9-]+)[^"]*"[^>]*>\s*<img src="([^"]+)"[^>]*alt="Achievement: ([^"]+)"[^>]*\/?>(?:<span[^>]*>(x\d+)<\/span>)?/g;
  for (const m of html.matchAll(re)) {
    if (!out.has(m[1]) && m[2].startsWith("https://github.githubassets.com/")) {
      out.set(m[1], { slug: m[1], image: m[2], name: m[3], tier: m[4] ?? null });
    }
  }
  return [...out.values()];
}

const today = () => new Date().toISOString().slice(0, 10);

function streaks(days: ContributionDay[]) {
  let longest = 0;
  let run = 0;
  for (const d of days) {
    run = d.count > 0 ? run + 1 : 0;
    longest = Math.max(longest, run);
  }
  // Current streak: hitung mundur dari hari ini (jika hari ini 0, mulai dari kemarin)
  let i = days.length - 1;
  if (i >= 0 && days[i].count === 0) i--;
  let current = 0;
  for (; i >= 0 && days[i].count > 0; i--) current++;
  return { longest, current };
}

export async function getGitHubData(user: string): Promise<GitHubData> {
  type ApiUser = {
    name: string | null;
    bio: string | null;
    avatar_url: string;
    html_url: string;
    public_repos: number;
    followers: number;
    following: number;
    created_at: string;
  };
  type ApiRepo = {
    name: string;
    description: string | null;
    language: string | null;
    stargazers_count: number;
    pushed_at: string;
    html_url: string;
    fork: boolean;
    archived: boolean;
  };

  const [profile, allRepos, achievements] = await Promise.all([
    getJson<ApiUser>(`https://api.github.com/users/${user}`),
    getJson<ApiRepo[]>(
      `https://api.github.com/users/${user}/repos?sort=pushed&per_page=100&type=owner`,
    ),
    getAchievements(user),
  ]);

  // Kontribusi semua tahun sejak akun dibuat
  const now = new Date();
  const startYear = profile
    ? new Date(profile.created_at).getUTCFullYear()
    : now.getUTCFullYear() - 1;
  const years: number[] = [];
  for (let y = startYear; y <= now.getUTCFullYear(); y++) years.push(y);
  const t = today();
  const allDays = (await Promise.all(years.map((y) => getYear(user, y))))
    .flat()
    .filter((d) => d.date <= t)
    .sort((a, b) => a.date.localeCompare(b.date));

  // Jendela 53 minggu terakhir untuk heatmap & statistik tahunan
  const from = new Date(now);
  from.setUTCDate(from.getUTCDate() - 364 - now.getUTCDay());
  const fromStr = from.toISOString().slice(0, 10);
  const yearDays = allDays.filter((d) => d.date >= fromStr);

  const hasDays = allDays.length > 0;
  const { longest, current } = streaks(allDays);

  const own = (allRepos ?? []).filter((r) => !r.fork);
  const langCount = new Map<string, number>();
  own.forEach((r) => r.language && langCount.set(r.language, (langCount.get(r.language) ?? 0) + 1));

  return {
    login: user,
    name: profile?.name ?? null,
    bio: profile?.bio ?? null,
    avatarUrl: profile?.avatar_url ?? null,
    url: profile?.html_url ?? `https://github.com/${user}`,
    followers: profile?.followers ?? null,
    following: profile?.following ?? null,
    publicRepos: profile?.public_repos ?? null,
    createdAt: profile?.created_at ?? null,
    totalStars: own.reduce((s, r) => s + r.stargazers_count, 0),
    languages: [...langCount.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count),
    repos: own
      // lewati arsip dan repo profil (namanya sama dengan username)
      .filter((r) => !r.archived && r.name.toLowerCase() !== user.toLowerCase())
      .slice(0, 4)
      .map((r) => ({
        name: r.name,
        description: r.description,
        language: r.language,
        stars: r.stargazers_count,
        pushedAt: r.pushed_at,
        url: r.html_url,
      })),
    days: yearDays,
    stats: {
      totalAllTime: hasDays ? allDays.reduce((s, d) => s + d.count, 0) : null,
      totalYear: hasDays ? yearDays.reduce((s, d) => s + d.count, 0) : null,
      activeDaysYear: hasDays ? yearDays.filter((d) => d.count > 0).length : null,
      currentStreak: hasDays ? current : null,
      longestStreak: hasDays ? longest : null,
    },
    achievements,
  };
}
