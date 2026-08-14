"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isRole } from "@/features/admin/roles";
import { ApiRequestError, ApiUnreachableError } from "@/lib/api";
import { requireAdmin, SESSION_EXPIRED_PATH } from "@/lib/session";
import { createUser, deleteUser, updateUser } from "@/services/user";
import type { UpdateUserRequest } from "@/types/api";

export interface UserFormState {
  error?: string;
  /** Ditempelkan di kolom email — bukan di alert atas, supaya jelas apa yang bentrok. */
  emailError?: string;
  values?: { email?: string; name?: string; role?: string; googleOnly?: boolean };
}

const PASSWORD_MIN = 8;

function toMessage(error: unknown): string {
  // Empat penolakan yang disengaja backend (ubah peran sendiri, hapus diri
  // sendiri, ADMIN terakhir, masih penulis berita) datang sebagai `400` dengan
  // satu kalimat yang sudah layak dibaca pengelola. Diteruskan apa adanya —
  // menerjemahkannya ulang di sini hanya akan membuat dua sumber kebenaran.
  if (error instanceof ApiRequestError) return error.messages.join(" ");
  if (error instanceof ApiUnreachableError) return error.message;
  return "Terjadi kesalahan yang tidak terduga.";
}

function redirectIfExpired(error: unknown) {
  if (error instanceof ApiRequestError && error.isUnauthorized) {
    redirect(SESSION_EXPIRED_PATH);
  }
}

function revalidateUsers() {
  revalidatePath("/admin/pengelola");
}

/**
 * Menambah dan mengubah pengelola.
 *
 * `role` tidak punya nilai bawaan di mana pun — tidak di form, tidak di sini.
 * Backend menolak `POST` tanpanya, dan alasan yang sama berlaku di frontend:
 * yang paling berbahaya adalah seseorang menjadi ADMIN karena satu kolom
 * terlewat.
 */
export async function saveUserAction(
  _prevState: UserFormState,
  formData: FormData,
): Promise<UserFormState> {
  const { token } = await requireAdmin();

  const read = (key: string) => String(formData.get(key) ?? "").trim();

  const id = read("id");
  const isEdit = Boolean(id);

  const email = read("email");
  const name = read("name");
  const role = read("role");
  const password = String(formData.get("password") ?? "");
  const googleOnly = formData.get("googleOnly") === "on";

  const values = { email, name, role, googleOnly };

  if (name.length < 2) return { error: "Nama pengelola minimal 2 huruf.", values };
  if (!isEdit && !email) return { error: "Email wajib diisi.", values };
  if (!role) return { error: "Pilih peran pengelola ini lebih dulu.", values };
  if (!isRole(role)) return { error: "Peran yang dipilih tidak dikenali.", values };

  // Tanpa JavaScript, kolom kata sandi tetap terlihat walau centang "Google
  // saja" menyala — jadi kombinasi ini bisa benar-benar terkirim. Ditolak
  // dengan kalimat yang menyebut jalan keluarnya, bukan diabaikan diam-diam:
  // pengelola yang sudah mengetik kata sandi berhak tahu ia tidak terpakai.
  if (!isEdit && googleOnly && password) {
    return {
      error: "Lepas centang “Cukup masuk lewat akun Google” kalau ingin menyetel kata sandi.",
      values,
    };
  }

  const wantsPassword = isEdit ? password.length > 0 : !googleOnly;
  if (wantsPassword && password.length < PASSWORD_MIN) {
    return { error: `Kata sandi minimal ${PASSWORD_MIN} karakter.`, values };
  }

  try {
    if (isEdit) {
      // `PATCH` hanya menyentuh field yang dikirim. Kata sandi yang dikosongkan
      // berarti "biarkan seperti semula", BUKAN "kosongkan" — karena itu ia
      // tidak ikut dikirim sebagai `null` seperti field opsional di modul lain.
      const body: UpdateUserRequest = { name, role };
      if (password) body.password = password;
      await updateUser(id, body, token);
    } else {
      await createUser(
        { email, name, role, ...(googleOnly ? {} : { password }) },
        token,
      );
    }
  } catch (error) {
    redirectIfExpired(error);

    // Email bentrok ditempelkan di kolomnya, bukan di alert atas: yang perlu
    // diubah pengelola persis kolom itu.
    if (error instanceof ApiRequestError && error.status === 409) {
      return { emailError: `${error.messages.join(" ")}`, values };
    }

    return { error: toMessage(error), values };
  }

  revalidateUsers();
  redirect(`/admin/pengelola?pesan=${isEdit ? "diperbarui" : "dibuat"}`);
}

export async function deleteUserAction(formData: FormData) {
  const { token } = await requireAdmin();

  const id = String(formData.get("id") ?? "");
  if (!id) redirect("/admin/pengelola");

  // `redirect()` bekerja dengan melempar, jadi ia wajib berada di luar `try` —
  // kalau tidak, ia tertangkap `catch`-nya sendiri.
  let gagal: string | null = null;
  try {
    await deleteUser(id, token);
  } catch (error) {
    redirectIfExpired(error);
    gagal = toMessage(error);
  }

  if (gagal) {
    // Penolakan yang disengaja backend (ADMIN terakhir, masih penulis berita)
    // dibawa kembali ke halaman daftar lewat alamatnya — halaman konfirmasi
    // hapus tidak punya state sendiri.
    redirect(`/admin/pengelola?galat=${encodeURIComponent(gagal)}`);
  }

  revalidateUsers();
  redirect("/admin/pengelola?pesan=dihapus");
}
