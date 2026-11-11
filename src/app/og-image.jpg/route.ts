import sharp from "sharp";
import { renderOgImage } from "@/lib/og";

/**
 * GET /og-image.jpg — kartu pratinjau link dalam format JPEG (~100 KB).
 * Sengaja JPEG kecil & alamat berekstensi file (tanpa redirect trailing slash),
 * karena WhatsApp tidak menampilkan gambar yang terlalu besar atau dialihkan.
 * Dibuat sekali saat build (static).
 */
export const dynamic = "force-static";

export async function GET() {
  const png = Buffer.from(await (await renderOgImage()).arrayBuffer());
  const jpg = await sharp(png).jpeg({ quality: 84, mozjpeg: true }).toBuffer();
  return new Response(new Uint8Array(jpg), {
    headers: {
      "Content-Type": "image/jpeg",
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
  });
}
