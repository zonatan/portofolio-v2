export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://zonatan.vercel.app").replace(
  /\/$/,
  "",
);

/** Placeholder blur gelap untuk next/image (dipakai semua gambar). */
export const BLUR_DATA_URL =
  "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='5'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0' stop-color='%2318152a'/%3E%3Cstop offset='1' stop-color='%23100e1a'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='8' height='5' fill='url(%23g)'/%3E%3C/svg%3E";

export const pad2 = (n: number) => String(n).padStart(2, "0");
