import type { Role } from "@/types/api";

/**
 * Peran pengelola beserta keterangannya.
 *
 * Sengaja bebas React: Server Action mengimpornya untuk memvalidasi nilai yang
 * masuk, sepola dengan `features/potential/categories.ts` dan
 * `features/kkn/sub-programs.ts`.
 *
 * Bedanya kedua peran **wajib dijelaskan di layar**, bukan hanya jadi dua
 * pilihan di dropdown: pengelola padukuhan tidak bisa diharapkan menebak apa
 * arti "EDITOR", dan yang membedakan keduanya justru hal-hal yang tidak
 * terlihat sampai seseorang mencoba melakukannya.
 */
export const ROLES: Role[] = ["ADMIN", "EDITOR"];

export const ROLE_LABELS: Record<Role, string> = {
  ADMIN: "Admin",
  EDITOR: "Editor",
};

export const ROLE_HINTS: Record<Role, string> = {
  ADMIN: "Bisa semua, termasuk menghapus isi, mengubah pengaturan situs, dan mengelola pengelola.",
  EDITOR: "Bisa menulis dan mengubah isi portal, tetapi tidak bisa menghapus, mengubah pengaturan, atau menambah pengelola.",
};

/** Baris tabel pembanding di halaman tambah/ubah pengelola. */
export const ROLE_MATRIX: { kemampuan: string; admin: boolean; editor: boolean }[] = [
  { kemampuan: "Membuat & mengubah konten", admin: true, editor: true },
  { kemampuan: "Mengunggah & menghapus berkas", admin: true, editor: true },
  { kemampuan: "Menghapus berita, agenda, dan lainnya", admin: true, editor: false },
  { kemampuan: "Mengubah pengaturan situs", admin: true, editor: false },
  { kemampuan: "Mengelola pengelola", admin: true, editor: false },
];

export function isRole(value: string): value is Role {
  return (ROLES as string[]).includes(value);
}
