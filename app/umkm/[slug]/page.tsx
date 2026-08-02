import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Globe, Mail, MapPin, Navigation, Phone } from "lucide-react";
import { Card, CardBody } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { PhotoGallery } from "@/components/ui/photo-gallery";
import { PlainText } from "@/components/ui/plain-text";
import { FacebookIcon, InstagramIcon, WhatsappIcon } from "@/components/ui/social-icons";
import { excerpt, googleMapsDirectionsLink, telLink, whatsappLink } from "@/lib/format";
import { fetchOrNotFound, fetchOrNull } from "@/lib/fetch-page";
import { getUmkmBySlug } from "@/services/umkm";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const umkm = await fetchOrNull(getUmkmBySlug(slug));

  if (!umkm) return { title: "UMKM tidak ditemukan" };

  const description = excerpt(umkm.description, 160);

  return {
    title: umkm.name,
    description,
    alternates: { canonical: `/umkm/${umkm.slug}` },
    openGraph: {
      title: umkm.name,
      description,
      images: umkm.images?.[0] ? [{ url: umkm.images[0].url }] : undefined,
    },
  };
}

export default async function UmkmDetailPage({ params }: Props) {
  const { slug } = await params;
  // Pada endpoint detail, `images` berisi SEMUA gambar, bukan hanya yang primer.
  const umkm = await fetchOrNotFound(getUmkmBySlug(slug));

  const photos = (umkm.images ?? []).map((image) => ({
    id: image.id,
    url: image.url,
    caption: image.caption ?? umkm.name,
  }));

  const hasCoordinates = umkm.latitude !== null && umkm.longitude !== null;

  return (
    <>
      <PageHeader
        title={umkm.name}
        breadcrumbs={[{ label: "UMKM", href: "/umkm" }, { label: umkm.name }]}
      />

      <Container className="py-8 md:py-12">
        <div className="grid gap-8 lg:grid-cols-3 lg:gap-12">
          <div className="lg:col-span-2">
            {photos.length > 0 ? <PhotoGallery photos={photos} className="mb-8" /> : null}

            <h2 className="text-xl font-semibold tracking-tight">Tentang Usaha</h2>
            <PlainText className="mt-3">{umkm.description}</PlainText>
          </div>

          <aside className="lg:col-span-1">
            <Card>
              <CardBody className="flex flex-col gap-4">
                <h2 className="font-semibold">Kontak & Lokasi</h2>

                {umkm.whatsapp ? (
                  <a
                    href={whatsappLink(
                      umkm.whatsapp,
                      `Halo, saya ingin bertanya tentang ${umkm.name}.`,
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 font-medium text-white transition-colors hover:bg-primary-hover"
                  >
                    <WhatsappIcon className="size-5" />
                    Hubungi via WhatsApp
                  </a>
                ) : null}

                <ul className="flex flex-col gap-3 text-muted">
                  {umkm.address ? (
                    <li className="flex gap-3">
                      <MapPin className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
                      <span>{umkm.address}</span>
                    </li>
                  ) : null}
                  {/* Semua baris berikut adalah tautan yang benar-benar diketuk,
                      jadi tingginya dijaga minimal 44px. */}
                  {umkm.phone ? (
                    <li className="flex items-center gap-3">
                      <Phone className="size-5 shrink-0" aria-hidden="true" />
                      <a
                        href={telLink(umkm.phone)}
                        className="inline-flex min-h-11 items-center hover:text-accent"
                      >
                        {umkm.phone}
                      </a>
                    </li>
                  ) : null}
                  {umkm.email ? (
                    <li className="flex items-center gap-3">
                      <Mail className="size-5 shrink-0" aria-hidden="true" />
                      <a
                        href={`mailto:${umkm.email}`}
                        className="inline-flex min-h-11 items-center break-all hover:text-accent"
                      >
                        {umkm.email}
                      </a>
                    </li>
                  ) : null}
                  {umkm.website ? (
                    <li className="flex items-center gap-3">
                      <Globe className="size-5 shrink-0" aria-hidden="true" />
                      <a
                        href={umkm.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-11 items-center break-all hover:text-accent"
                      >
                        {umkm.website.replace(/^https?:\/\//, "")}
                      </a>
                    </li>
                  ) : null}
                  {umkm.instagram ? (
                    <li className="flex items-center gap-3">
                      <InstagramIcon className="size-5 shrink-0" />
                      <a
                        href={umkm.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-11 items-center break-all hover:text-accent"
                      >
                        Instagram
                      </a>
                    </li>
                  ) : null}
                  {umkm.facebook ? (
                    <li className="flex items-center gap-3">
                      <FacebookIcon className="size-5 shrink-0" />
                      <a
                        href={umkm.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-11 items-center break-all hover:text-accent"
                      >
                        Facebook
                      </a>
                    </li>
                  ) : null}
                </ul>

                {hasCoordinates ? (
                  <a
                    href={googleMapsDirectionsLink(umkm.latitude!, umkm.longitude!)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border px-4 font-medium transition-colors hover:bg-surface-muted"
                  >
                    <Navigation className="size-4" aria-hidden="true" />
                    Petunjuk Arah
                  </a>
                ) : null}
              </CardBody>
            </Card>
          </aside>
        </div>

        <Link
          href="/umkm"
          className="mt-10 inline-flex min-h-11 items-center gap-2 text-muted hover:text-accent"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Kembali ke daftar UMKM
        </Link>
      </Container>
    </>
  );
}
