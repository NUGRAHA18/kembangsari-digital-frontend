import { del, getOne, getPaginated, patch, post } from "@/lib/api";
import type { AdminAnnouncementQuery, Announcement, PaginationQuery } from "@/types/api";

/** Hanya pengumuman yang masih aktif — inilah yang tampil di beranda. */
export function getActiveAnnouncements(query: PaginationQuery = {}) {
  return getPaginated<Announcement>("/announcement/active", query, { revalidate: 300 });
}

/** Pengumuman nonaktif dijawab 404 untuk pemanggil tanpa token. */
export function getAnnouncementById(id: string) {
  return getOne<Announcement>(`/announcement/${id}`, { revalidate: 300 });
}

// ============================================================
// DASHBOARD ADMIN
// ============================================================

export interface AnnouncementInput {
  title: string;
  content: string;
  isActive?: boolean;
}

/**
 * Seluruh pengumuman termasuk yang nonaktif. `GET /announcement` menjawab 401
 * tanpa token; `isActive` menyaringnya.
 */
export function getAllAnnouncements(query: AdminAnnouncementQuery, token: string) {
  return getPaginated<Announcement>("/announcement", query, { token });
}

/** Dengan token, pengumuman nonaktif ikut terbaca. */
export function getAnnouncementByIdAsAdmin(id: string, token: string) {
  return getOne<Announcement>(`/announcement/${id}`, { token });
}

export function createAnnouncement(input: AnnouncementInput, token: string) {
  return post<Announcement>("/announcement", input, { token });
}

export function updateAnnouncement(
  id: string,
  input: Partial<AnnouncementInput>,
  token: string,
) {
  return patch<Announcement>(`/announcement/${id}`, input, { token });
}

export function deleteAnnouncement(id: string, token: string) {
  return del<Announcement>(`/announcement/${id}`, { token });
}
