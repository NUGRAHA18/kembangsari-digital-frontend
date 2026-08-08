import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, MapPin, PenSquare, Plus, Tags } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { FilterChips } from "@/components/ui/filter-chips";
import { Pagination } from "@/components/ui/pagination";
import { SearchInput } from "@/components/ui/search-input";
import { EmptyState, ErrorState } from "@/components/ui/states";
import { readStatus, statusOptions, VISIBILITY_STATUS } from "@/features/admin/status-filter";
import { safeFetch } from "@/lib/api";
import { fetchAsAdmin } from "@/lib/admin-fetch";
import { googleMapsPointLink } from "@/lib/format";
import { readPage, readParam, type RawSearchParams } from "@/lib/page-params";
import { requireSession } from "@/lib/session";
import { getAllMarkers, getMapCategoriesUncached } from "@/services/maps";

export const metadata: Metadata = { title: "Peta" };

const PER_PAGE = 20;

const MESSAGES: Record<string, string> = {
  dibuat: "Titik lokasi berhasil ditambahkan.",
  diperbarui: "Perubahan titik lokasi berhasil disimpan.",
  dihapus: "Titik lokasi berhasil dihapus.",
};

export default async function AdminMapPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const { token } = await requireSession();
  const params = await searchParams;

  const page = readPage(params);
  const search = readParam(params, "search");
  const categorySlug = readParam(params, "kategori");
  const status = readStatus(params, VISIBILITY_STATUS);
  const message = MESSAGES[readParam(params, "pesan") ?? ""];

  // Kategori disaring lewat id, tetapi alamat halamannya memakai slug — sama
  // seperti daftar berita, supaya URL-nya tetap terbaca saat dibagikan.
  const categories = await safeFetch(getMapCategoriesUncached());
  const activeCategory = (categories.data ?? []).find((item) => item.slug === categorySlug);

  const markers = await fetchAsAdmin(
    getAllMarkers(
      {
        page,
        limit: PER_PAGE,
        search,
        categoryId: activeCategory?.id,
        isActive: status.value,
      },
      token,
    ),
  );

  const activeParams = {
    search,
    kategori: activeCategory?.slug,
    status: status.param,
    page: page > 1 ? String(page) : undefined,
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Peta</h1>
          <p className="mt-1 text-muted text-pretty">
            {status.value === undefined
              ? `${markers.meta.total} titik lokasi, termasuk yang tidak ditampilkan di peta warga.`
              : `${markers.meta.total} titik lokasi ${status.value ? "yang tampil di peta warga" : "yang disembunyikan"}.`}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/peta/kategori"
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border px-4 transition-colors hover:bg-surface-muted"
          >
            <Tags className="size-5" aria-hidden="true" />
            Kategori
          </Link>

          <ButtonLink href="/admin/peta/baru">
            <Plus className="size-5" aria-hidden="true" />
            Tambah Lokasi
          </ButtonLink>
        </div>
      </div>

      {message ? <Alert tone="success">{message}</Alert> : null}

      <div className="flex flex-col gap-4">
        <SearchInput
          action="/admin/peta"
          defaultValue={search}
          placeholder="Cari nama atau alamat lokasi…"
          label="Cari titik lokasi"
          hiddenFields={{ kategori: activeCategory?.slug, status: status.param }}
        />

        <FilterChips
          label="Status titik lokasi"
          basePath="/admin/peta"
          paramName="status"
          activeValue={status.param}
          searchParams={activeParams}
          options={statusOptions(VISIBILITY_STATUS)}
        />

        {/* Saringan kategori memakai `?categoryId=` di daftar utama, bukan
            `/maps/marker/category/:id` — hanya yang pertama bisa digabung
            dengan saringan status. */}
        {categories.data && categories.data.length > 0 ? (
          <FilterChips
            label="Kategori lokasi"
            basePath="/admin/peta"
            paramName="kategori"
            activeValue={activeCategory?.slug}
            searchParams={activeParams}
            options={[
              { label: "Semua" },
              ...categories.data.map((item) => ({
                value: item.slug,
                label: item.name,
                count: item._count?.markers,
              })),
            ]}
          />
        ) : null}
      </div>

      {categories.error ? (
        <ErrorState
          title="Kategori gagal dimuat"
          message="Saringan kategori tidak tersedia untuk sementara."
        />
      ) : null}

      {markers.data.length > 0 ? (
        <>
          <ul className="flex flex-col gap-3">
            {markers.data.map((marker) => (
              <li key={marker.id}>
                <Card>
                  <CardBody className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center">
                    <span
                      aria-hidden="true"
                      className="grid size-12 shrink-0 place-items-center rounded-xl bg-surface-muted"
                    >
                      <MapPin className="size-5 text-muted" />
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge tone={marker.isActive ? "primary" : "neutral"}>
                          {marker.isActive ? "Tampil" : "Disembunyikan"}
                        </Badge>
                        {/* `category` selalu disertakan backend, tetapi kartu
                            ini tetap bertahan kalau suatu saat tidak. */}
                        <span className="text-sm text-muted">
                          {marker.category?.name ?? "Tanpa kategori"}
                        </span>
                      </div>

                      <p className="mt-1 font-medium text-pretty">{marker.name}</p>
                      {marker.address ? (
                        <p className="text-sm text-muted text-pretty">{marker.address}</p>
                      ) : null}
                      <p className="text-sm text-muted">
                        {marker.latitude}, {marker.longitude}
                      </p>
                    </div>

                    <div className="flex shrink-0 flex-wrap gap-1">
                      <Link
                        href={googleMapsPointLink(marker.latitude, marker.longitude)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-11 items-center gap-2 rounded-xl px-3 text-muted transition-colors hover:bg-surface-muted"
                      >
                        <ExternalLink className="size-4" aria-hidden="true" />
                        <span className="sr-only lg:not-sr-only">Periksa titik</span>
                      </Link>

                      <Link
                        href={`/admin/peta/${marker.id}`}
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

          <Pagination meta={markers.meta} basePath="/admin/peta" searchParams={activeParams} />
        </>
      ) : (
        <EmptyState
          title={
            search
              ? `Tidak ada lokasi untuk "${search}"`
              : status.param || activeCategory
                ? "Tidak ada lokasi yang cocok"
                : "Belum ada titik lokasi"
          }
          description={
            search || status.param || activeCategory
              ? "Coba ubah kata kunci atau saringannya."
              : "Tambahkan fasilitas umum atau titik penting yang pertama."
          }
        />
      )}
    </div>
  );
}
