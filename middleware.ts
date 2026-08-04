import { NextResponse, type NextRequest } from "next/server";

/**
 * Penjaga dashboard.
 *
 * Yang diperiksa hanya **ada atau tidaknya** cookie sesi, bukan keabsahan
 * tokennya: middleware berjalan di Edge Runtime untuk setiap permintaan, dan
 * memverifikasi tanda tangan JWT di sana berarti menambah pekerjaan pada jalur
 * terpanas hanya untuk mengulang apa yang sudah dilakukan backend. Token palsu
 * atau kedaluwarsa tetap ditolak `401` oleh backend saat halaman mengambil
 * data, lalu halaman itu mengarahkan ke `/admin/keluar`.
 *
 * Gunanya di sini adalah pengalaman pengguna: pengunjung yang belum masuk
 * langsung dibawa ke form login beserta alamat tujuannya, bukan menunggu
 * halaman dashboard dirender lebih dulu.
 */
const COOKIE_NAME = "kd_admin";

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const hasSession = Boolean(request.cookies.get(COOKIE_NAME));

  if (!hasSession) {
    const login = new URL("/admin/login", request.url);
    // Tujuan semula dibawa serta supaya setelah masuk pengguna kembali ke
    // halaman yang tadi diketuk, bukan selalu ke ringkasan.
    login.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(login);
  }

  return NextResponse.next();
}

export const config = {
  /**
   * Hanya isi dashboard. `/admin/login` dan `/admin/keluar` sengaja di luar
   * cakupan — yang pertama harus bisa dibuka tanpa sesi, dan yang kedua justru
   * bertugas menghapus sesi.
   */
  matcher: ["/admin", "/admin/((?!login|keluar).*)"],
};
