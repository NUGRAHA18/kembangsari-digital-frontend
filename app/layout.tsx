import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { getSettingsMap } from "@/services/settings";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

/** Dipakai untuk membentuk URL absolut pada tag Open Graph dan sitemap. */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3001";

/**
 * Mewarnai bilah status ponsel — terutama ketika portal dibuka dari layar
 * utama sebagai aplikasi, di mana bilah itu satu-satunya kerangka yang tersisa.
 *
 * Dua nilai, bukan satu: hijau di atas latar terang punya kontras yang cukup,
 * sedangkan di mode gelap bilah status yang tetap hijau terang tampak seperti
 * potongan yang tertinggal dari tema lain.
 */
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#15803D" },
    { media: "(prefers-color-scheme: dark)", color: "#020617" },
  ],
};

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettingsMap();
  const siteName = settings.site_name ?? "Kembangsari Digital";

  return {
    metadataBase: new URL(SITE_URL),
    // Ikon tab peramban mengikuti `site_favicon` di Pengaturan, dan jatuh ke
    // monogram yang dibangkitkan kalau pengelola belum mengunggahnya.
    //
    // Dideklarasikan di sini, bukan lewat `app/icon.tsx`, karena konvensi
    // berkas itu selalu diselipkan **di depan** daftar `icons`: kedua ikon akan
    // sama-sama tercetak sebagai `<link rel="icon">` dan peramban bebas memilih
    // yang mana. Itu sebabnya favicon yang sudah diunggah tetap tidak tampak.
    //
    // `apple` ikut ditulis di sini meski isinya tidak berubah-ubah: begitu
    // `icons` disetel, Next.js membuang seluruh ikon konvensi-berkas — termasuk
    // `apple-icon.tsx` yang dulu berdiri sendiri. Tanpa baris ini, yang dipasang
    // di layar utama iPhone kembali jadi potongan tangkapan layar halaman.
    //
    // Ikon layar utama sengaja tetap monogram, tidak ikut `site_logo`: iOS dan
    // peluncur Android memotong sudutnya dan menaruhnya di atas latar hitam
    // kalau berlatar tembus pandang — logo yang bagus di navbar belum tentu
    // selamat di sana. `type` juga tidak disetel untuk berkas unggahan: yang
    // tersimpan bisa PNG, JPEG, atau SVG, dan menebaknya salah justru membuat
    // sebagian peramban melewatkan ikonnya.
    icons: {
      icon: settings.site_favicon
        ? [{ url: settings.site_favicon }]
        : [{ url: "/ikon/32", sizes: "32x32", type: "image/png" }],
      apple: [{ url: "/ikon/180", sizes: "180x180", type: "image/png" }],
    },
    title: {
      default: `${siteName} — Portal Informasi Padukuhan`,
      // Halaman lain cukup menyetel judulnya sendiri, nama situs ditambahkan otomatis.
      template: `%s — ${siteName}`,
    },
    description: settings.site_description,
    openGraph: {
      type: "website",
      locale: "id_ID",
      siteName,
      title: `${siteName} — Portal Informasi Padukuhan`,
      description: settings.site_description,
      images: settings.site_banner ? [{ url: settings.site_banner }] : undefined,
    },
    robots: { index: true, follow: true },
  };
}

/**
 * Root layout hanya menyiapkan dokumen: bahasa, font, tema, dan metadata.
 *
 * Navbar dan footer pindah ke `app/(publik)/layout.tsx` karena dashboard admin
 * di `/admin` memakai kerangka yang sama sekali berbeda — tidak boleh ada menu
 * warga dan alamat padukuhan di halaman kerja pengelola.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // suppressHydrationWarning diperlukan karena next-themes menulis class `dark`
    // ke <html> sebelum React sempat melakukan hydration.
    // data-scroll-behavior="smooth" memberi tahu Next.js 16 agar tetap melompat
    // instan saat pindah halaman, dan hanya menggulir halus untuk anchor.
    <html
      lang="id"
      dir="ltr"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
