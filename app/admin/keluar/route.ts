import { NextResponse } from "next/server";
import { destroySession, LOGIN_PATH } from "@/lib/session";

/**
 * Menghapus cookie sesi lalu kembali ke halaman masuk.
 *
 * Dibuat sebagai Route Handler, bukan Server Action, karena dipakai dua pihak:
 * tombol "Keluar" di dashboard, dan halaman mana pun yang menerima `401` dari
 * backend karena tokennya kedaluwarsa — Server Component tidak boleh menghapus
 * cookie, jadi ia mengarahkan ke sini.
 *
 * Konsekuensinya tautan ini bisa dipicu dari luar (mis. lewat `<img>` di situs
 * lain) dan memaksa pengguna keluar. Itu hanya mengakhiri sesi, tidak mengubah
 * atau membocorkan data apa pun, dan sebagai gantinya tombol keluar tetap
 * bekerja tanpa JavaScript.
 */
export async function GET(request: Request) {
  await destroySession();

  const expired = new URL(request.url).searchParams.get("sesi") === "habis";
  const target = new URL(expired ? `${LOGIN_PATH}?sesi=habis` : LOGIN_PATH, request.url);

  return NextResponse.redirect(target);
}
