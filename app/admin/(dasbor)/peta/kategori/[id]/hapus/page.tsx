import type { Metadata } from "next";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { deleteMapCategoryAction } from "@/app/admin/(dasbor)/peta/kategori/actions";
import { fetchAsAdmin } from "@/lib/admin-fetch";
import { requireSession } from "@/lib/session";
import { getMapCategoryByIdUncached } from "@/services/maps";

export const metadata: Metadata = { title: "Hapus Kategori Lokasi" };

type Props = { params: Promise<{ id: string }> };

export default async function DeleteMapCategoryPage({ params }: Props) {
  await requireSession();
  const { id } = await params;

  const category = await fetchAsAdmin(getMapCategoryByIdUncached(id));

  // `_count.markers` ikut menghitung marker yang disembunyikan — justru itu
  // yang perlu disebut, karena titik yang tidak tampil di peta warga pun akan
  // ikut terhapus tanpa pengelola sempat melihatnya.
  const markerCount = category._count?.markers ?? 0;

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6">
      <h1 className="text-2xl font-bold tracking-tight">Hapus kategori ini?</h1>

      <Card>
        <CardBody className="flex flex-col gap-1">
          <p className="font-medium">{category.name}</p>
          <p className="text-muted">/{category.slug}</p>
        </CardBody>
      </Card>

      {/* Berbeda dari kategori berita, backend TIDAK menolak penghapusan ini:
          seluruh marker di dalamnya ikut terhapus dalam satu transaksi. Jadi
          halaman ini memperingatkan, bukan memblokir. */}
      {markerCount > 0 ? (
        <>
          <Alert tone="error">
            {markerCount} titik lokasi di kategori ini akan ikut terhapus, termasuk yang sedang
            disembunyikan dari peta warga. Tindakan ini tidak bisa dibatalkan.
          </Alert>

          <p className="text-muted text-pretty">
            Kalau titik-titik itu masih diperlukan, pindahkan dulu ke kategori lain lewat
            halaman daftar lokasi, lalu kembali ke sini. Warna pin kategori sesudahnya juga
            akan bergeser, karena warnanya mengikuti urutan kategori.
          </p>

          <Link
            href="/admin/peta"
            className="inline-flex min-h-11 w-fit items-center rounded-xl border border-border px-4 transition-colors hover:bg-surface-muted"
          >
            Lihat daftar titik lokasi
          </Link>
        </>
      ) : (
        <p className="text-muted text-pretty">
          Kategori ini belum dipakai titik mana pun, jadi menghapusnya tidak menghilangkan
          lokasi apa pun. Warna pin kategori sesudahnya akan bergeser, karena warnanya
          mengikuti urutan kategori. Tindakan ini tidak bisa dibatalkan.
        </p>
      )}

      <form action={deleteMapCategoryAction} className="flex flex-wrap gap-3">
        <input type="hidden" name="id" value={category.id} />

        <Button type="submit" size="lg" className="bg-error hover:brightness-95">
          <Trash2 className="size-5" aria-hidden="true" />
          {markerCount > 0 ? `Ya, Hapus Beserta ${markerCount} Titik` : "Ya, Hapus"}
        </Button>

        <Link
          href="/admin/peta/kategori"
          className="inline-flex min-h-11 items-center rounded-xl px-4 text-muted transition-colors hover:bg-surface-muted"
        >
          Batal
        </Link>
      </form>
    </div>
  );
}
