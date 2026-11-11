/**
 * Leaderboard Bug Hunter (HANYA server).
 * Redis: sorted set `zs:arcade:lb` (member = nama, skor = skor terbaik) +
 *        hash `zs:arcade:meta` (nama → { wave, at }).
 * Lokal tanpa Redis: `.data/leaderboard.json`.
 */
import { readJsonFile, redis, redisConfig, writeJsonFile } from "./redis";

export type ScoreEntry = { name: string; score: number; wave: number; at: string };

const LB = "zs:arcade:lb";
const META = "zs:arcade:meta";
const FILE = "leaderboard.json";
export const TOP_N = 10;

/**
 * Batas atas skor yang mungkin dicapai sampai `wave` (lihat engine.ts v2):
 * tiap wave k berisi 5 + 3k bug (maks 30 poin × combo 4), wave boss (tiap 5) menambah
 * boss 250 poin × 4, plus bonus 50 per wave yang selesai. Sengaja longgar — hanya untuk
 * menolak skor palsu yang jelas mustahil.
 */
export function maxScoreFor(wave: number) {
  const MULT = 4;
  let max = 0;
  for (let k = 1; k <= wave; k++) {
    max += (5 + 3 * k) * 30 * MULT;
    if (k % 5 === 0) max += 250 * MULT;
  }
  return max + 50 * (wave - 1);
}

export async function getTop(): Promise<ScoreEntry[]> {
  if (redisConfig()) {
    const flat = await redis<string[]>(["ZRANGE", LB, 0, TOP_N - 1, "REV", "WITHSCORES"]);
    const names: string[] = [];
    const scores: number[] = [];
    for (let i = 0; i < flat.length; i += 2) {
      names.push(flat[i]);
      scores.push(Number(flat[i + 1]));
    }
    if (!names.length) return [];
    const metas = await redis<(string | null)[]>(["HMGET", META, ...names]);
    return names.map((name, i) => {
      const m = metas[i] ? (JSON.parse(metas[i]!) as { wave: number; at: string }) : null;
      return { name, score: scores[i], wave: m?.wave ?? 1, at: m?.at ?? "" };
    });
  }
  const all = await readJsonFile<ScoreEntry[]>(FILE, []);
  return all.sort((a, b) => b.score - a.score).slice(0, TOP_N);
}

/** Simpan skor (hanya jika lebih tinggi dari skor terbaik nama tsb). */
export async function submitScore(entry: ScoreEntry) {
  if (redisConfig()) {
    const prev = await redis<string | null>(["ZSCORE", LB, entry.name]);
    if (prev !== null && Number(prev) >= entry.score) return;
    await redis(["ZADD", LB, entry.score, entry.name]);
    await redis(["HSET", META, entry.name, JSON.stringify({ wave: entry.wave, at: entry.at })]);
    // Simpan maksimal 100 nama teratas
    const extra = await redis<number>(["ZCARD", LB]);
    if (extra > 100) {
      const drop = await redis<string[]>(["ZRANGE", LB, 0, extra - 101]);
      await redis(["ZREMRANGEBYRANK", LB, 0, extra - 101]);
      if (drop.length) await redis(["HDEL", META, ...drop]);
    }
    return;
  }
  const all = await readJsonFile<ScoreEntry[]>(FILE, []);
  const i = all.findIndex((e) => e.name === entry.name);
  if (i >= 0 && all[i].score >= entry.score) return;
  if (i >= 0) all[i] = entry;
  else all.push(entry);
  await writeJsonFile(FILE, all.sort((a, b) => b.score - a.score).slice(0, 100));
}

export async function removeName(name: string) {
  if (redisConfig()) {
    await redis(["ZREM", LB, name]);
    await redis(["HDEL", META, name]);
    return;
  }
  const all = await readJsonFile<ScoreEntry[]>(FILE, []);
  await writeJsonFile(
    FILE,
    all.filter((e) => e.name !== name),
  );
}
