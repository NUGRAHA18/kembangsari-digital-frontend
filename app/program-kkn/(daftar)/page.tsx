import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/components/ui/pagination";
import { EmptyState, ErrorState } from "@/components/ui/states";
import { KknCard } from "@/features/kkn/kkn-card";
import { safeFetch } from "@/lib/api";
import { readPage, type RawSearchParams } from "@/lib/page-params";
import { getActiveKknPrograms } from "@/services/kkn";

const PER_PAGE = 12;

export const metadata: Metadata = {
  title: "Program KKN",
  description:
    "Rumah Belajar, Pekarangan Produktif, Pengelolaan Sampah, dan Penerangan Jalan — empat program kerja KKN di Padukuhan Kembangsari.",
};

export default async function KknListPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const params = await searchParams;
  const page = readPage(params);

  const programs = await safeFetch(getActiveKknPrograms({ page, limit: PER_PAGE }));

  return (
    <>
      <PageHeader
        title="Program KKN"
        description="Empat program kerja KKN yang dirancang agar tetap dapat dimanfaatkan warga setelah masa KKN berakhir — bukan berhenti sebagai laporan PDF."
        breadcrumbs={[{ label: "Program KKN" }]}
      />

      <Container className="py-8 md:py-12">
        {programs.error ? (
          <ErrorState message={programs.error} />
        ) : programs.data && programs.data.data.length > 0 ? (
          <>
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-4">
              {programs.data.data.map((program) => (
                <li key={program.id}>
                  <KknCard program={program} />
                </li>
              ))}
            </ul>
            <Pagination
              meta={programs.data.meta}
              basePath="/program-kkn"
              searchParams={{ page: page > 1 ? String(page) : undefined }}
            />
          </>
        ) : (
          <EmptyState
            title="Belum ada program aktif"
            description="Program KKN akan tampil di sini setelah dipublikasikan."
          />
        )}
      </Container>
    </>
  );
}
