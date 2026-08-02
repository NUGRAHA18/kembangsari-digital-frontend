import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/components/ui/pagination";
import { SearchInput } from "@/components/ui/search-input";
import { EmptyState, ErrorState } from "@/components/ui/states";
import { PotentialCard } from "@/features/potential/potential-card";
import { safeFetch } from "@/lib/api";
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

  const potentials = await safeFetch(getActivePotentials({ page, limit: PER_PAGE, search }));
  const activeParams = { search, page: page > 1 ? String(page) : undefined };

  return (
    <>
      <PageHeader
        title="Potensi Padukuhan"
        description="Pertanian, peternakan, perikanan, kerajinan, dan wisata yang menjadi kekuatan Padukuhan Kembangsari."
        breadcrumbs={[{ label: "Potensi" }]}
      />

      <Container className="py-8 md:py-12">
        {/*
          Tidak ada filter kategori di halaman ini: endpoint `/potential/active`
          hanya menerima page, limit, dan search — parameter kategori diabaikan
          backend. Menyaring di sisi klien hanya akan menyaring satu halaman
          hasil, sehingga menampilkan jumlah yang menyesatkan. Kategori tetap
          terlihat sebagai label pada setiap kartu.
        */}
        <SearchInput
          action="/potensi"
          defaultValue={search}
          placeholder="Cari potensi, misalnya bambu atau lele…"
          label="Cari potensi padukuhan"
        />

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
              title={search ? `Tidak ada potensi untuk "${search}"` : "Belum ada data potensi"}
              description="Data potensi akan tampil di sini setelah ditambahkan admin."
            />
          )}
        </div>
      </Container>
    </>
  );
}
