import { getOne, getPaginated } from "@/lib/api";
import type { GalleryAlbum, GalleryItem, PaginationQuery } from "@/types/api";

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
