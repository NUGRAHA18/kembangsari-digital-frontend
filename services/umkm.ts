import { del, getList, getOne, getPaginated, patch, post } from "@/lib/api";
import type { PaginationQuery, UMKM, UMKMImage } from "@/types/api";

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

/** Seluruh UMKM termasuk yang nonaktif. `GET /umkm` menjawab 401 tanpa token. */
export function getAllUmkm(query: PaginationQuery, token: string) {
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

/** ARRAY POLOS, bukan `{ data, meta }`. */
export function getUmkmImages(umkmId: string) {
  return getList<UMKMImage>(`/umkm/image/umkm/${umkmId}`);
}

export function getUmkmImageById(id: string) {
  return getOne<UMKMImage>(`/umkm/image/${id}`);
}

export interface UmkmImageInput {
  url: string;
  umkmId: string;
  caption?: string | null;
  isPrimary?: boolean;
}

export function createUmkmImage(input: UmkmImageInput, token: string) {
  return post<UMKMImage>("/umkm/image", input, { token });
}

/**
 * Backend tidak menjaga agar gambar utama hanya satu — `isPrimary` sekadar
 * disimpan apa adanya. Yang menjaganya adalah pemanggil; lihat
 * `setPrimaryImageAction` di modul UMKM dashboard.
 */
export function updateUmkmImage(id: string, input: Partial<UmkmImageInput>, token: string) {
  return patch<UMKMImage>(`/umkm/image/${id}`, input, { token });
}

export function deleteUmkmImage(id: string, token: string) {
  return del<UMKMImage>(`/umkm/image/${id}`, { token });
}
