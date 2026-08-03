import { getOne, getPaginated } from "@/lib/api";
import type { Potential, PotentialQuery } from "@/types/api";

/**
 * Potensi padukuhan yang aktif.
 *
 * `category` diisi nilai enum `PotentialCategory` (huruf besar). Nilai di luar
 * daftar itu dijawab backend dengan `400 "kategori tidak dikenal"`, bukan
 * diabaikan diam-diam, jadi pemanggil wajib memvalidasi lebih dulu apa pun yang
 * datang dari query string.
 */
export function getActivePotentials(query: PotentialQuery = {}) {
  return getPaginated<Potential>("/potential/active", query, { revalidate: 600 });
}

/** Detail potensi — `images` berisi semua gambar. Potensi nonaktif dijawab 404. */
export function getPotentialBySlug(slug: string) {
  return getOne<Potential>(`/potential/${slug}`, { revalidate: 600 });
}
