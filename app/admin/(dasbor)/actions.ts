"use server";

import { redirect } from "next/navigation";
import { destroySession, LOGIN_PATH } from "@/lib/session";

/**
 * Keluar dari dashboard atas kemauan sendiri.
 *
 * Server Action, bukan tautan ke sebuah rute keluar — dan bedanya bukan soal
 * selera. Di production Next.js **mem-prefetch setiap `<Link>` begitu masuk
 * viewport**, dan tombol keluar ada di bilah atas setiap halaman dashboard.
 * Sebuah `<Link href="/admin/keluar">` membuat prefetch itu benar-benar
 * memanggil rute keluarnya: pengelola mendarat di dashboard, bilah atas
 * dirender, sesinya langsung terhapus tanpa ada yang mengklik apa pun — lalu
 * menu mana pun yang diketuk berikutnya meminta login lagi.
 *
 * Tidak pernah terlihat saat `npm run dev` karena prefetch otomatis memang
 * tidak berjalan di sana. Butuh production untuk muncul, dan tampak seperti
 * cookie yang tidak tersimpan padahal cookie-nya tidak pernah bermasalah.
 *
 * `POST` kebal terhadap ini: prefetch selalu `GET`, dan `<img src="…">` di
 * situs lain juga tidak bisa memicunya. Formnya tetap terkirim tanpa
 * JavaScript, sama seperti seluruh form lain di dashboard.
 *
 * Jalur satunya — sesi yang mati sendiri karena tokennya kedaluwarsa — tidak
 * lewat sini: Server Component tidak boleh menghapus cookie, jadi ia hanya
 * mengarahkan ke `SESSION_EXPIRED_PATH` dan `proxy.ts` yang membuang
 * cookie-nya di sana.
 */
export async function logoutAction() {
  await destroySession();
  redirect(LOGIN_PATH);
}
