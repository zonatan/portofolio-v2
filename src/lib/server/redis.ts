/**
 * Helper penyimpanan bersama (HANYA server): Upstash Redis via REST di produksi,
 * file JSON di `.data/` saat development lokal tanpa Redis.
 *
 * Env: UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN
 *      (atau KV_REST_API_URL + KV_REST_API_TOKEN / prefix custom dari integrasi Vercel).
 */
import { timingSafeEqual } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

export class StorageUnavailableError extends Error {}

export function redisConfig() {
  let url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  let token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  // Integrasi Vercel bisa memakai prefix custom (mis. STORAGE_REST_API_URL) → cari otomatis.
  if (!url || !token) {
    const key = Object.keys(process.env).find(
      (k) => k.endsWith("_REST_API_URL") && process.env[k.replace(/_URL$/, "_TOKEN")],
    );
    if (key) {
      url = process.env[key];
      token = process.env[key.replace(/_URL$/, "_TOKEN")];
    }
  }
  return url && token ? { url: url.replace(/\/$/, ""), token } : null;
}

export async function redis<T = unknown>(command: (string | number)[]): Promise<T> {
  const cfg = redisConfig();
  if (!cfg) throw new StorageUnavailableError("Redis belum dikonfigurasi.");
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

/** Penyimpanan berbasis file hanya untuk development lokal (bukan di Vercel). */
export const canUseFile = () => !process.env.VERCEL;

const DATA_DIR = join(process.cwd(), ".data");

export async function readJsonFile<T>(name: string, fallback: T): Promise<T> {
  try {
    return JSON.parse(await readFile(join(DATA_DIR, name), "utf8")) as T;
  } catch {
    return fallback;
  }
}

export async function writeJsonFile(name: string, value: unknown) {
  if (!canUseFile()) throw new StorageUnavailableError("Penyimpanan belum dikonfigurasi.");
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(join(DATA_DIR, name), JSON.stringify(value, null, 2), "utf8");
}

/* ---------- Utilitas request ---------- */

export function clientIp(req: Request) {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "local"
  );
}

/** PIN admin (env QUOTE_EDIT_PIN). Kosong → semua aksi admin dinonaktifkan. */
export const ADMIN_PIN = process.env.QUOTE_EDIT_PIN?.trim() || "";

export function pinMatches(input: unknown) {
  if (!ADMIN_PIN || typeof input !== "string") return false;
  const a = Buffer.from(input.padEnd(32, "\0").slice(0, 32));
  const b = Buffer.from(ADMIN_PIN.padEnd(32, "\0").slice(0, 32));
  return timingSafeEqual(a, b) && input.length === ADMIN_PIN.length;
}

/**
 * Batas laju sederhana: true jika `key` masih dalam masa tunggu.
 * Jika tidak, tandai key selama `seconds` detik lalu kembalikan false.
 */
const memCooldown = new Map<string, number>();
export async function onCooldown(key: string, seconds: number): Promise<boolean> {
  if (redisConfig()) {
    const ok = await redis<string | null>(["SET", key, "1", "NX", "EX", seconds]);
    return ok !== "OK";
  }
  const until = memCooldown.get(key) ?? 0;
  if (until > Date.now()) return true;
  memCooldown.set(key, Date.now() + seconds * 1000);
  return false;
}

/** Bersihkan teks input: buang karakter kontrol & spasi berlebih. */
export const cleanText = (s: string) =>
  s
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export const noStore = { "Cache-Control": "no-store" };
