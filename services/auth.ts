import { post } from "@/lib/api";
import type {
  ExchangeTicketRequest,
  ExchangeTicketResponse,
  LoginRequest,
  LoginResponse,
} from "@/types/api";

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

/**
 * Langkah terakhir masuk dengan akun Google.
 *
 * Backend mengembalikan pengelola ke `<situs>/admin/login/google?ticket=…`,
 * dan tiket itu ditukar di sini menjadi token yang sesungguhnya. Yang lewat
 * URL — dan karenanya ikut tercatat di riwayat peramban, log server, dan
 * header `Referer` — hanya tiketnya: sekali pakai dan hangus dalam dua menit.
 * JWT-nya tidak pernah menyentuh alamat.
 *
 * Menukar tiket yang sama dua kali dijawab `401`. Itu perilaku yang benar,
 * bukan galat yang perlu dicoba ulang.
 *
 * Responsnya sama persis dengan `POST /auth/login` — kuncinya `accessToken`,
 * bukan `token` — sehingga penyimpan cookie yang sama bisa dipakai keduanya.
 */
export function exchangeTicket(ticket: string) {
  const body: ExchangeTicketRequest = { ticket };
  return post<ExchangeTicketResponse>("/auth/ticket", body);
}

/**
 * Alamat yang membuka layar persetujuan Google.
 *
 * Harus dibuka sebagai **navigasi biasa**, bukan `fetch`: jawabannya `302` ke
 * Google, dan `fetch` tidak bisa mengikutinya sambil membawa cookie `state`
 * yang mengikat alur itu ke peramban pengelola.
 *
 * `?redirect=` dikirim eksplisit supaya pengembangan di localhost kembali ke
 * localhost, bukan ke portal produksi. Backend memvalidasinya terhadap daftar
 * putih origin — alamat di luar daftar dijawab `400`, dan itu memang yang
 * diinginkan: tanpa penjagaan itu parameter ini menjadi open redirect yang
 * membawa tiket yang bisa ditukar menjadi token pengelola.
 */
export function googleSignInUrl(): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3001";
  const redirect = `${siteUrl}/admin/login/google`;

  return `${process.env.NEXT_PUBLIC_API_URL}/auth/google?redirect=${encodeURIComponent(redirect)}`;
}
