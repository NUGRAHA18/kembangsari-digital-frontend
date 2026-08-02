import { getOne, getPaginated } from "@/lib/api";
import type { Announcement, PaginationQuery } from "@/types/api";

/** Hanya pengumuman yang masih aktif — inilah yang tampil di beranda. */
export function getActiveAnnouncements(query: PaginationQuery = {}) {
  return getPaginated<Announcement>("/announcement/active", query, { revalidate: 300 });
}

export function getAnnouncementById(id: string) {
  return getOne<Announcement>(`/announcement/${id}`, { revalidate: 300 });
}
