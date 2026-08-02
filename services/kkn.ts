import { getOne, getPaginated } from "@/lib/api";
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
