import { NextResponse, type NextRequest } from "next/server";
import { ApiRequestError, ApiUnreachableError } from "@/lib/api";
import { ADMIN_HOME, LOGIN_PATH, sessionCookie } from "@/lib/session";
import { exchangeTicket } from "@/services/auth";

/**
 * Tempat pengelola mendarat setelah menyetujui di layar Google.
 *
 * Route Handler, bukan halaman: yang dilakukannya adalah **menyetel cookie**,
 * dan Server Component memang tidak boleh melakukan itu.
 *
 * Sekilas ini melanggar aturan "tidak ada satu pun `GET` yang menyentuh sesi"
 * — tetapi arahnya berlawanan dan itu yang menentukan. Rute keluar yang dulu
 * dihapus **mengakhiri** sesi, sehingga satu prefetch `<Link>` yang tak
 * disengaja cukup untuk melempar pengelola keluar. Rute ini **membuat** sesi,
 * dan hanya bisa berhasil bila membawa tiket sah yang baru saja diterbitkan
 * backend untuk peramban ini. Prefetch yang kebetulan menyentuhnya paling
 * jauh hanya menghanguskan satu tiket yang memang sekali pakai.
 *
 * Meski begitu: **jangan pernah memasang `<Link>` ke alamat ini.** Satu-satunya
 * yang boleh mengantar ke sini adalah pengalihan dari backend.
 */

/** Membawa tiket dari query string; tidak ada yang bisa dipranyatakan. */
export const dynamic = "force-dynamic";

function backToLogin(request: NextRequest, reason: string) {
  const url = new URL(LOGIN_PATH, request.url);
  url.searchParams.set("google", reason);
  return NextResponse.redirect(url);
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  // Pengelola menekan "Batal" di layar Google. Bukan galat, jadi tidak
  // ditampilkan sebagai galat.
  if (searchParams.get("error")) return backToLogin(request, "dibatalkan");

  const ticket = searchParams.get("ticket");
  if (!ticket) return backToLogin(request, "tanpa-tiket");

  let login;
  try {
    login = await exchangeTicket(ticket);
  } catch (error) {
    if (error instanceof ApiRequestError) {
      // 401 berarti tiketnya kedaluwarsa atau sudah pernah ditukar — dua-duanya
      // dijawab dengan menyuruh mengulang dari awal, bukan mencoba lagi.
      return backToLogin(request, error.status === 401 ? "tiket-hangus" : "gagal");
    }
    if (error instanceof ApiUnreachableError) return backToLogin(request, "server-mati");
    return backToLogin(request, "gagal");
  }

  const response = NextResponse.redirect(new URL(ADMIN_HOME, request.url));

  // Dipasang langsung pada respons, bukan lewat `cookies()`: yang dikembalikan
  // di sini pengalihan yang dibuat sendiri, dan menempelkan cookie padanya
  // tidak menyisakan pertanyaan tentang kapan Next.js menggabungkannya.
  const { name, value, options } = sessionCookie(login);
  response.cookies.set(name, value, options);

  return response;
}
