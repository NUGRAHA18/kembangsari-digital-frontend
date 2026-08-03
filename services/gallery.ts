import { del, getOne, getPaginated, patch, post } from "@/lib/api";
import type { GalleryAlbum, GalleryItem, GalleryType, PaginationQuery } from "@/types/api";

/** Daftar album; tiap album membawa `_count.items`. */
export function getGalleryAlbums(query: PaginationQuery = {}) {
  return getPaginated<GalleryAlbum>("/gallery/album", query, { revalidate: 600 });
}

/** Detail album beserta `items` di dalamnya — objek tunggal. */
export function getGalleryAlbumBySlug(slug: string) {
  return getOne<GalleryAlbum>(`/gallery/album/${slug}`, { revalidate: 600 });
}

/** Foto pilihan untuk beranda. */
export function getFeaturedGalleryItems(query: PaginationQuery = {}) {
  return getPaginated<GalleryItem>("/gallery/item/featured", query, { revalidate: 600 });
}

export function getGalleryItemsByAlbum(albumId: string, query: PaginationQuery = {}) {
  return getPaginated<GalleryItem>(`/gallery/item/album/${albumId}`, query, { revalidate: 600 });
}

// ============================================================
// DASHBOARD ADMIN
//
// Galeri tidak punya penanda sembunyi, jadi endpoint bacanya sama dengan yang
// dipakai portal warga — bedanya di sini tanpa `revalidate`, supaya foto yang
// baru diunggah langsung terlihat alih-alih menunggu cache sepuluh menit.
// ============================================================

export function getGalleryAlbumsAsAdmin(query: PaginationQuery = {}) {
  return getPaginated<GalleryAlbum>("/gallery/album", query);
}

/** Detail album beserta seluruh `items`-nya. */
export function getGalleryAlbumBySlugAsAdmin(slug: string) {
  return getOne<GalleryAlbum>(`/gallery/album/${slug}`);
}

export function getGalleryItemById(id: string) {
  return getOne<GalleryItem>(`/gallery/item/${id}`);
}

export interface AlbumInput {
  name: string;
  slug: string;
  description?: string | null;
  thumbnail?: string | null;
}

export function createGalleryAlbum(input: AlbumInput, token: string) {
  return post<GalleryAlbum>("/gallery/album", input, { token });
}

export function updateGalleryAlbum(id: string, input: Partial<AlbumInput>, token: string) {
  return patch<GalleryAlbum>(`/gallery/album/${id}`, input, { token });
}

/**
 * Menghapus album **beserta seluruh isinya** — backend menghapus itemnya lebih
 * dulu dalam satu transaksi. Jadi ini bukan penghapusan wadah kosong, dan
 * halaman konfirmasinya wajib menyebut berapa foto yang ikut hilang.
 */
export function deleteGalleryAlbum(id: string, token: string) {
  return del<GalleryAlbum>(`/gallery/album/${id}`, { token });
}

export interface GalleryItemInput {
  url: string;
  albumId: string;
  type?: GalleryType;
  caption?: string | null;
  isFeatured?: boolean;
}

export function createGalleryItem(input: GalleryItemInput, token: string) {
  return post<GalleryItem>("/gallery/item", input, { token });
}

export function updateGalleryItem(
  id: string,
  input: Partial<GalleryItemInput>,
  token: string,
) {
  return patch<GalleryItem>(`/gallery/item/${id}`, input, { token });
}

export function deleteGalleryItem(id: string, token: string) {
  return del<GalleryItem>(`/gallery/item/${id}`, { token });
}
