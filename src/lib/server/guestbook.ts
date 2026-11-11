/**
 * Buku tamu "Player Log" (HANYA server).
 * Redis: list `zs:guestbook` (terbaru di depan, maks 200 entri).
 * Lokal tanpa Redis: `.data/guestbook.json`.
 */
import { randomUUID } from "node:crypto";
import { readJsonFile, redis, redisConfig, writeJsonFile } from "./redis";

export const GUEST_ROLES = ["visitor", "dev", "recruiter", "student"] as const;
export type GuestRole = (typeof GUEST_ROLES)[number];
export type GuestEntry = { id: string; name: string; role: GuestRole; message: string; at: string };

const KEY = "zs:guestbook";
const FILE = "guestbook.json";
const KEEP = 200;
export const SHOW = 30;

export async function listEntries(): Promise<GuestEntry[]> {
  if (redisConfig()) {
    const raw = await redis<string[]>(["LRANGE", KEY, 0, SHOW - 1]);
    return raw.map((r) => JSON.parse(r) as GuestEntry);
  }
  return (await readJsonFile<GuestEntry[]>(FILE, [])).slice(0, SHOW);
}

export async function addEntry(input: Omit<GuestEntry, "id" | "at">): Promise<GuestEntry> {
  const entry: GuestEntry = {
    ...input,
    id: randomUUID().slice(0, 8),
    at: new Date().toISOString(),
  };
  if (redisConfig()) {
    await redis(["LPUSH", KEY, JSON.stringify(entry)]);
    await redis(["LTRIM", KEY, 0, KEEP - 1]);
    return entry;
  }
  const all = await readJsonFile<GuestEntry[]>(FILE, []);
  await writeJsonFile(FILE, [entry, ...all].slice(0, KEEP));
  return entry;
}

export async function removeEntry(id: string) {
  if (redisConfig()) {
    const raw = await redis<string[]>(["LRANGE", KEY, 0, -1]);
    const hit = raw.find((r) => (JSON.parse(r) as GuestEntry).id === id);
    if (hit) await redis(["LREM", KEY, 1, hit]);
    return;
  }
  const all = await readJsonFile<GuestEntry[]>(FILE, []);
  await writeJsonFile(
    FILE,
    all.filter((e) => e.id !== id),
  );
}
