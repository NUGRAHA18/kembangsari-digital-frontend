import type { FamilyRelation } from "@/types/api";

/**
 * Hubungan dalam kartu keluarga.
 *
 * Sengaja bebas React: Server Action mengimpornya untuk memvalidasi nilai
 * yang datang dari `<select>`, dan form yang terkirim tanpa JavaScript bisa
 * membawa nilai apa pun. Nilai di luar daftar ini dijawab backend `400`
 * dengan pesan yang tidak menjelaskan apa pun kepada pengelola.
 *
 * Urutannya mengikuti cara sebuah kartu keluarga dibaca dari atas ke bawah,
 * bukan abjad — itu yang dilihat pendata saat mengisi.
 */
export const FAMILY_RELATIONS: FamilyRelation[] = [
  "KEPALA_KELUARGA",
  "ISTRI",
  "SUAMI",
  "ANAK",
  "MENANTU",
  "CUCU",
  "ORANG_TUA",
  "FAMILI_LAIN",
  "LAINNYA",
];

export const FAMILY_RELATION_LABELS: Record<FamilyRelation, string> = {
  KEPALA_KELUARGA: "Kepala keluarga",
  ISTRI: "Istri",
  SUAMI: "Suami",
  ANAK: "Anak",
  MENANTU: "Menantu",
  CUCU: "Cucu",
  ORANG_TUA: "Orang tua",
  FAMILI_LAIN: "Famili lain",
  LAINNYA: "Belum ditentukan",
};

export function isFamilyRelation(value: string): value is FamilyRelation {
  return (FAMILY_RELATIONS as string[]).includes(value);
}

/**
 * `LAINNYA` bukan sekadar salah satu pilihan.
 *
 * Ketika pengelola menyetel kepala keluarga baru, backend melepas penanda
 * yang lama dan menjadikannya `LAINNYA` — bukan menebaknya menjadi "istri"
 * atau "suami", karena menebak berarti menaruh data karangan di baris warga
 * sungguhan. Jadi nilai ini berarti "hubungannya menunggu dibetulkan
 * pendata", dan dashboard harus menampilkannya sebagai peringatan, bukan
 * sebagai keterangan biasa yang mudah terlewat.
 */
export function needsRelationReview(relation: FamilyRelation): boolean {
  return relation === "LAINNYA";
}
