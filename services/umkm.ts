import { del, getOne, getPaginated, patch, post } from "@/lib/api";
import type { AdminUmkmQuery, PaginationQuery, UMKM, UMKMImage } from "@/types/api";

/**
 * UMKM yang aktif. Endpoint ini sudah menyaring hanya gambar `isPrimary`,
 * jadi `images[0]` aman dipakai sebagai gambar utama kartu.
 * Pencarian menyasar `name`, `description`, dan `address`.
 */
export function getActiveUmkm(query: PaginationQuery = {}) {
  return getPaginated<UMKM>("/umkm/active", query, { revalidate: 600 });
}

/** Detail UMKM — pada endpoint ini `images` berisi SEMUA gambar. */
export function getUmkmBySlug(slug: string) {
  return getOne<UMKM>(`/umkm/${slug}`, { revalidate: 600 });
}

// ============================================================
// DASHBOARD ADMIN
// ============================================================

/**
 * Seluruh UMKM termasuk yang nonaktif. `GET /umkm` menjawab 401 tanpa token.
 * `isActive` menyaringnya; tidak dikirim berarti semua.
 */
export function getAllUmkm(query: AdminUmkmQuery, token: string) {
  return getPaginated<UMKM>("/umkm", query, { token });
}

/** Dengan token, UMKM nonaktif ikut terbaca — tanpa itu backend menjawab 404. */
export function getUmkmBySlugAsAdmin(slug: string, token: string) {
  return getOne<UMKM>(`/umkm/${slug}`, { token });
}

export interface UmkmInput {
  name: string;
  slug: string;
  description: string;
  /** Kolom opsional dikirim `null` saat dikosongkan, bukan dihilangkan. */
  address?: string | null;
  phone?: string | null;
  /** Format internasional tanpa tanda plus, contoh "6281234567890". */
  whatsapp?: string | null;
  email?: string | null;
  /** Ketiganya dipakai langsung sebagai `href` di halaman publik, jadi harus URL lengkap. */
  instagram?: string | null;
  facebook?: string | null;
  website?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  isActive?: boolean;
}

export function createUmkm(input: UmkmInput, token: string) {
  return post<UMKM>("/umkm", input, { token });
}

export function updateUmkm(id: string, input: Partial<UmkmInput>, token: string) {
  return patch<UMKM>(`/umkm/${id}`, input, { token });
}

/** Menghapus UMKM **beserta seluruh gambarnya** — backend membuangnya dalam satu transaksi. */
export function deleteUmkm(id: string, token: string) {
  return del<UMKM>(`/umkm/${id}`, { token });
}

// ---------- Gambar UMKM ----------
//
// `GET /umkm/image/umkm/:id` sengaja tidak dibungkus di sini. Dulu ia dipakai
// untuk menghitung sendiri gambar mana yang bertanda utama; sekarang backend
// menjaganya, dan daftar gambar sudah ikut di `GET /umkm/:slug`.

export function getUmkmImageById(id: string) {
  return getOne<UMKMImage>(`/umkm/image/${id}`);
}

export interface UmkmImageInput {
  url: string;
  umkmId: string;
  caption?: string | null;
  /**
   * Boleh tidak dikirim: gambar pertama sebuah UMKM otomatis menjadi utama.
   * Mengirim `true` melepas penanda gambar lain dalam transaksi yang sama.
   */
  isPrimary?: boolean;
}

export function createUmkmImage(input: UmkmImageInput, token: string) {
  return post<UMKMImage>("/umkm/image", input, { token });
}

/**
 * Backend menjaga agar gambar utama tepat satu, jadi cukup satu permintaan
 * `isPrimary: true` — jangan melepas penanda yang lama lebih dulu.
 *
 * `isPrimary: false` pada satu-satunya gambar dijawab `400`; dashboard tidak
 * menyediakan tombolnya, jadi keadaan itu tidak pernah muncul.
 */
export function updateUmkmImage(id: string, input: Partial<UmkmImageInput>, token: string) {
  return patch<UMKMImage>(`/umkm/image/${id}`, input, { token });
}

export function deleteUmkmImage(id: string, token: string) {
  return del<UMKMImage>(`/umkm/image/${id}`, { token });
}
