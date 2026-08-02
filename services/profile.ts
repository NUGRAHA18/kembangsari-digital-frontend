import { getList, getOne } from "@/lib/api";
import type { Profile } from "@/types/api";

/** Halaman profil — ARRAY POLOS, jumlahnya sedikit (sejarah, visi-misi, struktur). */
export function getProfiles() {
  return getList<Profile>("/profile", {}, { revalidate: 3600 });
}

export function getProfileBySlug(slug: string) {
  return getOne<Profile>(`/profile/${slug}`, { revalidate: 3600 });
}
