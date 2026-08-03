import { del, getList, getOne, getPaginated, patch, post } from "@/lib/api";
import type { Category, News, NewsQuery, Paginated } from "@/types/api";

/**
 * Daftar berita terbit — bentuk `{ data, meta }`. Pencarian menyasar `title` dan `content`.
 *
 * Endpointnya `/news/published`, bukan `/news`: yang terakhir kini khusus admin
 * dan menjawab `401` tanpa token. Draf sudah disaring backend, jadi `meta.total`
 * menghitung berita terbit saja dan jumlah halamannya akurat — penyaring
 * pengaman yang dulu ada di sini tidak lagi punya pekerjaan.
 *
 * `categoryId` diambil dari `getNewsCategories()`. Backend memakai
 * `forbidNonWhitelisted`, sehingga parameter di luar `page`, `limit`, `search`,
 * dan `categoryId` sekarang dijawab `400`, bukan diabaikan diam-diam.
 */
export function getNewsList(query: NewsQuery = {}) {
  return getPaginated<News>("/news/published", query, { revalidate: 60 });
}

/**
 * Detail berita berdasarkan slug — objek tunggal. Melempar 404 kalau tidak ada.
 * Draf ikut dijawab 404 untuk pemanggil tanpa token, jadi halaman detail tidak
 * perlu memeriksa `published` lagi.
 */
export function getNewsBySlug(slug: string) {
  return getOne<News>(`/news/${slug}`, { revalidate: 300 });
}

/**
 * Kategori berita — ARRAY POLOS.
 *
 * `_count.news` yang menyertainya menghitung **semua** berita termasuk draf,
 * jadi jangan dipakai sebagai jumlah berita yang terlihat warga. Untuk
 * dashboard justru itulah angka yang benar.
 */
export function getNewsCategories() {
  return getList<Category>("/news/category/all", {}, { revalidate: 600 });
}

/** Satu kategori beserta `_count.news`. Publik, tidak butuh token. */
export function getNewsCategoryById(id: string) {
  return getOne<Category>(`/news/category/${id}`, { revalidate: 600 });
}

// ============================================================
// DASHBOARD ADMIN — semuanya butuh token
//
// Tidak satu pun memakai `revalidate`. Respons bertoken tidak boleh mengendap
// di cache Next.js: isinya berbeda per pengguna, dan draf yang tersimpan di
// sana bisa ikut tersaji ke pengunjung biasa.
// ============================================================

/** Seluruh berita termasuk draf. `GET /news` menjawab 401 tanpa token. */
export function getAllNews(query: NewsQuery, token: string): Promise<Paginated<News>> {
  return getPaginated<News>("/news", query, { token });
}

/** Detail untuk halaman ubah — dengan token, draf ikut terbaca. */
export function getNewsBySlugAsAdmin(slug: string, token: string) {
  return getOne<News>(`/news/${slug}`, { token });
}

/** Bentuk isian `POST /news`; `slug` dan `categoryId` wajib, sisanya opsional. */
export interface NewsInput {
  title: string;
  slug: string;
  content: string;
  thumbnail?: string;
  published?: boolean;
  categoryId: string;
}

export function createNews(input: NewsInput, token: string) {
  return post<News>("/news", input, { token });
}

/** `PATCH` memakai id, bukan slug — slug-nya sendiri bisa ikut diubah. */
export function updateNews(id: string, input: Partial<NewsInput>, token: string) {
  return patch<News>(`/news/${id}`, input, { token });
}

export function deleteNews(id: string, token: string) {
  return del<News>(`/news/${id}`, { token });
}

/** `name` dan `slug` sama-sama wajib dan sama-sama unik di database. */
export interface CategoryInput {
  name: string;
  slug: string;
}

export function createNewsCategory(input: CategoryInput, token: string) {
  return post<Category>("/news/category", input, { token });
}

export function updateNewsCategory(id: string, input: Partial<CategoryInput>, token: string) {
  return patch<Category>(`/news/category/${id}`, input, { token });
}

/**
 * Menghapus kategori.
 *
 * Akan gagal selama masih ada berita yang memakainya: relasi `News.category`
 * wajib, sehingga database menolak penghapusannya. Pemanggil wajib memeriksa
 * `_count.news` lebih dulu — pesan galat yang muncul dari backend
 * ("Referensi data tidak valid") tidak menjelaskan apa pun kepada pengelola.
 */
export function deleteNewsCategory(id: string, token: string) {
  return del<Category>(`/news/category/${id}`, { token });
}
