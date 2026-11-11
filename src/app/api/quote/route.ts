import { timingSafeEqual } from "node:crypto";
import {
  getQuote,
  isLocked,
  registerFail,
  setQuote,
  StorageUnavailableError,
} from "@/lib/server/quoteStore";

export const dynamic = "force-dynamic";

/**
 * PIN edit kutipan — WAJIB diisi lewat env QUOTE_EDIT_PIN (.env.local / Vercel).
 * Sengaja tidak ada nilai default di kode agar PIN tidak ikut ter-upload ke GitHub.
 * Jika kosong, fitur edit dinonaktifkan.
 */
const PIN = process.env.QUOTE_EDIT_PIN?.trim() || "";
const MIN_LEN = 3;
const MAX_LEN = 180;

function pinMatches(input: unknown) {
  if (!PIN || typeof input !== "string") return false;
  const a = Buffer.from(input.padEnd(32, "\0").slice(0, 32));
  const b = Buffer.from(PIN.padEnd(32, "\0").slice(0, 32));
  return timingSafeEqual(a, b) && input.length === PIN.length;
}

function clientIp(req: Request) {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "local"
  );
}

const noStore = { "Cache-Control": "no-store" };

export async function GET() {
  const quote = await getQuote();
  return Response.json(quote ?? { text: null, updatedAt: null }, { headers: noStore });
}

/**
 * POST { pin }          → hanya verifikasi PIN
 * POST { pin, text }    → simpan kutipan baru
 */
export async function POST(req: Request) {
  const ip = clientIp(req);
  try {
    if (!PIN) {
      return Response.json({ error: "storage" }, { status: 503, headers: noStore });
    }
    if (await isLocked(ip)) {
      return Response.json({ error: "locked" }, { status: 429, headers: noStore });
    }

    let body: { pin?: unknown; text?: unknown };
    try {
      body = await req.json();
    } catch {
      return Response.json({ error: "bad_request" }, { status: 400, headers: noStore });
    }

    if (!pinMatches(body.pin)) {
      await registerFail(ip);
      // Jeda kecil untuk memperlambat tebak-tebakan PIN
      await new Promise((r) => setTimeout(r, 600));
      return Response.json({ error: "pin" }, { status: 401, headers: noStore });
    }

    if (body.text === undefined) {
      return Response.json({ ok: true }, { headers: noStore });
    }

    if (typeof body.text !== "string") {
      return Response.json({ error: "text" }, { status: 400, headers: noStore });
    }
    // Rapikan: buang karakter kontrol & spasi berlebih
    const text = body.text
      .replace(/[\u0000-\u001f\u007f]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    if (text.length < MIN_LEN || text.length > MAX_LEN) {
      return Response.json({ error: "length" }, { status: 400, headers: noStore });
    }

    const saved = await setQuote(text);
    return Response.json(saved, { headers: noStore });
  } catch (e) {
    const storage = e instanceof StorageUnavailableError;
    return Response.json(
      { error: storage ? "storage" : "server" },
      { status: storage ? 503 : 500, headers: noStore },
    );
  }
}
