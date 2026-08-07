import { del, getList, getOne, getPaginated, patch, post, MAX_PAGE_LIMIT } from "@/lib/api";
import type { MapCategory, MapMarker, PaginationQuery } from "@/types/api";

/**
 * ARRAY POLOS dan sengaja tidak dipaginasi: peta harus menggambar semua pin
 * sekaligus, bukan 10 per halaman. Jangan membaca `.data` di sini.
 */
export function getActiveMarkers() {
  return getList<MapMarker>("/maps/marker/active", {}, { revalidate: 600 });
}

/** Kategori marker — ARRAY POLOS, dipakai untuk filter dan warna pin. */
export function getMapCategories() {
  return getList<MapCategory>("/maps/category", {}, { revalidate: 600 });
}

/**
 * Kategori marker tanpa cache.
 *
 * Dipakai Server Action untuk memeriksa `categoryId` yang dikirim form.
 * `getMapCategories` menyimpan jawabannya sepuluh menit, dan kategori yang baru
 * dibuat pada menit yang sama akan terbaca sebagai tidak ada — marker yang
 * sebenarnya sah pun ditolak dengan alasan yang membingungkan pengelola.
 */
export function getMapCategoriesUncached() {
  return getList<MapCategory>("/maps/category");
}

/** Satu kategori marker. Publik, tidak butuh token. */
export function getMapCategoryById(id: string) {
  return getOne<MapCategory>(`/maps/category/${id}`, { revalidate: 600 });
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
 * Query yang diterima hanya `page`, `limit`, dan `search`; sejak backend
 * memakai `forbidNonWhitelisted`, parameter lain dijawab `400`. Karena itu
 * daftar dashboard tidak punya saringan kategori — penyaringnya
 * `/maps/marker/category/:categoryId`, endpoint terpisah yang tidak
 * terdokumentasi apakah ikut menyembunyikan marker nonaktif seperti
 * `/maps/marker/active`. Marker tersembunyi justru yang paling perlu dicari
 * pengelola, jadi risikonya tidak diambil.
 */
export function getAllMarkers(query: PaginationQuery, token: string) {
  return getPaginated<MapMarker>("/maps/marker", query, { token });
}

/** Dengan token, marker nonaktif ikut terbaca. `category` selalu disertakan. */
export function getMarkerById(id: string, token: string) {
  return getOne<MapMarker>(`/maps/marker/${id}`, { token });
}

/**
 * Mengambil seluruh marker lintas halaman.
 *
 * Dipakai halaman kategori peta: `GET /maps/category` tidak menyertakan
 * `_count` seperti kategori berita, padahal `MapMarker.categoryId` adalah
 * relasi wajib — kategori yang masih dipakai akan ditolak database dengan
 * "Referensi data tidak valid". Jumlahnya dihitung sendiri di sini, dari
 * endpoint admin supaya marker yang disembunyikan ikut terhitung.
 *
 * Marker satu padukuhan jumlahnya puluhan, jadi perulangannya nyaris selalu
 * berhenti setelah satu permintaan.
 */
export async function getEveryMarker(token: string): Promise<MapMarker[]> {
  const markers: MapMarker[] = [];
  let page = 1;
  let lastPage = 1;

  do {
    const response = await getAllMarkers({ page, limit: MAX_PAGE_LIMIT }, token);
    markers.push(...response.data);
    lastPage = response.meta.lastPage;
    page += 1;
  } while (page <= lastPage);

  return markers;
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
 * Menghapus kategori marker.
 *
 * Akan gagal selama masih ada marker yang memakainya: `MapMarker.categoryId`
 * relasi wajib, sama seperti `News.categoryId`. Pemanggil memeriksa jumlah
 * pemakaiannya lebih dulu agar pengelola tidak menemui pesan database.
 */
export function deleteMapCategory(id: string, token: string) {
  return del<MapCategory>(`/maps/category/${id}`, { token });
}
