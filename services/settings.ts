import { getList, patch } from "@/lib/api";
import type { Setting, SettingKey, UpdateSettingBody } from "@/types/api";

/** Pengaturan situs berbentuk pasangan key-value. Perhatikan: ARRAY POLOS, bukan `{ data }`. */
export function getSettings() {
  return getList<Setting>("/settings", {}, { revalidate: 3600 });
}

export type SettingsMap = Partial<Record<SettingKey, string>> & Record<string, string | undefined>;

/** Mengubah array pengaturan menjadi objek agar bisa diakses `settings.site_name`. */
export function toSettingsMap(settings: Setting[]): SettingsMap {
  const map: Record<string, string> = {};
  for (const setting of settings) {
    if (setting.value) map[setting.key] = setting.value;
  }
  return map;
}

/**
 * Nilai bawaan dipakai saat backend mati atau key belum diisi admin, supaya
 * navbar dan footer tetap punya isi alih-alih menampilkan bagian kosong.
 */
export const SETTINGS_FALLBACK: SettingsMap = {
  site_name: "Kembangsari Digital",
  site_description:
    "Portal informasi resmi Padukuhan Kembangsari, Kalurahan Banjararum, Kapanewon Kalibawang, Kulon Progo.",
  footer_text: "Padukuhan Kembangsari",
};

/**
 * Titik tengah dan tingkat perbesaran peta, disimpan admin sebagai string.
 * Kalau nilainya kosong atau bukan angka, dipakai koordinat Padukuhan Kembangsari.
 *
 * Angka cadangannya pernah salah: `-7.79558, 110.16349` — titik data seed yang
 * berjarak **13,6 km** dari padukuhan, dan tertulis di sini seolah-olah itu
 * koordinat Kembangsari. Akibatnya peta terbuka di kapanewon yang sama sekali
 * lain setiap kali kolom di Pengaturan kosong, dan tautan alamat di footer ikut
 * mengarah ke sana. Nilai di bawah ini sama dengan yang dipakai
 * `public/data/README.md` dan form rumah warga — jangan diganti tanpa
 * mencocokkannya dengan batas wilayah di `public/data/batas-wilayah.geojson`.
 */
export function getMapView(settings: SettingsMap): { center: [number, number]; zoom: number } {
  const latitude = Number(settings.map_latitude);
  const longitude = Number(settings.map_longitude);
  const zoom = Number(settings.map_zoom);

  return {
    center: [
      Number.isFinite(latitude) && latitude !== 0 ? latitude : -7.690025,
      Number.isFinite(longitude) && longitude !== 0 ? longitude : 110.228583,
    ],
    zoom: Number.isFinite(zoom) && zoom > 0 ? zoom : 15,
  };
}

/** Mengambil pengaturan tanpa pernah gagal — dipakai di layout yang membungkus semua halaman. */
export async function getSettingsMap(): Promise<SettingsMap> {
  try {
    return { ...SETTINGS_FALLBACK, ...toSettingsMap(await getSettings()) };
  } catch {
    return SETTINGS_FALLBACK;
  }
}

// ============================================================
// DASHBOARD ADMIN
// ============================================================

/**
 * Pengaturan tanpa cache dan tanpa nilai bawaan.
 *
 * Form pengaturan harus menampilkan apa yang benar-benar tersimpan: kalau
 * `SETTINGS_FALLBACK` ikut tercampur seperti pada `getSettingsMap`, pengelola
 * akan mengira nama situs sudah terisi padahal yang dilihatnya nilai cadangan
 * milik frontend — dan menyimpannya akan menuliskan nilai itu ke backend.
 */
export function getSettingsAsAdmin() {
  return getList<Setting>("/settings");
}

/**
 * Menyimpan satu pengaturan.
 *
 * `PATCH /settings/:key` bersifat **upsert**: key yang belum ada dibuatkan,
 * jadi menambah pengaturan baru (`tiktok`, misalnya) tidak perlu seed baru.
 * Tidak ada `DELETE` dan itu disengaja — mengosongkan `value` lebih aman
 * daripada menghilangkan key yang dipakai halaman publik.
 *
 * `value` selalu teks, termasuk untuk `map_zoom` dan koordinat.
 */
export function updateSetting(key: string, value: string, token: string) {
  const body: UpdateSettingBody = { value };
  return patch<Setting>(`/settings/${key}`, body, { token });
}
