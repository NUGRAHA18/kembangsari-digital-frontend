"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ApiRequestError, ApiUnreachableError } from "@/lib/api";
import { validateImage } from "@/lib/image";
import { requireSession } from "@/lib/session";
import { slugify } from "@/lib/slug";
import { createNews, deleteNews, updateNews, type NewsInput } from "@/services/news";
import { uploadImage } from "@/services/upload";

export interface NewsFormState {
  error?: string;
  /** Nilai yang tadi diketik, dikembalikan agar form tidak kosong lagi setelah gagal. */
  values?: Partial<NewsInput>;
}

/**
 * Menyegarkan halaman publik yang menampilkan berita.
 *
 * Halaman-halaman itu disajikan dari cache selama 60–300 detik. Tanpa langkah
 * ini, pengelola yang baru menerbitkan berita akan membuka portal, tidak
 * melihat tulisannya, lalu mengira penyimpanannya gagal.
 */
function revalidateNews(slug?: string) {
  revalidatePath("/");
  revalidatePath("/berita");
  revalidatePath("/sitemap.xml");
  if (slug) revalidatePath(`/berita/${slug}`);
}

/** Menerjemahkan galat backend menjadi kalimat yang bisa ditindaklanjuti pengelola. */
function toMessage(error: unknown): string {
  if (error instanceof ApiRequestError) {
    if (error.status === 409) {
      return "Slug itu sudah dipakai berita lain. Ubah slug-nya agar unik.";
    }
    // 400 bisa berisi beberapa pesan validasi sekaligus.
    return error.messages.join(" ");
  }

  if (error instanceof ApiUnreachableError) return error.message;

  return "Terjadi kesalahan yang tidak terduga.";
}

/**
 * Menyimpan berita — dipakai halaman "tulis" maupun "ubah".
 *
 * Dijadikan satu aksi karena keduanya mengisi form yang sama; yang membedakan
 * hanya ada tidaknya `id`.
 */
export async function saveNewsAction(
  _prevState: NewsFormState,
  formData: FormData,
): Promise<NewsFormState> {
  const { token } = await requireSession();

  const id = String(formData.get("id") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const categoryId = String(formData.get("categoryId") ?? "").trim();
  const published = formData.get("published") === "on";
  // Slug boleh dikosongkan; kalau begitu diturunkan dari judul.
  const slug = slugify(String(formData.get("slug") ?? "").trim() || title);

  const values: Partial<NewsInput> = { title, content, categoryId, slug, published };

  if (!title || !content || !categoryId) {
    return { error: "Judul, kategori, dan isi berita wajib diisi.", values };
  }

  if (!slug) {
    return { error: "Slug tidak bisa dibentuk dari judul itu. Isi slug secara manual.", values };
  }

  // Gambar: berkas baru menggantikan yang lama; kalau tidak ada berkas, URL
  // lama diteruskan apa adanya.
  let thumbnail = String(formData.get("currentThumbnail") ?? "");
  const file = formData.get("thumbnailFile");

  if (file instanceof File && file.size > 0) {
    const invalid = validateImage(file);
    if (invalid) return { error: invalid, values };

    try {
      const uploaded = await uploadImage(file, "berita", token);
      thumbnail = uploaded.url;
    } catch (error) {
      return { error: `Gagal mengunggah gambar. ${toMessage(error)}`, values };
    }
  } else if (formData.get("removeThumbnail") === "on") {
    // Backend menolak `null` pada field ini (`@IsString`), jadi pengosongan
    // dikirim sebagai string kosong. Halaman publik memperlakukannya sama
    // dengan tidak bergambar.
    thumbnail = "";
  }

  const payload: NewsInput = { title, slug, content, categoryId, published, thumbnail };

  try {
    if (id) {
      await updateNews(id, payload, token);
    } else {
      await createNews(payload, token);
    }
  } catch (error) {
    if (error instanceof ApiRequestError && error.isUnauthorized) redirect("/admin/keluar?sesi=habis");
    return { error: toMessage(error), values };
  }

  revalidateNews(slug);
  redirect(`/admin/berita?pesan=${id ? "diperbarui" : "dibuat"}`);
}

export async function deleteNewsAction(formData: FormData) {
  const { token } = await requireSession();

  const id = String(formData.get("id") ?? "");
  const slug = String(formData.get("slug") ?? "");

  if (!id) redirect("/admin/berita");

  try {
    await deleteNews(id, token);
  } catch (error) {
    if (error instanceof ApiRequestError && error.isUnauthorized) redirect("/admin/keluar?sesi=habis");
    throw error;
  }

  revalidateNews(slug);
  redirect("/admin/berita?pesan=dihapus");
}
