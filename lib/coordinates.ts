/**
 * Pembacaan lintang dan bujur dari isian yang diketik tangan.
 *
 * Dipakai bersama Server Action peta dan rumah warga. Berdiri sendiri karena
 * berkas `"use server"` hanya boleh mengekspor fungsi async — pembantu seperti
 * ini ditolak saat kompilasi kalau ditaruh di dalamnya.
 */

export interface ParsedCoordinate {
  value: number | null;
  error: string | null;
}

/**
 * Koordinat wajib diisi pada marker peta dan rumah warga: tanpa keduanya,
 * titik itu tersimpan tanpa pernah tampil di peta — dan pengelola tidak punya
 * cara mengetahuinya.
 */
export function parseCoordinate(value: string, label: string, max: number): ParsedCoordinate {
  // Papan ketik ponsel Indonesia banyak yang menuliskan desimal dengan koma,
  // sedangkan `Number` hanya mengenal titik.
  const parsed = Number(value.replace(",", "."));

  if (!value || !Number.isFinite(parsed) || Math.abs(parsed) > max) {
    return { value: null, error: `${label} wajib diisi dengan angka yang sah.` };
  }

  return { value: parsed, error: null };
}

/**
 * Menerima "−7.690025, 110.228583" — bentuk yang disalin utuh dari Google Maps.
 *
 * Ini bukan kemewahan. Menekan lama di Google Maps menyalin **kedua** angka
 * sekaligus, dan menempelkannya ke kolom lintang adalah kesalahan yang paling
 * sering terjadi: `Number()` menolaknya, isian bujur tertinggal kosong, dan
 * yang terbaca pengelola hanya "wajib diisi dengan angka yang sah" pada kolom
 * yang menurutnya sudah terisi.
 *
 * Mengembalikan `null` kalau isinya bukan sepasang angka — pemanggil lalu
 * memperlakukan kedua kolom seperti biasa.
 */
export function parseCoordinatePair(value: string): { latitude: string; longitude: string } | null {
  const parts = value.split(",").map((part) => part.trim());
  if (parts.length !== 2) return null;

  const [latitude, longitude] = parts;
  if (!Number.isFinite(Number(latitude)) || !Number.isFinite(Number(longitude))) return null;
  if (!latitude || !longitude) return null;

  return { latitude, longitude };
}

/**
 * Lintang-bujur untuk ditampilkan, dipotong enam angka di belakang koma.
 *
 * Angka dari backend bertipe `number`, dan menampilkannya apa adanya
 * memunculkan ekor pembulatan biner — `-7.6915000000000004` benar-benar tampil
 * seperti itu di kartu lokasi. Enam angka bukan pilihan sembarang: pada garis
 * lintang ini satu per sejuta derajat ≈ 11 cm, jauh lebih teliti daripada yang
 * bisa dicapai titik yang ditandai dengan jari di layar ponsel.
 */
export function formatCoordinatePair(latitude: number, longitude: number): string {
  const trim = (value: number) => String(Number(value.toFixed(6)));
  return `${trim(latitude)}, ${trim(longitude)}`;
}
