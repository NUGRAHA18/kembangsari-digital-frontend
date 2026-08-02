import { getList } from "@/lib/api";
import type { MapCategory, MapMarker } from "@/types/api";

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
