import { getList, getOne, getPaginated } from "@/lib/api";
import type { Category, News, PaginationQuery, Paginated } from "@/types/api";

/**
 * Daftar berita — bentuk `{ data, meta }`. Pencarian menyasar `title` dan `content`.
 *
 * TIDAK ADA parameter kategori. `GET /news` hanya menerima `page`, `limit`, dan
 * `search`; backend memakai ValidationPipe dengan `whitelist: true`, sehingga
 * parameter di luar itu dibuang diam-diam tanpa galat. Mengirim `categoryId`
 * menghasilkan daftar lengkap yang tampak seperti filter yang tidak bekerja.
 * Lihat LAPORAN-BACKEND.md butir B-1.
 */
export async function getNewsList(query: PaginationQuery = {}): Promise<Paginated<News>> {
  const result = await getPaginated<News>("/news", query, { revalidate: 60 });

  // Penyaring pengaman: `GET /news` mengembalikan draf (`published: false`)
  // bersama berita terbit, dan portal publik tidak boleh menampilkannya.
  // Konsekuensinya `meta.total` bisa sedikit lebih besar daripada jumlah yang
  // tampil selama draf masih ikut terhitung di backend. Menampilkan draf ke
  // publik jauh lebih berbahaya daripada hitungan halaman yang meleset sedikit.
  // Lihat LAPORAN-BACKEND.md butir B-2.
  return { ...result, data: result.data.filter((item) => item.published) };
}

/** Detail berita berdasarkan slug — objek tunggal. Melempar 404 kalau tidak ada. */
export function getNewsBySlug(slug: string) {
  return getOne<News>(`/news/${slug}`, { revalidate: 300 });
}

/** Kategori berita — ARRAY POLOS. */
export function getNewsCategories() {
  return getList<Category>("/news/category/all", {}, { revalidate: 600 });
}
