"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

/**
 * Penampung galat untuk seluruh halaman.
 *
 * Penyebab paling sering di lingkungan pengembangan adalah backend yang belum
 * dijalankan — itu bukan kerusakan frontend, jadi pesannya menyebutkan
 * kemungkinan tersebut alih-alih hanya menulis "terjadi kesalahan".
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Container className="flex flex-col items-center py-20 text-center md:py-28">
      <AlertTriangle className="size-10 text-error" aria-hidden="true" />
      <h1 className="mt-4 text-[1.75rem] font-bold tracking-tight lg:text-4xl">
        Halaman gagal dimuat
      </h1>
      <p className="mt-3 max-w-prose text-muted text-pretty">
        {error.message ||
          "Terjadi kesalahan saat mengambil data. Silakan coba beberapa saat lagi."}
      </p>
      <p className="mt-2 max-w-prose text-sm text-muted">
        Kalau ini terjadi saat pengembangan, pastikan server backend sedang berjalan di port 3000.
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button onClick={reset}>Coba Lagi</Button>
        <ButtonLink href="/" variant="outline">
          Kembali ke Beranda
        </ButtonLink>
      </div>
    </Container>
  );
}
