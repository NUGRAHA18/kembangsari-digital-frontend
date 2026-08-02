import { getOne, getPaginated } from "@/lib/api";
import type { PaginationQuery, UMKM } from "@/types/api";

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
