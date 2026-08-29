import "server-only";

import { readFileSync } from "node:fs";
import { join } from "node:path";

import type { PinGlyphs } from "@/features/maps/pin-icons";

/**
 * Membaca satu ikon Material Symbols dari `@material-symbols/svg-400` dan
 * mengembalikan jalur gambarnya saja.
 *
 * **Kenapa di server.** Katalog ikon dijaga backend dan bisa bertambah tanpa
 * rilis frontend, jadi frontend tidak boleh memegang daftarnya sendiri — nama
 * apa pun harus bisa digambar. Paketnya berisi 7.798 berkas; mengirim
 * semuanya ke browser mustahil, dan memuat webfont Material Symbols berarti
 * satu permintaan ke host luar setiap kali peta dibuka, padahal portal ini
 * dipasang sebagai aplikasi dan punya halaman luring. Yang dikirim karena itu
 * hanya `d` dari ikon yang benar-benar dipakai halaman itu — sekitar 200 byte
 * per ikon, dan tidak ada satu pun berkas tambahan yang perlu diunduh.
 *
 * Paketnya hanya dibaca saat merender di server; ia tidak pernah ikut ke
 * bundel browser. Supaya berkasnya ikut terbawa ke Vercel, `next.config.ts`
 * menyebutkannya di `outputFileTracingIncludes` — tanpa itu ikonnya hilang di
 * produksi sementara di komputer sendiri tampak baik-baik saja.
 *
 * Nama yang tidak dikenal mengembalikan `null`, dan peta menggambar pin polos
 * seperti sebelumnya. Ikon yang meleset tidak boleh menjatuhkan peta.
 */

/**
 * Direktori `outlined/` di dalam paket, disusun dari `process.cwd()`.
 *
 * **Bukan `require.resolve`, dan itu bukan selera.** Turbopack menggantikan
 * `require.resolve` dengan id modul internalnya — sebuah **angka** — sehingga
 * `dirname()` melempar `ERR_INVALID_ARG_TYPE` saat build mengumpulkan data
 * halaman. Jalur yang disusun saat berjalan juga menutup masalah kedua:
 * Turbopack membaca `readFileSync` dengan jalur yang bisa ditebaknya sebagai
 * pola berkas, dan `require.resolve` membuatnya cukup tahu untuk mencocokkan
 * 15.596 berkas sekaligus lalu memperingatkan soal over-bundling.
 *
 * `process.cwd()` adalah akar proyek baik saat `next build` maupun di dalam
 * fungsi serverless Vercel, dan `outputFileTracingIncludes` menaruh berkasnya
 * relatif terhadap akar yang sama.
 */
const ICON_DIR = join(process.cwd(), "node_modules", "@material-symbols", "svg-400", "outlined");

/**
 * Nama ikon menjadi bagian dari jalur berkas, jadi ia dibatasi ke bentuk yang
 * memang dipakai Material Symbols. Tanpa ini sebuah nama berisi `../` yang
 * lolos dari backend bisa membaca berkas lain di server.
 */
const SAFE_NAME = /^[a-z0-9_]{1,64}$/;

/** Ikon yang sama diminta berkali-kali dalam satu halaman; berkasnya dibaca sekali. */
const cache = new Map<string, string | null>();

export function materialSymbolPath(name: string): string | null {
  const cached = cache.get(name);
  if (cached !== undefined) return cached;

  const resolved = SAFE_NAME.test(name) ? read(name) : null;
  cache.set(name, resolved);
  return resolved;
}

function read(name: string): string | null {
  let svg: string;

  try {
    svg = readFileSync(join(ICON_DIR, `${name}.svg`), "utf8");
  } catch {
    return null;
  }

  // Berkasnya selalu satu <path> tunggal. Diambil dengan regex, bukan pengurai
  // XML: sumbernya paket npm yang bentuknya seragam, dan menambah pengurai
  // hanya untuk satu atribut tidak sepadan.
  return /<path[^>]*\sd="([^"]+)"/.exec(svg)?.[1] ?? null;
}

/**
 * Menyiapkan sekumpulan ikon sekaligus. Nama yang tidak ditemukan sengaja tidak
 * ikut ke hasilnya, sehingga peta tinggal memeriksa ada tidaknya kuncinya.
 */
export function materialSymbolPaths(names: string[]): PinGlyphs {
  const glyphs: PinGlyphs = {};

  for (const name of names) {
    const path = materialSymbolPath(name);
    if (path) glyphs[name] = path;
  }

  return glyphs;
}
