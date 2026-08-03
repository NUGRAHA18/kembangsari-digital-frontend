"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ApiRequestError, ApiUnreachableError } from "@/lib/api";
import { validateImage } from "@/lib/image";
import { requireSession } from "@/lib/session";
import { slugify } from "@/lib/slug";
import {
  createGalleryAlbum,
  createGalleryItem,
  deleteGalleryAlbum,
  deleteGalleryItem,
  updateGalleryAlbum,
  updateGalleryItem,
  type AlbumInput,
} from "@/services/gallery";
import { uploadImage, uploadImages } from "@/services/upload";
import { UPLOAD_MAX_FILES } from "@/types/api";

export interface AlbumFormState {
  error?: string;
  values?: Partial<AlbumInput>;
}

export interface PhotoFormState {
  error?: string;
}

function revalidateGallery(slug?: string) {
  revalidatePath("/");
  revalidatePath("/galeri");
  revalidatePath("/sitemap.xml");
  if (slug) revalidatePath(`/galeri/${slug}`);
}

function toMessage(error: unknown): string {
  if (error instanceof ApiRequestError) {
    if (error.status === 409) return "Slug itu sudah dipakai album lain. Ubah slug-nya agar unik.";
    return error.messages.join(" ");
  }

  if (error instanceof ApiUnreachableError) return error.message;

  return "Terjadi kesalahan yang tidak terduga.";
}

/** 401 di tengah aksi berarti token kedaluwarsa; cookie basi dibersihkan Route Handler. */
function redirectIfExpired(error: unknown) {
  if (error instanceof ApiRequestError && error.isUnauthorized) {
    redirect("/admin/keluar?sesi=habis");
  }
}

// ============================================================
// ALBUM
// ============================================================

export async function saveAlbumAction(
  _prevState: AlbumFormState,
  formData: FormData,
): Promise<AlbumFormState> {
  const { token } = await requireSession();

  const id = String(formData.get("id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const slug = slugify(String(formData.get("slug") ?? "").trim() || name);

  const values = { name, slug, description };

  if (!name) return { error: "Nama album wajib diisi.", values };
  if (!slug) {
    return { error: "Slug tidak bisa dibentuk dari nama itu. Isi slug secara manual.", values };
  }

  let thumbnail: string | null = String(formData.get("currentThumbnail") ?? "") || null;
  const file = formData.get("thumbnailFile");

  if (file instanceof File && file.size > 0) {
    const invalid = validateImage(file);
    if (invalid) return { error: invalid, values };

    try {
      thumbnail = (await uploadImage(file, "galeri", token)).url;
    } catch (error) {
      redirectIfExpired(error);
      return { error: `Gagal mengunggah sampul. ${toMessage(error)}`, values };
    }
  } else if (formData.get("removeThumbnail") === "on") {
    thumbnail = null;
  }

  const payload: AlbumInput = { name, slug, description: description || null, thumbnail };

  try {
    if (id) {
      await updateGalleryAlbum(id, payload, token);
    } else {
      await createGalleryAlbum(payload, token);
    }
  } catch (error) {
    redirectIfExpired(error);
    return { error: toMessage(error), values };
  }

  revalidateGallery(slug);
  redirect(`/admin/galeri/${slug}?pesan=${id ? "diperbarui" : "dibuat"}`);
}

export async function deleteAlbumAction(formData: FormData) {
  const { token } = await requireSession();

  const id = String(formData.get("id") ?? "");
  const slug = String(formData.get("slug") ?? "");

  if (!id) redirect("/admin/galeri");

  try {
    await deleteGalleryAlbum(id, token);
  } catch (error) {
    redirectIfExpired(error);
    throw error;
  }

  revalidateGallery(slug);
  redirect("/admin/galeri?pesan=dihapus");
}

// ============================================================
// ISI ALBUM
// ============================================================

/**
 * Mengunggah beberapa foto sekaligus, lalu mencatat masing-masing sebagai item.
 *
 * Dua langkah ini tidak bisa digabung: `POST /upload/multiple` hanya menyimpan
 * berkas dan mengembalikan URL, sedangkan yang menghubungkannya ke album adalah
 * `POST /gallery/item`. Kalau pencatatan gagal di tengah, berkas yang telanjur
 * terunggah dibiarkan — menghapusnya berisiko membuang berkas yang ternyata
 * sudah tercatat, dan berkas yatim tidak merusak apa pun selain memakan ruang.
 */
export async function addPhotosAction(
  _prevState: PhotoFormState,
  formData: FormData,
): Promise<PhotoFormState> {
  const { token } = await requireSession();

  const albumId = String(formData.get("albumId") ?? "");
  const albumSlug = String(formData.get("albumSlug") ?? "");
  if (!albumId) return { error: "Album tidak dikenali." };

  const files = formData
    .getAll("photos")
    .filter((entry): entry is File => entry instanceof File && entry.size > 0);

  if (files.length === 0) return { error: "Pilih setidaknya satu foto." };
  if (files.length > UPLOAD_MAX_FILES) {
    return {
      error: `Maksimal ${UPLOAD_MAX_FILES} foto sekali unggah. Anda memilih ${files.length}.`,
    };
  }

  for (const file of files) {
    const invalid = validateImage(file);
    if (invalid) return { error: `${file.name}: ${invalid}` };
  }

  try {
    const uploaded = await uploadImages(files, "galeri", token);

    for (const item of uploaded) {
      await createGalleryItem({ url: item.url, albumId, type: "FOTO" }, token);
    }
  } catch (error) {
    redirectIfExpired(error);
    return { error: toMessage(error) };
  }

  revalidateGallery(albumSlug);
  redirect(`/admin/galeri/${albumSlug}?pesan=foto-ditambah`);
}

/** Menambahkan video sebagai tautan; berkasnya tidak ikut diunggah ke bucket. */
export async function addVideoAction(
  _prevState: PhotoFormState,
  formData: FormData,
): Promise<PhotoFormState> {
  const { token } = await requireSession();

  const albumId = String(formData.get("albumId") ?? "");
  const albumSlug = String(formData.get("albumSlug") ?? "");
  const url = String(formData.get("url") ?? "").trim();
  const caption = String(formData.get("caption") ?? "").trim();

  if (!albumId) return { error: "Album tidak dikenali." };
  if (!/^https?:\/\/\S+$/.test(url)) {
    return { error: "Alamat video harus berupa tautan lengkap yang diawali http:// atau https://." };
  }

  try {
    await createGalleryItem(
      { url, albumId, type: "VIDEO", caption: caption || null },
      token,
    );
  } catch (error) {
    redirectIfExpired(error);
    return { error: toMessage(error) };
  }

  revalidateGallery(albumSlug);
  redirect(`/admin/galeri/${albumSlug}?pesan=video-ditambah`);
}

/**
 * Menyimpan keterangan dan penanda "foto pilihan" satu item.
 *
 * Formnya dirender langsung di kisi foto tanpa Client Component: isiannya cuma
 * dua, jadi tidak ada yang perlu ditampilkan selama proses berjalan.
 */
export async function updateItemAction(formData: FormData) {
  const { token } = await requireSession();

  const id = String(formData.get("id") ?? "");
  const albumSlug = String(formData.get("albumSlug") ?? "");
  const caption = String(formData.get("caption") ?? "").trim();
  const isFeatured = formData.get("isFeatured") === "on";

  if (!id) redirect(`/admin/galeri/${albumSlug}`);

  try {
    await updateGalleryItem(id, { caption: caption || null, isFeatured }, token);
  } catch (error) {
    redirectIfExpired(error);
    throw error;
  }

  revalidateGallery(albumSlug);
  redirect(`/admin/galeri/${albumSlug}?pesan=foto-disimpan`);
}

export async function deleteItemAction(formData: FormData) {
  const { token } = await requireSession();

  const id = String(formData.get("id") ?? "");
  const albumSlug = String(formData.get("albumSlug") ?? "");

  if (!id) redirect(`/admin/galeri/${albumSlug}`);

  try {
    await deleteGalleryItem(id, token);
  } catch (error) {
    redirectIfExpired(error);
    throw error;
  }

  revalidateGallery(albumSlug);
  redirect(`/admin/galeri/${albumSlug}?pesan=foto-dihapus`);
}
