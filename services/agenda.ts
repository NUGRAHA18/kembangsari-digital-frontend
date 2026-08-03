import { getOne, getPaginated } from "@/lib/api";
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
