"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { POTENTIAL_CATEGORIES } from "@/features/potential/categories";
import { ApiRequestError, ApiUnreachableError } from "@/lib/api";
import type { FormState } from "@/lib/form-state";
import { validateImage } from "@/lib/image";
import { requireSession, SESSION_EXPIRED_PATH } from "@/lib/session";
import { slugify } from "@/lib/slug";
import {
  createPotential,
  createPotentialImage,
  deletePotential,
  deletePotentialImage,
  updatePotential,
  updatePotentialImage,
  type PotentialInput,
} from "@/services/potential";
import { uploadImage, uploadImages } from "@/services/upload";
import { UPLOAD_MAX_FILES, type PotentialCategory } from "@/types/api";

export interface PotentialFormState {
  error?: string;
  values?: Partial<Record<keyof PotentialInput, string>>;
}

function revalidatePotential(slug?: string) {
  revalidatePath("/potensi");
  revalidatePath("/sitemap.xml");
  if (slug) revalidatePath(`/potensi/${slug}`);
}

function toMessage(error: unknown): string {
  if (error instanceof ApiRequestError) {
    if (error.status === 409) return "Slug itu sudah dipakai potensi lain. Ubah slug-nya agar unik.";
    return error.messages.join(" ");
  }

  if (error instanceof ApiUnreachableError) return error.message;

  return "Terjadi kesalahan yang tidak terduga.";
}

function redirectIfExpired(error: unknown) {
  if (error instanceof ApiRequestError && error.isUnauthorized) {
    redirect(SESSION_EXPIRED_PATH);
  }
}

/**
 * Kategori datang dari `<select>`, tetapi form bisa dikirim tanpa JavaScript dan
 * nilainya tetap bisa dipalsukan. Kategori di luar daftar dijawab backend `400`
 * dengan pesan yang tidak menjelaskan apa pun, jadi diperiksa lebih dulu di sini.
 */
function readCategory(value: string): PotentialCategory | null {
  return POTENTIAL_CATEGORIES.find((category) => category === value) ?? null;
}

/** Koordinat: kosong berarti tidak dipetakan, dan keduanya harus diisi bersama. */
function parseCoordinate(value: string, label: string, max: number) {
  if (!value) return { value: null as number | null, error: null as string | null };

  const parsed = Number(value.replace(",", "."));
  if (!Number.isFinite(parsed) || Math.abs(parsed) > max) {
    return { value: null, error: `${label} tidak valid.` };
  }

  return { value: parsed, error: null };
}

export async function savePotentialAction(
  _prevState: PotentialFormState,
  formData: FormData,
): Promise<PotentialFormState> {
  const { token } = await requireSession();

  const read = (key: string) => String(formData.get(key) ?? "").trim();

  const id = read("id");
  const name = read("name");
  const description = read("description");
  const slug = slugify(read("slug") || name);
  const rawCategory = read("category");
  const address = read("address");
  const contactPerson = read("contactPerson");
  const contactPhone = read("contactPhone");
  const rawLatitude = read("latitude");
  const rawLongitude = read("longitude");
  const isActive = formData.get("isActive") === "on";

  const values = {
    name,
    description,
    slug,
    category: rawCategory,
    address,
    contactPerson,
    contactPhone,
    latitude: rawLatitude,
    longitude: rawLongitude,
  };

  if (!name || !description) return { error: "Nama dan deskripsi wajib diisi.", values };
  if (!slug) {
    return { error: "Slug tidak bisa dibentuk dari nama itu. Isi slug secara manual.", values };
  }

  const category = readCategory(rawCategory);
  if (!category) return { error: "Pilih salah satu kategori potensi.", values };

  const latitude = parseCoordinate(rawLatitude, "Lintang (latitude)", 90);
  const longitude = parseCoordinate(rawLongitude, "Bujur (longitude)", 180);
  if (latitude.error ?? longitude.error) {
    return { error: (latitude.error ?? longitude.error)!, values };
  }

  // Satu koordinat saja tidak menghasilkan titik: peta dan tombol "Petunjuk
  // Arah" sama-sama butuh keduanya.
  if ((latitude.value === null) !== (longitude.value === null)) {
    return { error: "Lintang dan bujur harus diisi berdua atau dikosongkan berdua.", values };
  }

  // Gambar sampul: berkas baru menggantikan yang lama; kalau tidak ada berkas,
  // URL lama diteruskan apa adanya. Sampul ini terpisah dari galeri di halaman
  // kelola — yang satu tampil di kartu daftar, yang lain di bagian dokumentasi.
  let thumbnail: string | null = read("currentThumbnail") || null;
  const file = formData.get("thumbnailFile");

  if (file instanceof File && file.size > 0) {
    const invalid = validateImage(file);
    if (invalid) return { error: invalid, values };

    try {
      const uploaded = await uploadImage(file, "potensi", token);
      thumbnail = uploaded.url;
    } catch (error) {
      redirectIfExpired(error);
      return { error: `Gagal mengunggah gambar sampul. ${toMessage(error)}`, values };
    }
  } else if (formData.get("removeThumbnail") === "on") {
    thumbnail = null;
  }

  const payload: PotentialInput = {
    name,
    slug,
    category,
    description,
    thumbnail,
    address: address || null,
    latitude: latitude.value,
    longitude: longitude.value,
    contactPerson: contactPerson || null,
    contactPhone: contactPhone || null,
    isActive,
  };

  try {
    if (id) {
      await updatePotential(id, payload, token);
    } else {
      await createPotential(payload, token);
    }
  } catch (error) {
    redirectIfExpired(error);
    return { error: toMessage(error), values };
  }

  revalidatePotential(slug);
  redirect(`/admin/potensi/${slug}?pesan=${id ? "diperbarui" : "dibuat"}`);
}

export async function deletePotentialAction(formData: FormData) {
  const { token } = await requireSession();

  const id = String(formData.get("id") ?? "");
  const slug = String(formData.get("slug") ?? "");

  if (!id) redirect("/admin/potensi");

  try {
    await deletePotential(id, token);
  } catch (error) {
    redirectIfExpired(error);
    throw error;
  }

  revalidatePotential(slug);
  redirect("/admin/potensi?pesan=dihapus");
}

// ============================================================
// GAMBAR
// ============================================================

/**
 * Mengunggah gambar dokumentasi potensi, lalu mencatat masing-masing sebagai
 * record gambar.
 *
 * `isPrimary` tidak dikirim: backend menandai gambar pertama sebuah record
 * sebagai utama dengan sendirinya. Penanda itu tetap penting di sini karena
 * kartu daftar memakai `thumbnail` dan jatuh ke gambar `isPrimary` bila
 * sampulnya kosong.
 */
export async function addPotentialImagesAction(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const { token } = await requireSession();

  const potentialId = String(formData.get("potentialId") ?? "");
  const potentialSlug = String(formData.get("potentialSlug") ?? "");
  if (!potentialId) return { error: "Potensi tidak dikenali." };

  const files = formData
    .getAll("images")
    .filter((entry): entry is File => entry instanceof File && entry.size > 0);

  if (files.length === 0) return { error: "Pilih setidaknya satu gambar." };
  if (files.length > UPLOAD_MAX_FILES) {
    return {
      error: `Maksimal ${UPLOAD_MAX_FILES} gambar sekali unggah. Anda memilih ${files.length}.`,
    };
  }

  for (const file of files) {
    const invalid = validateImage(file);
    if (invalid) return { error: `${file.name}: ${invalid}` };
  }

  try {
    const uploaded = await uploadImages(files, "potensi", token);

    for (const item of uploaded) {
      await createPotentialImage({ url: item.url, potentialId }, token);
    }
  } catch (error) {
    redirectIfExpired(error);
    return { error: toMessage(error) };
  }

  revalidatePotential(potentialSlug);
  redirect(`/admin/potensi/${potentialSlug}?pesan=gambar-ditambah`);
}

export async function updatePotentialImageAction(formData: FormData) {
  const { token } = await requireSession();

  const id = String(formData.get("id") ?? "");
  const potentialSlug = String(formData.get("potentialSlug") ?? "");
  const caption = String(formData.get("caption") ?? "").trim();

  if (!id) redirect(`/admin/potensi/${potentialSlug}`);

  try {
    await updatePotentialImage(id, { caption: caption || null }, token);
  } catch (error) {
    redirectIfExpired(error);
    throw error;
  }

  revalidatePotential(potentialSlug);
  redirect(`/admin/potensi/${potentialSlug}?pesan=gambar-disimpan`);
}

/**
 * Menjadikan satu gambar sebagai gambar utama.
 *
 * Satu permintaan saja: backend melepas penanda gambar lain dalam transaksi
 * yang sama.
 */
export async function setPrimaryImageAction(formData: FormData) {
  const { token } = await requireSession();

  const id = String(formData.get("id") ?? "");
  const potentialSlug = String(formData.get("potentialSlug") ?? "");

  if (!id) redirect(`/admin/potensi/${potentialSlug}`);

  try {
    await updatePotentialImage(id, { isPrimary: true }, token);
  } catch (error) {
    redirectIfExpired(error);
    throw error;
  }

  revalidatePotential(potentialSlug);
  redirect(`/admin/potensi/${potentialSlug}?pesan=gambar-utama`);
}

/**
 * Menghapus satu gambar.
 *
 * Tidak ada pengangkatan pengganti di sini: menghapus gambar utama membuat
 * backend mengangkat gambar teratas berikutnya, dalam transaksi yang sama.
 */
export async function deletePotentialImageAction(formData: FormData) {
  const { token } = await requireSession();

  const id = String(formData.get("id") ?? "");
  const potentialSlug = String(formData.get("potentialSlug") ?? "");

  if (!id) redirect(`/admin/potensi/${potentialSlug}`);

  try {
    await deletePotentialImage(id, token);
  } catch (error) {
    redirectIfExpired(error);
    throw error;
  }

  revalidatePotential(potentialSlug);
  redirect(`/admin/potensi/${potentialSlug}?pesan=gambar-dihapus`);
}
