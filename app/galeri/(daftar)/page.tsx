import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/components/ui/pagination";
import { EmptyState, ErrorState } from "@/components/ui/states";
import { AlbumCard } from "@/features/gallery/album-card";
import { safeFetch } from "@/lib/api";
import { readPage, type RawSearchParams } from "@/lib/page-params";
import { getGalleryAlbums } from "@/services/gallery";

const PER_PAGE = 12;

export const metadata: Metadata = {
  title: "Galeri",
  description:
    "Dokumentasi foto dan video kegiatan Padukuhan Kembangsari, tersimpan rapi per album.",
};

export default async function GalleryPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const params = await searchParams;
  const page = readPage(params);

  const albums = await safeFetch(getGalleryAlbums({ page, limit: PER_PAGE }));

  return (
    <>
      <PageHeader
        title="Galeri"
        description="Dokumentasi kegiatan padukuhan yang selama ini hanya tersimpan di galeri ponsel, kini terarsip dan mudah ditemukan kembali."
        breadcrumbs={[{ label: "Galeri" }]}
      />

      <Container className="py-8 md:py-12">
        {albums.error ? (
          <ErrorState message={albums.error} />
        ) : albums.data && albums.data.data.length > 0 ? (
          <>
            <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
              {albums.data.data.map((album) => (
                <li key={album.id}>
                  <AlbumCard album={album} />
                </li>
              ))}
            </ul>
            <Pagination
              meta={albums.data.meta}
              basePath="/galeri"
              searchParams={{ page: page > 1 ? String(page) : undefined }}
            />
          </>
        ) : (
          <EmptyState
            title="Belum ada album"
            description="Album dokumentasi akan tampil di sini setelah dibuat admin."
          />
        )}
      </Container>
    </>
  );
}
