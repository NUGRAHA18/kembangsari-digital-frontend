import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, PenSquare, Plus, Sprout } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { FilterChips } from "@/components/ui/filter-chips";
import { Pagination } from "@/components/ui/pagination";
import { SearchInput } from "@/components/ui/search-input";
import { EmptyState } from "@/components/ui/states";
import {
  POTENTIAL_CATEGORIES,
  potentialCategorySlug,
  readPotentialCategory,
} from "@/features/potential/categories";
import { fetchAsAdmin } from "@/lib/admin-fetch";
import { humanizeEnum } from "@/lib/format";
import { readPage, readParam, type RawSearchParams } from "@/lib/page-params";
import { requireSession } from "@/lib/session";
import { getAllPotentials } from "@/services/potential";

export const metadata: Metadata = { title: "Potensi" };

const PER_PAGE = 20;

const MESSAGES: Record<string, string> = {
  dihapus: "Potensi beserta gambarnya berhasil dihapus.",
};

export default async function AdminPotentialPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const { token } = await requireSession();
  const params = await searchParams;

  const page = readPage(params);
  const search = readParam(params, "search");
  // Kategori yang tidak dikenal dijawab backend 400, jadi nilai dari query
  // string diterjemahkan dulu ke enum yang sah — sama seperti halaman publik.
  const category = readPotentialCategory(readParam(params, "kategori"));
  const message = MESSAGES[readParam(params, "pesan") ?? ""];

  const potentials = await fetchAsAdmin(
    getAllPotentials({ page, limit: PER_PAGE, search, category }, token),
  );

  const activeParams = {
    search,
    kategori: category ? potentialCategorySlug(category) : undefined,
    page: page > 1 ? String(page) : undefined,
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Potensi</h1>
          <p className="mt-1 text-muted">
            {potentials.meta.total} potensi padukuhan, termasuk yang tidak ditampilkan.
          </p>
        </div>

        <ButtonLink href="/admin/potensi/baru">
          <Plus className="size-5" aria-hidden="true" />
          Tambah Potensi
        </ButtonLink>
      </div>

      {message ? <Alert tone="success">{message}</Alert> : null}

      <div className="flex flex-col gap-4">
        <SearchInput
          action="/admin/potensi"
          defaultValue={search}
          placeholder="Cari nama atau deskripsi potensi…"
          label="Cari potensi"
          hiddenFields={{ kategori: activeParams.kategori }}
        />

        <FilterChips
          label="Kategori potensi"
          basePath="/admin/potensi"
          paramName="kategori"
          activeValue={activeParams.kategori}
          searchParams={activeParams}
          options={[
            { label: "Semua" },
            ...POTENTIAL_CATEGORIES.map((item) => ({
              value: potentialCategorySlug(item),
              label: humanizeEnum(item),
            })),
          ]}
        />
      </div>

      {potentials.data.length > 0 ? (
        <>
          <ul className="flex flex-col gap-3">
            {potentials.data.map((item) => {
              // `GET /potential` hanya menyertakan `_count`, bukan gambarnya —
              // sama seperti daftar UMKM.
              const imageCount = item._count?.images ?? 0;

              return (
                <li key={item.id}>
                  <Card>
                    <CardBody className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center">
                      <span
                        aria-hidden="true"
                        className="grid size-12 shrink-0 place-items-center rounded-xl bg-surface-muted"
                      >
                        <Sprout className="size-5 text-muted" />
                      </span>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge tone={item.isActive ? "primary" : "neutral"}>
                            {item.isActive ? "Tampil" : "Disembunyikan"}
                          </Badge>
                          <span className="text-sm text-muted">
                            {humanizeEnum(item.category)}
                          </span>
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
                            href={`/potensi/${item.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex min-h-11 items-center gap-2 rounded-xl px-3 text-muted transition-colors hover:bg-surface-muted"
                          >
                            <ExternalLink className="size-4" aria-hidden="true" />
                            <span className="sr-only lg:not-sr-only">Lihat</span>
                          </Link>
                        ) : null}

                        <Link
                          href={`/admin/potensi/${item.slug}`}
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

          <Pagination
            meta={potentials.meta}
            basePath="/admin/potensi"
            searchParams={activeParams}
          />
        </>
      ) : (
        <EmptyState
          title={search ? `Tidak ada potensi untuk "${search}"` : "Belum ada potensi"}
          description={
            search ? "Coba kata kunci lain." : "Tambahkan potensi padukuhan yang pertama."
          }
        />
      )}
    </div>
  );
}
