import { UPLOAD_ALLOWED_MIME, UPLOAD_MAX_SIZE_BYTES } from "@/types/api";

/**
 * Batas yang berlaku bagi pengelola saat mengunggah gambar.
 *
 * Ada DUA batas yang berbeda dan yang lebih kecil selalu menang:
 *
 *  1. `UPLOAD_MAX_SIZE_BYTES` (5 MB) — batas milik backend.
 *  2. Batas angkut Server Action. Seluruh unggahan dashboard menumpang Server
 *     Action, dan Vercel menolak body permintaan di atas 4,5 MB di lapisan
 *     platformnya sendiri. `bodySizeLimit` di `next.config.ts` dipatok 4 MB
 *     untuk berada di bawahnya dengan aman.
 *
 * Batas kedualah yang lebih ketat, jadi itu yang diberlakukan. Angka di bawah
 * ini menyisakan ruang untuk kolom form lain dan pembatas multipart — sebuah
 * unggahan yang persis sebesar `bodySizeLimit` tetap akan ditolak karena
 * badan permintaannya lebih besar dari jumlah berkasnya.
 *
 * Kalau backend nanti menerima unggahan langsung dari browser, seluruh berkas
 * ini kembali cukup memeriksa batas backend saja.
 */
const SERVER_ACTION_BUDGET_BYTES = 4 * 1024 * 1024 - 256 * 1024;

/** Batas per berkas yang benar-benar berlaku: yang terkecil di antara keduanya. */
export const IMAGE_MAX_BYTES = Math.min(UPLOAD_MAX_SIZE_BYTES, SERVER_ACTION_BUDGET_BYTES);

function toMegabytes(bytes: number): string {
  return (bytes / 1024 / 1024).toFixed(1).replace(".", ",");
}

/** Dipakai teks bantuan di form supaya angkanya tidak ditulis ulang per modul. */
export const IMAGE_MAX_LABEL = `${toMegabytes(IMAGE_MAX_BYTES)} MB`;

/**
 * Pemeriksaan satu gambar.
 *
 * Berdiri sendiri, terpisah dari `services/upload.ts`, supaya form di browser
 * bisa memakainya tanpa ikut menarik klien HTTP ke dalam bundelnya. Dijalankan
 * dua kali — di browser agar pengguna tidak menunggu berkas besar terkirim
 * hanya untuk ditolak, dan di server karena pemeriksaan di browser bisa
 * dilewati siapa pun.
 *
 * Mengembalikan pesan galat, atau `null` kalau berkasnya layak.
 */
export function validateImage(file: File): string | null {
  if (!(UPLOAD_ALLOWED_MIME as readonly string[]).includes(file.type)) {
    return "Format gambar tidak didukung. Gunakan JPG, PNG, WEBP, GIF, atau AVIF.";
  }

  if (file.size > IMAGE_MAX_BYTES) {
    return `Ukuran gambar ${toMegabytes(file.size)} MB melebihi batas ${IMAGE_MAX_LABEL}. Perkecil dulu fotonya, atau unggah satu per satu.`;
  }

  return null;
}

/**
 * Pemeriksaan unggahan banyak gambar sekaligus.
 *
 * Yang menentukan bukan ukuran berkas terbesar melainkan JUMLAH seluruhnya:
 * kesepuluhnya berangkat dalam satu badan permintaan. Sepuluh foto yang
 * masing-masing lolos pemeriksaan per berkas tetap bisa menembus batas angkut
 * kalau ditotal — dan kegagalannya terjadi di lapisan platform, tanpa pesan
 * yang bisa dibaca pengelola.
 */
export function validateImageBatch(files: File[]): string | null {
  for (const file of files) {
    const invalid = validateImage(file);
    if (invalid) return `${file.name}: ${invalid}`;
  }

  const total = files.reduce((sum, file) => sum + file.size, 0);
  if (total > SERVER_ACTION_BUDGET_BYTES) {
    return `Total ${toMegabytes(total)} MB untuk ${files.length} gambar melebihi batas ${toMegabytes(SERVER_ACTION_BUDGET_BYTES)} MB sekali unggah. Kirim dalam beberapa kali unggahan.`;
  }

  return null;
}
