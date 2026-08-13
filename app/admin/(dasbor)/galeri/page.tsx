import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, Images, Plus } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";
import { SearchInput } from "@/components/ui/search-input";
import { EmptyState } from "@/components/ui/states";
import { PageHero } from "@/features/admin/page-hero";
import { fetchAsAdmin } from "@/lib/admin-fetch";
import { readPage, readParam, type RawSearchParams } from "@/lib/page-params";
import { getGalleryAlbumsAsAdmin } from "@/services/gallery";

export const metadata: Metadata = { title: "Galeri" };

const PER_PAGE = 20;

const MESSAGES: Record<string, string> = {
  dihapus: "Album beserta isinya berhasil dihapus.",
};

export default async function AdminGalleryPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const params = await searchParams;

  const page = readPage(params);
  const search = readParam(params, "search");
  const message = MESSAGES[readParam(params, "pesan") ?? ""];

  const albums = await fetchAsAdmin(getGalleryAlbumsAsAdmin({ page, limit: PER_PAGE, search }));
  const activeParams = { search, page: page > 1 ? String(page) : undefined };

  return (
    <div className="flex flex-col gap-6">
      <PageHero title="Galeri" description={`${albums.meta.total} album. Foto dikelola di dalam albumnya masing-masing.`}>
        <ButtonLink href="/admin/galeri/baru">
          <Plus className="size-5" aria-hidden="true" />
          Buat Album
        </ButtonLink>
      </PageHero>

      {message ? <Alert tone="success">{message}</Alert> : null}

      <SearchInput
        action="/admin/galeri"
        defaultValue={search}
        placeholder="Cari nama album…"
        label="Cari album"
      />

      {albums.data.length > 0 ? (
        <>
          <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {albums.data.map((album) => (
              <li key={album.id}>
                <Card className="h-full">
                  {album.thumbnail ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={album.thumbnail}
                      alt=""
                      loading="lazy"
                      className="aspect-16/9 w-full object-cover"
                    />
                  ) : (
                    <div className="grid aspect-16/9 w-full place-items-center bg-surface-muted">
                      <Images className="size-8 text-muted" aria-hidden="true" />
                    </div>
                  )}

                  <CardBody className="flex flex-col gap-2 p-4">
                    <Link
                      href={`/admin/galeri/${album.slug}`}
                      className="font-medium text-pretty hover:text-accent hover:underline"
                    >
                      {album.name}
                    </Link>

                    <p className="text-sm text-muted">
                      {album._count?.items ?? 0} foto & video
                    </p>

                    <div className="mt-1 flex flex-wrap gap-1">
                      <Link
                        href={`/admin/galeri/${album.slug}`}
                        className="inline-flex min-h-11 items-center rounded-xl px-3 transition-colors hover:bg-surface-muted"
                      >
                        Kelola isi
                      </Link>
                      <Link
                        href={`/galeri/${album.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-11 items-center gap-2 rounded-xl px-3 text-muted transition-colors hover:bg-surface-muted"
                      >
                        <ExternalLink className="size-4" aria-hidden="true" />
                        Lihat
                      </Link>
                    </div>
                  </CardBody>
                </Card>
              </li>
            ))}
          </ul>

          <Pagination meta={albums.meta} basePath="/admin/galeri" searchParams={activeParams} />
        </>
      ) : (
        <EmptyState
          title={search ? `Tidak ada album untuk "${search}"` : "Belum ada album"}
          description={
            search
              ? "Coba kata kunci lain."
              : "Buat album lebih dulu, misalnya per kegiatan, baru unggah fotonya."
          }
        />
      )}
    </div>
  );
}
