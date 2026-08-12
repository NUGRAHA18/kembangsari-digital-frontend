import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Leaf } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Card, CardBody } from "@/components/ui/card";
import { LoginForm } from "@/features/admin/login-form";
import { GoogleIcon } from "@/components/ui/social-icons";
import { readParam, type RawSearchParams } from "@/lib/page-params";
import { ADMIN_HOME, getSession } from "@/lib/session";
import { googleSignInUrl } from "@/services/auth";

/**
 * Sebab kembalinya pengelola dari alur Google tanpa membawa sesi.
 *
 * Semuanya berakhir di halaman ini karena halaman inilah yang memang sedang
 * dituju — dan satu-satunya hal yang masuk akal dilakukan berikutnya adalah
 * mencoba lagi, entah lewat Google atau lewat kata sandi.
 */
const GOOGLE_MESSAGES: Record<string, string> = {
  dibatalkan: "Masuk dengan Google dibatalkan. Silakan coba lagi bila mau.",
  "tiket-hangus":
    "Tautan masuknya sudah tidak berlaku — hanya bertahan dua menit dan sekali pakai. Silakan ulangi dari awal.",
  "tanpa-tiket": "Balasan dari Google tidak lengkap. Silakan ulangi dari awal.",
  "server-mati": "Tidak dapat terhubung ke server. Coba lagi beberapa saat lagi.",
  gagal:
    "Masuk dengan Google gagal. Kalau akun Google Anda belum terdaftar sebagai pengelola, gunakan email dan kata sandi.",
};

export const metadata: Metadata = {
  title: "Masuk Dashboard",
  // Halaman kerja pengelola tidak punya urusan dengan hasil pencarian.
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const params = await searchParams;

  // Yang sudah masuk tidak perlu melihat form ini lagi.
  if (await getSession()) redirect(ADMIN_HOME);

  const next = readParam(params, "next");
  const expired = readParam(params, "sesi") === "habis";
  const googleMessage = GOOGLE_MESSAGES[readParam(params, "google") ?? ""];

  return (
    <main className="flex min-h-dvh flex-col justify-center px-4 py-12">
      <div className="mx-auto w-full max-w-md">
        <div className="flex flex-col items-center text-center">
          <span className="flex size-12 items-center justify-center rounded-xl bg-primary text-white">
            <Leaf className="size-6" aria-hidden="true" />
          </span>
          <h1 className="mt-4 text-2xl font-bold tracking-tight">Dashboard Kembangsari</h1>
          <p className="mt-2 text-muted text-pretty">
            Masuk untuk mengelola isi portal informasi padukuhan.
          </p>
        </div>

        {expired ? (
          <Alert className="mt-6">Sesi Anda sudah berakhir. Silakan masuk kembali.</Alert>
        ) : null}

        {googleMessage ? (
          <Alert tone="error" className="mt-6">
            {googleMessage}
          </Alert>
        ) : null}

        <Card className="mt-6">
          <CardBody>
            {/* Tautan biasa, bukan tombol ber-JavaScript dan bukan `fetch`:
                jawabannya 302 ke Google, dan hanya navigasi sungguhan yang
                bisa mengikutinya sambil membawa cookie `state` yang mengikat
                alur ini ke peramban pengelola.

                `<a>`, bukan `<Link>`: alamatnya di luar aplikasi ini, dan
                prefetch Next.js tidak punya urusan dengan alur masuk. */}
            <a
              href={googleSignInUrl()}
              className="flex min-h-11 w-full items-center justify-center gap-3 rounded-xl border border-border bg-surface font-medium transition-colors hover:bg-surface-muted"
            >
              <GoogleIcon className="size-5" aria-hidden="true" />
              Masuk dengan Google
            </a>

            <div className="my-5 flex items-center gap-3 text-sm text-muted">
              <span className="h-px flex-1 bg-border" />
              atau pakai kata sandi
              <span className="h-px flex-1 bg-border" />
            </div>

            <LoginForm next={next} />
          </CardBody>
        </Card>

        <p className="mt-4 text-center text-sm text-muted text-pretty">
          Akun Google hanya bisa dipakai kalau emailnya sudah terdaftar sebagai pengelola.
          Mendaftarkannya tetap lewat tim backend.
        </p>

        <Link
          href="/"
          className="mx-auto mt-6 flex min-h-11 w-fit items-center gap-2 text-muted hover:text-accent"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Kembali ke portal warga
        </Link>
      </div>
    </main>
  );
}
