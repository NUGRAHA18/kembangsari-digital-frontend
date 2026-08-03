import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { FilterChips } from "@/components/ui/filter-chips";
import { PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/components/ui/pagination";
import { SearchInput } from "@/components/ui/search-input";
import { EmptyState, ErrorState } from "@/components/ui/states";
import { NewsCard } from "@/features/news/news-card";
import { safeFetch } from "@/lib/api";
import { readPage, readParam, type RawSearchParams } from "@/lib/page-params";
import { getNewsCategories, getNewsList } from "@/services/news";

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
  const categorySlug = readParam(params, "kategori");

  // Yang dipakai di URL adalah slug kategori, bukan id: `/berita?kategori=budaya`
  // bisa dibagikan dan tetap terbaca setelah database di-seed ulang. Daftar
  // kategori tetap dibutuhkan untuk chip-nya, jadi memetakan slug ke id di sini
  // tidak menambah permintaan.
  const categories = await safeFetch(getNewsCategories());
  const activeCategory = (categories.data ?? []).find((item) => item.slug === categorySlug);

  const news = await safeFetch(
    getNewsList({ page, limit: PER_PAGE, search, categoryId: activeCategory?.id }),
  );

  const activeParams = {
    search,
    kategori: activeCategory?.slug,
    page: page > 1 ? String(page) : undefined,
  };

  return (
    <>
      <PageHeader
        title="Berita"
        description="Kabar terbaru seputar kegiatan, pembangunan, dan pemerintahan padukuhan."
        breadcrumbs={[{ label: "Berita" }]}
      />

      <Container className="py-8 md:py-12">
        <SearchInput
          action="/berita"
          defaultValue={search}
          placeholder="Cari judul atau isi berita…"
          label="Cari berita"
          hiddenFields={{ kategori: activeCategory?.slug }}
        />

        {/*
          Jumlah berita per kategori sengaja tidak ditampilkan: `_count.news`
          dari `/news/category/all` ikut menghitung draf, sehingga angkanya bisa
          lebih besar daripada berita yang benar-benar tampil.
        */}
        {categories.data && categories.data.length > 0 ? (
          <div className="mt-4">
            <FilterChips
              label="Kategori berita"
              basePath="/berita"
              paramName="kategori"
              activeValue={activeCategory?.slug}
              searchParams={activeParams}
              options={[
                { label: "Semua" },
                ...categories.data.map((item) => ({ value: item.slug, label: item.name })),
              ]}
            />
          </div>
        ) : null}

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
              title={
                search
                  ? `Tidak ada berita untuk "${search}"`
                  : activeCategory
                    ? `Belum ada berita kategori ${activeCategory.name}`
                    : "Belum ada berita"
              }
              description={
                search
                  ? "Coba kata kunci lain."
                  : activeCategory
                    ? "Pilih kategori lain atau lihat semua berita."
                    : "Berita akan tampil di sini setelah dipublikasikan."
              }
            />
          )}
        </div>
      </Container>
    </>
  );
}
