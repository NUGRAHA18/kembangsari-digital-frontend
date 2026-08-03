import { del, getOne, getPaginated, patch, post } from "@/lib/api";
import type { Agenda, PaginationQuery } from "@/types/api";

/** Seluruh agenda, termasuk yang sudah lewat. */
export function getAgendaList(query: PaginationQuery = {}) {
  return getPaginated<Agenda>("/agenda", query, { revalidate: 300 });
}

/** Agenda yang belum berlangsung — yang paling sering dibuka warga. */
export function getUpcomingAgenda(query: PaginationQuery = {}) {
  return getPaginated<Agenda>("/agenda/upcoming", query, { revalidate: 300 });
}

/**
 * Detail agenda. `GET /agenda/:idOrSlug` menerima keduanya — halaman publik
 * memakai slug supaya tautannya enak dibagikan ke grup WhatsApp, sementara id
 * tetap bekerja untuk dashboard admin.
 */
export function getAgendaBySlug(slug: string) {
  return getOne<Agenda>(`/agenda/${slug}`, { revalidate: 300 });
}

// ============================================================
// DASHBOARD ADMIN
// ============================================================

/**
 * Bentuk isian agenda.
 *
 * `slug` sengaja opsional: kalau dikosongkan backend membuatnya sendiri dari
 * judul, lengkap dengan penomoran saat judulnya berulang — "posyandu-balita",
 * lalu "posyandu-balita-2". Kegiatan seperti Posyandu memang berulang tiap
 * bulan dengan judul sama, jadi jangan mengisinya otomatis dari sisi ini.
 */
export interface AgendaInput {
  title: string;
  slug?: string;
  /**
   * Field opsional dikirim `null` — bukan dihilangkan — saat dikosongkan.
   * Menghilangkannya membuat `PATCH` mempertahankan nilai lama, sehingga
   * keterangan atau waktu selesai yang dihapus pengelola diam-diam kembali.
   * Backend menerimanya karena `@IsOptional()` melewatkan `null`.
   */
  description?: string | null;
  location?: string | null;
  /** ISO 8601 lengkap dengan offset, mis. "2026-08-24T13:00:00+07:00". */
  startDate: string;
  endDate?: string | null;
}

export function createAgenda(input: AgendaInput, token: string) {
  return post<Agenda>("/agenda", input, { token });
}

/** `PATCH` memakai id, walaupun halaman detail dibuka lewat slug. */
export function updateAgenda(id: string, input: Partial<AgendaInput>, token: string) {
  return patch<Agenda>(`/agenda/${id}`, input, { token });
}

export function deleteAgenda(id: string, token: string) {
  return del<Agenda>(`/agenda/${id}`, { token });
}

/** Versi tanpa cache untuk dashboard — daftar admin tidak boleh basi setelah menyimpan. */
export function getAgendaListAsAdmin(query: PaginationQuery, token: string) {
  return getPaginated<Agenda>("/agenda", query, { token });
}

export function getAgendaBySlugAsAdmin(slug: string, token: string) {
  return getOne<Agenda>(`/agenda/${slug}`, { token });
}
