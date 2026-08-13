import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, PenSquare, Trash2 } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Card, CardBody } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/states";
import { MapCategoryForm } from "@/features/admin/map-category-form";
import { fetchAsAdmin } from "@/lib/admin-fetch";
import { readParam, type RawSearchParams } from "@/lib/page-params";
import { requireSession } from "@/lib/session";
import { getMapCategoriesUncached } from "@/services/maps";

export const metadata: Metadata = { title: "Kategori Lokasi" };

const MESSAGES: Record<string, string> = {
  dibuat: "Kategori lokasi berhasil ditambahkan.",
  diperbarui: "Perubahan kategori berhasil disimpan.",
  dihapus: "Kategori berhasil dihapus.",
};

export default async function MapCategoriesPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  await requireSession();
  const message = MESSAGES[readParam(await searchParams, "pesan") ?? ""];

  // `_count.markers` datang langsung dari backend dan sudah menghitung marker
  // yang disembunyikan.
  const categories = await fetchAsAdmin(getMapCategoriesUncached());

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/admin/peta"
          className="inline-flex min-h-11 items-center gap-2 text-muted hover:text-accent"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Kembali ke daftar lokasi
        </Link>

        <h1 className="mt-2 text-2xl font-bold tracking-tight">Kategori Lokasi</h1>
        <p className="mt-1 text-muted text-pretty">
          Setiap titik di peta wajib punya kategori. Kategori juga menjadi tombol saringan di
          halaman peta, dan urutannya menentukan warna pin — menghapus satu kategori menggeser
          warna kategori sesudahnya. Menghapus kategori juga menghapus semua titik lokasi di
          dalamnya.
        </p>
      </div>

      {message ? <Alert tone="success">{message}</Alert> : null}

      <Card>
        <CardBody className="flex flex-col gap-4">
          <h2 className="font-semibold">Tambah Kategori</h2>
          <MapCategoryForm />
        </CardBody>
      </Card>

      <section aria-labelledby="daftar">
        <h2 id="daftar" className="mb-3 text-xl font-semibold tracking-tight">
          {categories.length} Kategori
        </h2>

        {categories.length > 0 ? (
          <ul className="flex flex-col gap-3">
            {categories.map((category) => {
              const markerCount = category._count?.markers ?? 0;

              return (
                <li key={category.id}>
                  <Card interactive>
                    <CardBody className="flex flex-wrap items-center gap-3 p-4">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium">{category.name}</p>
                        <p className="text-sm text-muted">
                          <span className="break-all">/{category.slug}</span> ·{" "}
                          {markerCount === 0
                            ? "belum dipakai"
                            : `${markerCount} titik, termasuk yang disembunyikan`}
                        </p>
                      </div>

                      <div className="flex shrink-0 gap-1">
                        <Link
                          href={`/admin/peta/kategori/${category.id}`}
                          className="inline-flex min-h-11 items-center gap-2 rounded-xl px-3 transition-colors hover:bg-surface-muted"
                        >
                          <PenSquare className="size-4" aria-hidden="true" />
                          Ubah
                        </Link>

                        {/* Tombolnya tidak pernah dimatikan: berbeda dari
                            kategori berita, menghapus kategori peta TIDAK
                            ditolak backend — seluruh titik di dalamnya ikut
                            terhapus. Yang perlu pengelola tahu adalah
                            akibatnya, dan itu disebut di halaman konfirmasi. */}
                        <Link
                          href={`/admin/peta/kategori/${category.id}/hapus`}
                          className="inline-flex min-h-11 items-center gap-2 rounded-xl px-3 text-error transition-colors hover:bg-error/10"
                        >
                          <Trash2 className="size-4" aria-hidden="true" />
                          Hapus
                        </Link>
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
            description="Tambahkan minimal satu kategori sebelum menandai lokasi di peta."
          />
        )}
      </section>
    </div>
  );
}
