"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { readSubProgram } from "@/features/kkn/sub-programs";
import { ApiRequestError, ApiUnreachableError } from "@/lib/api";
import { fromDateInput } from "@/lib/format";
import { validateImage } from "@/lib/image";
import { requireSession } from "@/lib/session";
import { slugify } from "@/lib/slug";
import {
  createKknActivity,
  createKknProgram,
  deleteKknActivity,
  deleteKknProgram,
  getKknProgramBySlugAsAdmin,
  updateKknActivity,
  updateKknProgram,
  type KknActivityInput,
  type KknProgramInput,
} from "@/services/kkn";
import { uploadImage } from "@/services/upload";

export interface KknProgramFormState {
  error?: string;
  values?: Partial<Record<keyof KknProgramInput, string>>;
}

export interface KknActivityFormState {
  error?: string;
  values?: Partial<Record<keyof KknActivityInput, string>>;
}

function revalidateKkn(slug?: string) {
  revalidatePath("/program-kkn");
  revalidatePath("/sitemap.xml");
  if (slug) revalidatePath(`/program-kkn/${slug}`);
}

function toMessage(error: unknown): string {
  if (error instanceof ApiRequestError) {
    if (error.status === 409) return "Slug itu sudah dipakai program lain. Ubah slug-nya agar unik.";
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

// ============================================================
// PROGRAM
// ============================================================

export async function saveKknProgramAction(
  _prevState: KknProgramFormState,
  formData: FormData,
): Promise<KknProgramFormState> {
  const { token } = await requireSession();

  const read = (key: string) => String(formData.get(key) ?? "").trim();

  const id = read("id");
  const title = read("title");
  const description = read("description");
  const content = read("content");
  const slug = slugify(read("slug") || title);
  const rawSubProgram = read("subProgram");
  const isActive = formData.get("isActive") === "on";

  const values = {
    title,
    description,
    content,
    slug,
    subProgram: rawSubProgram,
  };

  if (!title || !description || !content) {
    return { error: "Judul, ringkasan, dan isi program wajib diisi.", values };
  }

  if (!slug) {
    return { error: "Slug tidak bisa dibentuk dari judul itu. Isi slug secara manual.", values };
  }

  const subProgram = readSubProgram(rawSubProgram);
  if (!subProgram) return { error: "Pilih salah satu sub-program.", values };

  // Gambar: berkas baru menggantikan yang lama; kalau tidak ada berkas, URL lama
  // diteruskan apa adanya.
  let thumbnail: string | null = read("currentThumbnail") || null;
  const file = formData.get("thumbnailFile");

  if (file instanceof File && file.size > 0) {
    const invalid = validateImage(file);
    if (invalid) return { error: invalid, values };

    try {
      const uploaded = await uploadImage(file, "kkn", token);
      thumbnail = uploaded.url;
    } catch (error) {
      redirectIfExpired(error);
      return { error: `Gagal mengunggah gambar. ${toMessage(error)}`, values };
    }
  } else if (formData.get("removeThumbnail") === "on") {
    thumbnail = null;
  }

  const payload: KknProgramInput = {
    subProgram,
    title,
    slug,
    description,
    content,
    thumbnail,
    isActive,
  };

  try {
    if (id) {
      await updateKknProgram(id, payload, token);
    } else {
      await createKknProgram(payload, token);
    }
  } catch (error) {
    redirectIfExpired(error);
    return { error: toMessage(error), values };
  }

  revalidateKkn(slug);
  redirect(`/admin/program-kkn/${slug}?pesan=${id ? "diperbarui" : "dibuat"}`);
}

/**
 * Menghapus program — hanya bila kegiatannya sudah kosong.
 *
 * `KKNActivity.programId` adalah relasi wajib, dan tidak ada catatan bahwa
 * backend menghapusnya berantai seperti gambar UMKM. Dua kemungkinannya
 * sama-sama buruk kalau dibiarkan: database menolak dengan "Referensi data
 * tidak valid" yang tidak menjelaskan apa pun, atau seluruh dokumentasi
 * kegiatan lenyap tanpa pengelola pernah memintanya. Jadi kegiatannya dihapus
 * lebih dulu satu per satu, sadar, seperti pola kategori berita.
 */
export async function deleteKknProgramAction(formData: FormData) {
  const { token } = await requireSession();

  const id = String(formData.get("id") ?? "");
  const slug = String(formData.get("slug") ?? "");

  if (!id || !slug) redirect("/admin/program-kkn");

  try {
    // Diperiksa ulang di sini: halaman konfirmasinya bisa saja dimuat sebelum
    // kegiatan terakhir ditambahkan.
    const program = await getKknProgramBySlugAsAdmin(slug, token);
    if ((program.activities?.length ?? 0) > 0) {
      redirect(`/admin/program-kkn/${slug}/hapus?pesan=masih-ada-kegiatan`);
    }

    await deleteKknProgram(id, token);
  } catch (error) {
    redirectIfExpired(error);
    throw error;
  }

  revalidateKkn(slug);
  redirect("/admin/program-kkn?pesan=dihapus");
}

// ============================================================
// KEGIATAN
// ============================================================

export async function saveKknActivityAction(
  _prevState: KknActivityFormState,
  formData: FormData,
): Promise<KknActivityFormState> {
  const { token } = await requireSession();

  const read = (key: string) => String(formData.get(key) ?? "").trim();

  const id = read("id");
  const programId = read("programId");
  const programSlug = read("programSlug");
  const title = read("title");
  const description = read("description");
  const rawDate = read("date");

  const values = { title, description, date: rawDate };

  if (!programId) return { error: "Program tidak dikenali.", values };
  if (!title) return { error: "Judul kegiatan wajib diisi.", values };

  // Tanggal boleh dikosongkan — sebagian kegiatan memang berjalan berminggu-minggu
  // dan tidak punya satu tanggal yang benar.
  const date = rawDate ? fromDateInput(rawDate) : null;
  if (rawDate && !date) return { error: "Tanggal kegiatan tidak dikenali.", values };

  let image: string | null = read("currentImage") || null;
  const file = formData.get("imageFile");

  if (file instanceof File && file.size > 0) {
    const invalid = validateImage(file);
    if (invalid) return { error: invalid, values };

    try {
      const uploaded = await uploadImage(file, "kkn", token);
      image = uploaded.url;
    } catch (error) {
      redirectIfExpired(error);
      return { error: `Gagal mengunggah gambar. ${toMessage(error)}`, values };
    }
  } else if (formData.get("removeImage") === "on") {
    image = null;
  }

  const payload: KknActivityInput = {
    title,
    programId,
    description: description || null,
    date,
    image,
  };

  try {
    if (id) {
      await updateKknActivity(id, payload, token);
    } else {
      await createKknActivity(payload, token);
    }
  } catch (error) {
    redirectIfExpired(error);
    return { error: toMessage(error), values };
  }

  revalidateKkn(programSlug);
  redirect(
    `/admin/program-kkn/${programSlug}?pesan=${id ? "kegiatan-diperbarui" : "kegiatan-dibuat"}`,
  );
}

export async function deleteKknActivityAction(formData: FormData) {
  const { token } = await requireSession();

  const id = String(formData.get("id") ?? "");
  const programSlug = String(formData.get("programSlug") ?? "");

  if (!id) redirect(`/admin/program-kkn/${programSlug}`);

  try {
    await deleteKknActivity(id, token);
  } catch (error) {
    redirectIfExpired(error);
    throw error;
  }

  revalidateKkn(programSlug);
  redirect(`/admin/program-kkn/${programSlug}?pesan=kegiatan-dihapus`);
}
