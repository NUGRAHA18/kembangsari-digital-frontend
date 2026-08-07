import type { MonographyInput } from "@/services/monography";

/**
 * Daftar kolom angka monografi beserta labelnya.
 *
 * Satu-satunya sumber kebenaran untuk form dashboard **dan** Server Action-nya:
 * ada 19 kolom opsional di sini, dan menuliskannya dua kali berarti cepat atau
 * lambat ada kolom yang tampil di form tetapi tidak pernah ikut terkirim.
 *
 * Berkas ini sengaja tanpa React — Server Action mengimpornya, dan komponen
 * apa pun di dalamnya akan ikut tertarik ke bundel server.
 */

/** Kolom yang boleh dikosongkan: `null` berarti tidak didata, bukan nol. */
export type OptionalStatKey = Exclude<
  keyof MonographyInput,
  "year" | "totalPopulation" | "maleCount" | "femaleCount" | "employmentData" | "isPublished"
>;

export interface StatField {
  key: OptionalStatKey;
  label: string;
}

/** Urutannya mengikuti halaman publik, dari jenjang terendah. */
export const EDUCATION_FIELDS: StatField[] = [
  { key: "educationNoSchool", label: "Tidak/Belum Sekolah" },
  { key: "educationSD", label: "SD/Sederajat" },
  { key: "educationSLTP", label: "SLTP/Sederajat" },
  { key: "educationSLTA", label: "SLTA/Sederajat" },
  { key: "educationD1_D3", label: "Diploma (D1–D3)" },
  { key: "educationS1", label: "Sarjana (S1)" },
  { key: "educationS2", label: "Magister (S2)" },
  { key: "educationS3", label: "Doktor (S3)" },
];

export const RELIGION_FIELDS: StatField[] = [
  { key: "religionIslam", label: "Islam" },
  { key: "religionProtestant", label: "Kristen Protestan" },
  { key: "religionCatholic", label: "Katolik" },
  { key: "religionHindu", label: "Hindu" },
  { key: "religionBuddha", label: "Buddha" },
  { key: "religionKonghucu", label: "Konghucu" },
  { key: "religionOther", label: "Lainnya" },
];

export const HOUSEHOLD_FIELDS: StatField[] = [
  { key: "familyHeadCount", label: "Kepala keluarga" },
  { key: "familyCount", label: "Jumlah keluarga" },
  { key: "rtCount", label: "Jumlah RT" },
  { key: "rwCount", label: "Jumlah RW" },
];

export const OPTIONAL_STAT_FIELDS: StatField[] = [
  ...EDUCATION_FIELDS,
  ...RELIGION_FIELDS,
  ...HOUSEHOLD_FIELDS,
];
