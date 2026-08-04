import { notFound, redirect } from "next/navigation";
import { ApiRequestError } from "@/lib/api";

/**
 * Pembungkus pengambilan data untuk halaman dashboard.
 *
 * Token bisa kedaluwarsa kapan saja — masa berlakunya 7 hari, jauh lebih
 * pendek daripada kebiasaan membuka dashboard. Saat itu terjadi backend
 * menjawab `401`, dan halaman tidak boleh menampilkan galat mentah: pengguna
 * diarahkan ke `/admin/keluar` yang menghapus cookie basi lalu membawanya ke
 * form masuk dengan keterangan bahwa sesinya berakhir.
 *
 * Server Component tidak boleh menghapus cookie sendiri — itu sebabnya
 * pembersihannya dititipkan ke Route Handler, bukan dikerjakan di sini.
 */
export async function fetchAsAdmin<T>(promise: Promise<T>): Promise<T> {
  try {
    return await promise;
  } catch (error) {
    if (error instanceof ApiRequestError) {
      if (error.isUnauthorized) redirect("/admin/keluar?sesi=habis");
      if (error.isNotFound) notFound();
    }
    throw error;
  }
}
