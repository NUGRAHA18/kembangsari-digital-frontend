import { getOne, getPaginated } from "@/lib/api";
import type { PaginationQuery, PopulationStat } from "@/types/api";

/**
 * Statistik penduduk yang sudah dipublikasikan.
 * Modul ini menerima `page` & `limit` tapi mengabaikan `search` karena tidak
 * punya kolom teks untuk dicari.
 */
export function getPublishedMonography(query: Omit<PaginationQuery, "search"> = {}) {
  return getPaginated<PopulationStat>("/monography/published", query, { revalidate: 3600 });
}

/** Satu tahun statistik — objek tunggal, bukan `{ data, meta }`. */
export function getMonographyByYear(year: number) {
  return getOne<PopulationStat>(`/monography/year/${year}`, { revalidate: 3600 });
}
