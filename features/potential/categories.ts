import type { PotentialCategory } from "@/types/api";

/**
 * Delapan kategori potensi, urutannya mengikuti enum `PotentialCategory` di
 * backend supaya deretan chip tidak berubah-ubah setiap kali data disegarkan.
 */
export const POTENTIAL_CATEGORIES: readonly PotentialCategory[] = [
  "PERTANIAN",
  "PETERNAKAN",
  "PERKEBUNAN",
  "PERIKANAN",
  "KERAJINAN",
  "WISATA",
  "KULINER",
  "LAINNYA",
];

/** URL memakai huruf kecil (`/potensi?kategori=pertanian`), enum backend huruf besar. */
export function potentialCategorySlug(category: PotentialCategory): string {
  return category.toLowerCase();
}

/**
 * Menerjemahkan nilai query string menjadi nilai enum yang sah.
 *
 * Wajib dipakai sebelum meneruskannya ke API: kategori yang tidak dikenal
 * dijawab backend dengan `400`, sehingga URL salah ketik akan memunculkan
 * halaman galat alih-alih daftar biasa.
 */
export function readPotentialCategory(value?: string): PotentialCategory | undefined {
  return POTENTIAL_CATEGORIES.find((category) => potentialCategorySlug(category) === value);
}
