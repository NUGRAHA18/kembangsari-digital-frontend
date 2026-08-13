import { Footer } from "@/components/layout/footer";
import { InstallPrompt } from "@/components/layout/install-prompt";
import { Navbar } from "@/components/layout/navbar";
import { getSettingsMap } from "@/services/settings";

/**
 * Kerangka portal publik: navbar, footer, dan tautan lewati-ke-konten.
 *
 * Terpisah dari root layout supaya dashboard admin bisa punya kerangkanya
 * sendiri. Route group `(publik)` tidak muncul di URL — `/berita` tetap
 * `/berita`, bukan `/publik/berita`.
 */
export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettingsMap();

  return (
    <>
      <a
        href="#konten-utama"
        className="sr-only rounded-xl bg-primary px-4 text-white focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-100 focus:inline-flex focus:min-h-11 focus:items-center"
      >
        Lewati ke konten utama
      </a>

      <Navbar siteName={settings.site_name ?? "Kembangsari Digital"} logo={settings.site_logo} />

      {/* pt-16 mengganti tinggi navbar yang posisinya fixed. Beranda
          menariknya kembali dengan -mt-16 agar hero berada di baliknya. */}
      <main id="konten-utama" className="flex-1 pt-16">
        {children}
      </main>

      <Footer settings={settings} />

      {/* Hanya di portal warga. Dashboard dibuka pengelola dari peramban di
          komputer, dan ajakan memasang aplikasi di sana hanya menutupi form. */}
      <InstallPrompt />
    </>
  );
}
