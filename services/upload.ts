import { post } from "@/lib/api";
import type { UploadFolder, UploadedFile } from "@/types/api";

/**
 * Unggah gambar — langkah pertama dari dua.
 *
 * Backend menyimpan berkasnya lalu mengembalikan `url`; URL itulah yang
 * disimpan ke field `thumbnail`/`image` milik record, bukan berkasnya. Jadi
 * setiap form yang punya gambar selalu: unggah dulu, baru simpan record.
 *
 * `Content-Type` sengaja tidak diset di sini maupun di `lib/api.ts` — untuk
 * `FormData`, header itu harus ditulis sendiri oleh runtime lengkap dengan
 * boundary-nya.
 *
 * Aturan ukuran dan format ada di `lib/image.ts`, agar form di browser bisa
 * memeriksanya tanpa ikut memuat berkas ini.
 */
export function uploadImage(file: File, folder: UploadFolder, token: string) {
  const body = new FormData();
  body.append("file", file);

  return post<UploadedFile>("/upload", body, { token, query: { folder } });
}

/**
 * Unggah beberapa gambar sekaligus — dipakai galeri, yang jarang diisi satu foto.
 *
 * Nama fieldnya `files` (jamak) dan berbeda dari `uploadImage`; salah satu saja
 * membuat backend menerima daftar kosong. Batasnya `UPLOAD_MAX_FILES` berkas per
 * permintaan, jadi pemanggil harus memeriksa jumlahnya lebih dulu.
 */
export function uploadImages(files: File[], folder: UploadFolder, token: string) {
  const body = new FormData();
  for (const file of files) body.append("files", file);

  return post<UploadedFile[]>("/upload/multiple", body, { token, query: { folder } });
}
