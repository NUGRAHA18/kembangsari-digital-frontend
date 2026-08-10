"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { EMPLOYMENT_KEYS, EMPLOYMENT_LABELS } from "@/features/monography/employment";
import { OPTIONAL_STAT_FIELDS } from "@/features/monography/fields";
import { ApiRequestError, ApiUnreachableError } from "@/lib/api";
import { requireSession, SESSION_EXPIRED_PATH } from "@/lib/session";
import {
  createMonography,
  deleteMonography,
  updateMonography,
  type MonographyInput,
} from "@/services/monography";
import type { EmploymentData } from "@/types/api";

export interface MonographyFormState {
  error?: string;
  /** Semua isian dikembalikan apa adanya supaya 30-an kolom tidak perlu diketik ulang. */
  values?: Record<string, string>;
}

/** Monografi tampil di halamannya sendiri dan sebagai ringkasan di beranda. */
function revalidateMonography() {
  revalidatePath("/");
  revalidatePath("/monografi");
}

function toMessage(error: unknown): string {
  if (error instanceof ApiRequestError) {
    // `year` unik: satu tahun hanya boleh punya satu baris statistik.
    if (error.status === 409) {
      return "Data tahun itu sudah ada. Ubah data tahun tersebut, atau pakai tahun lain.";
    }
    return error.messages.join(" ");
  }

  if (error instanceof ApiUnreachableError) return error.message;

  return "Terjadi kesalahan yang tidak terduga.";
}

/**
 * Membaca satu kolom angka.
 *
 * Backend hanya menerima bilangan bulat >= 0. Kolom kosong menghasilkan `null`
 * — artinya **tidak didata**, dan itulah yang membedakannya dari 0 di halaman
 * publik: kategori bernilai null tidak ditampilkan sama sekali, sedangkan 0
 * tampil sebagai batang kosong yang mengklaim "sudah dihitung, hasilnya nihil".
 */
function parseCount(raw: string, label: string) {
  if (raw === "") return { value: null as number | null, error: null as string | null };

  const parsed = Number(raw);
  if (!Number.isInteger(parsed) || parsed < 0) {
    return { value: null, error: `${label} harus berupa bilangan bulat 0 atau lebih.` };
  }

  return { value: parsed, error: null };
}

export async function saveMonographyAction(
  _prevState: MonographyFormState,
  formData: FormData,
): Promise<MonographyFormState> {
  const { token } = await requireSession();

  const read = (key: string) => String(formData.get(key) ?? "").trim();

  const id = read("id");
  const isPublished = formData.get("isPublished") === "on";

  // Seluruh isian dikumpulkan lebih dulu supaya bisa dikembalikan ke form
  // ketika ada satu kolom yang ditolak.
  const values: Record<string, string> = { year: read("year") };
  for (const key of ["totalPopulation", "maleCount", "femaleCount"]) values[key] = read(key);
  for (const field of OPTIONAL_STAT_FIELDS) values[field.key] = read(field.key);
  for (const key of EMPLOYMENT_KEYS) values[`employment_${key}`] = read(`employment_${key}`);

  const year = Number(values.year);
  // 1900 adalah batas bawah yang masuk akal untuk data kependudukan, dan tahun
  // depan tetap diizinkan karena pendataan sering dituliskan mendahului tahunnya.
  const maxYear = new Date().getFullYear() + 1;
  if (!Number.isInteger(year) || year < 1900 || year > maxYear) {
    return { error: `Tahun harus berupa angka antara 1900 dan ${maxYear}.`, values };
  }

  const required = [
    { key: "totalPopulation", label: "Jumlah penduduk" },
    { key: "maleCount", label: "Jumlah laki-laki" },
    { key: "femaleCount", label: "Jumlah perempuan" },
  ] as const;

  const counts: Record<string, number> = {};
  for (const { key, label } of required) {
    const parsed = parseCount(values[key], label);
    if (parsed.error) return { error: parsed.error, values };
    if (parsed.value === null) return { error: `${label} wajib diisi.`, values };
    counts[key] = parsed.value;
  }

  // Halaman publik menghitung persentase jenis kelamin dari penjumlahan kedua
  // angka ini, lalu menampilkan total penduduk sebagai baris tersendiri di
  // tabel rincian. Kalau keduanya berbeda, warga melihat dua angka yang saling
  // membantah — dan tidak ada yang tahu mana yang benar.
  const genderTotal = counts.maleCount + counts.femaleCount;
  if (genderTotal !== counts.totalPopulation) {
    return {
      error: `Laki-laki dan perempuan berjumlah ${genderTotal}, sedangkan jumlah penduduk diisi ${counts.totalPopulation}. Betulkan salah satunya.`,
      values,
    };
  }

  const payload: MonographyInput = {
    year,
    totalPopulation: counts.totalPopulation,
    maleCount: counts.maleCount,
    femaleCount: counts.femaleCount,
    isPublished,
  };

  for (const field of OPTIONAL_STAT_FIELDS) {
    const parsed = parseCount(values[field.key], field.label);
    if (parsed.error) return { error: parsed.error, values };
    // Dikirim walaupun `null`: tanpa itu `PATCH` mempertahankan angka lama yang
    // baru saja dikosongkan pengelola.
    payload[field.key] = parsed.value;
  }

  // `employmentData` dikirim sebagai objek utuh — backend menimpanya sekaligus,
  // bukan menggabungkannya dengan yang tersimpan. Kunci yang dikosongkan
  // dibuang dari objek, bukan diisi 0, karena tidak didata bukan berarti nihil.
  const employmentData: EmploymentData = {};
  for (const key of EMPLOYMENT_KEYS) {
    const parsed = parseCount(
      values[`employment_${key}`],
      `Mata pencaharian ${EMPLOYMENT_LABELS[key]}`,
    );
    if (parsed.error) return { error: parsed.error, values };
    if (parsed.value !== null) employmentData[key] = parsed.value;
  }
  payload.employmentData = Object.keys(employmentData).length > 0 ? employmentData : null;

  try {
    if (id) {
      await updateMonography(id, payload, token);
    } else {
      await createMonography(payload, token);
    }
  } catch (error) {
    if (error instanceof ApiRequestError && error.isUnauthorized) {
      redirect(SESSION_EXPIRED_PATH);
    }
    return { error: toMessage(error), values };
  }

  revalidateMonography();
  redirect(`/admin/monografi?pesan=${id ? "diperbarui" : "dibuat"}`);
}

export async function deleteMonographyAction(formData: FormData) {
  const { token } = await requireSession();

  const id = String(formData.get("id") ?? "");
  if (!id) redirect("/admin/monografi");

  try {
    await deleteMonography(id, token);
  } catch (error) {
    if (error instanceof ApiRequestError && error.isUnauthorized) {
      redirect(SESSION_EXPIRED_PATH);
    }
    throw error;
  }

  revalidateMonography();
  redirect("/admin/monografi?pesan=dihapus");
}
