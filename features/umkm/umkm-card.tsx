import Link from "next/link";
import { MapPin } from "lucide-react";
import { Card, CardBody } from "@/components/ui/card";
import { Thumbnail } from "@/components/ui/thumbnail";
import { WhatsappIcon } from "@/components/ui/social-icons";
import { excerpt, whatsappLink } from "@/lib/format";
import type { UMKM } from "@/types/api";

export function UmkmCard({ umkm }: { umkm: UMKM }) {
  // `GET /umkm/active` sudah menyaring hanya gambar dengan isPrimary true,
  // jadi elemen pertama aman dipakai sebagai gambar utama.
  const image = umkm.images?.[0];

  return (
    <Card className="group relative flex h-full flex-col transition-shadow hover:shadow-md">
      <Thumbnail
        src={image?.url}
        alt={image?.caption ?? umkm.name}
        sizes="(min-width: 1024px) 22rem, (min-width: 768px) 50vw, 100vw"
      />

      <CardBody className="flex flex-1 flex-col gap-2">
        <h3 className="font-semibold text-pretty">
          <Link
            href={`/umkm/${umkm.slug}`}
            className="after:absolute after:inset-0 group-hover:text-accent"
          >
            {umkm.name}
          </Link>
        </h3>

        {umkm.address ? (
          <p className="flex items-start gap-1.5 text-sm text-muted">
            <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <span>{umkm.address}</span>
          </p>
        ) : null}

        <p className="text-muted">{excerpt(umkm.description, 110)}</p>

        {umkm.whatsapp ? (
          // Diletakkan di atas lapisan tautan kartu (`relative z-10`) supaya
          // ketukan pada tombol ini membuka WhatsApp, bukan halaman detail.
          <a
            href={whatsappLink(umkm.whatsapp, `Halo, saya ingin bertanya tentang ${umkm.name}.`)}
            target="_blank"
            rel="noopener noreferrer"
            className="relative z-10 mt-auto inline-flex min-h-11 w-fit items-center gap-2 rounded-xl bg-primary px-4 font-medium text-white transition-colors hover:bg-primary-hover"
          >
            <WhatsappIcon className="size-5" />
            Hubungi via WhatsApp
          </a>
        ) : null}
      </CardBody>
    </Card>
  );
}
