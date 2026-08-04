/**
 * Bentuk state paling sederhana untuk Server Action: hanya pesan galat.
 *
 * Dipakai form yang tidak perlu mengembalikan isian apa pun ketika gagal —
 * unggahan berkas, misalnya, memang tidak bisa diisi ulang dari sisi server.
 * Form yang perlu mempertahankan isian mendeklarasikan state-nya sendiri.
 */
export interface FormState {
  error?: string;
}
