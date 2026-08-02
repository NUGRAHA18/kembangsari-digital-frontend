import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { FilterChips } from "@/components/ui/filter-chips";
import { PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/components/ui/pagination";
import { EmptyState, ErrorState } from "@/components/ui/states";
import { AgendaCard } from "@/features/agenda/agenda-card";
import { safeFetch } from "@/lib/api";
import { readPage, readParam, type RawSearchParams } from "@/lib/page-params";
import { getAgendaList, getUpcomingAgenda } from "@/services/agenda";
import type { Agenda } from "@/types/api";

const PER_PAGE = 12;

export const metadata: Metadata = {
  title: "Agenda",
  description:
    "Jadwal kegiatan warga Padukuhan Kembangsari: posyandu, kerja bakti, rapat RT, dan kegiatan lainnya.",
};

export default async function AgendaPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const params = await searchParams;
  const page = readPage(params);
  const view = readParam(params, "tampilan") === "semua" ? "semua" : undefined;

  const agenda = await safeFetch(
    view === "semua"
      ? getAgendaList({ page, limit: PER_PAGE })
      : getUpcomingAgenda({ page, limit: PER_PAGE }),
  );

  const activeParams = { tampilan: view, page: page > 1 ? String(page) : undefined };

  return (
    <>
      <PageHeader
        title="Agenda Kegiatan"
        description="Jadwal kegiatan padukuhan. Kegiatan seperti Posyandu, PKK, dan kerja bakti berlangsung berkala — halaman ini menggantikan pengumuman yang selama ini hanya beredar di grup WhatsApp."
        breadcrumbs={[{ label: "Agenda" }]}
      />

      <Container className="py-8 md:py-12">
        <FilterChips
          label="Tampilan agenda"
          basePath="/agenda"
          paramName="tampilan"
          activeValue={view}
          searchParams={activeParams}
          options={[
            { label: "Akan Datang" },
            { value: "semua", label: "Semua Agenda" },
          ]}
        />

        <div className="mt-8">
          {agenda.error ? (
            <ErrorState message={agenda.error} />
          ) : agenda.data && agenda.data.data.length > 0 ? (
            <>
              <AgendaByMonth items={agenda.data.data} />
              <Pagination meta={agenda.data.meta} basePath="/agenda" searchParams={activeParams} />
            </>
          ) : (
            <EmptyState
              title={view === "semua" ? "Belum ada agenda" : "Belum ada agenda mendatang"}
              description={
                view === "semua"
                  ? "Agenda akan tampil di sini setelah ditambahkan admin."
                  : "Semua kegiatan yang terdaftar sudah berlalu. Lihat tab Semua Agenda untuk riwayatnya."
              }
            />
          )}
        </div>
      </Container>
    </>
  );
}

/**
 * Agenda dikelompokkan per bulan.
 *
 * Dokumen SRS meminta "tampilan kalender". Kisi kalender 7 kolom praktis tidak
 * terbaca di layar 320px dan memaksa halaman menggulir ke samping, sementara
 * yang sebenarnya dicari warga adalah "kapan kegiatan berikutnya". Pengelompokan
 * per bulan menjawab pertanyaan itu dan tetap nyaman dibaca di ponsel.
 */
function AgendaByMonth({ items }: { items: Agenda[] }) {
  const groups = new Map<string, Agenda[]>();

  for (const item of items) {
    const key = new Intl.DateTimeFormat("id-ID", {
      month: "long",
      year: "numeric",
      timeZone: "Asia/Jakarta",
    }).format(new Date(item.startDate));

    groups.set(key, [...(groups.get(key) ?? []), item]);
  }

  return (
    <div className="flex flex-col gap-8">
      {[...groups.entries()].map(([month, monthItems]) => (
        <section key={month}>
          <h2 className="mb-4 text-xl font-semibold tracking-tight">{month}</h2>
          <ul className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {monthItems.map((item) => (
              <li key={item.id}>
                <AgendaCard agenda={item} />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
