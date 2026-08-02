import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, MapPin, Navigation, Phone, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { PhotoGallery } from "@/components/ui/photo-gallery";
import { PlainText } from "@/components/ui/plain-text";
import { Thumbnail } from "@/components/ui/thumbnail";
import { excerpt, googleMapsDirectionsLink, humanizeEnum, telLink } from "@/lib/format";
import { fetchOrNotFound, fetchOrNull } from "@/lib/fetch-page";
import { getPotentialBySlug } from "@/services/potential";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const potential = await fetchOrNull(getPotentialBySlug(slug));

  if (!potential) return { title: "Potensi tidak ditemukan" };

  const description = excerpt(potential.description, 160);

  return {
    title: potential.name,
    description,
    alternates: { canonical: `/potensi/${potential.slug}` },
    openGraph: {
      title: potential.name,
      description,
      images: potential.thumbnail ? [{ url: potential.thumbnail }] : undefined,
    },
  };
}

export default async function PotentialDetailPage({ params }: Props) {
  const { slug } = await params;
  const potential = await fetchOrNotFound(getPotentialBySlug(slug));

  const photos = (potential.images ?? []).map((image) => ({
    id: image.id,
    url: image.url,
    caption: image.caption ?? potential.name,
  }));

  const hasCoordinates = potential.latitude !== null && potential.longitude !== null;
  const hasContact = Boolean(potential.contactPerson || potential.contactPhone);

  return (
    <>
      <PageHeader
        title={potential.name}
        breadcrumbs={[{ label: "Potensi", href: "/potensi" }, { label: potential.name }]}
      >
        <Badge tone="secondary" className="mt-4">
          {humanizeEnum(potential.category)}
        </Badge>
      </PageHeader>

      <Container className="py-8 md:py-12">
        <div className="grid gap-8 lg:grid-cols-3 lg:gap-12">
          <div className="lg:col-span-2">
            {potential.thumbnail ? (
              <Thumbnail
                src={potential.thumbnail}
                alt={potential.name}
                priority
                ratio="aspect-16/9"
                sizes="(min-width: 1024px) 45rem, 100vw"
                className="mb-8 rounded-xl"
              />
            ) : null}

            <h2 className="text-xl font-semibold tracking-tight">Deskripsi</h2>
            <PlainText className="mt-3">{potential.description}</PlainText>

            {photos.length > 0 ? (
              <>
                <h2 className="mt-10 text-xl font-semibold tracking-tight">Dokumentasi</h2>
                <PhotoGallery photos={photos} className="mt-4" />
              </>
            ) : null}
          </div>

          {hasContact || potential.address || hasCoordinates ? (
            <aside className="lg:col-span-1">
              <Card>
                <CardBody className="flex flex-col gap-4">
                  <h2 className="font-semibold">Informasi</h2>

                  <ul className="flex flex-col gap-3 text-muted">
                    {potential.address ? (
                      <li className="flex gap-3">
                        <MapPin className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
                        <span>{potential.address}</span>
                      </li>
                    ) : null}
                    {potential.contactPerson ? (
                      <li className="flex gap-3">
                        <User className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
                        <span>{potential.contactPerson}</span>
                      </li>
                    ) : null}
                    {potential.contactPhone ? (
                      <li className="flex items-center gap-3">
                        <Phone className="size-5 shrink-0" aria-hidden="true" />
                        <a
                          href={telLink(potential.contactPhone)}
                          className="inline-flex min-h-11 items-center hover:text-accent"
                        >
                          {potential.contactPhone}
                        </a>
                      </li>
                    ) : null}
                  </ul>

                  {hasCoordinates ? (
                    <a
                      href={googleMapsDirectionsLink(potential.latitude!, potential.longitude!)}
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
          ) : null}
        </div>

        <Link
          href="/potensi"
          className="mt-10 inline-flex min-h-11 items-center gap-2 text-muted hover:text-accent"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Kembali ke daftar potensi
        </Link>
      </Container>
    </>
  );
}
