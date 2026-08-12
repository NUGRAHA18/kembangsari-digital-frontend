import { del, getList, getOne, getPaginated, patch, post } from "@/lib/api";
import type { AdminMarkerQuery, MapCategory, MapMarker } from "@/types/api";

/**
 * ARRAY POLOS dan sengaja tidak dipaginasi: peta harus menggambar semua pin
 * sekaligus, bukan 10 per halaman. Jangan membaca `.data` di sini.
 */
export function getActiveMarkers() {
  return getList<MapMarker>("/maps/marker/active", {}, { revalidate: 600 });
}

/**
 * Kategori marker — ARRAY POLOS, dipakai untuk filter dan warna pin.
 *
 * Menyertakan `_count.markers`, termasuk marker yang disembunyikan.
 */
export function getMapCategories() {
  return getList<MapCategory>("/maps/category", {}, { revalidate: 600 });
}

/**
 * Kategori marker tanpa cache — dipakai seluruh dashboard, bukan hanya Server
 * Action.
 *
 * `getMapCategories` menyimpan jawabannya sepuluh menit. Dua akibatnya sama-sama
 * tidak bisa diterima di dashboard: kategori yang baru dibuat terbaca sebagai
 * tidak ada saat marker disimpan, dan `_count.markers` yang basi membuat halaman
 * hapus menyebut angka yang lebih kecil daripada jumlah titik yang benar-benar
 * akan ikut terhapus.
 */
export function getMapCategoriesUncached() {
  return getList<MapCategory>("/maps/category");
}

/** Versi tanpa cache, dengan alasan yang sama seperti `getMapCategoriesUncached`. */
export function getMapCategoryByIdUncached(id: string) {
  return getOne<MapCategory>(`/maps/category/${id}`);
}

// ============================================================
// DASHBOARD ADMIN — semuanya butuh token
//
// Tidak satu pun memakai `revalidate`: respons bertoken berisi marker yang
// sengaja disembunyikan dari warga, dan cache Next.js tidak membedakan siapa
// yang meminta.
// ============================================================

/**
 * Seluruh marker termasuk yang disembunyikan — `GET /maps/marker` menjawab
 * `401` tanpa token.
 *
 * Selain `page`, `limit`, dan `search`, daftar ini menerima `categoryId` dan
 * `isActive` — dua saringan yang bisa dipakai bersamaan. Itulah yang tidak
 * bisa dilakukan `/maps/marker/category/:categoryId`, dan sebabnya endpoint
 * terpisah itu tidak dipakai dashboard meski ia ikut menampilkan marker
 * nonaktif untuk pemanggil bertoken.
 */
export function getAllMarkers(query: AdminMarkerQuery, token: string) {
  return getPaginated<MapMarker>("/maps/marker", query, { token });
}

/** Dengan token, marker nonaktif ikut terbaca. `category` selalu disertakan. */
export function getMarkerById(id: string, token: string) {
  return getOne<MapMarker>(`/maps/marker/${id}`, { token });
}

export interface MarkerInput {
  name: string;
  categoryId: string;
  /** Wajib: marker tanpa koordinat tidak bisa digambar di peta. */
  latitude: number;
  longitude: number;
  /** Kolom opsional dikirim `null` saat dikosongkan, bukan dihilangkan. */
  description?: string | null;
  address?: string | null;
  phone?: string | null;
  image?: string | null;
  isActive?: boolean;
}

export function createMarker(input: MarkerInput, token: string) {
  return post<MapMarker>("/maps/marker", input, { token });
}

export function updateMarker(id: string, input: Partial<MarkerInput>, token: string) {
  return patch<MapMarker>(`/maps/marker/${id}`, input, { token });
}

export function deleteMarker(id: string, token: string) {
  return del<MapMarker>(`/maps/marker/${id}`, { token });
}

export interface MapCategoryInput {
  name: string;
  slug: string;
  /** Nama ikon, bukan URL — lihat catatan di form kategori peta. */
  icon?: string | null;
}

export function createMapCategory(input: MapCategoryInput, token: string) {
  return post<MapCategory>("/maps/category", input, { token });
}

export function updateMapCategory(id: string, input: Partial<MapCategoryInput>, token: string) {
  return patch<MapCategory>(`/maps/category/${id}`, input, { token });
}

/**
 * Menghapus kategori marker **beserta seluruh marker di dalamnya**.
 *
 * Berbeda dari kategori berita: yang itu ditolak `400` selama masih dipakai,
 * yang ini berantai dalam satu transaksi. Karena itu pemanggil tidak
 * mematikan tombol hapusnya, melainkan memperingatkan berapa titik lokasi
 * yang akan ikut hilang — angkanya dari `_count.markers`.
 */
export function deleteMapCategory(id: string, token: string) {
  return del<MapCategory>(`/maps/category/${id}`, { token });
}
