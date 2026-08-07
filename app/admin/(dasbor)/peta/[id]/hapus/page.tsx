import type { Metadata } from "next";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { deleteMarkerAction } from "@/app/admin/(dasbor)/peta/actions";
import { fetchAsAdmin } from "@/lib/admin-fetch";
import { excerpt } from "@/lib/format";
import { requireSession } from "@/lib/session";
import { getMarkerById } from "@/services/maps";

export const metadata: Metadata = { title: "Hapus Lokasi" };

type Props = { params: Promise<{ id: string }> };

export default async function DeleteMarkerPage({ params }: Props) {
  const { token } = await requireSession();
  const { id } = await params;

  const marker = await fetchAsAdmin(getMarkerById(id, token));

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6">
      <h1 className="text-2xl font-bold tracking-tight">Hapus titik lokasi ini?</h1>

      <Card>
        <CardBody className="flex flex-col gap-2">
          <p className="font-medium text-pretty">{marker.name}</p>
          <p className="text-sm text-muted">{marker.category?.name ?? "Tanpa kategori"}</p>
          {marker.address ? (
            <p className="text-muted text-pretty">{marker.address}</p>
          ) : null}
          <p className="text-sm text-muted">
            {marker.latitude}, {marker.longitude}
          </p>
          {marker.description ? (
            <p className="text-muted text-pretty">{excerpt(marker.description, 200)}</p>
          ) : null}
        </CardBody>
      </Card>

      <p className="text-muted text-pretty">
        Kalau titiknya hanya sedang tidak ingin ditampilkan, buka halaman ubah dan hilangkan
        centang &ldquo;Tampilkan di peta warga&rdquo; — datanya tetap tersimpan dan bisa
        ditampilkan lagi. Menghapus tidak bisa dibatalkan.
      </p>

      <form action={deleteMarkerAction} className="flex flex-wrap gap-3">
        <input type="hidden" name="id" value={marker.id} />

        <Button type="submit" size="lg" className="bg-error hover:brightness-95">
          <Trash2 className="size-5" aria-hidden="true" />
          Ya, Hapus
        </Button>

        <Link
          href={`/admin/peta/${marker.id}`}
          className="inline-flex min-h-11 items-center rounded-xl px-4 text-muted transition-colors hover:bg-surface-muted"
        >
          Batal
        </Link>
      </form>
    </div>
  );
}
