import { isLocked, registerFail } from "@/lib/server/quoteStore";
import { getTop, maxScoreFor, removeName, submitScore } from "@/lib/server/leaderboard";
import {
  clientIp,
  noStore,
  onCooldown,
  pinMatches,
  StorageUnavailableError,
} from "@/lib/server/redis";

export const dynamic = "force-dynamic";

/** Nama gaya arcade: 3–12 huruf/angka/_ (huruf besar). */
const NAME_RE = /^[A-Z0-9_]{3,12}$/;

const fail = (e: unknown) => {
  const storage = e instanceof StorageUnavailableError;
  return Response.json(
    { error: storage ? "storage" : "server" },
    { status: storage ? 503 : 500, headers: noStore },
  );
};

export async function GET() {
  try {
    return Response.json({ entries: await getTop() }, { headers: noStore });
  } catch (e) {
    return fail(e);
  }
}

/** POST { name, score, wave } → simpan skor. */
export async function POST(req: Request) {
  try {
    let body: { name?: unknown; score?: unknown; wave?: unknown };
    try {
      body = await req.json();
    } catch {
      return Response.json({ error: "bad_request" }, { status: 400, headers: noStore });
    }
    const name = typeof body.name === "string" ? body.name.trim().toUpperCase() : "";
    const score = Number(body.score);
    const wave = Number(body.wave);
    if (!NAME_RE.test(name)) {
      return Response.json({ error: "name" }, { status: 400, headers: noStore });
    }
    // Validasi kewajaran skor: bilangan bulat kelipatan 10, tidak melebihi batas wave
    if (
      !Number.isInteger(score) ||
      !Number.isInteger(wave) ||
      score <= 0 ||
      score % 10 !== 0 ||
      wave < 1 ||
      wave > 200 ||
      score > maxScoreFor(wave)
    ) {
      return Response.json({ error: "score" }, { status: 400, headers: noStore });
    }
    if (await onCooldown(`zs:cd:score:${clientIp(req)}`, 15)) {
      return Response.json({ error: "rate" }, { status: 429, headers: noStore });
    }
    await submitScore({ name, score, wave, at: new Date().toISOString() });
    return Response.json({ entries: await getTop() }, { headers: noStore });
  } catch (e) {
    return fail(e);
  }
}

/** DELETE { pin, name } → hapus nama dari leaderboard (moderasi, butuh PIN admin). */
export async function DELETE(req: Request) {
  try {
    const ip = clientIp(req);
    if (await isLocked(ip)) {
      return Response.json({ error: "locked" }, { status: 429, headers: noStore });
    }
    const body = (await req.json().catch(() => ({}))) as { pin?: unknown; name?: unknown };
    if (!pinMatches(body.pin)) {
      await registerFail(ip);
      await new Promise((r) => setTimeout(r, 600));
      return Response.json({ error: "pin" }, { status: 401, headers: noStore });
    }
    if (typeof body.name !== "string") {
      return Response.json({ error: "name" }, { status: 400, headers: noStore });
    }
    await removeName(body.name.trim().toUpperCase());
    return Response.json({ entries: await getTop() }, { headers: noStore });
  } catch (e) {
    return fail(e);
  }
}
