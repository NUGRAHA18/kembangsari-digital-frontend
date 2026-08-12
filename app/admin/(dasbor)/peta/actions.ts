"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ApiRequestError, ApiUnreachableError } from "@/lib/api";
// Koordinat marker wajib diisi, tidak seperti pada potensi dan UMKM: tanpa
// keduanya pin ini tidak punya tempat di peta sama sekali. Pembacaannya
// dipakai bersama rumah warga, jadi tinggal di `lib/`.
import { parseCoordinate, parseCoordinatePair } from "@/lib/coordinates";
import { validateImage } from "@/lib/image";
import { requireSession, SESSION_EXPIRED_PATH } from "@/lib/session";
import {
  createMarker,
  deleteMarker,
  getMapCategoriesUncached,
  updateMarker,
  type MarkerInput,
} from "@/services/maps";
import { uploadImage } from "@/services/upload";

export interface MarkerFormState {
  error?: string;
  values?: Partial<Record<keyof MarkerInput, string>>;
}

/**
 * Marker aktif digambar di halaman peta dan di peta ringkas beranda.
 *
 * Sengaja tidak diekspor: berkas `"use server"` hanya boleh mengekspor fungsi
 * async — pembantu seperti ini ditolak saat kompilasi. Kembarannya di
 * `kategori/actions.ts` karena itu memang disalin, bukan diimpor.
 */
function revalidateMaps() {
  revalidatePath("/");
  revalidatePath("/peta");
}

function toMessage(error: unknown): string {
  if (error instanceof ApiRequestError) return error.messages.join(" ");
  if (error instanceof ApiUnreachableError) return error.message;
  return "Terjadi kesalahan yang tidak terduga.";
}

function redirectIfExpired(error: unknown) {
  if (error instanceof ApiRequestError && error.isUnauthorized) {
    redirect(SESSION_EXPIRED_PATH);
  }
}

export async function saveMarkerAction(
  _prevState: MarkerFormState,
  formData: FormData,
): Promise<MarkerFormState> {
  const { token } = await requireSession();

  const read = (key: string) => String(formData.get(key) ?? "").trim();

  const id = read("id");
  const name = read("name");
  const description = read("description");
  const categoryId = read("categoryId");
  const address = read("address");
  const phone = read("phone");
  // Menekan lama di Google Maps menyalin kedua angka sekaligus, dan
  // menempelkannya utuh ke kolom lintang adalah salah tempel yang paling
  // sering terjadi. Kalau itu yang terkirim, angkanya dipisah di sini alih-alih
  // ditolak dengan pesan yang membingungkan.
  const pasted = parseCoordinatePair(read("latitude"));
  const rawLatitude = pasted?.latitude ?? read("latitude");
  const rawLongitude = pasted?.longitude ?? read("longitude");
  const isActive = formData.get("isActive") === "on";

  const values = {
    name,
    description,
    categoryId,
    address,
    phone,
    latitude: rawLatitude,
    longitude: rawLongitude,
  };

  if (!name) return { error: "Nama lokasi wajib diisi.", values };

  // Kategori datang dari `<select>`, tetapi form ini tetap terkirim tanpa
  // JavaScript dan nilainya bisa dipalsukan. `categoryId` adalah relasi wajib,
  // dan id yang tidak ada dijawab backend dengan galat referensi yang tidak
  // menjelaskan apa pun kepada pengelola.
  try {
    const categories = await getMapCategoriesUncached();
    if (!categories.some((category) => category.id === categoryId)) {
      return { error: "Pilih salah satu kategori lokasi yang tersedia.", values };
    }
  } catch (error) {
    redirectIfExpired(error);
    return { error: `Gagal memeriksa kategori. ${toMessage(error)}`, values };
  }

  const latitude = parseCoordinate(rawLatitude, "Lintang (latitude)", 90);
  const longitude = parseCoordinate(rawLongitude, "Bujur (longitude)", 180);
  if (latitude.error ?? longitude.error) {
    return { error: (latitude.error ?? longitude.error)!, values };
  }

  // Gambar: berkas baru menggantikan yang lama, dan tanpa berkas URL lama
  // diteruskan apa adanya — sama seperti sampul berita dan potensi.
  let image: string | null = read("currentImage") || null;
  const file = formData.get("imageFile");

  if (file instanceof File && file.size > 0) {
    const invalid = validateImage(file);
    if (invalid) return { error: invalid, values };

    try {
      const uploaded = await uploadImage(file, "peta", token);
      image = uploaded.url;
    } catch (error) {
      redirectIfExpired(error);
      return { error: `Gagal mengunggah gambar. ${toMessage(error)}`, values };
    }
  } else if (formData.get("removeImage") === "on") {
    image = null;
  }

  const payload: MarkerInput = {
    name,
    categoryId,
    latitude: latitude.value!,
    longitude: longitude.value!,
    description: description || null,
    address: address || null,
    phone: phone || null,
    image,
    isActive,
  };

  try {
    if (id) {
      await updateMarker(id, payload, token);
    } else {
      await createMarker(payload, token);
    }
  } catch (error) {
    redirectIfExpired(error);
    return { error: toMessage(error), values };
  }

  revalidateMaps();
  redirect(`/admin/peta?pesan=${id ? "diperbarui" : "dibuat"}`);
}

export async function deleteMarkerAction(formData: FormData) {
  const { token } = await requireSession();

  const id = String(formData.get("id") ?? "");
  if (!id) redirect("/admin/peta");

  try {
    await deleteMarker(id, token);
  } catch (error) {
    redirectIfExpired(error);
    throw error;
  }

  revalidateMaps();
  redirect("/admin/peta?pesan=dihapus");
}
