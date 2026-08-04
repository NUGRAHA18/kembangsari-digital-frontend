import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { LoginResponse, User } from "@/types/api";

/**
 * Sesi admin.
 *
 * Token disimpan di cookie `httpOnly`, bukan `localStorage`: dengan begitu ia
 * tidak pernah tersentuh JavaScript di browser, dan halaman dashboard tetap
 * bisa berupa Server Component yang mengambil data langsung dari server —
 * tanpa perlu memindahkan seluruh dashboard menjadi Client Component.
 *
 * Cookie-nya diset oleh Next.js sendiri, bukan oleh backend, sehingga tidak ada
 * satu pun perubahan yang perlu diminta ke repo backend.
 *
 * Seluruh berkas ini hanya boleh dipanggil dari kode server (`next/headers`
 * memang gagal di klien) — jangan mengimpornya dari Client Component.
 */

const COOKIE_NAME = "kd_admin";

/** Sama dengan `JWT_EXPIRES_IN=7d` di backend: cookie tidak boleh hidup lebih lama daripada tokennya. */
const MAX_AGE_SECONDS = 7 * 24 * 60 * 60;

export interface Session {
  token: string;
  user: User;
}

/** Halaman login memakainya sebagai tujuan setelah berhasil masuk. */
export const ADMIN_HOME = "/admin";
export const LOGIN_PATH = "/admin/login";

export async function createSession(login: LoginResponse) {
  const store = await cookies();

  store.set(COOKIE_NAME, JSON.stringify({ token: login.accessToken, user: login.user }), {
    httpOnly: true,
    sameSite: "lax",
    // Di pengembangan situsnya diakses lewat http://localhost, dan cookie
    // `secure` tidak akan pernah terkirim di sana.
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function destroySession() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

/** `null` kalau belum masuk atau isi cookie-nya rusak. */
export async function getSession(): Promise<Session | null> {
  const raw = (await cookies()).get(COOKIE_NAME)?.value;
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Session;
    return parsed.token && parsed.user ? parsed : null;
  } catch {
    // Cookie yang tidak bisa dibaca diperlakukan sama seperti belum masuk.
    return null;
  }
}

/**
 * Dipakai setiap halaman dashboard. Middleware sudah menyaring pengunjung tanpa
 * cookie sebelum sampai ke sini, tetapi pemeriksaan ini tetap ada supaya
 * halaman tidak pernah bergantung pada middleware saja — misalnya kalau
 * `matcher`-nya suatu saat diubah.
 */
export async function requireSession(): Promise<Session> {
  const session = await getSession();
  if (!session) redirect(LOGIN_PATH);
  return session;
}
