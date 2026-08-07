import { del, getList, getOne, patch, post } from "@/lib/api";
import type { Profile } from "@/types/api";

/** Halaman profil — ARRAY POLOS, jumlahnya sedikit (sejarah, visi-misi, struktur). */
export function getProfiles() {
  return getList<Profile>("/profile", {}, { revalidate: 3600 });
}

export function getProfileBySlug(slug: string) {
  return getOne<Profile>(`/profile/${slug}`, { revalidate: 3600 });
}

// ============================================================
// DASHBOARD ADMIN
// ============================================================

/**
 * Sama dengan `getProfiles`, tetapi tanpa cache satu jam.
 *
 * Halaman profil tidak punya status tersembunyi, jadi dashboard memakai
 * endpoint yang sama dengan warga. Yang tidak boleh sama adalah cache-nya:
 * pengelola harus melihat tulisannya sendiri seketika, bukan sejam kemudian.
 */
export function getProfilesAsAdmin() {
  return getList<Profile>("/profile");
}

/** Detail untuk form ubah — juga tanpa cache, karena alasan yang sama. */
export function getProfileBySlugAsAdmin(slug: string) {
  return getOne<Profile>(`/profile/${slug}`);
}

export interface ProfileInput {
  title: string;
  slug: string;
  /** Berisi Markdown. */
  content: string;
  /** Kolom opsional dikirim `null` saat dikosongkan, bukan dihilangkan. */
  thumbnail?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
}

export function createProfile(input: ProfileInput, token: string) {
  return post<Profile>("/profile", input, { token });
}

/** Perhatikan: `PATCH` dan `DELETE` memakai **id**, sedangkan `GET` memakai slug. */
export function updateProfile(id: string, input: Partial<ProfileInput>, token: string) {
  return patch<Profile>(`/profile/${id}`, input, { token });
}

export function deleteProfile(id: string, token: string) {
  return del<Profile>(`/profile/${id}`, { token });
}
