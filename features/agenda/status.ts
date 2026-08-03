import type { Agenda } from "@/types/api";

/**
 * Kegiatan dianggap selesai setelah waktu akhirnya lewat — atau setelah waktu
 * mulainya, kalau agenda itu tidak punya waktu selesai.
 *
 * Jamnya dibaca saat halaman dirender di server, bukan di browser, jadi tidak
 * ada beda antara hasil render server dan hydration. Halaman publik disajikan
 * dari cache paling lama lima menit, sehingga label "akan datang" bisa tertinggal
 * paling lama selama itu — cukup akurat untuk jadwal kegiatan warga, dan
 * menjadikannya Client Component hanya demi ketepatan detik tidak sepadan.
 */
export function hasAgendaPassed(agenda: Pick<Agenda, "startDate" | "endDate">): boolean {
  const end = new Date(agenda.endDate ?? agenda.startDate);
  return Number.isFinite(end.getTime()) && end.getTime() < Date.now();
}
