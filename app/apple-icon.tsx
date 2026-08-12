import { ImageResponse } from "next/og";

/**
 * Ikon layar utama untuk iOS.
 *
 * Safari tidak membaca `icons` di `manifest.webmanifest` saat sebuah situs
 * ditambahkan ke layar utama — yang dicarinya `apple-touch-icon`. Tanpa berkas
 * ini, yang dipasang di layar utama iPhone adalah potongan tangkapan layar
 * halamannya, dan hasilnya tidak terbaca sebagai ikon aplikasi.
 *
 * 180×180 adalah ukuran yang diminta iPhone beresolusi tinggi. Sudutnya
 * dibiarkan siku-siku karena iOS memotongnya sendiri.
 */
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
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
        fontSize: 74,
        fontWeight: 700,
        letterSpacing: -2,
      }}
    >
      KD
    </div>,
    size,
  );
}
