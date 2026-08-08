import { del, getOne, getPaginated, patch, post } from "@/lib/api";
import type {
  AdminPotentialQuery,
  Potential,
  PotentialCategory,
  PotentialImage,
  PotentialQuery,
} from "@/types/api";

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

// ============================================================
// DASHBOARD ADMIN
// ============================================================

/**
 * Seluruh potensi termasuk yang nonaktif. `GET /potential` menjawab 401 tanpa
 * token. `isActive` menyaringnya, dan bisa digabung dengan `category`.
 */
export function getAllPotentials(query: AdminPotentialQuery, token: string) {
  return getPaginated<Potential>("/potential", query, { token });
}

/** Dengan token, potensi nonaktif ikut terbaca — tanpa itu backend menjawab 404. */
export function getPotentialBySlugAsAdmin(slug: string, token: string) {
  return getOne<Potential>(`/potential/${slug}`, { token });
}

export interface PotentialInput {
  name: string;
  slug: string;
  category: PotentialCategory;
  description: string;
  /** Kolom opsional dikirim `null` saat dikosongkan, bukan dihilangkan. */
  thumbnail?: string | null;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  contactPerson?: string | null;
  contactPhone?: string | null;
  isActive?: boolean;
}

export function createPotential(input: PotentialInput, token: string) {
  return post<Potential>("/potential", input, { token });
}

export function updatePotential(id: string, input: Partial<PotentialInput>, token: string) {
  return patch<Potential>(`/potential/${id}`, input, { token });
}

/** Menghapus potensi **beserta seluruh gambarnya**, sama seperti UMKM. */
export function deletePotential(id: string, token: string) {
  return del<Potential>(`/potential/${id}`, { token });
}

// ---------- Gambar potensi ----------
//
// Seperti pada UMKM, `GET /potential/image/potential/:id` tidak dibungkus:
// backend menjaga sendiri gambar utamanya, dan daftar gambar sudah ikut di
// `GET /potential/:slug`.

export function getPotentialImageById(id: string) {
  return getOne<PotentialImage>(`/potential/image/${id}`);
}

export interface PotentialImageInput {
  url: string;
  potentialId: string;
  caption?: string | null;
  /** Boleh tidak dikirim: gambar pertama otomatis menjadi utama. */
  isPrimary?: boolean;
}

export function createPotentialImage(input: PotentialImageInput, token: string) {
  return post<PotentialImage>("/potential/image", input, { token });
}

/**
 * Seperti pada UMKM: backend menjaga agar gambar utama tepat satu, jadi cukup
 * satu permintaan `isPrimary: true`.
 */
export function updatePotentialImage(
  id: string,
  input: Partial<PotentialImageInput>,
  token: string,
) {
  return patch<PotentialImage>(`/potential/image/${id}`, input, { token });
}

export function deletePotentialImage(id: string, token: string) {
  return del<PotentialImage>(`/potential/image/${id}`, { token });
}
