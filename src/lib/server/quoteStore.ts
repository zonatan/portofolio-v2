/**
 * Penyimpanan kutipan di balik kartu foto (HANYA dipakai di server / route handler).
 *
 * - Produksi (Vercel): Upstash Redis via REST API. Isi env:
 *     UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN
 *   (atau KV_REST_API_URL + KV_REST_API_TOKEN jika memakai integrasi Vercel).
 * - Lokal (npm run dev): file `.data/quote.json` jika Redis belum diatur.
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

export type StoredQuote = { text: string; updatedAt: string };

const KEY = "zs:quote";
const FILE = join(process.cwd(), ".data", "quote.json");

export class StorageUnavailableError extends Error {}

function redisConfig() {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  return url && token ? { url: url.replace(/\/$/, ""), token } : null;
}

async function redis<T = unknown>(command: (string | number)[]): Promise<T> {
  const cfg = redisConfig()!;
  const res = await fetch(cfg.url, {
    method: "POST",
    headers: { Authorization: `Bearer ${cfg.token}`, "Content-Type": "application/json" },
    body: JSON.stringify(command),
    cache: "no-store",
  });
  if (!res.ok) throw new StorageUnavailableError(`Redis error ${res.status}`);
  const data = (await res.json()) as { result: T };
  return data.result;
}

/** Penyimpanan berbasis file hanya untuk development lokal. */
const canUseFile = () => !process.env.VERCEL;

export async function getQuote(): Promise<StoredQuote | null> {
  try {
    if (redisConfig()) {
      const raw = await redis<string | null>(["GET", KEY]);
      return raw ? (JSON.parse(raw) as StoredQuote) : null;
    }
    if (canUseFile()) return JSON.parse(await readFile(FILE, "utf8")) as StoredQuote;
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
  if (!canUseFile()) {
    throw new StorageUnavailableError("Penyimpanan belum dikonfigurasi (Upstash Redis).");
  }
  await mkdir(join(process.cwd(), ".data"), { recursive: true });
  await writeFile(FILE, JSON.stringify(value, null, 2), "utf8");
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
