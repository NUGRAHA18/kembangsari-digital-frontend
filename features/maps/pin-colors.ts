/**
 * Warna pin peta per kategori.
 *
 * Dipisahkan dari `map-view.tsx` karena berkas itu `"use client"` dan mengimpor
 * Leaflet di baris paling atas — Leaflet menyentuh `window` saat modulnya
 * dimuat, jadi Server Component tidak bisa mengimpor apa pun darinya. Daftar
 * lokasi di dashboard perlu warna yang sama dengan pin di peta, dan ia Server
 * Component. Berkas ini karena itu sengaja bebas React dan bebas Leaflet,
 * sepola dengan `features/maps/boundaries.ts`.
 *
 * **Warnanya berasal dari urutan kategori, bukan dari namanya.** `design-idea.md`
 * §2 memberi tabel "Balai Padukuhan → Blue, Lapangan → Green, …", dan itu tidak
 * dipakai: kategori dikelola pengelola lewat dashboard, jadi tabel bernama-tetap
 * akan putus begitu satu kategori diganti namanya atau ditambah. §28 dokumen
 * yang sama justru meminta UI berasal dari data, bukan dari tangkapan layar —
 * dan `MapCategory` di backend memang tidak punya kolom `color` sama sekali.
 *
 * Konsekuensinya tetap sama seperti sebelumnya, dan sudah disebutkan di halaman
 * kategori: menghapus atau menambah kategori menggeser warna kategori sesudahnya.
 */
export const PIN_COLORS = [
  "#15803d",
  "#f59e0b",
  "#0ea5e9",
  "#a855f7",
  "#ef4444",
  "#0d9488",
  "#e11d48",
];

export function colorForCategory(categoryId: string, categoryIds: string[]): string {
  const index = categoryIds.indexOf(categoryId);
  return PIN_COLORS[(index < 0 ? 0 : index) % PIN_COLORS.length];
}
