import { del, getList, getOne, getPaginated, patch, post } from "@/lib/api";
import type {
  Family,
  FamilyRelation,
  Gender,
  House,
  HouseSummary,
  PaginationQuery,
  Resident,
} from "@/types/api";

/**
 * Rumah warga, kartu keluarga, dan penghuninya.
 *
 * Tiga model bertingkat: `House` → `Family` → `Resident`. Penghapusan berantai
 * dijaga basis data (`onDelete: Cascade`), jadi menghapus rumah cukup satu
 * permintaan — jangan menghapus KK dan warganya satu per satu lebih dulu.
 */

// ============================================================
// PUBLIK
// ============================================================

/** Saringan yang diterima daftar publik. Tidak ada `isActive` di sini. */
export interface HouseQuery extends PaginationQuery {
  rt?: string;
  rw?: string;
}

/**
 * ARRAY POLOS, bukan `{ data, meta }` — jangan membaca `.data`.
 *
 * Sengaja tidak dipaginasi seperti `/maps/marker/active`: peta menggambar
 * seluruh rumah sekaligus. `page` dan `limit` tetap diterima backend, tetapi
 * halaman peta tidak memakainya.
 *
 * `?search=` di sini ikut mencocokkan **nama penghuni**, bukan hanya `label`,
 * `address`, dan `note` — jadi satu kotak pencarian sudah cukup untuk
 * menemukan "rumah yang penghuninya bernama X".
 */
export function getActiveHouses(query: HouseQuery = {}) {
  return getList<House>("/house/active", query, { revalidate: 600 });
}

/**
 * Ringkasan per RT — ARRAY POLOS.
 *
 * Hanya menghitung rumah yang aktif, dan urutannya numerik (RT 6 sebelum
 * RT 10), bukan alfabetis. Dipakai agar halaman publik tidak perlu mengunduh
 * ketujuh puluh rumah beserta seluruh penghuninya hanya untuk menjumlahkannya.
 */
export function getHouseSummary() {
  return getList<HouseSummary>("/house/summary", {}, { revalidate: 600 });
}

/**
 * Satu rumah beserta `families[].residents[]`-nya. Menerima id maupun slug.
 *
 * Tanpa token, rumah yang disembunyikan dijawab `404` — jadi halaman detailnya
 * cukup memakai `fetchOrNotFound`, tanpa menyaring `isActive` sendiri.
 */
export function getHouseBySlug(idOrSlug: string) {
  return getOne<House>(`/house/${idOrSlug}`, { revalidate: 600 });
}

// ============================================================
// DASHBOARD ADMIN — semuanya butuh token
//
// Tidak satu pun memakai `revalidate`: respons bertoken memuat rumah yang
// sengaja disembunyikan dari warga, dan cache Next.js tidak membedakan siapa
// yang meminta.
// ============================================================

export interface AdminHouseQuery extends HouseQuery {
  isActive?: boolean;
}

/** `GET /house` menjawab `401` tanpa token. */
export function getAllHouses(query: AdminHouseQuery, token: string) {
  return getPaginated<House>("/house", query, { token });
}

/** Dengan token, rumah yang disembunyikan ikut terbaca. */
export function getHouseByIdAsAdmin(idOrSlug: string, token: string) {
  return getOne<House>(`/house/${idOrSlug}`, { token });
}

export interface HouseInput {
  label: string;
  /** Teks, bukan angka — ada RT "6A" di sebagian padukuhan. */
  rt: string;
  rw: string;
  /** Wajib: rumah tanpa koordinat tersimpan tanpa pernah tampil di peta. */
  latitude: number;
  longitude: number;
  /** Kolom opsional dikirim `null` saat dikosongkan, bukan dihilangkan. */
  address?: string | null;
  photo?: string | null;
  note?: string | null;
  /** Kapan pendata terakhir memeriksanya. Bukan `updatedAt`. */
  dataVerifiedAt?: string | null;
  isActive?: boolean;
}

export function createHouse(input: HouseInput, token: string) {
  return post<House>("/house", input, { token });
}

export function updateHouse(id: string, input: Partial<HouseInput>, token: string) {
  return patch<House>(`/house/${id}`, input, { token });
}

/**
 * Menghapus rumah **beserta seluruh KK dan penghuninya**, berantai di tingkat
 * basis data. Menjawab `204` tanpa isi, dan menuntut peran `ADMIN` — bukan
 * sekadar token yang sah.
 */
export function deleteHouse(id: string, token: string) {
  return del<void>(`/house/${id}`, { token });
}

// ------------------------------------------------------------
// Kartu keluarga
// ------------------------------------------------------------

export interface FamilyInput {
  houseId: string;
  kkNumber?: string | null;
  /** Tidak dikirim berarti "letakkan di urutan terakhir". */
  order?: number;
}

export function createFamily(input: FamilyInput, token: string) {
  return post<Family>("/house/family", input, { token });
}

/**
 * `houseId` sengaja tidak ikut: memindahkan satu KK ke rumah lain lewat
 * `PATCH` mengubah `_count` dua rumah sekaligus tanpa terlihat di mana pun.
 * Kalau memang perlu dipindah — hapus lalu buat ulang.
 */
export function updateFamily(
  id: string,
  input: Omit<Partial<FamilyInput>, "houseId">,
  token: string,
) {
  return patch<Family>(`/house/family/${id}`, input, { token });
}

/** Ikut menghapus seluruh penghuninya. `204`, dan menuntut peran `ADMIN`. */
export function deleteFamily(id: string, token: string) {
  return del<void>(`/house/family/${id}`, { token });
}

// ------------------------------------------------------------
// Penghuni
// ------------------------------------------------------------

export interface ResidentInput {
  familyId: string;
  name: string;
  relation: FamilyRelation;
  /** Tahun lahir, bukan umur. Ditolak backend di bawah 1900 atau di atas tahun berjalan. */
  birthYear?: number | null;
  gender?: Gender | null;
  order?: number;
}

/**
 * Penghuni pertama sebuah KK **selalu** menjadi kepala keluarga, apa pun
 * `relation` yang dikirim — dijaga backend, sama seperti gambar pertama
 * sebuah UMKM yang selalu menjadi utama. Jangan menambalnya dari sini.
 */
export function createResident(input: ResidentInput, token: string) {
  return post<Resident>("/house/resident", input, { token });
}

/**
 * `familyId` sengaja tidak ikut, dengan alasan yang sama seperti `houseId`
 * pada `updateFamily`.
 *
 * Mengirim `relation: "KEPALA_KELUARGA"` melepas penanda penghuni lain dalam
 * satu transaksi, dan yang lama menjadi `LAINNYA` — penanda "hubungan
 * aslinya belum dibetulkan", bukan data yang sudah benar.
 */
export function updateResident(
  id: string,
  input: Omit<Partial<ResidentInput>, "familyId">,
  token: string,
) {
  return patch<Resident>(`/house/resident/${id}`, input, { token });
}

/** `204`, dan menuntut peran `ADMIN`. */
export function deleteResident(id: string, token: string) {
  return del<void>(`/house/resident/${id}`, { token });
}
