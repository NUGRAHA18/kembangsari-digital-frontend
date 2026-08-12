import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, Home, PenSquare, Plus } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { FilterChips } from "@/components/ui/filter-chips";
import { Pagination } from "@/components/ui/pagination";
import { SearchInput } from "@/components/ui/search-input";
import { EmptyState } from "@/components/ui/states";
import { readStatus, statusOptions, VISIBILITY_STATUS } from "@/features/admin/status-filter";
import { compareArea, houseTally } from "@/features/house/house";
import { fetchAsAdmin } from "@/lib/admin-fetch";
import { formatDate, googleMapsPointLink } from "@/lib/format";
import { readPage, readParam, type RawSearchParams } from "@/lib/page-params";
import { requireSession } from "@/lib/session";
import { getAllHouses } from "@/services/house";

export const metadata: Metadata = { title: "Rumah Warga" };

const PER_PAGE = 20;

const MESSAGES: Record<string, string> = {
  dibuat: "Rumah berhasil ditambahkan.",
  diperbarui: "Perubahan rumah berhasil disimpan.",
  dihapus: "Rumah berhasil dihapus beserta KK dan penghuninya.",
};

export default async function AdminHousePage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const { token } = await requireSession();
  const params = await searchParams;

  const page = readPage(params);
  const search = readParam(params, "search");
  const rt = readParam(params, "rt");
  const status = readStatus(params, VISIBILITY_STATUS);
  const message = MESSAGES[readParam(params, "pesan") ?? ""];

  const houses = await fetchAsAdmin(
    getAllHouses({ page, limit: PER_PAGE, search, rt, isActive: status.value }, token),
  );

  // Saringan RT disusun dari halaman yang sedang tampil, bukan dari daftar
  // tetap: RT-nya adalah data, bukan enum, dan padukuhan lain bisa memakai
  // penomoran yang sama sekali berbeda.
  const rtOptions = [...new Set(houses.data.map((house) => house.rt))].sort(compareArea);

  const activeParams = {
    search,
    rt,
    status: status.param,
    page: page > 1 ? String(page) : undefined,
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Rumah Warga</h1>
          <p className="mt-1 text-muted text-pretty">
            {status.value === undefined
              ? `${houses.meta.total} rumah terdata, termasuk yang tidak ditampilkan di peta warga.`
              : `${houses.meta.total} rumah ${status.value ? "yang tampil di peta warga" : "yang disembunyikan"}.`}
          </p>
        </div>

        <ButtonLink href="/admin/rumah/baru">
          <Plus className="size-5" aria-hidden="true" />
          Tambah Rumah
        </ButtonLink>
      </div>

      {message ? <Alert tone="success">{message}</Alert> : null}

      <div className="flex flex-col gap-4">
        <SearchInput
          action="/admin/rumah"
          defaultValue={search}
          placeholder="Cari nama rumah, alamat, atau nama penghuni…"
          label="Cari rumah warga"
          hiddenFields={{ rt, status: status.param }}
        />

        {/* Pencarian di sini ikut mencocokkan nama penghuni, bukan hanya kolom
            rumahnya — itu sebabnya tidak ada kotak pencarian terpisah untuk
            warga. */}
        <p className="text-sm text-muted text-pretty">
          Pencarian juga menjangkau nama penghuni, jadi mengetik nama seorang warga akan menemukan
          rumahnya.
        </p>

        <FilterChips
          label="Status rumah"
          basePath="/admin/rumah"
          paramName="status"
          activeValue={status.param}
          searchParams={activeParams}
          options={statusOptions(VISIBILITY_STATUS)}
        />

        {rtOptions.length > 1 || rt ? (
          <FilterChips
            label="RT"
            basePath="/admin/rumah"
            paramName="rt"
            activeValue={rt}
            searchParams={activeParams}
            options={[
              { label: "Semua RT" },
              ...rtOptions.map((value) => ({ value, label: `RT ${value}` })),
            ]}
          />
        ) : null}
      </div>

      {houses.data.length > 0 ? (
        <>
          <ul className="flex flex-col gap-3">
            {houses.data.map((house) => (
              <li key={house.id}>
                <Card>
                  <CardBody className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center">
                    <span
                      aria-hidden="true"
                      className="grid size-12 shrink-0 place-items-center rounded-xl bg-surface-muted"
                    >
                      <Home className="size-5 text-muted" />
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge tone={house.isActive ? "primary" : "neutral"}>
                          {house.isActive ? "Tampil" : "Disembunyikan"}
                        </Badge>
                        <span className="text-sm text-muted">
                          RT {house.rt} / RW {house.rw}
                        </span>
                        <span className="text-sm text-muted">{houseTally(house)}</span>
                      </div>

                      <p className="mt-1 font-medium text-pretty">{house.label}</p>
                      {house.address ? (
                        <p className="text-sm text-muted text-pretty">{house.address}</p>
                      ) : null}
                      <p className="text-sm text-muted">
                        {house.dataVerifiedAt
                          ? `Data diverifikasi ${formatDate(house.dataVerifiedAt)}`
                          : "Belum pernah diverifikasi pendata"}
                      </p>
                    </div>

                    <div className="flex shrink-0 flex-wrap gap-1">
                      <Link
                        href={googleMapsPointLink(house.latitude, house.longitude)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-11 items-center gap-2 rounded-xl px-3 text-muted transition-colors hover:bg-surface-muted"
                      >
                        <ExternalLink className="size-4" aria-hidden="true" />
                        <span className="sr-only lg:not-sr-only">Periksa titik</span>
                      </Link>

                      <Link
                        href={`/admin/rumah/${house.id}`}
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

          <Pagination meta={houses.meta} basePath="/admin/rumah" searchParams={activeParams} />
        </>
      ) : (
        <EmptyState
          title={
            search
              ? `Tidak ada rumah untuk "${search}"`
              : status.param || rt
                ? "Tidak ada rumah yang cocok"
                : "Belum ada rumah terdata"
          }
          description={
            search || status.param || rt
              ? "Coba ubah kata kunci atau saringannya."
              : "Tambahkan rumah pertama, lalu isi kartu keluarga dan penghuninya."
          }
        />
      )}
    </div>
  );
}
