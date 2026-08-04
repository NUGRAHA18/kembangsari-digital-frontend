/**
 * Membentuk slug dari judul.
 *
 * Slug ikut menjadi alamat halaman publik (`/berita/<slug>`), jadi hasilnya
 * dibatasi pada huruf kecil, angka, dan tanda hubung — karakter lain akan
 * muncul ter-encode di bilah alamat dan merusak tautan yang dibagikan ke
 * WhatsApp.
 *
 * `normalize("NFD")` memisahkan huruf beraksen menjadi huruf dasar + tanda,
 * sehingga tandanya ikut terbuang oleh penyaring berikutnya dan huruf dasarnya
 * tetap tinggal — "Kebun Rejosari é" menjadi "kebun-rejosari-e", bukan
 * "kebun-rejosari".
 *
 * Dipakai di dua tempat sekaligus: menyarankan slug sambil pengguna mengetik
 * judul, dan sebagai cadangan di server kalau kolomnya dikosongkan.
 */
export function slugify(value: string): string {
  return value
    .normalize("NFD")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
