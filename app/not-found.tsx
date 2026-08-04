import { MapPinOff } from "lucide-react";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { getSettingsMap } from "@/services/settings";

/**
 * Halaman 404 untuk seluruh situs.
 *
 * Navbar dan footer dipasang di sini sendiri, bukan diwarisi: berkas ini adalah
 * batas 404 terluar — ia menangani alamat yang tidak cocok dengan rute mana pun,
 * sehingga dirender di dalam root layout yang memang tidak memuat keduanya.
 */
export default async function NotFound() {
  const settings = await getSettingsMap();

  return (
    <>
      <Navbar siteName={settings.site_name ?? "Kembangsari Digital"} />

      <main className="flex-1 pt-16">
        <Container className="flex flex-col items-center py-20 text-center md:py-28">
          <MapPinOff className="size-10 text-muted" aria-hidden="true" />
          <h1 className="mt-4 text-[1.75rem] font-bold tracking-tight lg:text-4xl">
            Halaman tidak ditemukan
          </h1>
          <p className="mt-3 max-w-prose text-muted text-pretty">
            Halaman yang Anda cari mungkin sudah dipindahkan atau alamatnya salah ketik.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <ButtonLink href="/">Kembali ke Beranda</ButtonLink>
            <ButtonLink href="/berita" variant="outline">
              Lihat Berita
            </ButtonLink>
          </div>
        </Container>
      </main>

      <Footer settings={settings} />
    </>
  );
}
