import type { FilterOption } from "@/components/ui/filter-chips";
import { readParam, type RawSearchParams } from "@/lib/page-params";

/**
 * Saringan status untuk daftar dashboard.
 *
 * Daftar bertoken menerima `?published=` (berita, monografi) atau `?isActive=`
 * (pengumuman, UMKM, potensi, program KKN, peta). Tidak dikirim berarti semua,
 * dan `meta.total` ikut menyesuaikan — itulah bedanya dengan menyaring sendiri
 * satu halaman hasil, yang membuat jumlahnya menyesatkan.
 *
 * Nilai di URL memakai kata Indonesia (`?status=draf`) supaya alamat halaman
 * tetap terbaca saat dibagikan antar pengelola, bukan `?published=false`.
 * Berkas ini sengaja bebas React: halaman daftar mengimpornya sebagai Server
 * Component.
 */
export interface StatusVocabulary {
  /** Nilai query string dan labelnya untuk keadaan "terbit"/"tampil". */
  onValue: string;
  onLabel: string;
  /** Keadaan sebaliknya: "draf"/"disembunyikan". */
  offValue: string;
  offLabel: string;
}

/** Untuk modul yang statusnya terbit atau draf: berita dan monografi. */
export const PUBLISH_STATUS: StatusVocabulary = {
  onValue: "terbit",
  onLabel: "Terbit",
  offValue: "draf",
  offLabel: "Draf",
};

/** Untuk modul yang statusnya tampil atau disembunyikan. */
export const VISIBILITY_STATUS: StatusVocabulary = {
  onValue: "tampil",
  onLabel: "Tampil",
  offValue: "tersembunyi",
  offLabel: "Disembunyikan",
};

export interface ActiveStatus {
  /** Dikirim ke backend sebagai `published` atau `isActive`. */
  value: boolean | undefined;
  /** Dikembalikan ke URL — `undefined` bila query string-nya tidak dikenali. */
  param: string | undefined;
}

/**
 * Membaca `?status=` dan menerjemahkannya menjadi boolean.
 *
 * Nilai di luar kosakata diperlakukan sebagai "semua", bukan diteruskan ke
 * backend: parameter `published` yang bukan true/false dijawab `400`, dan
 * halaman daftar tidak boleh runtuh hanya karena salah ketik di alamat.
 */
export function readStatus(params: RawSearchParams, vocabulary: StatusVocabulary): ActiveStatus {
  const raw = readParam(params, "status");

  if (raw === vocabulary.onValue) return { value: true, param: raw };
  if (raw === vocabulary.offValue) return { value: false, param: raw };

  return { value: undefined, param: undefined };
}

/** Tiga chip: semua, aktif, tidak aktif. */
export function statusOptions(vocabulary: StatusVocabulary): FilterOption[] {
  return [
    { label: "Semua" },
    { value: vocabulary.onValue, label: vocabulary.onLabel },
    { value: vocabulary.offValue, label: vocabulary.offLabel },
  ];
}
