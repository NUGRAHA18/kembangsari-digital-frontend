import type { Metadata } from "next";
import Link from "next/link";
import { PenSquare, Plus, Trash2 } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";
import { SearchInput } from "@/components/ui/search-input";
import { EmptyState } from "@/components/ui/states";
import { fetchAsAdmin } from "@/lib/admin-fetch";
import { excerpt, formatDateShort } from "@/lib/format";
import { readPage, readParam, type RawSearchParams } from "@/lib/page-params";
import { requireSession } from "@/lib/session";
import { getAllAnnouncements } from "@/services/announcement";

export const metadata: Metadata = { title: "Pengumuman" };

const PER_PAGE = 20;

const MESSAGES: Record<string, string> = {
  dibuat: "Pengumuman berhasil disimpan.",
  diperbarui: "Perubahan pengumuman berhasil disimpan.",
  dihapus: "Pengumuman berhasil dihapus.",
};

export default async function AdminAnnouncementPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const { token } = await requireSession();
  const params = await searchParams;

  const page = readPage(params);
  const search = readParam(params, "search");
  const message = MESSAGES[readParam(params, "pesan") ?? ""];

  const announcements = await fetchAsAdmin(
    getAllAnnouncements({ page, limit: PER_PAGE, search }, token),
  );

  const activeParams = { search, page: page > 1 ? String(page) : undefined };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Pengumuman</h1>
          <p className="mt-1 text-muted">
            {announcements.meta.total} pengumuman, termasuk yang tidak ditampilkan.
          </p>
        </div>

        <ButtonLink href="/admin/pengumuman/baru">
          <Plus className="size-5" aria-hidden="true" />
          Tulis Pengumuman
        </ButtonLink>
      </div>

      {message ? <Alert tone="success">{message}</Alert> : null}

      <SearchInput
        action="/admin/pengumuman"
        defaultValue={search}
        placeholder="Cari judul atau isi pengumuman…"
        label="Cari pengumuman"
      />

      {announcements.data.length > 0 ? (
        <>
          <ul className="flex flex-col gap-3">
            {announcements.data.map((item) => (
              <li key={item.id}>
                <Card>
                  <CardBody className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge tone={item.isActive ? "primary" : "neutral"}>
                          {item.isActive ? "Tampil" : "Disembunyikan"}
                        </Badge>
                        <span className="text-sm text-muted">
                          Diperbarui {formatDateShort(item.updatedAt)}
                        </span>
                      </div>

                      <p className="mt-1 font-medium text-pretty">{item.title}</p>
                      <p className="mt-0.5 text-sm text-muted text-pretty">
                        {excerpt(item.content, 120)}
                      </p>
                    </div>

                    <div className="flex shrink-0 flex-wrap gap-1">
                      <Link
                        href={`/admin/pengumuman/${item.id}`}
                        className="inline-flex min-h-11 items-center gap-2 rounded-xl px-3 transition-colors hover:bg-surface-muted"
                      >
                        <PenSquare className="size-4" aria-hidden="true" />
                        Ubah
                      </Link>

                      <Link
                        href={`/admin/pengumuman/${item.id}/hapus`}
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

          <Pagination
            meta={announcements.meta}
            basePath="/admin/pengumuman"
            searchParams={activeParams}
          />
        </>
      ) : (
        <EmptyState
          title={search ? `Tidak ada pengumuman untuk "${search}"` : "Belum ada pengumuman"}
          description={
            search
              ? "Coba kata kunci lain."
              : "Pengumuman yang aktif akan tampil di beranda portal warga."
          }
        />
      )}
    </div>
  );
}
