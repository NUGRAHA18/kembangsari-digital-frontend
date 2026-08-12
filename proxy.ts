import { NextResponse, type NextRequest } from "next/server";

/**
 * Penjaga dashboard, sekaligus **satu-satunya tempat cookie sesi basi dibuang**.
 *
 * ## Penjagaan
 *
 * Berkas ini bernama `proxy.ts`, bukan `middleware.ts`: sejak Next.js 16
 * konvensi lamanya sudah usang dan `next dev` memperingatkannya setiap kali
 * dijalankan. Isinya sama persis — yang berubah hanya nama berkas dan nama
 * fungsi yang diekspor.
 *
 * Yang diperiksa hanya **ada atau tidaknya** cookie sesi, bukan keabsahan
 * tokennya: ia berjalan untuk setiap permintaan, dan memverifikasi
 * tanda tangan JWT di sini berarti menambah pekerjaan pada jalur terpanas hanya
 * untuk mengulang apa yang sudah dilakukan backend. Token palsu atau
 * kedaluwarsa tetap ditolak `401` oleh backend saat halaman mengambil data.
 *
 * Gunanya adalah pengalaman pengguna: pengunjung yang belum masuk langsung
 * dibawa ke form login beserta alamat tujuannya, bukan menunggu halaman
 * dashboard dirender lebih dulu.
 *
 * ## Pembuangan cookie basi
 *
 * Halaman yang menerima `401` mengarahkan ke `/admin/login?sesi=habis`
 * (`SESSION_EXPIRED_PATH`), dan cookie basinya dibuang **di sini**, saat
 * halaman masuk itu dilayani.
 *
 * Sebelumnya tugas itu dipegang Route Handler `/admin/keluar`, dan itu salah
 * secara mendasar: sebuah `GET` yang mengakhiri sesi bisa terpanggil tanpa
 * seorang pun mengkliknya. Prefetch `<Link>` milik Next.js pernah benar-benar
 * melakukannya di production — tombol "Keluar" ada di bilah atas setiap halaman
 * dashboard, prefetch-nya memanggil rute itu begitu bilahnya dirender, dan
 * setiap menu yang diketuk berikutnya meminta login lagi.
 *
 * Menyaring prefetch lewat header tidak bisa menutup lubangnya:
 *
 *  - dari tiga strategi prefetch Next.js 16, hanya satu yang mengirim
 *    `Next-Router-Prefetch: 1` — satu mengirim `2`, satu lagi tidak mengirim
 *    header itu sama sekali;
 *  - dan yang menentukan, `redirect()` dari Server Component pada navigasi
 *    lunak dikirim sebagai penanda `NEXT_REDIRECT` di dalam muatan RSC, lalu
 *    **router klien yang meminta alamat tujuannya** — dengan `RSC: 1` dan tanpa
 *    header prefetch. Jadi jalur `401` yang sah tiba dalam bentuk yang persis
 *    sama dengan prefetch `FetchStrategy.Full`, dan tidak ada header yang bisa
 *    memisahkan keduanya.
 *
 * Di sini masalahnya tidak ada: yang membuang cookie bukan sebuah alamat
 * tersendiri, melainkan halaman masuk itu sendiri — halaman yang memang sedang
 * dituju pengguna, dan yang tidak punya apa pun untuk dirusak.
 *
 * Keluar atas kemauan sendiri tetap lewat Server Action `logoutAction`
 * (`app/admin/(dasbor)/actions.ts`), yang menghapus cookie-nya langsung.
 */
const COOKIE_NAME = "kd_admin";
const LOGIN_PATH = "/admin/login";

export function proxy(request: NextRequest) {
  const { pathname, search, searchParams } = request.nextUrl;

  // Halaman masuk **beserta jalur di bawahnya** harus bisa dibuka tanpa sesi.
  // Yang di bawahnya itu `/admin/login/google`, tempat pengelola mendarat
  // sepulang dari layar persetujuan Google — belum punya cookie apa pun, dan
  // memang itulah yang sedang ia usahakan. Tanpa pengecualian ini penjagaan di
  // bawah memantulkannya kembali ke form masuk beserta `?next=`, dan tiketnya
  // hangus tanpa pernah ditukar.
  if (pathname === LOGIN_PATH || pathname.startsWith(`${LOGIN_PATH}/`)) {
    if (searchParams.get("sesi") !== "habis") return NextResponse.next();

    // Dibuang dua kali, dan keduanya perlu:
    //  1. dari permintaan yang diteruskan, supaya halaman masuk tidak melihat
    //     sesi yang sudah mati lalu memantulkan pengguna kembali ke dashboard
    //     — yang akan menerima `401` lagi dan memantulkannya ke sini lagi;
    //  2. dari browser, supaya cookie itu tidak ikut di permintaan berikutnya.
    request.cookies.delete(COOKIE_NAME);
    const response = NextResponse.next({ request: { headers: request.headers } });
    response.cookies.delete({ name: COOKIE_NAME, path: "/" });
    return response;
  }

  if (!request.cookies.has(COOKIE_NAME)) {
    const login = new URL(LOGIN_PATH, request.url);
    // Tujuan semula dibawa serta supaya setelah masuk pengguna kembali ke
    // halaman yang tadi diketuk, bukan selalu ke ringkasan.
    login.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(login);
  }

  return NextResponse.next();
}

export const config = {
  /**
   * Seluruh dashboard **beserta halaman masuknya** — yang terakhir bukan untuk
   * dijaga, melainkan supaya cookie basi bisa dibuang di sana.
   */
  matcher: ["/admin", "/admin/:path*"],
};
