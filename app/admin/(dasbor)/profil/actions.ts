"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ApiRequestError, ApiUnreachableError } from "@/lib/api";
import { validateImage } from "@/lib/image";
import { requireSession } from "@/lib/session";
import { slugify } from "@/lib/slug";
import {
  createProfile,
  deleteProfile,
  updateProfile,
  type ProfileInput,
} from "@/services/profile";
import { uploadImage } from "@/services/upload";

export interface ProfileFormState {
  error?: string;
  values?: Partial<Record<keyof ProfileInput, string>>;
}

/** Halaman profil tampil di daftar profil, halamannya sendiri, dan sitemap. */
function revalidateProfiles(slug?: string) {
  revalidatePath("/profil");
  revalidatePath("/sitemap.xml");
  if (slug) revalidatePath(`/profil/${slug}`);
}

function toMessage(error: unknown): string {
  if (error instanceof ApiRequestError) {
    if (error.status === 409) {
      return "Slug itu sudah dipakai halaman profil lain. Ubah slug-nya agar unik.";
    }
    // Record ditelusuri lewat slug yang berlaku saat halaman dibuka; `404`
    // berarti slug itu sudah berubah atau halamannya dihapus dari tab lain.
    if (error.isNotFound) {
      return "Halaman profil ini sudah tidak ada — slug-nya berubah atau sudah dihapus. Muat ulang daftar profil.";
    }
    return error.messages.join(" ");
  }

  if (error instanceof ApiUnreachableError) return error.message;

  return "Terjadi kesalahan yang tidak terduga.";
}

function redirectIfExpired(error: unknown) {
  if (error instanceof ApiRequestError && error.isUnauthorized) {
    redirect("/admin/keluar?sesi=habis");
  }
}

export async function saveProfileAction(
  _prevState: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  const { token } = await requireSession();

  const read = (key: string) => String(formData.get(key) ?? "").trim();

  // Slug saat halaman dibuka, bukan slug yang sedang diketik — yang kedua
  // boleh berubah dan tidak bisa dipakai menemukan record-nya.
  const currentSlug = read("currentSlug");
  const title = read("title");
  const content = read("content");
  const slug = slugify(read("slug") || title);
  const metaTitle = read("metaTitle");
  const metaDescription = read("metaDescription");

  const values = { title, content, slug, metaTitle, metaDescription };

  if (!title || !content) return { error: "Judul dan isi halaman wajib diisi.", values };
  if (!slug) {
    return { error: "Slug tidak bisa dibentuk dari judul itu. Isi slug secara manual.", values };
  }

  // Gambar sampul: berkas baru menggantikan yang lama; tanpa berkas, URL lama
  // diteruskan apa adanya.
  let thumbnail: string | null = read("currentThumbnail") || null;
  const file = formData.get("thumbnailFile");

  if (file instanceof File && file.size > 0) {
    const invalid = validateImage(file);
    if (invalid) return { error: invalid, values };

    try {
      const uploaded = await uploadImage(file, "profil", token);
      thumbnail = uploaded.url;
    } catch (error) {
      redirectIfExpired(error);
      return { error: `Gagal mengunggah gambar. ${toMessage(error)}`, values };
    }
  } else if (formData.get("removeThumbnail") === "on") {
    thumbnail = null;
  }

  const payload: ProfileInput = {
    title,
    slug,
    content,
    thumbnail,
    metaTitle: metaTitle || null,
    metaDescription: metaDescription || null,
  };

  try {
    if (currentSlug) {
      // `PATCH /profile/:idOrSlug` menerima slug, sama seperti `GET`.
      await updateProfile(currentSlug, payload, token);
    } else {
      await createProfile(payload, token);
    }
  } catch (error) {
    redirectIfExpired(error);
    return { error: toMessage(error), values };
  }

  // Slug lama ikut disegarkan: kalau pengelola mengubahnya, halaman lamanya
  // sekarang 404 dan cache-nya tidak boleh menyajikan isi yang sudah pindah.
  revalidateProfiles(slug);
  if (currentSlug && currentSlug !== slug) revalidateProfiles(currentSlug);

  redirect(`/admin/profil/${slug}?pesan=${currentSlug ? "diperbarui" : "dibuat"}`);
}

export async function deleteProfileAction(formData: FormData) {
  const { token } = await requireSession();

  const slug = String(formData.get("slug") ?? "");

  if (!slug) redirect("/admin/profil");

  try {
    await deleteProfile(slug, token);
  } catch (error) {
    redirectIfExpired(error);
    throw error;
  }

  revalidateProfiles(slug);
  redirect("/admin/profil?pesan=dihapus");
}
