/**
 * Pembantu untuk membaca query string halaman daftar.
 *
 * Sejak Next.js 16, `params` dan `searchParams` sampai ke komponen sebagai
 * Promise dan harus di-`await` lebih dulu.
 */

export type RawSearchParams = Record<string, string | string[] | undefined>;

/** Mengambil satu nilai; kalau satu key muncul dua kali, yang pertama dipakai. */
export function readParam(params: RawSearchParams, key: string): string | undefined {
  const value = params[key];
  const single = Array.isArray(value) ? value[0] : value;
  return single && single.trim() !== "" ? single.trim() : undefined;
}

/** Nomor halaman selalu bilangan bulat ≥ 1, apa pun yang diketik di URL. */
export function readPage(params: RawSearchParams): number {
  const parsed = Number.parseInt(readParam(params, "page") ?? "1", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}
