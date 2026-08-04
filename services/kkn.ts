import { del, getOne, getPaginated, patch, post } from "@/lib/api";
import type { KKNActivity, KKNProgram, KKNSubProgram, PaginationQuery } from "@/types/api";

/** Program KKN yang aktif. */
export function getActiveKknPrograms(query: PaginationQuery = {}) {
  return getPaginated<KKNProgram>("/kkn/program/active", query, { revalidate: 600 });
}

/** Detail program beserta `activities` di dalamnya — objek tunggal. */
export function getKknProgramBySlug(slug: string) {
  return getOne<KKNProgram>(`/kkn/program/${slug}`, { revalidate: 600 });
}

export function getKknProgramsBySubProgram(subProgram: KKNSubProgram, query: PaginationQuery = {}) {
  return getPaginated<KKNProgram>(`/kkn/program/sub/${subProgram}`, query, { revalidate: 600 });
}

export function getKknActivitiesByProgram(programId: string, query: PaginationQuery = {}) {
  return getPaginated<KKNActivity>(`/kkn/activity/program/${programId}`, query, {
    revalidate: 600,
  });
}

// ============================================================
// DASHBOARD ADMIN
// ============================================================

/**
 * Seluruh program termasuk yang nonaktif. `GET /kkn/program` menjawab 401 tanpa
 * token, dan hanya menerima page, limit, dan search — tidak ada penyaring
 * sub-program di sini. `/kkn/program/sub/:subProgram` bukan penggantinya:
 * endpoint itu menyaring yang aktif saja, jadi program tersembunyi akan lenyap
 * dari dashboard justru saat pengelola mencarinya.
 */
export function getAllKknPrograms(query: PaginationQuery, token: string) {
  return getPaginated<KKNProgram>("/kkn/program", query, { token });
}

/** Dengan token, program nonaktif ikut terbaca. `activities` ikut disertakan. */
export function getKknProgramBySlugAsAdmin(slug: string, token: string) {
  return getOne<KKNProgram>(`/kkn/program/${slug}`, { token });
}

export interface KknProgramInput {
  subProgram: KKNSubProgram;
  title: string;
  slug: string;
  description: string;
  /** Berisi Markdown. */
  content: string;
  /** Kolom opsional dikirim `null` saat dikosongkan, bukan dihilangkan. */
  thumbnail?: string | null;
  isActive?: boolean;
}

export function createKknProgram(input: KknProgramInput, token: string) {
  return post<KKNProgram>("/kkn/program", input, { token });
}

export function updateKknProgram(id: string, input: Partial<KknProgramInput>, token: string) {
  return patch<KKNProgram>(`/kkn/program/${id}`, input, { token });
}

export function deleteKknProgram(id: string, token: string) {
  return del<KKNProgram>(`/kkn/program/${id}`, { token });
}

// ---------- Kegiatan ----------

export function getKknActivityById(id: string, token: string) {
  return getOne<KKNActivity>(`/kkn/activity/${id}`, { token });
}

export interface KknActivityInput {
  title: string;
  programId: string;
  description?: string | null;
  /** String ISO; lihat `fromDateInput` di lib/format.ts. */
  date?: string | null;
  /** Satu URL gambar, bukan galeri seperti UMKM dan potensi. */
  image?: string | null;
}

export function createKknActivity(input: KknActivityInput, token: string) {
  return post<KKNActivity>("/kkn/activity", input, { token });
}

export function updateKknActivity(id: string, input: Partial<KknActivityInput>, token: string) {
  return patch<KKNActivity>(`/kkn/activity/${id}`, input, { token });
}

export function deleteKknActivity(id: string, token: string) {
  return del<KKNActivity>(`/kkn/activity/${id}`, { token });
}
