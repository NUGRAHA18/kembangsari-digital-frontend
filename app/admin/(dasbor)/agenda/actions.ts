"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ApiRequestError, ApiUnreachableError } from "@/lib/api";
import { fromDateTimeLocal } from "@/lib/format";
import { requireSession, SESSION_EXPIRED_PATH } from "@/lib/session";
import { slugify } from "@/lib/slug";
import { createAgenda, deleteAgenda, updateAgenda, type AgendaInput } from "@/services/agenda";

export interface AgendaFormState {
  error?: string;
  values?: Partial<AgendaInput> & { startDate?: string; endDate?: string };
}

function revalidateAgenda(slug?: string) {
  revalidatePath("/");
  revalidatePath("/agenda");
  revalidatePath("/sitemap.xml");
  if (slug) revalidatePath(`/agenda/${slug}`);
}

function toMessage(error: unknown): string {
  if (error instanceof ApiRequestError) {
    if (error.status === 409) return "Slug itu sudah dipakai agenda lain. Ubah atau kosongkan.";
    return error.messages.join(" ");
  }

  if (error instanceof ApiUnreachableError) return error.message;

  return "Terjadi kesalahan yang tidak terduga.";
}

export async function saveAgendaAction(
  _prevState: AgendaFormState,
  formData: FormData,
): Promise<AgendaFormState> {
  const { token } = await requireSession();

  const id = String(formData.get("id") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim();
  const rawStart = String(formData.get("startDate") ?? "");
  const rawEnd = String(formData.get("endDate") ?? "");
  // Slug yang diketik tetap dirapikan; yang kosong dibiarkan kosong supaya
  // backend yang membuatnya, termasuk penomoran untuk judul yang berulang.
  const slug = slugify(String(formData.get("slug") ?? "").trim());

  const values = {
    title,
    slug,
    description,
    location,
    startDate: rawStart,
    endDate: rawEnd,
  };

  if (!title) return { error: "Judul kegiatan wajib diisi.", values };

  const startDate = fromDateTimeLocal(rawStart);
  if (!startDate) return { error: "Waktu mulai wajib diisi.", values };

  const endDate = rawEnd ? fromDateTimeLocal(rawEnd) : undefined;
  if (rawEnd && !endDate) return { error: "Waktu selesai tidak dikenali.", values };

  // Backend menerima rentang terbalik tanpa keberatan; halaman publik akan
  // menampilkannya sebagai kegiatan yang selesai sebelum dimulai.
  if (endDate && new Date(endDate) < new Date(startDate)) {
    return { error: "Waktu selesai berada sebelum waktu mulai.", values };
  }

  // Kolom yang dikosongkan dikirim `null`, bukan dihilangkan dari payload:
  // `PATCH` hanya menyentuh field yang dikirim, jadi menghilangkannya berarti
  // keterangan atau waktu selesai yang baru saja dihapus pengelola akan tetap
  // tersimpan. `slug` tetap dihilangkan saat kosong — di situ justru backend
  // yang harus membuatkannya.
  const payload: AgendaInput = {
    title,
    startDate,
    endDate: endDate ?? null,
    description: description || null,
    location: location || null,
    ...(slug ? { slug } : {}),
  };

  let saved;
  try {
    saved = id ? await updateAgenda(id, payload, token) : await createAgenda(payload, token);
  } catch (error) {
    if (error instanceof ApiRequestError && error.isUnauthorized) {
      redirect(SESSION_EXPIRED_PATH);
    }
    return { error: toMessage(error), values };
  }

  revalidateAgenda(saved.slug);
  redirect(`/admin/agenda?pesan=${id ? "diperbarui" : "dibuat"}`);
}

export async function deleteAgendaAction(formData: FormData) {
  const { token } = await requireSession();

  const id = String(formData.get("id") ?? "");
  const slug = String(formData.get("slug") ?? "");

  if (!id) redirect("/admin/agenda");

  try {
    await deleteAgenda(id, token);
  } catch (error) {
    if (error instanceof ApiRequestError && error.isUnauthorized) {
      redirect(SESSION_EXPIRED_PATH);
    }
    throw error;
  }

  revalidateAgenda(slug);
  redirect("/admin/agenda?pesan=dihapus");
}
