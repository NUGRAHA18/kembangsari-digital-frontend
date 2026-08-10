import type { Metadata } from "next";
import Link from "next/link";
import { BarChart3, ExternalLink, PenSquare, Plus } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { FilterChips } from "@/components/ui/filter-chips";
import { Pagination } from "@/components/ui/pagination";
import { EmptyState } from "@/components/ui/states";
import { PUBLISH_STATUS, readStatus, statusOptions } from "@/features/admin/status-filter";
import { fetchAsAdmin } from "@/lib/admin-fetch";
import { formatNumber } from "@/lib/format";
import { readPage, readParam, type RawSearchParams } from "@/lib/page-params";
import { requireSession } from "@/lib/session";
import { getAllMonography } from "@/services/monography";

export const metadata: Metadata = { title: "Monografi" };

const PER_PAGE = 20;

const MESSAGES: Record<string, string> = {
  dibuat: "Data monografi berhasil ditambahkan.",
  diperbarui: "Perubahan data monografi berhasil disimpan.",
  dihapus: "Data monografi satu tahun berhasil dihapus.",
};

export default async function AdminMonographyPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const { token } = await requireSession();
  const params = await searchParams;

  const page = readPage(params);
  const status = readStatus(params, PUBLISH_STATUS);
  const message = MESSAGES[readParam(params, "pesan") ?? ""];

  // Tanpa pencarian: modul ini hanya punya kolom angka, tidak ada teks yang
  // bisa dicari — sama seperti halaman publiknya.
  const monography = await fetchAsAdmin(
    getAllMonography({ page, limit: PER_PAGE, published: status.value }, token),
  );

  const activeParams = {
    status: status.param,
    page: page > 1 ? String(page) : undefined,
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Monografi</h1>
          <p className="mt-1 text-muted text-pretty">
            {status.value === undefined
              ? `${monography.meta.total} tahun data kependudukan, termasuk yang belum diterbitkan.`
              : `${monography.meta.total} tahun data ${status.value ? "yang sudah terbit" : "yang masih draf"}.`}
          </p>
        </div>

        <ButtonLink href="/admin/monografi/baru">
          <Plus className="size-5" aria-hidden="true" />
          Tambah Tahun
        </ButtonLink>
      </div>

      {message ? <Alert tone="success">{message}</Alert> : null}

      <FilterChips
        label="Status monografi"
        basePath="/admin/monografi"
        paramName="status"
        activeValue={status.param}
        searchParams={activeParams}
        options={statusOptions(PUBLISH_STATUS)}
      />

      {monography.data.length > 0 ? (
        <>
          <ul className="flex flex-col gap-3">
            {monography.data.map((stat) => (
              <li key={stat.id}>
                <Card>
                  <CardBody className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center">
                    <span
                      aria-hidden="true"
                      className="grid size-12 shrink-0 place-items-center rounded-xl bg-surface-muted"
                    >
                      <BarChart3 className="size-5 text-muted" />
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge tone={stat.isPublished ? "primary" : "neutral"}>
                          {stat.isPublished ? "Terbit" : "Draf"}
                        </Badge>
                        <span className="text-sm text-muted">
                          {formatNumber(stat.maleCount)} laki-laki ·{" "}
                          {formatNumber(stat.femaleCount)} perempuan
                        </span>
                      </div>

                      <p className="mt-1 font-medium">
                        Tahun {stat.year} · {formatNumber(stat.totalPopulation)} jiwa
                      </p>
                    </div>

                    <div className="flex shrink-0 flex-wrap gap-1">
                      {stat.isPublished ? (
                        <Link
                          href={`/monografi?tahun=${stat.year}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex min-h-11 items-center gap-2 rounded-xl px-3 text-muted transition-colors hover:bg-surface-muted"
                        >
                          <ExternalLink className="size-4" aria-hidden="true" />
                          <span className="sr-only lg:not-sr-only">Lihat</span>
                        </Link>
                      ) : null}

                      <Link
                        href={`/admin/monografi/${stat.id}`}
                        className="inline-flex min-h-11 items-center gap-2 rounded-xl px-3 transition-colors hover:bg-surface-muted"
                      >
                        <PenSquare className="size-4" aria-hidden="true" />
                        Ubah
                      </Link>
                    </div>
                  </CardBody>
                </Card>
              </li>
            ))}
          </ul>

          <Pagination
            meta={monography.meta}
            basePath="/admin/monografi"
            searchParams={activeParams}
          />
        </>
      ) : (
        <EmptyState
          title={status.param ? "Tidak ada tahun yang cocok" : "Belum ada data monografi"}
          description={
            status.param
              ? "Coba ubah saringan statusnya."
              : "Tambahkan data kependudukan tahun terbaru untuk mulai mengisi halaman monografi."
          }
        />
      )}
    </div>
  );
}
