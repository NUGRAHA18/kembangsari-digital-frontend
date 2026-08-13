import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, GraduationCap, PenSquare, Plus } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { FilterChips } from "@/components/ui/filter-chips";
import { Pagination } from "@/components/ui/pagination";
import { SearchInput } from "@/components/ui/search-input";
import { EmptyState } from "@/components/ui/states";
import { PageHero } from "@/features/admin/page-hero";
import { readStatus, statusOptions, VISIBILITY_STATUS } from "@/features/admin/status-filter";
import {
  KKN_SUB_PROGRAMS,
  readSubProgram,
  SUB_PROGRAM_LABELS,
} from "@/features/kkn/sub-programs";
import { fetchAsAdmin } from "@/lib/admin-fetch";
import { readPage, readParam, type RawSearchParams } from "@/lib/page-params";
import { requireSession } from "@/lib/session";
import { getAllKknPrograms } from "@/services/kkn";

export const metadata: Metadata = { title: "Program KKN" };

const PER_PAGE = 20;

const MESSAGES: Record<string, string> = {
  dihapus: "Program beserta kegiatannya berhasil dihapus.",
};

export default async function AdminKknPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const { token } = await requireSession();
  const params = await searchParams;

  const page = readPage(params);
  const search = readParam(params, "search");
  // Nilai enum huruf besar dipakai apa adanya di URL. Sub-program tidak punya
  // slug seperti kategori, dan yang di luar daftar dijawab backend 400 — jadi
  // apa pun yang datang dari query string diterjemahkan dulu.
  const subProgram = readSubProgram(readParam(params, "sub") ?? "");
  const status = readStatus(params, VISIBILITY_STATUS);
  const message = MESSAGES[readParam(params, "pesan") ?? ""];

  const programs = await fetchAsAdmin(
    getAllKknPrograms(
      { page, limit: PER_PAGE, search, subProgram: subProgram ?? undefined, isActive: status.value },
      token,
    ),
  );

  const activeParams = {
    search,
    sub: subProgram ?? undefined,
    status: status.param,
    page: page > 1 ? String(page) : undefined,
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHero
        title="Program KKN"
        description={
          status.value === undefined
            ? `${programs.meta.total} program, termasuk yang tidak ditampilkan.`
            : `${programs.meta.total} program ${status.value ? "yang tampil" : "yang disembunyikan"}.`
        }
      >
        <ButtonLink href="/admin/program-kkn/baru">
          <Plus className="size-5" aria-hidden="true" />
          Tambah Program
        </ButtonLink>
      </PageHero>

      {message ? <Alert tone="success">{message}</Alert> : null}

      <div className="flex flex-col gap-4">
        <SearchInput
          action="/admin/program-kkn"
          defaultValue={search}
          placeholder="Cari judul atau isi program…"
          label="Cari program KKN"
          hiddenFields={{ sub: subProgram ?? undefined, status: status.param }}
        />

        <FilterChips
          label="Status program"
          basePath="/admin/program-kkn"
          paramName="status"
          activeValue={status.param}
          searchParams={activeParams}
          options={statusOptions(VISIBILITY_STATUS)}
        />

        {/* `?subProgram=` di daftar utama, bukan `/kkn/program/sub/:sub` —
            hanya yang pertama bisa digabung dengan saringan status. */}
        <FilterChips
          label="Sub-program"
          basePath="/admin/program-kkn"
          paramName="sub"
          activeValue={subProgram ?? undefined}
          searchParams={activeParams}
          options={[
            { label: "Semua" },
            ...KKN_SUB_PROGRAMS.map((item) => ({
              value: item,
              label: SUB_PROGRAM_LABELS[item],
            })),
          ]}
        />
      </div>

      {programs.data.length > 0 ? (
        <>
          <ul className="flex flex-col gap-3">
            {programs.data.map((item) => (
              <li key={item.id}>
                <Card interactive>
                  <CardBody className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center">
                    <span
                      aria-hidden="true"
                      className="grid size-12 shrink-0 place-items-center rounded-xl bg-surface-muted"
                    >
                      <GraduationCap className="size-5 text-muted" />
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge tone={item.isActive ? "primary" : "neutral"}>
                          {item.isActive ? "Tampil" : "Disembunyikan"}
                        </Badge>
                        <span className="text-sm text-muted">
                          {SUB_PROGRAM_LABELS[item.subProgram] ?? item.subProgram}
                        </span>
                        <span className="text-sm text-muted">
                          {item._count?.activities ?? 0} kegiatan
                        </span>
                      </div>

                      <p className="mt-1 font-medium text-pretty">{item.title}</p>
                    </div>

                    <div className="flex shrink-0 flex-wrap gap-1">
                      {item.isActive ? (
                        <Link
                          href={`/program-kkn/${item.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex min-h-11 items-center gap-2 rounded-xl px-3 text-muted transition-colors hover:bg-surface-muted"
                        >
                          <ExternalLink className="size-4" aria-hidden="true" />
                          <span className="sr-only lg:not-sr-only">Lihat</span>
                        </Link>
                      ) : null}

                      <Link
                        href={`/admin/program-kkn/${item.slug}`}
                        className="inline-flex min-h-11 items-center gap-2 rounded-xl px-3 transition-colors hover:bg-surface-muted"
                      >
                        <PenSquare className="size-4" aria-hidden="true" />
                        Kelola
                      </Link>
                    </div>
                  </CardBody>
                </Card>
              </li>
            ))}
          </ul>

          <Pagination
            meta={programs.meta}
            basePath="/admin/program-kkn"
            searchParams={activeParams}
          />
        </>
      ) : (
        <EmptyState
          title={
            search
              ? `Tidak ada program untuk "${search}"`
              : status.param || subProgram
                ? "Tidak ada program yang cocok"
                : "Belum ada program KKN"
          }
          description={
            search || status.param || subProgram
              ? "Coba ubah kata kunci atau saringannya."
              : "Tambahkan program KKN yang pertama."
          }
        />
      )}
    </div>
  );
}
