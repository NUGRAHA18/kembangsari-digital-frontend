import type { Metadata } from "next";
import { WifiOff } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

/**
 * Halaman yang tersaji saat sambungan putus.
 *
 * Ditaruh di luar route group `(publik)` dengan sengaja: layout publik memanggil
 * `GET /settings` untuk mengisi navbar dan footer, dan permintaan itu justru
 * yang tidak mungkin berhasil pada saat halaman ini dibutuhkan. Halaman ini
 * harus bisa berdiri sepenuhnya dari cache, tanpa satu pun permintaan jaringan.
 */
export const metadata: Metadata = {
  title: "Tidak ada sambungan",
  robots: { index: false, follow: false },
};

export default function OfflinePage() {
  return (
    <Container className="flex min-h-dvh flex-col items-center justify-center py-12 text-center">
      <WifiOff className="size-12 text-muted" aria-hidden="true" />

      <h1 className="mt-6 text-2xl font-semibold text-balance">Tidak ada sambungan internet</h1>

      <p className="mt-3 max-w-prose text-muted text-pretty">
        Halaman ini belum sempat dimuat dan ponsel Anda sedang tidak terhubung. Periksa sinyal atau
        sambungan Wi-Fi, lalu coba lagi.
      </p>

      {/* Tanpa JavaScript pun tautan ini bekerja: begitu sambungan kembali,
          membuka beranda cukup untuk keluar dari halaman ini. */}
      <ButtonLink href="/" className="mt-8">
        Coba buka beranda
      </ButtonLink>
    </Container>
  );
}
