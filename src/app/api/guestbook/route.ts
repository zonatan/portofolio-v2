import {
  addEntry,
  GUEST_ROLES,
  listEntries,
  removeEntry,
  type GuestRole,
} from "@/lib/server/guestbook";
import { isLocked, registerFail } from "@/lib/server/quoteStore";
import {
  cleanText,
  clientIp,
  noStore,
  onCooldown,
  pinMatches,
  StorageUnavailableError,
} from "@/lib/server/redis";

export const dynamic = "force-dynamic";

const LINK_RE = /(https?:\/\/|www\.|\b[a-z0-9-]+\.(com|net|org|id|io|xyz|ru|ly)\b)/i;

const fail = (e: unknown) => {
  const storage = e instanceof StorageUnavailableError;
  return Response.json(
    { error: storage ? "storage" : "server" },
    { status: storage ? 503 : 500, headers: noStore },
  );
};
const bad = (error: string, status = 400) => Response.json({ error }, { status, headers: noStore });

export async function GET() {
  try {
    return Response.json({ entries: await listEntries() }, { headers: noStore });
  } catch (e) {
    return fail(e);
  }
}

/** POST { name, role, message, website } — `website` = honeypot (harus kosong). */
export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
    if (!body) return bad("bad_request");
    // Bot mengisi field tersembunyi → pura-pura sukses tanpa menyimpan
    if (typeof body.website === "string" && body.website.trim()) {
      return Response.json({ entries: await listEntries() }, { headers: noStore });
    }
    const name = typeof body.name === "string" ? cleanText(body.name) : "";
    const message = typeof body.message === "string" ? cleanText(body.message) : "";
    const role = GUEST_ROLES.includes(body.role as GuestRole)
      ? (body.role as GuestRole)
      : "visitor";
    if (name.length < 2 || name.length > 24) return bad("name");
    if (message.length < 3 || message.length > 160) return bad("message");
    if (LINK_RE.test(name) || LINK_RE.test(message)) return bad("link");
    if (await onCooldown(`zs:cd:guest:${clientIp(req)}`, 60)) return bad("rate", 429);

    await addEntry({ name, role, message });
    return Response.json({ entries: await listEntries() }, { headers: noStore });
  } catch (e) {
    return fail(e);
  }
}

/** DELETE { pin, id } → hapus pesan (moderasi, butuh PIN admin). */
export async function DELETE(req: Request) {
  try {
    const ip = clientIp(req);
    if (await isLocked(ip)) return bad("locked", 429);
    const body = (await req.json().catch(() => ({}))) as { pin?: unknown; id?: unknown };
    if (!pinMatches(body.pin)) {
      await registerFail(ip);
      await new Promise((r) => setTimeout(r, 600));
      return bad("pin", 401);
    }
    if (typeof body.id !== "string") return bad("id");
    await removeEntry(body.id);
    return Response.json({ entries: await listEntries() }, { headers: noStore });
  } catch (e) {
    return fail(e);
  }
}
