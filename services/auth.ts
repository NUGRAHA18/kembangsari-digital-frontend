import { post } from "@/lib/api";
import type { LoginRequest, LoginResponse } from "@/types/api";

/**
 * Satu-satunya endpoint auth yang tersedia: tidak ada `/auth/me`, jadi identitas
 * pengguna disimpan bersama token saat masuk, bukan diambil ulang tiap halaman.
 *
 * Backend membatasi endpoint ini **5 permintaan per menit per IP**; percobaan
 * berikutnya dijawab `429`, bukan `401`.
 */
export function login(body: LoginRequest) {
  return post<LoginResponse>("/auth/login", body);
}
