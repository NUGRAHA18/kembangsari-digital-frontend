import type { Metadata } from "next";
import { Eye, EyeOff, MapPin, Plus, Tags } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { ButtonLink } from "@/components/ui/button";
import { FilterChips } from "@/components/ui/filter-chips";
import { Pagination } from "@/components/ui/pagination";
import { SearchInput } from "@/components/ui/search-input";
import { EmptyState, ErrorState } from "@/components/ui/states";
import { MapPreviewPanel } from "@/features/admin/map-preview-panel";
import { MarkerCard } from "@/features/admin/marker-card";
import { PageHero } from "@/features/admin/page-hero";
import { StatTiles } from "@/features/admin/stat-tiles";
import { readStatus, statusOptions, VISIBILITY_STATUS } from "@/features/admin/status-filter";
import { safeFetch } from "@/lib/api";
import { fetchAsAdmin } from "@/lib/admin-fetch";
import { readPage, readParam, type RawSearchParams } from "@/lib/page-params";
import { requireSession } from "@/lib/session";
import { getAllMarkers, getMapCategoriesUncached } from "@/services/maps";
import { getMapView, getSettingsMap } from "@/services/settings";

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

  // Angka ringkasan menghitung seluruh titik, bukan yang sedang tersaring —
  // `markers.meta.total` di atas sudah ikut saringan. Dua permintaan `limit=1`
  // sudah cukup: yang diambil hanya `meta.total`, isinya tidak diunduh. Yang
  // disembunyikan dihitung sebagai selisih, jadi tidak perlu permintaan ketiga.
  //
  // `safeFetch`, bukan `fetchAsAdmin`: kartu angka yang gagal dimuat menampilkan
  // "—" dan halamannya tetap berguna. Sesi yang kedaluwarsa tetap tertangkap,
  // karena daftar utamanya di atas memakai `fetchAsAdmin`.
  const [allCount, visibleCount, settings] = await Promise.all([
    safeFetch(getAllMarkers({ page: 1, limit: 1 }, token)),
    safeFetch(getAllMarkers({ page: 1, limit: 1, isActive: true }, token)),
    getSettingsMap(),
  ]);

  const total = allCount.data?.meta.total ?? null;
  const visible = visibleCount.data?.meta.total ?? null;
  const hidden = total !== null && visible !== null ? total - visible : null;

  const categoryIds = (categories.data ?? []).map((category) => category.id);
  const mapView = getMapView(settings);

  const activeParams = {
    search,
    kategori: activeCategory?.slug,
    status: status.param,
    page: page > 1 ? String(page) : undefined,
  };

  const isFiltered = Boolean(search || status.param || activeCategory);

  return (
    <div className="flex flex-col gap-6">
      <PageHero
        title="Peta Lokasi"
        description="Kelola titik penting Padukuhan Kembangsari — fasilitas umum, rumah perangkat, dan lokasi layanan."
      >
        <ButtonLink href="/admin/peta/baru">
          <Plus className="size-5" aria-hidden="true" />
          Tambah Lokasi
        </ButtonLink>

        <ButtonLink href="/admin/peta/kategori" variant="outline-primary">
          <Tags className="size-5" aria-hidden="true" />
          Kategori Lokasi
        </ButtonLink>
      </PageHero>

      {message ? <Alert tone="success">{message}</Alert> : null}

      {/* Urutan di ponsel mengikuti §24: judul, aksi, pencarian, saringan,
          angka, daftar, lalu peta. */}
      <SearchInput
        action="/admin/peta"
        defaultValue={search}
        placeholder="Cari nama atau alamat lokasi…"
        label="Cari titik lokasi"
        hiddenFields={{ kategori: activeCategory?.slug, status: status.param }}
      />

      <div className="flex flex-col gap-3">
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

      <StatTiles
        tiles={[
          { label: "Total lokasi", value: total, unit: "titik", tone: "primary", Icon: MapPin },
          { label: "Ditampilkan", value: visible, unit: "di peta warga", tone: "info", Icon: Eye },
          {
            label: "Disembunyikan",
            value: hidden,
            unit: "belum tampil",
            tone: "neutral",
            Icon: EyeOff,
          },
          {
            label: "Kategori",
            value: categories.data?.length ?? null,
            unit: "kelompok",
            tone: "secondary",
            Icon: Tags,
          },
        ]}
      />

      {markers.data.length > 0 ? (
        // 3:2 — daftar 60%, pratinjau 40%, di dalam rentang §12. Peta menempel
        // saat daftarnya digulir, jadi keduanya tetap terbaca bersamaan.
        <div className="grid gap-6 lg:grid-cols-5">
          <div className="flex flex-col gap-3 lg:col-span-3">
            <ul className="flex flex-col gap-3">
              {markers.data.map((marker) => (
                <li key={marker.id}>
                  <MarkerCard marker={marker} categoryIds={categoryIds} />
                </li>
              ))}
            </ul>

            <Pagination meta={markers.meta} basePath="/admin/peta" searchParams={activeParams} />
          </div>

          <div className="lg:col-span-2">
            <div className="lg:sticky lg:top-24">
              <MapPreviewPanel
                markers={markers.data}
                categoryIds={categoryIds}
                center={mapView.center}
                zoom={mapView.zoom}
              />
            </div>
          </div>
        </div>
      ) : (
        <EmptyState
          title={
            search
              ? `Tidak ada lokasi untuk "${search}"`
              : isFiltered
                ? "Tidak ada lokasi yang cocok"
                : "Belum ada titik lokasi"
          }
          description={
            isFiltered
              ? "Coba ubah kata kunci atau saringannya."
              : "Tambahkan fasilitas umum atau titik penting yang pertama, misalnya balai padukuhan atau posyandu."
          }
        >
          {isFiltered ? (
            <ButtonLink href="/admin/peta" variant="outline">
              Hapus semua saringan
            </ButtonLink>
          ) : (
            <ButtonLink href="/admin/peta/baru">
              <Plus className="size-5" aria-hidden="true" />
              Tambah Lokasi
            </ButtonLink>
          )}
        </EmptyState>
      )}
    </div>
  );
}
