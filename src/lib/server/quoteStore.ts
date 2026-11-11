/**
 * Penyimpanan kutipan di balik kartu foto (HANYA dipakai di server / route handler).
 *
 * - Produksi (Vercel): Upstash Redis via REST API. Isi env:
 *     UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN
 *   (atau KV_REST_API_URL + KV_REST_API_TOKEN jika memakai integrasi Vercel).
 * - Lokal (npm run dev): file `.data/quote.json` jika Redis belum diatur.
 */
import { canUseFile, readJsonFile, redis, redisConfig, writeJsonFile } from "./redis";

export { StorageUnavailableError } from "./redis";

export type StoredQuote = { text: string; updatedAt: string };

const KEY = "zs:quote";
const FILE = "quote.json";

export async function getQuote(): Promise<StoredQuote | null> {
  try {
    if (redisConfig()) {
      const raw = await redis<string | null>(["GET", KEY]);
      return raw ? (JSON.parse(raw) as StoredQuote) : null;
    }
    if (canUseFile()) return await readJsonFile<StoredQuote | null>(FILE, null);
  } catch {
    /* belum ada data / gagal baca → pakai kutipan default */
  }
  return null;
}

export async function setQuote(text: string): Promise<StoredQuote> {
  const value: StoredQuote = { text, updatedAt: new Date().toISOString() };
  if (redisConfig()) {
    await redis(["SET", KEY, JSON.stringify(value)]);
    return value;
  }
  await writeJsonFile(FILE, value);
  return value;
}

/* ---------- Pembatas percobaan PIN salah ---------- */
const MAX_FAILS = 5;
const WINDOW_SEC = 15 * 60;
const memFails = new Map<string, { count: number; until: number }>();

export async function isLocked(ip: string): Promise<boolean> {
  if (redisConfig()) {
    const n = await redis<string | null>(["GET", `zs:pinfail:${ip}`]);
    return Number(n ?? 0) >= MAX_FAILS;
  }
  const e = memFails.get(ip);
  return !!e && e.until > Date.now() && e.count >= MAX_FAILS;
}

export async function registerFail(ip: string): Promise<void> {
  if (redisConfig()) {
    const n = await redis<number>(["INCR", `zs:pinfail:${ip}`]);
    if (n === 1) await redis(["EXPIRE", `zs:pinfail:${ip}`, WINDOW_SEC]);
    return;
  }
  const e = memFails.get(ip);
  if (!e || e.until < Date.now())
    memFails.set(ip, { count: 1, until: Date.now() + WINDOW_SEC * 1000 });
  else e.count += 1;
}
