import { ImageResponse } from "next/og";

/**
 * Ikon aplikasi untuk `manifest.webmanifest`.
 *
 * Dibangkitkan, bukan disimpan sebagai berkas PNG, dengan alasan yang sama
 * seperti `app/icon.tsx`: tidak ada gambar yang perlu dipelihara dan warnanya
 * mengikuti token `primary`. Ukurannya dibatasi pada dua yang diminta kriteria
 * pemasangan Chrome — 192 dan 512.
 *
 * `generateStaticParams` membuat keduanya ikut dirender saat build, jadi yang
 * dilayani ke ponsel warga adalah berkas statis, bukan hasil render per
 * permintaan. `dynamicParams = false` menutup ukuran lain dengan 404.
 */
export const dynamicParams = false;

const SIZES = [192, 512];

export function generateStaticParams() {
  return SIZES.map((size) => ({ ukuran: String(size) }));
}

export async function GET(_request: Request, { params }: { params: Promise<{ ukuran: string }> }) {
  const { ukuran } = await params;
  const size = Number(ukuran);

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        // Latar hijau menutup seluruh bidang, tanpa sudut membulat: ikon ini
        // dideklarasikan `maskable`, dan bentuk akhirnya dipotong sendiri
        // oleh peluncur ponsel — lingkaran, kotak membulat, atau tetesan air.
        // Sudut yang digambar di sini justru akan terpotong dua kali.
        background: "#15803D",
        color: "white",
        // Monogram sengaja hanya sepertiga bidang. Area aman sebuah ikon
        // maskable adalah 80% bagian tengahnya; yang di luar itu bisa hilang.
        fontSize: size * 0.34,
        fontWeight: 700,
        letterSpacing: -size * 0.015,
      }}
    >
      KD
    </div>,
    { width: size, height: size },
  );
}
