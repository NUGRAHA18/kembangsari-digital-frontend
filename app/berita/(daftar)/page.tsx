import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/components/ui/pagination";
import { SearchInput } from "@/components/ui/search-input";
import { EmptyState, ErrorState } from "@/components/ui/states";
import { NewsCard } from "@/features/news/news-card";
import { safeFetch } from "@/lib/api";
import { readPage, readParam, type RawSearchParams } from "@/lib/page-params";
import { getNewsList } from "@/services/news";

const PER_PAGE = 9;

export const metadata: Metadata = {
  title: "Berita",
  description:
    "Kabar terbaru seputar kegiatan, pembangunan, dan pemerintahan Padukuhan Kembangsari.",
};

export default async function NewsListPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const params = await searchParams;
  const page = readPage(params);
  const search = readParam(params, "search");

  const news = await safeFetch(getNewsList({ page, limit: PER_PAGE, search }));

  const activeParams = { search, page: page > 1 ? String(page) : undefined };

  return (
    <>
      <PageHeader
        title="Berita"
        description="Kabar terbaru seputar kegiatan, pembangunan, dan pemerintahan padukuhan."
        breadcrumbs={[{ label: "Berita" }]}
      />

      <Container className="py-8 md:py-12">
        {/*
          Belum ada filter kategori di halaman ini. `GET /news` hanya menerima
          page, limit, dan search — parameter kategori dibuang backend tanpa
          galat, sehingga deretan tombol kategori akan tampak berfungsi padahal
          hasilnya tidak pernah berubah. Kategori tetap terlihat sebagai label
          pada setiap kartu. Lihat LAPORAN-BACKEND.md butir B-1.
        */}
        <SearchInput
          action="/berita"
          defaultValue={search}
          placeholder="Cari judul atau isi berita…"
          label="Cari berita"
        />

        <div className="mt-8">
          {news.error ? (
            <ErrorState message={news.error} />
          ) : news.data && news.data.data.length > 0 ? (
            <>
              <p className="sr-only" aria-live="polite">
                {news.data.meta.total} berita ditemukan.
              </p>

              <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
                {news.data.data.map((item, index) => (
                  <li key={item.id}>
                    {/* Tiga kartu teratas berada di atas lipatan layar pada desktop. */}
                    <NewsCard news={item} priority={index < 3} />
                  </li>
                ))}
              </ul>

              <Pagination meta={news.data.meta} basePath="/berita" searchParams={activeParams} />
            </>
          ) : (
            <EmptyState
              title={search ? `Tidak ada berita untuk "${search}"` : "Belum ada berita"}
              description={
                search
                  ? "Coba kata kunci lain."
                  : "Berita akan tampil di sini setelah dipublikasikan."
              }
            />
          )}
        </div>
      </Container>
    </>
  );
}
