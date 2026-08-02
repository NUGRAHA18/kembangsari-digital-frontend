import { MapPinOff } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

export default function NotFound() {
  return (
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
  );
}
