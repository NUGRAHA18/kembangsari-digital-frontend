import type { MetadataRoute } from "next";
import { getSettingsMap } from "@/services/settings";

/**
 * Keterangan yang membuat portal ini bisa dipasang di layar utama ponsel.
 *
 * Dilayani Next.js di `/manifest.webmanifest`. Namanya diambil dari Pengaturan
 * supaya sama dengan yang tampil di navbar dan hasil pencarian — bukan nama
 * kedua yang harus diubah di tempat lain.
 */
export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const settings = await getSettingsMap();
  const siteName = settings.site_name ?? "Kembangsari Digital";

  return {
    name: `${siteName} — Portal Informasi Padukuhan`,
    // Yang tampil di bawah ikon pada layar utama. Panjang lebih dari sekitar
    // dua belas huruf dipotong ponsel, jadi nama pendeknya ditulis tersendiri.
    short_name: "Kembangsari",
    description: settings.site_description,
    start_url: "/",
    // Dipakai saat aplikasi dibuka dari layar utama: tanpa bilah alamat, tetapi
    // masih menyisakan bilah status ponsel.
    display: "standalone",
    orientation: "portrait",
    lang: "id",
    dir: "ltr",
    // Warna latar layar pembuka sebelum halaman pertama selesai dimuat.
    // Dipatok terang mengikuti token `background` mode terang: layar pembuka
    // hanya boleh satu warna dan tidak bisa mengikuti tema ponsel.
    background_color: "#F8FAFC",
    theme_color: "#15803D",
    categories: ["news", "government"],
    icons: [
      { src: "/ikon/192", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/ikon/512", sizes: "512x512", type: "image/png", purpose: "any" },
      // Dideklarasikan terpisah, bukan digabung sebagai "any maskable":
      // sebagian peluncur Android memperlakukan ikon bergabungan itu sebagai
      // maskable di semua tempat, termasuk yang tidak memotongnya sama sekali.
      { src: "/ikon/512", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
