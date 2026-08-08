"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { SETTING_FIELDS } from "@/features/settings/fields";
import { ApiRequestError, ApiUnreachableError } from "@/lib/api";
import { validateImage } from "@/lib/image";
import { requireSession } from "@/lib/session";
import { getSettingsAsAdmin, toSettingsMap, updateSetting } from "@/services/settings";
import { uploadImage } from "@/services/upload";

export interface SettingsFormState {
  error?: string;
  values?: Record<string, string>;
}

function toMessage(error: unknown): string {
  if (error instanceof ApiRequestError) return error.messages.join(" ");
  if (error instanceof ApiUnreachableError) return error.message;
  return "Terjadi kesalahan yang tidak terduga.";
}

function redirectIfExpired(error: unknown) {
  if (error instanceof ApiRequestError && error.isUnauthorized) {
    redirect("/admin/keluar?sesi=habis");
  }
}

/** Lintang, bujur, dan perbesaran disimpan sebagai string, tetapi harus terbaca sebagai angka. */
function validateMapView(values: Record<string, string>): string | null {
  const checks = [
    { key: "map_latitude", label: "Lintang", min: -90, max: 90 },
    { key: "map_longitude", label: "Bujur", min: -180, max: 180 },
    { key: "map_zoom", label: "Tingkat perbesaran", min: 1, max: 19 },
  ];

  for (const { key, label, min, max } of checks) {
    const raw = values[key];
    if (!raw) continue;

    const parsed = Number(raw.replace(",", "."));
    if (!Number.isFinite(parsed) || parsed < min || parsed > max) {
      return `${label} harus berupa angka antara ${min} dan ${max}.`;
    }
  }

  return null;
}

/**
 * Menyimpan pengaturan situs.
 *
 * Hanya key yang benar-benar berubah yang dikirim: `PATCH /settings/:key`
 * bekerja satu key per permintaan, dan mengirim ketujuh belasnya setiap kali
 * tombol simpan ditekan berarti tujuh belas permintaan untuk satu perubahan
 * kecil — terasa sekali di jaringan padukuhan.
 */
export async function saveSettingsAction(
  _prevState: SettingsFormState,
  formData: FormData,
): Promise<SettingsFormState> {
  const { token } = await requireSession();

  const read = (key: string) => String(formData.get(key) ?? "").trim();

  const values: Record<string, string> = {};
  for (const field of SETTING_FIELDS) {
    // Kolom gambar tidak diketik: nilainya berasal dari URL yang tersimpan,
    // dari berkas yang baru diunggah, atau dikosongkan lewat centang hapus.
    values[field.key] = field.kind === "image" ? read(`current_${field.key}`) : read(field.key);
  }

  const invalidMapView = validateMapView(values);
  if (invalidMapView) return { error: invalidMapView, values };

  for (const field of SETTING_FIELDS) {
    if (field.kind !== "image") continue;

    const file = formData.get(`file_${field.key}`);

    if (file instanceof File && file.size > 0) {
      const invalid = validateImage(file);
      if (invalid) return { error: `${field.label}: ${invalid}`, values };

      try {
        const uploaded = await uploadImage(file, "pengaturan", token);
        values[field.key] = uploaded.url;
      } catch (error) {
        redirectIfExpired(error);
        return { error: `Gagal mengunggah ${field.label}. ${toMessage(error)}`, values };
      }
    } else if (formData.get(`remove_${field.key}`) === "on") {
      values[field.key] = "";
    }
  }

  let stored: Record<string, string | undefined>;
  try {
    stored = toSettingsMap(await getSettingsAsAdmin());
  } catch (error) {
    redirectIfExpired(error);
    return { error: `Gagal membaca pengaturan yang tersimpan. ${toMessage(error)}`, values };
  }

  const changed = SETTING_FIELDS.filter((field) => values[field.key] !== (stored[field.key] ?? ""));

  if (changed.length === 0) {
    return { error: "Tidak ada perubahan untuk disimpan.", values };
  }

  // `PATCH /settings/:key` bersifat upsert: key yang belum ada di seed backend
  // dibuatkan, bukan dijawab 404. Jadi tidak ada lagi keadaan "mintakan
  // penambahannya ke tim backend" yang perlu diterjemahkan di sini.
  for (const field of changed) {
    try {
      await updateSetting(field.key, values[field.key], token);
    } catch (error) {
      redirectIfExpired(error);
      return { error: `Gagal menyimpan ${field.label}. ${toMessage(error)}`, values };
    }
  }

  // Nama situs, logo, dan kontak dipakai navbar serta footer — keduanya ada di
  // layout yang membungkus seluruh halaman publik, jadi yang disegarkan bukan
  // satu halaman melainkan semuanya.
  revalidatePath("/", "layout");
  redirect("/admin/pengaturan?pesan=disimpan");
}
