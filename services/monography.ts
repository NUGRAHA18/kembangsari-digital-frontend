import { del, getOne, getPaginated, patch, post } from "@/lib/api";
import type { EmploymentData, PaginationQuery, PopulationStat } from "@/types/api";

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

// ============================================================
// DASHBOARD ADMIN — semuanya butuh token
//
// Tidak satu pun memakai `revalidate`: respons bertoken memuat tahun yang
// belum diterbitkan, dan cache Next.js tidak membedakan siapa yang meminta.
// ============================================================

/** Seluruh tahun termasuk yang belum terbit. `GET /monography` menjawab 401 tanpa token. */
export function getAllMonography(query: Omit<PaginationQuery, "search">, token: string) {
  return getPaginated<PopulationStat>("/monography", query, { token });
}

/**
 * Satu baris statistik menurut id.
 *
 * Dashboard menelusuri id, bukan tahun seperti halaman publik: tahun adalah
 * kolom yang bisa disunting, dan alamat halaman tidak boleh ikut berubah
 * ketika pengelola membetulkan salah ketik pada tahunnya.
 */
export function getMonographyByIdAsAdmin(id: string, token: string) {
  return getOne<PopulationStat>(`/monography/${id}`, { token });
}

/**
 * Isian statistik penduduk.
 *
 * Hanya `year`, `totalPopulation`, `maleCount`, dan `femaleCount` yang wajib.
 * Sisanya `number | null`, dan `null` di sini berarti **tidak didata** — bukan
 * nol. Itu sebabnya kolom yang dikosongkan tetap dikirim sebagai `null`:
 * menghilangkannya membuat `PATCH` mempertahankan angka lama yang baru saja
 * dihapus pengelola.
 */
export interface MonographyInput {
  year: number;
  totalPopulation: number;
  maleCount: number;
  femaleCount: number;

  educationNoSchool?: number | null;
  educationSD?: number | null;
  educationSLTP?: number | null;
  educationSLTA?: number | null;
  educationD1_D3?: number | null;
  educationS1?: number | null;
  educationS2?: number | null;
  educationS3?: number | null;

  /** Objek utuh, bukan tambalan: `PATCH` menimpanya sekaligus. */
  employmentData?: EmploymentData | null;

  religionIslam?: number | null;
  religionProtestant?: number | null;
  religionCatholic?: number | null;
  religionHindu?: number | null;
  religionBuddha?: number | null;
  religionKonghucu?: number | null;
  religionOther?: number | null;

  familyHeadCount?: number | null;
  familyCount?: number | null;
  rtCount?: number | null;
  rwCount?: number | null;

  isPublished?: boolean;
}

export function createMonography(input: MonographyInput, token: string) {
  return post<PopulationStat>("/monography", input, { token });
}

export function updateMonography(id: string, input: Partial<MonographyInput>, token: string) {
  return patch<PopulationStat>(`/monography/${id}`, input, { token });
}

export function deleteMonography(id: string, token: string) {
  return del<PopulationStat>(`/monography/${id}`, { token });
}
