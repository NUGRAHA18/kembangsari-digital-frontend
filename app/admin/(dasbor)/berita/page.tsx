import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, PenSquare, Plus, Trash2 } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { FilterChips } from "@/components/ui/filter-chips";
import { Pagination } from "@/components/ui/pagination";
import { SearchInput } from "@/components/ui/search-input";
import { EmptyState, ErrorState } from "@/components/ui/states";
import { PUBLISH_STATUS, readStatus, statusOptions } from "@/features/admin/status-filter";
import { safeFetch } from "@/lib/api";
import { fetchAsAdmin } from "@/lib/admin-fetch";
import { formatDateShort } from "@/lib/format";
import { readPage, readParam, type RawSearchParams } from "@/lib/page-params";
import { requireSession } from "@/lib/session";
import { getAllNews, getNewsCategories } from "@/services/news";

export const metadata: Metadata = { title: "Berita" };

const PER_PAGE = 20;

const MESSAGES: Record<string, string> = {
  dibuat: "Berita berhasil disimpan.",
  diperbarui: "Perubahan berita berhasil disimpan.",
  dihapus: "Berita berhasil dihapus.",
};

export default async function AdminNewsPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const { token } = await requireSession();
  const params = await searchParams;

  const page = readPage(params);
  const search = readParam(params, "search");
  const categorySlug = readParam(params, "kategori");
  const status = readStatus(params, PUBLISH_STATUS);
  const message = MESSAGES[readParam(params, "pesan") ?? ""];

  const categories = await safeFetch(getNewsCategories());
  const activeCategory = (categories.data ?? []).find((item) => item.slug === categorySlug);

  const news = await fetchAsAdmin(
    getAllNews(
      {
        page,
        limit: PER_PAGE,
        search,
        categoryId: activeCategory?.id,
        published: status.value,
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
          <h1 className="text-2xl font-bold tracking-tight">Berita</h1>
          <p className="mt-1 text-muted">
            {status.value === undefined
              ? `${news.meta.total} berita, termasuk draf yang belum terlihat warga.`
              : `${news.meta.total} berita ${status.value ? "terbit" : "berupa draf"}.`}
          </p>
        </div>

        <ButtonLink href="/admin/berita/baru">
          <Plus className="size-5" aria-hidden="true" />
          Tulis Berita
        </ButtonLink>
      </div>

      {message ? <Alert tone="success">{message}</Alert> : null}

      <div className="flex flex-col gap-4">
        <SearchInput
          action="/admin/berita"
          defaultValue={search}
          placeholder="Cari judul atau isi berita…"
          label="Cari berita"
          hiddenFields={{ kategori: activeCategory?.slug, status: status.param }}
        />

        {/* Saringan status menyaring di backend, bukan di sini — jadi
            `meta.total` dan jumlah halamannya ikut menyesuaikan. */}
        <FilterChips
          label="Status berita"
          basePath="/admin/berita"
          paramName="status"
          activeValue={status.param}
          searchParams={activeParams}
          options={statusOptions(PUBLISH_STATUS)}
        />

        {categories.data && categories.data.length > 0 ? (
          <FilterChips
            label="Kategori berita"
            basePath="/admin/berita"
            paramName="kategori"
            activeValue={activeCategory?.slug}
            searchParams={activeParams}
            options={[
              { label: "Semua" },
              ...categories.data.map((item) => ({ value: item.slug, label: item.name })),
            ]}
          />
        ) : null}
      </div>

      {categories.error ? (
        <ErrorState
          title="Kategori gagal dimuat"
          message="Filter kategori tidak tersedia untuk sementara."
        />
      ) : null}

      {news.data.length > 0 ? (
        <>
          <ul className="flex flex-col gap-3">
            {news.data.map((item) => (
              <li key={item.id}>
                <Card>
                  <CardBody className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge tone={item.published ? "primary" : "neutral"}>
                          {item.published ? "Terbit" : "Draf"}
                        </Badge>
                        {item.category ? (
                          <span className="text-sm text-muted">{item.category.name}</span>
                        ) : null}
                        <span className="text-sm text-muted">
                          Diperbarui {formatDateShort(item.updatedAt)}
                        </span>
                      </div>

                      <p className="mt-1 font-medium text-pretty">{item.title}</p>
                    </div>

                    <div className="flex shrink-0 flex-wrap gap-1">
                      {item.published ? (
                        <Link
                          href={`/berita/${item.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex min-h-11 items-center gap-2 rounded-xl px-3 text-muted transition-colors hover:bg-surface-muted"
                        >
                          <ExternalLink className="size-4" aria-hidden="true" />
                          <span className="sr-only lg:not-sr-only">Lihat</span>
                        </Link>
                      ) : null}

                      <Link
                        href={`/admin/berita/${item.slug}`}
                        className="inline-flex min-h-11 items-center gap-2 rounded-xl px-3 transition-colors hover:bg-surface-muted"
                      >
                        <PenSquare className="size-4" aria-hidden="true" />
                        Ubah
                      </Link>

                      <Link
                        href={`/admin/berita/${item.slug}/hapus`}
                        className="inline-flex min-h-11 items-center gap-2 rounded-xl px-3 text-error transition-colors hover:bg-error/10"
                      >
                        <Trash2 className="size-4" aria-hidden="true" />
                        <span className="sr-only lg:not-sr-only">Hapus</span>
                      </Link>
                    </div>
                  </CardBody>
                </Card>
              </li>
            ))}
          </ul>

          <Pagination meta={news.meta} basePath="/admin/berita" searchParams={activeParams} />
        </>
      ) : (
        <EmptyState
          title={
            search
              ? `Tidak ada berita untuk "${search}"`
              : status.param || activeCategory
                ? "Tidak ada berita yang cocok"
                : "Belum ada berita"
          }
          description={
            search || status.param || activeCategory
              ? "Coba ubah kata kunci atau saringannya."
              : "Mulai dengan menulis berita pertama."
          }
        />
      )}
    </div>
  );
}
