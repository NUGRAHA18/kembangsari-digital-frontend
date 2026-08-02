import { ImageResponse } from "next/og";

/**
 * Ikon tab peramban. Dihasilkan saat build supaya tidak ada berkas gambar yang
 * perlu dipelihara, dan warnanya mengikuti token `primary` (#15803D).
 *
 * Menggantikan favicon bawaan create-next-app — logo Next.js di tab peramban
 * membuat situs terlihat belum selesai.
 */
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#15803D",
          color: "white",
          fontSize: 15,
          fontWeight: 700,
          letterSpacing: -0.5,
          borderRadius: 7,
        }}
      >
        KD
      </div>
    ),
    size,
  );
}
