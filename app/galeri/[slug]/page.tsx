import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/states";
import { GalleryGrid } from "@/features/gallery/gallery-grid";
import { fetchOrNotFound, fetchOrNull } from "@/lib/fetch-page";
import { getGalleryAlbumBySlug } from "@/services/gallery";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const album = await fetchOrNull(getGalleryAlbumBySlug(slug));

  if (!album) return { title: "Album tidak ditemukan" };

  return {
    title: album.name,
    description: album.description ?? `Dokumentasi foto album ${album.name}.`,
    alternates: { canonical: `/galeri/${album.slug}` },
    openGraph: {
      title: album.name,
      description: album.description ?? undefined,
      images: album.thumbnail ? [{ url: album.thumbnail }] : undefined,
    },
  };
}

export default async function AlbumDetailPage({ params }: Props) {
  const { slug } = await params;
  // Endpoint detail album sudah menyertakan `items` di dalamnya,
  // jadi tidak perlu permintaan kedua ke /gallery/item/album/:id.
  const album = await fetchOrNotFound(getGalleryAlbumBySlug(slug));
  const items = album.items ?? [];

  return (
    <>
      <PageHeader
        title={album.name}
        description={album.description ?? undefined}
        breadcrumbs={[{ label: "Galeri", href: "/galeri" }, { label: album.name }]}
      />

      <Container className="py-8 md:py-12">
        {items.length > 0 ? (
          <>
            <p className="mb-4 text-muted">{items.length} media dalam album ini.</p>
            <GalleryGrid items={items} />
          </>
        ) : (
          <EmptyState
            title="Album masih kosong"
            description="Belum ada foto atau video yang diunggah ke album ini."
          />
        )}

        <Link
          href="/galeri"
          className="mt-10 inline-flex min-h-11 items-center gap-2 text-muted hover:text-accent"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Kembali ke Galeri
        </Link>
      </Container>
    </>
  );
}
