import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/components/ui/pagination";
import { SearchInput } from "@/components/ui/search-input";
import { EmptyState, ErrorState } from "@/components/ui/states";
import { UmkmCard } from "@/features/umkm/umkm-card";
import { safeFetch } from "@/lib/api";
import { readPage, readParam, type RawSearchParams } from "@/lib/page-params";
import { getActiveUmkm } from "@/services/umkm";

const PER_PAGE = 9;

export const metadata: Metadata = {
  title: "UMKM",
  description:
    "Direktori usaha mikro, kecil, dan menengah warga Padukuhan Kembangsari beserta kontak dan lokasinya.",
};

export default async function UmkmListPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const params = await searchParams;
  const page = readPage(params);
  const search = readParam(params, "search");

  const umkm = await safeFetch(getActiveUmkm({ page, limit: PER_PAGE, search }));
  const activeParams = { search, page: page > 1 ? String(page) : undefined };

  return (
    <>
      <PageHeader
        title="UMKM Kembangsari"
        description="Usaha warga yang selama ini hanya dipromosikan dari mulut ke mulut. Hubungi langsung lewat WhatsApp."
        breadcrumbs={[{ label: "UMKM" }]}
      />

      <Container className="py-8 md:py-12">
        <SearchInput
          action="/umkm"
          defaultValue={search}
          placeholder="Cari nama usaha, produk, atau alamat…"
          label="Cari UMKM"
        />

        <div className="mt-8">
          {umkm.error ? (
            <ErrorState message={umkm.error} />
          ) : umkm.data && umkm.data.data.length > 0 ? (
            <>
              <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
                {umkm.data.data.map((item) => (
                  <li key={item.id}>
                    <UmkmCard umkm={item} />
                  </li>
                ))}
              </ul>
              <Pagination meta={umkm.data.meta} basePath="/umkm" searchParams={activeParams} />
            </>
          ) : (
            <EmptyState
              title={search ? `Tidak ada UMKM untuk "${search}"` : "Belum ada UMKM terdaftar"}
              description={
                search
                  ? "Coba kata kunci lain, misalnya jenis produknya."
                  : "Data UMKM akan tampil di sini setelah ditambahkan admin."
              }
            />
          )}
        </div>
      </Container>
    </>
  );
}
