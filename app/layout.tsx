import type { Metadata } from "next";
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

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettingsMap();
  const siteName = settings.site_name ?? "Kembangsari Digital";

  return {
    metadataBase: new URL(SITE_URL),
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
