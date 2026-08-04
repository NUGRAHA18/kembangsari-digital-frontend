import type { Metadata } from "next";
import Link from "next/link";
import { PenSquare, Trash2 } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Card, CardBody } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/states";
import { CategoryForm } from "@/features/admin/category-form";
import { fetchAsAdmin } from "@/lib/admin-fetch";
import { readParam, type RawSearchParams } from "@/lib/page-params";
import { getNewsCategories } from "@/services/news";

export const metadata: Metadata = { title: "Kategori Berita" };

const MESSAGES: Record<string, string> = {
  dibuat: "Kategori berhasil ditambahkan.",
  diperbarui: "Perubahan kategori berhasil disimpan.",
  dihapus: "Kategori berhasil dihapus.",
};

export default async function CategoriesPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const params = await searchParams;
  const message = MESSAGES[readParam(params, "pesan") ?? ""];

  const categories = await fetchAsAdmin(getNewsCategories());

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Kategori Berita</h1>
        <p className="mt-1 text-muted text-pretty">
          Setiap berita wajib punya kategori. Kategori juga menjadi tombol filter di halaman
          berita yang dilihat warga.
        </p>
      </div>

      {message ? <Alert tone="success">{message}</Alert> : null}

      <Card>
        <CardBody className="flex flex-col gap-4">
          <h2 className="font-semibold">Tambah Kategori</h2>
          <CategoryForm />
        </CardBody>
      </Card>

      <section aria-labelledby="daftar">
        <h2 id="daftar" className="mb-3 text-xl font-semibold tracking-tight">
          {categories.length} Kategori
        </h2>

        {categories.length > 0 ? (
          <ul className="flex flex-col gap-3">
            {categories.map((category) => {
              const newsCount = category._count?.news ?? 0;

              return (
                <li key={category.id}>
                  <Card>
                    <CardBody className="flex flex-wrap items-center gap-3 p-4">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium">{category.name}</p>
                        <p className="text-sm text-muted">
                          <span className="break-all">/{category.slug}</span> ·{" "}
                          {newsCount === 0
                            ? "belum dipakai"
                            : `${newsCount} berita, termasuk draf`}
                        </p>
                      </div>

                      <div className="flex shrink-0 gap-1">
                        <Link
                          href={`/admin/kategori/${category.id}`}
                          className="inline-flex min-h-11 items-center gap-2 rounded-xl px-3 transition-colors hover:bg-surface-muted"
                        >
                          <PenSquare className="size-4" aria-hidden="true" />
                          Ubah
                        </Link>

                        {/* Kategori yang masih dipakai tidak bisa dihapus — relasi
                            berita ke kategori wajib, jadi database menolaknya.
                            Tautannya dimatikan supaya pengelola tidak sampai ke
                            halaman yang ujungnya hanya menampilkan penolakan. */}
                        {newsCount === 0 ? (
                          <Link
                            href={`/admin/kategori/${category.id}/hapus`}
                            className="inline-flex min-h-11 items-center gap-2 rounded-xl px-3 text-error transition-colors hover:bg-error/10"
                          >
                            <Trash2 className="size-4" aria-hidden="true" />
                            Hapus
                          </Link>
                        ) : (
                          <span
                            className="inline-flex min-h-11 items-center gap-2 rounded-xl px-3 text-muted"
                            title="Masih dipakai berita, jadi belum bisa dihapus"
                          >
                            <Trash2 className="size-4" aria-hidden="true" />
                            Hapus
                          </span>
                        )}
                      </div>
                    </CardBody>
                  </Card>
                </li>
              );
            })}
          </ul>
        ) : (
          <EmptyState
            title="Belum ada kategori"
            description="Tambahkan minimal satu kategori sebelum menulis berita."
          />
        )}
      </section>
    </div>
  );
}
