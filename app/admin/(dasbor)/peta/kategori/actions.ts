"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ApiRequestError, ApiUnreachableError } from "@/lib/api";
import { requireSession } from "@/lib/session";
import { slugify } from "@/lib/slug";
import {
  createMapCategory,
  deleteMapCategory,
  updateMapCategory,
  type MapCategoryInput,
} from "@/services/maps";

export interface MapCategoryFormState {
  error?: string;
  values?: Partial<Record<keyof MapCategoryInput, string>>;
}

/**
 * Kategori ikut menentukan deretan saringan di halaman peta sekaligus warna
 * pin-nya — warnanya diambil dari urutan kategori, jadi menambah atau menghapus
 * satu kategori menggeser warna kategori lain. Halaman publiknya wajib ikut
 * disegarkan.
 */
function revalidateMapCategories() {
  revalidatePath("/");
  revalidatePath("/peta");
  revalidatePath("/admin/peta");
  revalidatePath("/admin/peta/kategori");
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

export async function saveMapCategoryAction(
  _prevState: MapCategoryFormState,
  formData: FormData,
): Promise<MapCategoryFormState> {
  const { token } = await requireSession();

  const id = String(formData.get("id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const slug = slugify(String(formData.get("slug") ?? "").trim() || name);
  const icon = String(formData.get("icon") ?? "").trim();

  const values = { name, slug, icon };

  if (!name) return { error: "Nama kategori wajib diisi.", values };
  if (!slug) {
    return { error: "Slug tidak bisa dibentuk dari nama itu. Isi slug secara manual.", values };
  }

  // `icon` opsional: dikosongkan berarti `null`, bukan dihilangkan dari payload
  // — kalau dihilangkan, PATCH membiarkan nama ikon lama tetap tersimpan.
  const payload: MapCategoryInput = { name, slug, icon: icon || null };

  try {
    if (id) {
      await updateMapCategory(id, payload, token);
    } else {
      await createMapCategory(payload, token);
    }
  } catch (error) {
    if (error instanceof ApiRequestError && error.isUnauthorized) {
      redirect("/admin/keluar?sesi=habis");
    }
    return { error: toMessage(error), values };
  }

  revalidateMapCategories();
  redirect(`/admin/peta/kategori?pesan=${id ? "diperbarui" : "dibuat"}`);
}

export async function deleteMapCategoryAction(formData: FormData) {
  const { token } = await requireSession();

  const id = String(formData.get("id") ?? "");
  if (!id) redirect("/admin/peta/kategori");

  try {
    await deleteMapCategory(id, token);
  } catch (error) {
    if (error instanceof ApiRequestError && error.isUnauthorized) {
      redirect("/admin/keluar?sesi=habis");
    }
    throw error;
  }

  revalidateMapCategories();
  redirect("/admin/peta/kategori?pesan=dihapus");
}
