import { notFound, redirect } from "next/navigation";
import { ApiRequestError } from "@/lib/api";
import { SESSION_EXPIRED_PATH } from "@/lib/session";

/**
 * Pembungkus pengambilan data untuk halaman dashboard.
 *
 * Token bisa kedaluwarsa kapan saja — masa berlakunya 7 hari, jauh lebih
 * pendek daripada kebiasaan membuka dashboard. Saat itu terjadi backend
 * menjawab `401`, dan halaman tidak boleh menampilkan galat mentah: pengguna
 * diarahkan ke form masuk dengan keterangan bahwa sesinya berakhir.
 *
 * Server Component tidak boleh menghapus cookie sendiri, dan cookie basinya
 * memang tidak dihapus di sini — `proxy.ts` yang membuangnya saat halaman
 * masuk itu dilayani. Lihat berkas itu untuk alasan mengapa ia bukan sebuah
 * rute `GET` tersendiri.
 */
export async function fetchAsAdmin<T>(promise: Promise<T>): Promise<T> {
  try {
    return await promise;
  } catch (error) {
    if (error instanceof ApiRequestError) {
      if (error.isUnauthorized) redirect(SESSION_EXPIRED_PATH);
      if (error.isNotFound) notFound();
    }
    throw error;
  }
}
