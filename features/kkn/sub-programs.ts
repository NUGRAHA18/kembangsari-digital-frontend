import type { KKNSubProgram } from "@/types/api";

/**
 * Empat sub-program KKN, urutannya mengikuti enum `KKNSubProgram` di backend
 * supaya pilihan pada form dan dashboard tidak berubah-ubah urutannya.
 *
 * Label bacanya tinggal di sini, bukan di `kkn-card.tsx`, karena Server Action
 * ikut memakainya untuk memeriksa kiriman form — dan berkas komponen membawa
 * serta React beserta ikon-ikonnya.
 */
export const KKN_SUB_PROGRAMS: readonly KKNSubProgram[] = [
  "RUMAH_BELAJAR",
  "PEKARANGAN_PRODUKTIF",
  "PENGELOLAAN_SAMPAH",
  "PENERANGAN_JALAN",
];

export const SUB_PROGRAM_LABELS: Record<KKNSubProgram, string> = {
  RUMAH_BELAJAR: "Rumah Belajar",
  PEKARANGAN_PRODUKTIF: "Pekarangan Produktif",
  PENGELOLAAN_SAMPAH: "Pengelolaan Sampah",
  PENERANGAN_JALAN: "Penerangan Jalan",
};

/**
 * Menerjemahkan kiriman form menjadi nilai enum yang sah.
 *
 * Form ini tetap terkirim tanpa JavaScript dan nilainya bisa dipalsukan, jadi
 * pilihan `<select>` saja bukan jaminan.
 */
export function readSubProgram(value: string): KKNSubProgram | null {
  return KKN_SUB_PROGRAMS.find((subProgram) => subProgram === value) ?? null;
}
