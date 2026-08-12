import type { Feature, FeatureCollection, Geometry } from "geojson";

/**
 * Batas wilayah padukuhan, RW, dan RT.
 *
 * Disimpan sebagai berkas statis di `public/`, bukan sebagai data backend, dan
 * itu keputusan yang disengaja: batas wilayah berubah sekali dalam sepuluh
 * tahun sementara membangun penyunting polygon di dashboard adalah pekerjaan
 * tersendiri yang besar. Berkasnya dilayani CDN, tidak ikut membesarkan bundel
 * JavaScript, dan baru diambil ketika halaman peta benar-benar dibuka.
 *
 * Cara menggambarnya ada di `public/data/README.md`.
 */

export const BOUNDARY_URL = "/data/batas-wilayah.geojson";

/**
 * Tiga yang pertama adalah wilayah (polygon), dua yang terakhir adalah ruas
 * jalan (garis). Keduanya menumpang berkas yang sama dengan sengaja: jalan dan
 * gang sama-sama bentuk yang tidak bisa diwakili sebuah titik, dan sama-sama
 * hampir tidak pernah berubah. Memberinya berkas sendiri hanya menambah satu
 * permintaan jaringan untuk data yang selalu dibutuhkan bersamaan.
 */
export type BoundaryType = "PADUKUHAN" | "RW" | "RT" | "JALAN" | "GANG";

export interface BoundaryProperties {
  /** Nama yang tampil di peta dan legenda, mis. "RT 05" atau "Gang Melati". */
  nama: string;
  tipe: BoundaryType;
  /** RW induk sebuah RT, mis. "RW 03". Kosong untuk padukuhan, jalan, dan gang. */
  induk?: string | null;
  /** Warna garis. Kalau kosong, dipakai palet berdasarkan urutan. */
  warna?: string | null;
}

export type BoundaryFeature = Feature<Geometry, BoundaryProperties>;
export type BoundaryCollection = FeatureCollection<Geometry, BoundaryProperties>;

/**
 * Palet cadangan, dipakai kalau sebuah wilayah tidak menuliskan `warna`
 * sendiri. Sengaja berbeda dari palet pin (`PIN_COLORS`) supaya garis batas
 * tidak pernah tertukar dengan kategori lokasi.
 */
const BOUNDARY_COLORS = ["#0ea5e9", "#a855f7", "#f97316", "#14b8a6", "#e11d48", "#84cc16"];

export function boundaryColor(feature: BoundaryFeature, index: number): string {
  return feature.properties.warna || BOUNDARY_COLORS[index % BOUNDARY_COLORS.length];
}

/**
 * Tampilan sebuah wilayah atau ruas jalan.
 *
 * Disatukan di sini, bukan disebar sebagai beberapa fungsi kecil, supaya
 * keputusan "apa bedanya jalan dari batas RT di layar" bisa dibaca sekaligus.
 * Bentuknya objek biasa dan bukan tipe milik Leaflet — berkas ini juga
 * diimpor legenda, yang tidak boleh ikut menarik pustaka peta ke bundelnya.
 */
export function boundaryStyle(feature: BoundaryFeature, index: number) {
  const { tipe } = feature.properties;
  const color = boundaryColor(feature, index);

  // Jalan dan gang adalah garis, bukan bidang: `fillOpacity` tidak berlaku
  // pada LineString, dan lebarnya yang membedakan jalan utama dari gang.
  if (tipe === "JALAN" || tipe === "GANG") {
    return { color, weight: tipe === "JALAN" ? 5 : 3, opacity: 0.8, fillOpacity: 0 };
  }

  return {
    color,
    // Batas padukuhan paling tebal dan putus-putus supaya terbaca sebagai
    // "tepi luar", bukan sebagai satu wilayah lagi yang setara dengan RT.
    weight: tipe === "PADUKUHAN" ? 3 : tipe === "RW" ? 2.5 : 2,
    dashArray: tipe === "PADUKUHAN" ? "8 6" : undefined,
    fillColor: color,
    // Isian sengaja nyaris tembus pandang: peta ini penuh pin, dan wilayah
    // bertumpuk yang berwarna pekat menenggelamkan semuanya.
    fillOpacity: tipe === "RT" ? 0.1 : 0.04,
  };
}

/**
 * Membaca berkas batas wilayah dan membuang isi yang tidak berbentuk GeoJSON.
 *
 * Berkasnya disunting tangan lewat geojson.io, jadi salah tempel adalah
 * kemungkinan yang nyata — dan peta tidak boleh runtuh karenanya. Yang gagal
 * dibaca diperlakukan sama dengan "belum ada batas wilayah".
 */
export function parseBoundaries(payload: unknown): BoundaryFeature[] {
  if (!payload || typeof payload !== "object") return [];

  const { features } = payload as Partial<BoundaryCollection>;
  if (!Array.isArray(features)) return [];

  return features.filter((feature): feature is BoundaryFeature => {
    if (!feature || typeof feature !== "object") return false;
    if (!feature.geometry) return false;

    const nama = (feature.properties as Partial<BoundaryProperties> | null)?.nama;
    return typeof nama === "string" && nama.length > 0;
  });
}
