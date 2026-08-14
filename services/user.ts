import { del, getOne, getPaginated, patch, post } from "@/lib/api";
import type { CreateUserRequest, UpdateUserRequest, User, UserListQuery } from "@/types/api";

/**
 * Pengelola portal.
 *
 * Seluruh endpoint di berkas ini **menuntut peran ADMIN**, bukan sekadar token
 * yang sah — EDITOR dijawab `403`. Tidak ada versi publiknya, dan memang tidak
 * boleh ada: daftar email di tabel inilah satu-satunya yang menentukan siapa
 * yang boleh masuk lewat akun Google.
 *
 * Tidak ada `revalidate` di sini, sepola dengan seluruh permintaan bertoken:
 * daftar pengelola tidak boleh masuk cache Next.js yang bisa tersaji ke
 * pemanggil lain.
 */
export function getUsers(query: UserListQuery, token: string) {
  return getPaginated<User>("/user", query, { token });
}

export function getUserById(id: string, token: string) {
  return getOne<User>(`/user/${id}`, { token });
}

/**
 * `role` wajib dan tidak punya nilai bawaan — backend menolak permintaan
 * tanpanya. Itu disengaja: nilai bawaan apa pun akan salah untuk sebagian
 * kasus, dan yang paling berbahaya adalah seseorang menjadi ADMIN karena satu
 * kolom terlewat di formulir.
 *
 * `password` boleh dikosongkan. Akun tanpa kata sandi hanya bisa masuk lewat
 * "Masuk dengan Google" memakai email yang sama; yang tersimpan adalah hash
 * dari nilai acak yang langsung dibuang, jadi tidak ada seorang pun yang tahu
 * kata sandinya — termasuk yang membuat akunnya.
 *
 * **Email dikembalikan dalam huruf kecil**, apa pun yang diketik. Yang
 * ditampilkan setelah menyimpan harus yang dari respons, bukan dari formulir.
 */
export function createUser(body: CreateUserRequest, token: string) {
  return post<User>("/user", body, { token });
}

/**
 * `email` tidak ada di badan permintaan dan tidak akan pernah ada: email adalah
 * satu-satunya penghubung ke akun Google, jadi mengubahnya sama dengan
 * memindahkan seluruh akses sebuah akun ke alamat lain dalam satu permintaan.
 * Alamat yang salah dibereskan dengan menghapus lalu membuat baru.
 */
export function updateUser(id: string, body: UpdateUserRequest, token: string) {
  return patch<User>(`/user/${id}`, body, { token });
}

export function deleteUser(id: string, token: string) {
  return del<User>(`/user/${id}`, { token });
}
