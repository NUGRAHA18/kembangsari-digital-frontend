import type { MapCategory, MapMarker } from "@/types/api";

/**
 * Ikon yang digambar di dalam pin sebuah titik.
 *
 * Bebas React dan bebas Leaflet, sepola dengan `pin-colors.ts` — dipakai
 * Server Component yang menyiapkan gambarnya sekaligus komponen peta yang
 * menggambarnya.
 *
 * Warna pin (`pin-colors.ts`) tetap ada dan tetap berguna, tetapi ia saja tidak
 * cukup: dengan tujuh belas kategori dan tujuh warna, dua kategori berbeda
 * sudah pasti berwarna kembar — makam pahlawan dan warung akan tampil sebagai
 * bulatan hijau yang sama. Ikonlah pembeda pertamanya sekarang.
 */

/**
 * Ikon cadangan ketika titik maupun kategorinya tidak memasang ikon.
 *
 * Katalog backend menyebut ikon ini `place`; `@material-symbols/svg-400` hanya
 * membawa nama kanoniknya, `location_on`. Keduanya gambar yang sama persis —
 * `place` adalah alias di sisi Google Fonts, bukan ikon tersendiri. Ini satu
 * nama cadangan, **bukan tabel terjemahan**: nama ikon lain diteruskan apa
 * adanya ke `@material-symbols`, dan yang tidak ditemukan digambar sebagai pin
 * polos, bukan diterjemahkan.
 */
export const FALLBACK_ICON = "location_on";

/**
 * Urutan bacanya sesuai kontrak backend: ikon titik menimpa ikon kategorinya,
 * dan `null` di keduanya berarti ikon cadangan.
 */
export function iconNameFor(marker: Pick<MapMarker, "icon" | "category">): string {
  return marker.icon ?? marker.category?.icon ?? FALLBACK_ICON;
}

/**
 * Seluruh nama ikon yang perlu disiapkan untuk sekumpulan titik.
 *
 * Kategori ikut dibaca terpisah, bukan hanya lewat `marker.category`: daftar
 * marker aktif sudah membawa kategorinya, tetapi peta di dashboard menyaring
 * titiknya — dan kategori yang sedang kosong tetap muncul di legendanya.
 */
export function iconNamesFor(
  markers: Pick<MapMarker, "icon" | "category">[],
  categories: Pick<MapCategory, "icon">[] = [],
): string[] {
  const names = new Set<string>([FALLBACK_ICON]);

  for (const marker of markers) names.add(iconNameFor(marker));
  for (const category of categories) if (category.icon) names.add(category.icon);

  return [...names];
}

/**
 * Nama ikon → jalur `<path d>`-nya, disiapkan di server dan diturunkan ke peta
 * sebagai prop. Hanya berisi ikon yang benar-benar dipakai halaman itu.
 */
export type PinGlyphs = Record<string, string>;

/**
 * Bidang gambar asli Material Symbols. Dipakai apa adanya ketika ikonnya berdiri
 * sendiri — misalnya di daftar lokasi sebelah peta.
 */
export const GLYPH_VIEW_BOX = "0 -960 960 960";

/**
 * Ikon Material Symbols digambar pada `0 -960 960 960`, sedangkan pin memakai
 * `0 0 24 24`. Ini transform yang memasukkan yang pertama ke kepala pin —
 * titik tengah kepala ada di (12, 10) dan jari-jarinya 7.
 *
 * Dibaca dari kanan: (480, -480) adalah titik tengah bidang ikon, jadi
 * `translate(-480 480)` memindahkannya ke titik asal; `scale` mengecilkannya
 * menjadi `GLYPH_SIZE` satuan; `translate(12 10)` menaruhnya di kepala pin.
 * `GLYPH_SIZE` sengaja di bawah diameter kepala (14) supaya ikon tidak
 * menyentuh tepi berwarnanya.
 */
const GLYPH_SIZE = 9.5;
export const GLYPH_TRANSFORM = `translate(12 10) scale(${GLYPH_SIZE / 960}) translate(-480 480)`;
