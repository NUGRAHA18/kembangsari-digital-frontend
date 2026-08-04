import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Leaf } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Card, CardBody } from "@/components/ui/card";
import { LoginForm } from "@/features/admin/login-form";
import { readParam, type RawSearchParams } from "@/lib/page-params";
import { ADMIN_HOME, getSession } from "@/lib/session";

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

        <Card className="mt-6">
          <CardBody>
            <LoginForm next={next} />
          </CardBody>
        </Card>

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
