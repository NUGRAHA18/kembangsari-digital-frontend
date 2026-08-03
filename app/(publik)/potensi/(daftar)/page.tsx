import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { FilterChips } from "@/components/ui/filter-chips";
import { PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/components/ui/pagination";
import { SearchInput } from "@/components/ui/search-input";
import { EmptyState, ErrorState } from "@/components/ui/states";
import {
  POTENTIAL_CATEGORIES,
  potentialCategorySlug,
  readPotentialCategory,
} from "@/features/potential/categories";
import { PotentialCard } from "@/features/potential/potential-card";
import { safeFetch } from "@/lib/api";
import { humanizeEnum } from "@/lib/format";
import { readPage, readParam, type RawSearchParams } from "@/lib/page-params";
import { getActivePotentials } from "@/services/potential";

const PER_PAGE = 9;

export const metadata: Metadata = {
  title: "Potensi Padukuhan",
  description:
    "Potensi pertanian, peternakan, perikanan, kerajinan, dan wisata di Padukuhan Kembangsari.",
};

export default async function PotentialListPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const params = await searchParams;
  const page = readPage(params);
  const search = readParam(params, "search");
  // Nilai asing dibuang di sini, bukan diteruskan: backend menjawabnya `400`.
  const category = readPotentialCategory(readParam(params, "kategori"));

  const potentials = await safeFetch(
    getActivePotentials({ page, limit: PER_PAGE, search, category }),
  );

  const activeParams = {
    search,
    kategori: category ? potentialCategorySlug(category) : undefined,
    page: page > 1 ? String(page) : undefined,
  };

  return (
    <>
      <PageHeader
        title="Potensi Padukuhan"
        description="Pertanian, peternakan, perikanan, kerajinan, dan wisata yang menjadi kekuatan Padukuhan Kembangsari."
        breadcrumbs={[{ label: "Potensi" }]}
      />

      <Container className="py-8 md:py-12">
        <SearchInput
          action="/potensi"
          defaultValue={search}
          placeholder="Cari potensi, misalnya bambu atau lele…"
          label="Cari potensi padukuhan"
          hiddenFields={activeParams.kategori ? { kategori: activeParams.kategori } : {}}
        />

        {/*
          Kedelapan kategori selalu ditampilkan, bukan hanya yang punya isi:
          daftarnya berasal dari enum backend, bukan dari data, sehingga tidak
          ada permintaan tambahan untuk mengetahuinya.
        */}
        <div className="mt-4">
          <FilterChips
            label="Kategori potensi"
            basePath="/potensi"
            paramName="kategori"
            activeValue={activeParams.kategori}
            searchParams={activeParams}
            options={[
              { label: "Semua" },
              ...POTENTIAL_CATEGORIES.map((item) => ({
                value: potentialCategorySlug(item),
                label: humanizeEnum(item),
              })),
            ]}
          />
        </div>

        <div className="mt-8">
          {potentials.error ? (
            <ErrorState message={potentials.error} />
          ) : potentials.data && potentials.data.data.length > 0 ? (
            <>
              <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
                {potentials.data.data.map((item) => (
                  <li key={item.id}>
                    <PotentialCard potential={item} />
                  </li>
                ))}
              </ul>
              <Pagination
                meta={potentials.data.meta}
                basePath="/potensi"
                searchParams={activeParams}
              />
            </>
          ) : (
            <EmptyState
              title={
                search
                  ? `Tidak ada potensi untuk "${search}"`
                  : category
                    ? `Belum ada potensi ${humanizeEnum(category)}`
                    : "Belum ada data potensi"
              }
              description={
                category
                  ? "Pilih kategori lain atau lihat semua potensi."
                  : "Data potensi akan tampil di sini setelah ditambahkan admin."
              }
            />
          )}
        </div>
      </Container>
    </>
  );
}
