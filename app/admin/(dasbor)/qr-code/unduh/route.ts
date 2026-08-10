import { type NextRequest } from "next/server";
import { renderQrPng, renderQrSvg } from "@/lib/qr";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3001";
const TARGET_PATH = "/monografi";

/**
 * Mengunduh QR monografi sebagai berkas.
 *
 * Route Handler, bukan tombol ber-JavaScript: unduhannya tetap bekerja saat JS
 * gagal dimuat, dan berkasnya dibangkitkan saat diminta sehingga selalu
 * mengikuti `NEXT_PUBLIC_SITE_URL` yang sedang berlaku — tidak ada berkas
 * usang yang tertinggal di `public/`.
 *
 * Dua format karena keduanya dipakai untuk hal berbeda: PNG bisa ditempel ke
 * Word dan dikirim lewat WhatsApp, sedangkan SVG tetap tajam pada cetakan
 * sebesar apa pun.
 *
 * Aksesnya dijaga `proxy.ts` bersama seluruh `/admin`. Isinya sendiri
 * bukan rahasia — hanya alamat halaman publik.
 */
export async function GET(request: NextRequest) {
  const target = `${SITE_URL}${TARGET_PATH}`;
  const format = request.nextUrl.searchParams.get("format");

  if (format === "svg") {
    const svg = await renderQrSvg(target);

    return new Response(svg, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Content-Disposition": 'attachment; filename="qr-monografi.svg"',
      },
    });
  }

  // PNG adalah bawaannya: format yang paling jarang menyulitkan pengelola.
  const png = await renderQrPng(target);

  return new Response(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      "Content-Disposition": 'attachment; filename="qr-monografi.png"',
    },
  });
}
