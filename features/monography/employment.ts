import type { EmploymentData, EmploymentStatus } from "@/types/api";
import type { StatBarItem } from "@/features/monography/stat-bars";

/**
 * Label Indonesia untuk kunci `employmentData`.
 *
 * Ditulis manual, tidak diturunkan dari `humanizeEnum`: fungsi itu akan
 * menghasilkan "Pns", "Tni Polri", dan "Guru Dosen" — bentuk yang salah untuk
 * singkatan dan untuk pasangan profesi yang lazim ditulis dengan garis miring.
 *
 * Urutannya mengikuti enum `EmploymentStatus` di backend, bukan diurutkan dari
 * yang terbesar: urutan yang tetap membuat perbandingan antar-tahun mudah dibaca.
 */
export const EMPLOYMENT_LABELS: Record<EmploymentStatus, string> = {
  PETANI: "Petani",
  NELAYAN: "Nelayan",
  PNS: "PNS",
  TNI_POLRI: "TNI/Polri",
  KARYAWAN_SWASTA: "Karyawan Swasta",
  WIRASWASTA: "Wiraswasta",
  BURUH: "Buruh",
  PEDAGANG: "Pedagang",
  GURU_DOSEN: "Guru/Dosen",
  TENAGA_KESEHATAN: "Tenaga Kesehatan",
  PENSIUNAN: "Pensiunan",
  SERABUTAN: "Serabutan",
  IBU_RUMAH_TANGGA: "Ibu Rumah Tangga",
  TIDAK_BEKERJA: "Tidak Bekerja",
  LAINNYA: "Lainnya",
};

/**
 * Kunci `employmentData` dalam urutan enum backend.
 *
 * Dipakai form dashboard dan Server Action-nya. Kunci di luar daftar ini
 * ditolak backend, jadi keduanya harus berangkat dari daftar yang sama.
 */
export const EMPLOYMENT_KEYS = Object.keys(EMPLOYMENT_LABELS) as EmploymentStatus[];

/**
 * Menyiapkan `employmentData` untuk `StatBars`.
 *
 * Kategori yang tidak dikirim backend berarti **tidak didata**, bukan bernilai
 * nol, jadi kunci yang hilang dibuang dari daftar — bukan diisi 0. Menampilkan
 * "Nelayan 0 jiwa" pada padukuhan yang memang tidak mendata nelayan adalah
 * angka yang tidak pernah diukur siapa pun.
 */
export function toEmploymentItems(data: EmploymentData | null): StatBarItem[] {
  if (!data) return [];

  return EMPLOYMENT_KEYS.filter((key) => typeof data[key] === "number")
    .map((key) => ({ label: EMPLOYMENT_LABELS[key], value: data[key] as number }));
}
