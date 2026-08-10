"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ApiRequestError, ApiUnreachableError } from "@/lib/api";
import { requireSession, SESSION_EXPIRED_PATH } from "@/lib/session";
import { slugify } from "@/lib/slug";
import {
  createNewsCategory,
  deleteNewsCategory,
  updateNewsCategory,
  type CategoryInput,
} from "@/services/news";

export interface CategoryFormState {
  error?: string;
  values?: Partial<CategoryInput>;
}

/**
 * Kategori ikut menentukan isi halaman berita dan deretan chip filternya, jadi
 * setiap perubahan menyentuh portal publik — bukan hanya dashboard.
 */
function revalidateCategories() {
  revalidatePath("/");
  revalidatePath("/berita");
  revalidatePath("/admin/berita");
  revalidatePath("/admin/kategori");
}

function toMessage(error: unknown): string {
  if (error instanceof ApiRequestError) {
    // `name` dan `slug` sama-sama unik; backend menyebut kolom mana yang bentrok.
    if (error.status === 409) return `${error.message}. Pakai nama atau slug yang lain.`;
    return error.messages.join(" ");
  }

  if (error instanceof ApiUnreachableError) return error.message;

  return "Terjadi kesalahan yang tidak terduga.";
}

export async function saveCategoryAction(
  _prevState: CategoryFormState,
  formData: FormData,
): Promise<CategoryFormState> {
  const { token } = await requireSession();

  const id = String(formData.get("id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const slug = slugify(String(formData.get("slug") ?? "").trim() || name);

  const values = { name, slug };

  if (!name) return { error: "Nama kategori wajib diisi.", values };
  if (!slug) {
    return { error: "Slug tidak bisa dibentuk dari nama itu. Isi slug secara manual.", values };
  }

  try {
    if (id) {
      await updateNewsCategory(id, values, token);
    } else {
      await createNewsCategory(values, token);
    }
  } catch (error) {
    if (error instanceof ApiRequestError && error.isUnauthorized) {
      redirect(SESSION_EXPIRED_PATH);
    }
    return { error: toMessage(error), values };
  }

  revalidateCategories();
  redirect(`/admin/kategori?pesan=${id ? "diperbarui" : "dibuat"}`);
}

export async function deleteCategoryAction(formData: FormData) {
  const { token } = await requireSession();

  const id = String(formData.get("id") ?? "");
  if (!id) redirect("/admin/kategori");

  try {
    await deleteNewsCategory(id, token);
  } catch (error) {
    if (error instanceof ApiRequestError && error.isUnauthorized) {
      redirect(SESSION_EXPIRED_PATH);
    }
    throw error;
  }

  revalidateCategories();
  redirect("/admin/kategori?pesan=dihapus");
}
