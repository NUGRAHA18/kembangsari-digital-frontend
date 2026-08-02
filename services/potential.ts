import { getOne, getPaginated } from "@/lib/api";
import type { PaginationQuery, Potential } from "@/types/api";

/** Potensi padukuhan yang aktif. */
export function getActivePotentials(query: PaginationQuery = {}) {
  return getPaginated<Potential>("/potential/active", query, { revalidate: 600 });
}

/** Detail potensi — `images` berisi semua gambar. */
export function getPotentialBySlug(slug: string) {
  return getOne<Potential>(`/potential/${slug}`, { revalidate: 600 });
}
