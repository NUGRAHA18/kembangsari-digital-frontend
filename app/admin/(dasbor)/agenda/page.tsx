import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, MapPin, PenSquare, Plus, Trash2 } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";
import { SearchInput } from "@/components/ui/search-input";
import { EmptyState } from "@/components/ui/states";
import { PageHero } from "@/features/admin/page-hero";
import { hasAgendaPassed } from "@/features/agenda/status";
import { fetchAsAdmin } from "@/lib/admin-fetch";
import { formatDateRange } from "@/lib/format";
import { readPage, readParam, type RawSearchParams } from "@/lib/page-params";
import { requireSession } from "@/lib/session";
import { getAgendaListAsAdmin } from "@/services/agenda";

export const metadata: Metadata = { title: "Agenda" };

const PER_PAGE = 20;

const MESSAGES: Record<string, string> = {
  dibuat: "Agenda berhasil disimpan.",
  diperbarui: "Perubahan agenda berhasil disimpan.",
  dihapus: "Agenda berhasil dihapus.",
};

export default async function AdminAgendaPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const { token } = await requireSession();
  const params = await searchParams;

  const page = readPage(params);
  const search = readParam(params, "search");
  const message = MESSAGES[readParam(params, "pesan") ?? ""];

  const agenda = await fetchAsAdmin(getAgendaListAsAdmin({ page, limit: PER_PAGE, search }, token));

  const activeParams = { search, page: page > 1 ? String(page) : undefined };

  return (
    <div className="flex flex-col gap-6">
      <PageHero title="Agenda" description={`${agenda.meta.total} kegiatan, termasuk yang sudah berlalu.`}>
        <ButtonLink href="/admin/agenda/baru">
          <Plus className="size-5" aria-hidden="true" />
          Tambah Agenda
        </ButtonLink>
      </PageHero>

      {message ? <Alert tone="success">{message}</Alert> : null}

      <SearchInput
        action="/admin/agenda"
        defaultValue={search}
        placeholder="Cari judul kegiatan…"
        label="Cari agenda"
      />

      {agenda.data.length > 0 ? (
        <>
          <ul className="flex flex-col gap-3">
            {agenda.data.map((item) => {
              const passed = hasAgendaPassed(item);

              return (
                <li key={item.id}>
                  <Card interactive>
                    <CardBody className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge tone={passed ? "neutral" : "primary"}>
                            {passed ? "Sudah berlangsung" : "Akan datang"}
                          </Badge>
                          <span className="text-sm text-muted">
                            <time dateTime={item.startDate}>
                              {formatDateRange(item.startDate, item.endDate)}
                            </time>
                          </span>
                        </div>

                        <p className="mt-1 font-medium text-pretty">{item.title}</p>

                        {item.location ? (
                          <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted">
                            <MapPin className="size-4 shrink-0" aria-hidden="true" />
                            {item.location}
                          </p>
                        ) : null}
                      </div>

                      <div className="flex shrink-0 flex-wrap gap-1">
                        <Link
                          href={`/agenda/${item.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex min-h-11 items-center gap-2 rounded-xl px-3 text-muted transition-colors hover:bg-surface-muted"
                        >
                          <ExternalLink className="size-4" aria-hidden="true" />
                          <span className="sr-only lg:not-sr-only">Lihat</span>
                        </Link>

                        <Link
                          href={`/admin/agenda/${item.slug}`}
                          className="inline-flex min-h-11 items-center gap-2 rounded-xl px-3 transition-colors hover:bg-surface-muted"
                        >
                          <PenSquare className="size-4" aria-hidden="true" />
                          Ubah
                        </Link>

                        <Link
                          href={`/admin/agenda/${item.slug}/hapus`}
                          className="inline-flex min-h-11 items-center gap-2 rounded-xl px-3 text-error transition-colors hover:bg-error/10"
                        >
                          <Trash2 className="size-4" aria-hidden="true" />
                          <span className="sr-only lg:not-sr-only">Hapus</span>
                        </Link>
                      </div>
                    </CardBody>
                  </Card>
                </li>
              );
            })}
          </ul>

          <Pagination meta={agenda.meta} basePath="/admin/agenda" searchParams={activeParams} />
        </>
      ) : (
        <EmptyState
          title={search ? `Tidak ada agenda untuk "${search}"` : "Belum ada agenda"}
          description={
            search ? "Coba kata kunci lain." : "Tambahkan kegiatan pertama untuk warga."
          }
        />
      )}
    </div>
  );
}
