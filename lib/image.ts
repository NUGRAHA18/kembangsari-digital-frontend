import { UPLOAD_ALLOWED_MIME, UPLOAD_MAX_SIZE_BYTES } from "@/types/api";

/**
 * Pemeriksaan gambar yang sama dengan milik backend.
 *
 * Berdiri sendiri, terpisah dari `services/upload.ts`, supaya form di browser
 * bisa memakainya tanpa ikut menarik klien HTTP ke dalam bundelnya. Dijalankan
 * dua kali — di browser agar pengguna tidak menunggu berkas 20 MB terkirim
 * hanya untuk ditolak, dan di server karena pemeriksaan di browser bisa
 * dilewati siapa pun.
 *
 * Mengembalikan pesan galat, atau `null` kalau berkasnya layak.
 */
export function validateImage(file: File): string | null {
  if (!(UPLOAD_ALLOWED_MIME as readonly string[]).includes(file.type)) {
    return "Format gambar tidak didukung. Gunakan JPG, PNG, WEBP, GIF, atau AVIF.";
  }

  if (file.size > UPLOAD_MAX_SIZE_BYTES) {
    const mb = (file.size / 1024 / 1024).toFixed(1);
    return `Ukuran gambar ${mb} MB melebihi batas 5 MB.`;
  }

  return null;
}
