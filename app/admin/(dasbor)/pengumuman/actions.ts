"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ApiRequestError, ApiUnreachableError } from "@/lib/api";
import { requireSession } from "@/lib/session";
import {
  createAnnouncement,
  deleteAnnouncement,
  updateAnnouncement,
  type AnnouncementInput,
} from "@/services/announcement";

export interface AnnouncementFormState {
  error?: string;
  values?: Partial<AnnouncementInput>;
}

/** Pengumuman aktif tampil di beranda dan di halamannya sendiri. */
function revalidateAnnouncements() {
  revalidatePath("/");
  revalidatePath("/pengumuman");
}

function toMessage(error: unknown): string {
  if (error instanceof ApiRequestError) return error.messages.join(" ");
  if (error instanceof ApiUnreachableError) return error.message;
  return "Terjadi kesalahan yang tidak terduga.";
}

export async function saveAnnouncementAction(
  _prevState: AnnouncementFormState,
  formData: FormData,
): Promise<AnnouncementFormState> {
  const { token } = await requireSession();

  const id = String(formData.get("id") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const isActive = formData.get("isActive") === "on";

  const values = { title, content, isActive };

  if (!title || !content) {
    return { error: "Judul dan isi pengumuman wajib diisi.", values };
  }

  try {
    if (id) {
      await updateAnnouncement(id, values, token);
    } else {
      await createAnnouncement(values, token);
    }
  } catch (error) {
    if (error instanceof ApiRequestError && error.isUnauthorized) {
      redirect("/admin/keluar?sesi=habis");
    }
    return { error: toMessage(error), values };
  }

  revalidateAnnouncements();
  redirect(`/admin/pengumuman?pesan=${id ? "diperbarui" : "dibuat"}`);
}

export async function deleteAnnouncementAction(formData: FormData) {
  const { token } = await requireSession();

  const id = String(formData.get("id") ?? "");
  if (!id) redirect("/admin/pengumuman");

  try {
    await deleteAnnouncement(id, token);
  } catch (error) {
    if (error instanceof ApiRequestError && error.isUnauthorized) {
      redirect("/admin/keluar?sesi=habis");
    }
    throw error;
  }

  revalidateAnnouncements();
  redirect("/admin/pengumuman?pesan=dihapus");
}
