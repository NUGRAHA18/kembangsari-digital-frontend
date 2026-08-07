import type { Metadata } from "next";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { deleteMapCategoryAction } from "@/app/admin/(dasbor)/peta/kategori/actions";
import { fetchAsAdmin } from "@/lib/admin-fetch";
import { requireSession } from "@/lib/session";
import { getEveryMarker, getMapCategoryById } from "@/services/maps";

export const metadata: Metadata = { title: "Hapus Kategori Lokasi" };

type Props = { params: Promise<{ id: string }> };

export default async function DeleteMapCategoryPage({ params }: Props) {
  const { token } = await requireSession();
  const { id } = await params;

  const [category, markers] = await Promise.all([
    fetchAsAdmin(getMapCategoryById(id)),
    fetchAsAdmin(getEveryMarker(token)),
  ]);

  // Pemeriksaan ini diulang di sini, bukan hanya di daftar: alamat halaman ini
  // bisa dibuka langsung, dan sebuah titik bisa saja baru dipindahkan ke
  // kategori ini sejak daftarnya dimuat.
  const markerCount = markers.filter((marker) => marker.categoryId === category.id).length;

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6">
      <h1 className="text-2xl font-bold tracking-tight">Hapus kategori ini?</h1>

      <Card>
        <CardBody className="flex flex-col gap-1">
          <p className="font-medium">{category.name}</p>
          <p className="text-muted">/{category.slug}</p>
        </CardBody>
      </Card>

      {markerCount > 0 ? (
        <>
          <Alert tone="error">
            Kategori ini masih dipakai {markerCount} titik lokasi, jadi tidak bisa dihapus.
            Pindahkan titik-titik itu ke kategori lain terlebih dahulu.
          </Alert>

          <Link
            href="/admin/peta"
            className="inline-flex min-h-11 w-fit items-center rounded-xl border border-border px-4 transition-colors hover:bg-surface-muted"
          >
            Lihat daftar titik lokasi
          </Link>

          <Link
            href="/admin/peta/kategori"
            className="inline-flex min-h-11 w-fit items-center text-muted hover:text-accent"
          >
            Kembali ke daftar kategori
          </Link>
        </>
      ) : (
        <>
          <p className="text-muted text-pretty">
            Kategori ini belum dipakai titik mana pun, jadi menghapusnya tidak menghilangkan
            lokasi apa pun. Warna pin kategori sesudahnya akan bergeser, karena warnanya
            mengikuti urutan kategori. Tindakan ini tidak bisa dibatalkan.
          </p>

          <form action={deleteMapCategoryAction} className="flex flex-wrap gap-3">
            <input type="hidden" name="id" value={category.id} />

            <Button type="submit" size="lg" className="bg-error hover:brightness-95">
              <Trash2 className="size-5" aria-hidden="true" />
              Ya, Hapus
            </Button>

            <Link
              href="/admin/peta/kategori"
              className="inline-flex min-h-11 items-center rounded-xl px-4 text-muted transition-colors hover:bg-surface-muted"
            >
              Batal
            </Link>
          </form>
        </>
      )}
    </div>
  );
}
