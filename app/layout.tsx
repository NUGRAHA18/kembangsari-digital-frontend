import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
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

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettingsMap();

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
        <ThemeProvider>
          <a
            href="#konten-utama"
            className="sr-only rounded-xl bg-primary px-4 text-white focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-100 focus:inline-flex focus:min-h-11 focus:items-center"
          >
            Lewati ke konten utama
          </a>

          <Navbar siteName={settings.site_name ?? "Kembangsari Digital"} />

          {/* pt-16 mengganti tinggi navbar yang posisinya fixed. Beranda
              menariknya kembali dengan -mt-16 agar hero berada di baliknya. */}
          <main id="konten-utama" className="flex-1 pt-16">
            {children}
          </main>

          <Footer settings={settings} />
        </ThemeProvider>
      </body>
    </html>
  );
}
