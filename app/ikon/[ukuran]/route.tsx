import { ImageResponse } from "next/og";

/**
 * Seluruh ikon monogram yang dibangkitkan portal ini, dalam satu rute.
 *
 * Dibangkitkan, bukan disimpan sebagai berkas PNG: tidak ada gambar yang perlu
 * dipelihara dan warnanya mengikuti token `primary`.
 *
 * 32 dulu ditangani `app/icon.tsx` dan 180 oleh `app/apple-icon.tsx`. Kedua
 * berkas itu dihapus karena resolver metadata Next.js **membuang seluruh ikon
 * konvensi-berkas begitu `metadata.icons` disetel** (lihat
 * `leafSegmentStaticIcons` di `resolve-metadata.js`) — dan `metadata.icons`
 * harus disetel, karena hanya dari sana favicon pilihan pengelola bisa masuk.
 * Membiarkan `apple-icon.tsx` di tempatnya berarti tautannya hilang diam-diam.
 * Sekarang keduanya dideklarasikan bersama di `app/layout.tsx`.
 *
 * `generateStaticParams` membuat keempatnya ikut dirender saat build, jadi yang
 * dilayani ke ponsel warga adalah berkas statis, bukan hasil render per
 * permintaan. `dynamicParams = false` menutup ukuran lain dengan 404.
 */
export const dynamicParams = false;

/**
 * Ukuran bukan sekadar perbesaran satu gambar yang sama: yang memotong ikon
 * berbeda-beda, jadi sudut dan besar monogramnya ikut berbeda.
 *
 * - `32` ikon tab peramban — tidak dipotong siapa pun, jadi sudutnya
 *   dibulatkan sendiri seperti komponen lain di portal, dan monogramnya dibuat
 *   sebesar mungkin karena pada 32px huruf kecil tidak terbaca sama sekali.
 * - `180` ikon layar utama iOS — Safari sendiri yang membulatkan sudutnya.
 * - `192`/`512` ikon `manifest.webmanifest`, dideklarasikan `maskable`:
 *   bentuk akhirnya dipotong peluncur Android jadi lingkaran, kotak membulat,
 *   atau tetesan air. Sudut yang digambar di sini akan terpotong dua kali, dan
 *   monogramnya ditahan di sepertiga bidang karena area aman sebuah ikon
 *   maskable hanya 80% bagian tengahnya.
 */
const ICONS: Record<number, { radius: number; monogram: number }> = {
  32: { radius: 0.22, monogram: 0.47 },
  180: { radius: 0, monogram: 0.41 },
  192: { radius: 0, monogram: 0.34 },
  512: { radius: 0, monogram: 0.34 },
};

export function generateStaticParams() {
  return Object.keys(ICONS).map((size) => ({ ukuran: size }));
}

export async function GET(_request: Request, { params }: { params: Promise<{ ukuran: string }> }) {
  const { ukuran } = await params;
  const size = Number(ukuran);
  const { radius, monogram } = ICONS[size];

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#15803D",
        color: "white",
        borderRadius: size * radius,
        fontSize: size * monogram,
        fontWeight: 700,
        letterSpacing: -size * 0.015,
      }}
    >
      KD
    </div>,
    { width: size, height: size },
  );
}
