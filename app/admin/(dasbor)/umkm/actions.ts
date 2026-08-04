"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ApiRequestError, ApiUnreachableError } from "@/lib/api";
import type { FormState } from "@/lib/form-state";
import { validateImage } from "@/lib/image";
import { requireSession } from "@/lib/session";
import { slugify } from "@/lib/slug";
import { uploadImages } from "@/services/upload";
import {
  createUmkm,
  createUmkmImage,
  deleteUmkm,
  deleteUmkmImage,
  getUmkmImages,
  updateUmkm,
  updateUmkmImage,
  type UmkmInput,
} from "@/services/umkm";
import { UPLOAD_MAX_FILES } from "@/types/api";

export interface UmkmFormState {
  error?: string;
  values?: Partial<Record<keyof UmkmInput, string>>;
}

function revalidateUmkm(slug?: string) {
  revalidatePath("/");
  revalidatePath("/umkm");
  revalidatePath("/sitemap.xml");
  if (slug) revalidatePath(`/umkm/${slug}`);
}

function toMessage(error: unknown): string {
  if (error instanceof ApiRequestError) {
    if (error.status === 409) return "Slug itu sudah dipakai UMKM lain. Ubah slug-nya agar unik.";
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

/**
 * Nomor WhatsApp disimpan dalam format internasional tanpa tanda plus, sesuai
 * kontrak backend. Warga hampir selalu menuliskannya sebagai "08…", jadi
 * pengubahannya dilakukan di sini alih-alih menuntut pengelola menghafal aturan.
 */
function normalizeWhatsapp(value: string): string {
  const digits = value.replace(/\D/g, "");
  return digits.startsWith("0") ? `62${digits.slice(1)}` : digits;
}

/** Mengembalikan pesan galat bila diisi tetapi bukan URL lengkap. */
function checkUrl(value: string, label: string): string | null {
  if (!value) return null;
  return /^https?:\/\/\S+$/.test(value)
    ? null
    : `${label} harus berupa tautan lengkap yang diawali http:// atau https://.`;
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

export async function saveUmkmAction(
  _prevState: UmkmFormState,
  formData: FormData,
): Promise<UmkmFormState> {
  const { token } = await requireSession();

  const read = (key: string) => String(formData.get(key) ?? "").trim();

  const id = read("id");
  const name = read("name");
  const description = read("description");
  const slug = slugify(read("slug") || name);
  const address = read("address");
  const phone = read("phone");
  const whatsapp = read("whatsapp");
  const email = read("email");
  const instagram = read("instagram");
  const facebook = read("facebook");
  const website = read("website");
  const rawLatitude = read("latitude");
  const rawLongitude = read("longitude");
  const isActive = formData.get("isActive") === "on";

  const values = {
    name,
    description,
    slug,
    address,
    phone,
    whatsapp,
    email,
    instagram,
    facebook,
    website,
    latitude: rawLatitude,
    longitude: rawLongitude,
  };

  if (!name || !description) return { error: "Nama dan deskripsi wajib diisi.", values };
  if (!slug) {
    return { error: "Slug tidak bisa dibentuk dari nama itu. Isi slug secara manual.", values };
  }

  if (email && !email.includes("@")) return { error: "Alamat email tidak valid.", values };

  const urlError =
    checkUrl(instagram, "Instagram") ?? checkUrl(facebook, "Facebook") ?? checkUrl(website, "Website");
  if (urlError) return { error: urlError, values };

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

  const payload: UmkmInput = {
    name,
    slug,
    description,
    address: address || null,
    phone: phone || null,
    whatsapp: whatsapp ? normalizeWhatsapp(whatsapp) : null,
    email: email || null,
    instagram: instagram || null,
    facebook: facebook || null,
    website: website || null,
    latitude: latitude.value,
    longitude: longitude.value,
    isActive,
  };

  try {
    if (id) {
      await updateUmkm(id, payload, token);
    } else {
      await createUmkm(payload, token);
    }
  } catch (error) {
    redirectIfExpired(error);
    return { error: toMessage(error), values };
  }

  revalidateUmkm(slug);
  redirect(`/admin/umkm/${slug}?pesan=${id ? "diperbarui" : "dibuat"}`);
}

export async function deleteUmkmAction(formData: FormData) {
  const { token } = await requireSession();

  const id = String(formData.get("id") ?? "");
  const slug = String(formData.get("slug") ?? "");

  if (!id) redirect("/admin/umkm");

  try {
    await deleteUmkm(id, token);
  } catch (error) {
    redirectIfExpired(error);
    throw error;
  }

  revalidateUmkm(slug);
  redirect("/admin/umkm?pesan=dihapus");
}

// ============================================================
// GAMBAR
// ============================================================

/**
 * Mengunggah gambar UMKM, lalu mencatat masing-masing sebagai record gambar.
 *
 * Gambar pertama sebuah UMKM otomatis menjadi gambar utama: kartu di halaman
 * daftar hanya menampilkan gambar `isPrimary`, jadi tanpa penanda itu UMKM yang
 * sudah berfoto tetap tampil sebagai kotak kosong.
 */
export async function addUmkmImagesAction(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const { token } = await requireSession();

  const umkmId = String(formData.get("umkmId") ?? "");
  const umkmSlug = String(formData.get("umkmSlug") ?? "");
  if (!umkmId) return { error: "UMKM tidak dikenali." };

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
    const existing = await getUmkmImages(umkmId);
    let hasPrimary = existing.some((image) => image.isPrimary);

    const uploaded = await uploadImages(files, "umkm", token);

    for (const item of uploaded) {
      await createUmkmImage({ url: item.url, umkmId, isPrimary: !hasPrimary }, token);
      hasPrimary = true;
    }
  } catch (error) {
    redirectIfExpired(error);
    return { error: toMessage(error) };
  }

  revalidateUmkm(umkmSlug);
  redirect(`/admin/umkm/${umkmSlug}?pesan=gambar-ditambah`);
}

export async function updateUmkmImageAction(formData: FormData) {
  const { token } = await requireSession();

  const id = String(formData.get("id") ?? "");
  const umkmSlug = String(formData.get("umkmSlug") ?? "");
  const caption = String(formData.get("caption") ?? "").trim();

  if (!id) redirect(`/admin/umkm/${umkmSlug}`);

  try {
    await updateUmkmImage(id, { caption: caption || null }, token);
  } catch (error) {
    redirectIfExpired(error);
    throw error;
  }

  revalidateUmkm(umkmSlug);
  redirect(`/admin/umkm/${umkmSlug}?pesan=gambar-disimpan`);
}

/**
 * Menjadikan satu gambar sebagai gambar utama.
 *
 * Penandaan lama dilepas satu per satu karena backend tidak melakukannya:
 * `isPrimary` hanya disimpan apa adanya, sehingga dua gambar bisa sama-sama
 * bertanda utama dan kartu UMKM akan menampilkan salah satunya secara acak.
 */
export async function setPrimaryImageAction(formData: FormData) {
  const { token } = await requireSession();

  const id = String(formData.get("id") ?? "");
  const umkmId = String(formData.get("umkmId") ?? "");
  const umkmSlug = String(formData.get("umkmSlug") ?? "");

  if (!id || !umkmId) redirect(`/admin/umkm/${umkmSlug}`);

  try {
    const images = await getUmkmImages(umkmId);

    for (const image of images) {
      if (image.isPrimary && image.id !== id) {
        await updateUmkmImage(image.id, { isPrimary: false }, token);
      }
    }

    await updateUmkmImage(id, { isPrimary: true }, token);
  } catch (error) {
    redirectIfExpired(error);
    throw error;
  }

  revalidateUmkm(umkmSlug);
  redirect(`/admin/umkm/${umkmSlug}?pesan=gambar-utama`);
}

export async function deleteUmkmImageAction(formData: FormData) {
  const { token } = await requireSession();

  const id = String(formData.get("id") ?? "");
  const umkmId = String(formData.get("umkmId") ?? "");
  const umkmSlug = String(formData.get("umkmSlug") ?? "");

  if (!id) redirect(`/admin/umkm/${umkmSlug}`);

  try {
    await deleteUmkmImage(id, token);

    // Kalau yang dihapus adalah gambar utama, gambar tersisa yang pertama
    // menggantikannya — kalau tidak, kartu UMKM ini akan kehilangan gambarnya
    // padahal fotonya masih ada.
    if (umkmId) {
      const remaining = await getUmkmImages(umkmId);
      if (remaining.length > 0 && !remaining.some((image) => image.isPrimary)) {
        await updateUmkmImage(remaining[0].id, { isPrimary: true }, token);
      }
    }
  } catch (error) {
    redirectIfExpired(error);
    throw error;
  }

  revalidateUmkm(umkmSlug);
  redirect(`/admin/umkm/${umkmSlug}?pesan=gambar-dihapus`);
}
