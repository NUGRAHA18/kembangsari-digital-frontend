import type { Metadata } from "next";
import Link from "next/link";
import { PenSquare, Plus, ShieldCheck, Trash2, UserRound, Users } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { FilterChips } from "@/components/ui/filter-chips";
import { Pagination } from "@/components/ui/pagination";
import { SearchInput } from "@/components/ui/search-input";
import { EmptyState } from "@/components/ui/states";
import { PageHero } from "@/features/admin/page-hero";
import { ROLE_LABELS, isRole } from "@/features/admin/roles";
import { StatTiles } from "@/features/admin/stat-tiles";
import { safeFetch } from "@/lib/api";
import { fetchAsAdmin } from "@/lib/admin-fetch";
import { formatDateShort } from "@/lib/format";
import { readPage, readParam, type RawSearchParams } from "@/lib/page-params";
import { requireAdmin } from "@/lib/session";
import { getUsers } from "@/services/user";

export const metadata: Metadata = { title: "Pengelola" };

const PER_PAGE = 20;

const MESSAGES: Record<string, string> = {
  dibuat: "Pengelola berhasil ditambahkan.",
  diperbarui: "Perubahan pengelola berhasil disimpan.",
  dihapus: "Pengelola berhasil dihapus.",
};

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  // Hanya ADMIN. Backend tetap menjaganya sendiri dengan `403`; ini supaya
  // EDITOR yang mengetik alamatnya mendapat kalimat, bukan halaman yang gagal
  // di setiap tombol.
  const { token, user: sesi } = await requireAdmin();
  const params = await searchParams;

  const page = readPage(params);
  const search = readParam(params, "search");
  const roleParam = readParam(params, "peran");
  const role = roleParam && isRole(roleParam) ? roleParam : undefined;
  const message = MESSAGES[readParam(params, "pesan") ?? ""];
  // Penolakan yang disengaja backend dibawa ke sini lewat alamat, karena
  // halaman konfirmasi hapus tidak punya state sendiri.
  const failure = readParam(params, "galat");

  const users = await fetchAsAdmin(
    getUsers({ page, limit: PER_PAGE, search, role }, token),
  );

  // Angka ringkasan menghitung seluruhnya, bukan yang sedang tersaring.
  // `limit=1` sudah cukup: yang diambil hanya `meta.total`.
  const [semua, adminCount] = await Promise.all([
    safeFetch(getUsers({ page: 1, limit: 1 }, token)),
    safeFetch(getUsers({ page: 1, limit: 1, role: "ADMIN" }, token)),
  ]);

  const total = semua.data?.meta.total ?? null;
  const admins = adminCount.data?.meta.total ?? null;
  const editors = total !== null && admins !== null ? total - admins : null;

  const activeParams = {
    search,
    peran: role,
    page: page > 1 ? String(page) : undefined,
  };

  const isFiltered = Boolean(search || role);

  return (
    <div className="flex flex-col gap-6">
      <PageHero
        title="Pengelola"
        description="Siapa saja yang boleh masuk ke dashboard ini, dan sejauh apa kewenangannya."
      >
        <ButtonLink href="/admin/pengelola/baru">
          <Plus className="size-5" aria-hidden="true" />
          Tambah Pengelola
        </ButtonLink>
      </PageHero>

      {message ? <Alert tone="success">{message}</Alert> : null}
      {failure ? <Alert tone="error">{failure}</Alert> : null}

      <SearchInput
        action="/admin/pengelola"
        defaultValue={search}
        placeholder="Cari nama atau email…"
        label="Cari pengelola"
        hiddenFields={{ peran: role }}
      />

      <FilterChips
        label="Peran pengelola"
        basePath="/admin/pengelola"
        paramName="peran"
        activeValue={role}
        searchParams={activeParams}
        options={[
          { label: "Semua" },
          { value: "ADMIN", label: ROLE_LABELS.ADMIN },
          { value: "EDITOR", label: ROLE_LABELS.EDITOR },
        ]}
      />

      <StatTiles
        tiles={[
          { label: "Total pengelola", value: total, unit: "akun", tone: "primary", Icon: Users },
          { label: "Admin", value: admins, unit: "kewenangan penuh", tone: "info", Icon: ShieldCheck },
          { label: "Editor", value: editors, unit: "hanya isi konten", tone: "neutral", Icon: UserRound },
        ]}
      />

      {users.data.length > 0 ? (
        <>
          <ul className="flex flex-col gap-3">
            {users.data.map((item) => {
              // Baris milik diri sendiri tidak diberi tombol hapus maupun ubah
              // peran. Backend menolak keduanya, tetapi tombol yang selalu
              // gagal saat diklik bukan pengalaman yang baik.
              const diriSendiri = item.id === sesi.id;

              return (
                <li key={item.id}>
                  <Card interactive>
                    <CardBody className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center">
                      <span
                        aria-hidden="true"
                        className="grid size-11 shrink-0 place-items-center rounded-xl bg-surface-muted"
                      >
                        {item.role === "ADMIN" ? (
                          <ShieldCheck className="size-5 text-muted" />
                        ) : (
                          <UserRound className="size-5 text-muted" />
                        )}
                      </span>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium text-pretty">{item.name}</p>
                          <Badge tone={item.role === "ADMIN" ? "primary" : "neutral"}>
                            {ROLE_LABELS[item.role]}
                          </Badge>
                          {diriSendiri ? <Badge tone="secondary">Anda</Badge> : null}
                        </div>
                        <p className="mt-0.5 text-sm break-all text-muted">{item.email}</p>
                        <p className="text-sm text-muted">
                          Bergabung {formatDateShort(item.createdAt)}
                        </p>
                      </div>

                      <div className="flex shrink-0 flex-wrap gap-1">
                        <Link
                          href={`/admin/pengelola/${item.id}`}
                          className="inline-flex min-h-11 items-center gap-2 rounded-lg px-3 font-medium text-accent transition-colors hover:bg-surface-muted"
                        >
                          <PenSquare className="size-4" aria-hidden="true" />
                          Ubah
                        </Link>

                        {diriSendiri ? null : (
                          <Link
                            href={`/admin/pengelola/${item.id}/hapus`}
                            className="inline-flex min-h-11 items-center gap-2 rounded-lg px-3 text-error transition-colors hover:bg-surface-muted"
                          >
                            <Trash2 className="size-4" aria-hidden="true" />
                            Hapus
                          </Link>
                        )}
                      </div>
                    </CardBody>
                  </Card>
                </li>
              );
            })}
          </ul>

          <Pagination meta={users.meta} basePath="/admin/pengelola" searchParams={activeParams} />
        </>
      ) : (
        <EmptyState
          title={
            search ? `Tidak ada pengelola untuk "${search}"` : "Tidak ada pengelola yang cocok"
          }
          description={
            isFiltered
              ? "Coba ubah kata kunci atau saringannya."
              : "Tambahkan pengelola pertama untuk portal ini."
          }
        >
          {isFiltered ? (
            <ButtonLink href="/admin/pengelola" variant="outline">
              Hapus semua saringan
            </ButtonLink>
          ) : (
            <ButtonLink href="/admin/pengelola/baru">
              <Plus className="size-5" aria-hidden="true" />
              Tambah Pengelola
            </ButtonLink>
          )}
        </EmptyState>
      )}
    </div>
  );
}
