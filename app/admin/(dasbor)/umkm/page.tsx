import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, PenSquare, Plus, Store } from "lucide-react";
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
import { fetchAsAdmin } from "@/lib/admin-fetch";
import { readPage, readParam, type RawSearchParams } from "@/lib/page-params";
import { requireSession } from "@/lib/session";
import { getAllUmkm } from "@/services/umkm";

export const metadata: Metadata = { title: "UMKM" };

const PER_PAGE = 20;

const MESSAGES: Record<string, string> = {
  dihapus: "UMKM beserta gambarnya berhasil dihapus.",
};

export default async function AdminUmkmPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const { token } = await requireSession();
  const params = await searchParams;

  const page = readPage(params);
  const search = readParam(params, "search");
  const status = readStatus(params, VISIBILITY_STATUS);
  const message = MESSAGES[readParam(params, "pesan") ?? ""];

  const umkm = await fetchAsAdmin(
    getAllUmkm({ page, limit: PER_PAGE, search, isActive: status.value }, token),
  );

  const activeParams = {
    search,
    status: status.param,
    page: page > 1 ? String(page) : undefined,
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHero
        title="UMKM"
        description={
          status.value === undefined
            ? `${umkm.meta.total} usaha warga, termasuk yang tidak ditampilkan.`
            : `${umkm.meta.total} usaha warga ${status.value ? "yang tampil" : "yang disembunyikan"}.`
        }
      >
        <ButtonLink href="/admin/umkm/baru">
          <Plus className="size-5" aria-hidden="true" />
          Tambah UMKM
        </ButtonLink>
      </PageHero>

      {message ? <Alert tone="success">{message}</Alert> : null}

      <div className="flex flex-col gap-4">
        <SearchInput
          action="/admin/umkm"
          defaultValue={search}
          placeholder="Cari nama, deskripsi, atau alamat…"
          label="Cari UMKM"
          hiddenFields={{ status: status.param }}
        />

        <FilterChips
          label="Status UMKM"
          basePath="/admin/umkm"
          paramName="status"
          activeValue={status.param}
          searchParams={activeParams}
          options={statusOptions(VISIBILITY_STATUS)}
        />
      </div>

      {umkm.data.length > 0 ? (
        <>
          <ul className="flex flex-col gap-3">
            {umkm.data.map((item) => {
              // `GET /umkm` hanya menyertakan `_count`, bukan gambarnya, jadi
              // daftar ini memang tidak menampilkan foto — satu permintaan per
              // baris hanya untuk thumbnail tidak sepadan.
              const imageCount = item._count?.images ?? 0;

              return (
                <li key={item.id}>
                  <Card interactive>
                    <CardBody className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center">
                      <span
                        aria-hidden="true"
                        className="grid size-12 shrink-0 place-items-center rounded-xl bg-surface-muted"
                      >
                        <Store className="size-5 text-muted" />
                      </span>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge tone={item.isActive ? "primary" : "neutral"}>
                            {item.isActive ? "Tampil" : "Disembunyikan"}
                          </Badge>
                          <span className="text-sm text-muted">
                            {imageCount === 0 ? "belum ada gambar" : `${imageCount} gambar`}
                          </span>
                        </div>

                        <p className="mt-1 font-medium text-pretty">{item.name}</p>
                        {item.address ? (
                          <p className="text-sm text-muted text-pretty">{item.address}</p>
                        ) : null}
                      </div>

                      <div className="flex shrink-0 flex-wrap gap-1">
                        {item.isActive ? (
                          <Link
                            href={`/umkm/${item.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex min-h-11 items-center gap-2 rounded-xl px-3 text-muted transition-colors hover:bg-surface-muted"
                          >
                            <ExternalLink className="size-4" aria-hidden="true" />
                            <span className="sr-only lg:not-sr-only">Lihat</span>
                          </Link>
                        ) : null}

                        <Link
                          href={`/admin/umkm/${item.slug}`}
                          className="inline-flex min-h-11 items-center gap-2 rounded-xl px-3 transition-colors hover:bg-surface-muted"
                        >
                          <PenSquare className="size-4" aria-hidden="true" />
                          Kelola
                        </Link>
                      </div>
                    </CardBody>
                  </Card>
                </li>
              );
            })}
          </ul>

          <Pagination meta={umkm.meta} basePath="/admin/umkm" searchParams={activeParams} />
        </>
      ) : (
        <EmptyState
          title={
            search
              ? `Tidak ada UMKM untuk "${search}"`
              : status.param
                ? "Tidak ada UMKM yang cocok"
                : "Belum ada UMKM"
          }
          description={
            search || status.param
              ? "Coba ubah kata kunci atau saringannya."
              : "Tambahkan usaha warga pertama ke portal."
          }
        />
      )}
    </div>
  );
}
