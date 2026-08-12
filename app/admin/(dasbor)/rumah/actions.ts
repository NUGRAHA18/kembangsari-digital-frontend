"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ApiRequestError, ApiUnreachableError } from "@/lib/api";
import { parseCoordinate, parseCoordinatePair } from "@/lib/coordinates";
import { fromDateInput } from "@/lib/format";
import { validateImage } from "@/lib/image";
import { requireSession, SESSION_EXPIRED_PATH } from "@/lib/session";
import { isFamilyRelation } from "@/features/house/relations";
import { MIN_BIRTH_YEAR } from "@/features/house/house";
import {
  createFamily,
  createHouse,
  createResident,
  deleteFamily,
  deleteHouse,
  deleteResident,
  updateFamily,
  updateHouse,
  updateResident,
  type HouseInput,
  type ResidentInput,
} from "@/services/house";
import { uploadImage } from "@/services/upload";

export interface HouseFormState {
  error?: string;
  values?: Record<string, string>;
}

/**
 * Kartu keluarga dan penghuninya memakai **form server biasa**, bukan
 * `useActionState`, dengan alasan yang sama seperti kartu gambar UMKM: satu
 * rumah bisa berisi beberapa KK dan belasan warga, masing-masing dengan
 * formnya sendiri. Menjadikan semuanya Client Component berarti mengirim
 * belasan salinan React ke browser demi dua isian per baris.
 *
 * Akibatnya galat tidak bisa dikembalikan sebagai state, jadi ia dibawa lewat
 * `?galat=` pada alamat halaman rumahnya — tempat pengelola memang berada.
 */
function backToHouse(houseId: string, params: Record<string, string>): never {
  const query = new URLSearchParams(params).toString();
  redirect(`/admin/rumah/${houseId}?${query}`);
}

/**
 * Rumah warga tampil di peta beranda, halaman peta, dan halaman detailnya
 * sendiri. Ringkasan per RT juga ikut berubah setiap kali seorang warga
 * ditambah — angkanya datang dari `GET /house/summary`, bukan dihitung
 * halamannya.
 */
function revalidateHouses(slug?: string) {
  revalidatePath("/");
  revalidatePath("/peta");
  if (slug) revalidatePath(`/peta/rumah/${slug}`);
}

function toMessage(error: unknown): string {
  if (error instanceof ApiRequestError) {
    // `DELETE` pada rumah, KK, dan warga menuntut peran ADMIN. Pesan bawaan
    // backend untuk 403 tidak menjelaskan apa yang harus dilakukan pengelola.
    if (error.status === 403) {
      return "Akun Anda tidak berwenang menghapus. Mintakan kepada pengelola berperan Admin.";
    }
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

// ============================================================
// RUMAH
// ============================================================

export async function saveHouseAction(
  _prevState: HouseFormState,
  formData: FormData,
): Promise<HouseFormState> {
  const { token } = await requireSession();

  const read = (key: string) => String(formData.get(key) ?? "").trim();

  const id = read("id");
  const label = read("label");
  const rt = read("rt");
  const rw = read("rw");
  const address = read("address");
  const note = read("note");
  const dataVerifiedAt = read("dataVerifiedAt");

  // Sepasang koordinat yang tertempel utuh dari Google Maps dipisah di sini.
  const pasted = parseCoordinatePair(read("latitude"));
  const rawLatitude = pasted?.latitude ?? read("latitude");
  const rawLongitude = pasted?.longitude ?? read("longitude");
  const isActive = formData.get("isActive") === "on";

  const values = {
    label,
    rt,
    rw,
    address,
    note,
    dataVerifiedAt,
    latitude: rawLatitude,
    longitude: rawLongitude,
  };

  if (!label) return { error: "Nama rumah wajib diisi.", values };
  if (!rt) return { error: "RT wajib diisi.", values };
  if (!rw) return { error: "RW wajib diisi.", values };

  const latitude = parseCoordinate(rawLatitude, "Lintang (latitude)", 90);
  const longitude = parseCoordinate(rawLongitude, "Bujur (longitude)", 180);
  if (latitude.error ?? longitude.error) {
    return { error: (latitude.error ?? longitude.error)!, values };
  }

  let photo: string | null = read("currentPhoto") || null;
  const file = formData.get("photoFile");

  if (file instanceof File && file.size > 0) {
    const invalid = validateImage(file);
    if (invalid) return { error: invalid, values };

    try {
      const uploaded = await uploadImage(file, "rumah", token);
      photo = uploaded.url;
    } catch (error) {
      redirectIfExpired(error);
      return { error: `Gagal mengunggah foto. ${toMessage(error)}`, values };
    }
  } else if (formData.get("removePhoto") === "on") {
    photo = null;
  }

  const payload: HouseInput = {
    label,
    rt,
    rw,
    latitude: latitude.value!,
    longitude: longitude.value!,
    address: address || null,
    note: note || null,
    // Tanggal tanpa jam, dikunci ke WIB seperti tanggal kegiatan KKN — tanpa
    // itu tanggal yang diketik bisa terbaca mundur sehari saat formnya dibuka
    // kembali.
    dataVerifiedAt: dataVerifiedAt ? fromDateInput(dataVerifiedAt) : null,
    photo,
    isActive,
  };

  let slug: string;
  try {
    const saved = id ? await updateHouse(id, payload, token) : await createHouse(payload, token);
    slug = saved.slug;
  } catch (error) {
    redirectIfExpired(error);
    return { error: toMessage(error), values };
  }

  revalidateHouses(slug);
  redirect(`/admin/rumah?pesan=${id ? "diperbarui" : "dibuat"}`);
}

export async function deleteHouseAction(formData: FormData) {
  const { token } = await requireSession();

  const id = String(formData.get("id") ?? "");
  if (!id) redirect("/admin/rumah");

  try {
    await deleteHouse(id, token);
  } catch (error) {
    redirectIfExpired(error);
    throw error;
  }

  revalidateHouses(String(formData.get("slug") ?? "") || undefined);
  redirect("/admin/rumah?pesan=dihapus");
}

// ============================================================
// KARTU KELUARGA
// ============================================================

export async function saveFamilyAction(formData: FormData) {
  const { token } = await requireSession();

  const houseId = String(formData.get("houseId") ?? "");
  const houseSlug = String(formData.get("houseSlug") ?? "");
  const familyId = String(formData.get("familyId") ?? "");
  const kkNumber = String(formData.get("kkNumber") ?? "").trim();

  if (!houseId) redirect("/admin/rumah");

  try {
    if (familyId) {
      await updateFamily(familyId, { kkNumber: kkNumber || null }, token);
    } else {
      // `order` sengaja tidak dikirim: backend membacanya sebagai "letakkan di
      // urutan terakhir", yang memang selalu benar saat KK baru ditambahkan.
      await createFamily({ houseId, kkNumber: kkNumber || null }, token);
    }
  } catch (error) {
    redirectIfExpired(error);
    backToHouse(houseId, { galat: toMessage(error) });
  }

  revalidateHouses(houseSlug);
  backToHouse(houseId, { pesan: "kk-disimpan" });
}

export async function deleteFamilyAction(formData: FormData) {
  const { token } = await requireSession();

  const houseId = String(formData.get("houseId") ?? "");
  const familyId = String(formData.get("familyId") ?? "");
  if (!familyId) redirect(`/admin/rumah/${houseId}`);

  try {
    await deleteFamily(familyId, token);
  } catch (error) {
    redirectIfExpired(error);
    throw error;
  }

  revalidateHouses(String(formData.get("houseSlug") ?? "") || undefined);
  redirect(`/admin/rumah/${houseId}?pesan=kk-dihapus`);
}

// ============================================================
// PENGHUNI
// ============================================================

export async function saveResidentAction(formData: FormData) {
  const { token } = await requireSession();

  const houseId = String(formData.get("houseId") ?? "");
  const houseSlug = String(formData.get("houseSlug") ?? "");
  const familyId = String(formData.get("familyId") ?? "");
  const residentId = String(formData.get("residentId") ?? "");

  const name = String(formData.get("name") ?? "").trim();
  const relation = String(formData.get("relation") ?? "");
  const rawBirthYear = String(formData.get("birthYear") ?? "").trim();
  const rawGender = String(formData.get("gender") ?? "");

  if (!houseId) redirect("/admin/rumah");
  if (!name) backToHouse(houseId, { galat: "Nama warga wajib diisi." });

  // `<select>` bisa dipalsukan, dan form ini tetap terkirim tanpa JavaScript.
  // Nilai di luar daftar dijawab backend `400` dengan pesan yang tidak
  // menjelaskan apa pun kepada pengelola.
  if (!isFamilyRelation(relation)) {
    backToHouse(houseId, { galat: "Pilih salah satu hubungan keluarga yang tersedia." });
  }

  let birthYear: number | null = null;
  if (rawBirthYear) {
    const parsed = Number(rawBirthYear);
    const thisYear = new Date().getFullYear();

    if (!Number.isInteger(parsed) || parsed < MIN_BIRTH_YEAR || parsed > thisYear) {
      backToHouse(houseId, {
        galat: `Tahun lahir harus antara ${MIN_BIRTH_YEAR} dan ${thisYear}.`,
      });
    }
    birthYear = parsed;
  }

  const gender = rawGender === "LAKI_LAKI" || rawGender === "PEREMPUAN" ? rawGender : null;

  // Diperiksa SEBELUM `try`, bukan di dalamnya. `redirect()` bekerja dengan
  // melempar; dipanggil dari dalam blok itu, pengalihannya akan tertangkap
  // `catch` di bawah dan berubah menjadi "kesalahan yang tidak terduga".
  if (!residentId && !familyId) backToHouse(houseId, { galat: "Kartu keluarga tidak dikenali." });

  try {
    if (residentId) {
      // Kolom yang dikosongkan dikirim `null`, bukan dihilangkan: `PATCH` hanya
      // menyentuh field yang dikirim, jadi tahun lahir yang baru saja dihapus
      // pengelola akan diam-diam kembali.
      await updateResident(residentId, { name, relation, birthYear, gender }, token);
    } else {
      const payload: ResidentInput = { familyId, name, relation, birthYear, gender };
      await createResident(payload, token);
    }
  } catch (error) {
    redirectIfExpired(error);
    backToHouse(houseId, { galat: toMessage(error) });
  }

  revalidateHouses(houseSlug);
  backToHouse(houseId, { pesan: "warga-disimpan" });
}

export async function deleteResidentAction(formData: FormData) {
  const { token } = await requireSession();

  const houseId = String(formData.get("houseId") ?? "");
  const residentId = String(formData.get("residentId") ?? "");
  if (!residentId) redirect(`/admin/rumah/${houseId}`);

  try {
    await deleteResident(residentId, token);
  } catch (error) {
    redirectIfExpired(error);
    throw error;
  }

  revalidateHouses(String(formData.get("houseSlug") ?? "") || undefined);
  redirect(`/admin/rumah/${houseId}?pesan=warga-dihapus`);
}
