import { getList } from "@/lib/api";
import type { Setting, SettingKey } from "@/types/api";

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
 */
export function getMapView(settings: SettingsMap): { center: [number, number]; zoom: number } {
  const latitude = Number(settings.map_latitude);
  const longitude = Number(settings.map_longitude);
  const zoom = Number(settings.map_zoom);

  return {
    center: [
      Number.isFinite(latitude) && latitude !== 0 ? latitude : -7.79558,
      Number.isFinite(longitude) && longitude !== 0 ? longitude : 110.16349,
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
