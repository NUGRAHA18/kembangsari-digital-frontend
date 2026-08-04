"use server";

import { redirect } from "next/navigation";
import { ApiRequestError, ApiUnreachableError } from "@/lib/api";
import { ADMIN_HOME, createSession } from "@/lib/session";
import { login } from "@/services/auth";

export interface LoginFormState {
  error?: string;
  /** Dikembalikan agar kolom email tidak ikut terhapus saat kata sandinya salah. */
  email?: string;
}

/** Hanya menerima tujuan di dalam dashboard, supaya `?next=` tidak bisa dipakai mengarahkan ke situs lain. */
function safeRedirectTarget(value: FormDataEntryValue | null): string {
  const target = typeof value === "string" ? value : "";
  return target.startsWith("/admin") && !target.startsWith("//") ? target : ADMIN_HOME;
}

export async function loginAction(
  _prevState: LoginFormState,
  formData: FormData,
): Promise<LoginFormState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = safeRedirectTarget(formData.get("next"));

  if (!email || !password) {
    return { error: "Email dan kata sandi wajib diisi.", email };
  }

  try {
    const result = await login({ email, password });
    await createSession(result);
  } catch (error) {
    if (error instanceof ApiRequestError) {
      if (error.status === 401) return { error: "Email atau kata sandi salah.", email };
      // Backend membatasi login 5 kali per menit per IP.
      if (error.status === 429) {
        return {
          error: "Terlalu banyak percobaan masuk. Tunggu sekitar satu menit, lalu coba lagi.",
          email,
        };
      }
      return { error: error.message, email };
    }

    if (error instanceof ApiUnreachableError) return { error: error.message, email };

    return { error: "Terjadi kesalahan yang tidak terduga.", email };
  }

  // redirect() bekerja dengan melempar, jadi ia harus berada di luar try —
  // kalau tidak, blok catch di atas akan menelannya dan halaman tidak pindah.
  redirect(next);
}
