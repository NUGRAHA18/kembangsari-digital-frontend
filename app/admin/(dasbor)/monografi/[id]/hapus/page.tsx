import type { Metadata } from "next";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { deleteMonographyAction } from "@/app/admin/(dasbor)/monografi/actions";
import { fetchAsAdmin } from "@/lib/admin-fetch";
import { formatNumber } from "@/lib/format";
import { requireSession } from "@/lib/session";
import { getMonographyByIdAsAdmin } from "@/services/monography";

export const metadata: Metadata = { title: "Hapus Data Monografi" };

type Props = { params: Promise<{ id: string }> };

export default async function DeleteMonographyPage({ params }: Props) {
  const { token } = await requireSession();
  const { id } = await params;

  const stat = await fetchAsAdmin(getMonographyByIdAsAdmin(id, token));

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6">
      <h1 className="text-2xl font-bold tracking-tight">Hapus data tahun ini?</h1>

      <Card>
        <CardBody className="flex flex-col gap-1">
          <p className="font-medium">Tahun {stat.year}</p>
          <p className="text-muted">
            {formatNumber(stat.totalPopulation)} jiwa · {formatNumber(stat.maleCount)} laki-laki
            · {formatNumber(stat.femaleCount)} perempuan
          </p>
        </CardBody>
      </Card>

      <p className="text-muted text-pretty">
        Seluruh angka pendidikan, mata pencaharian, agama, dan wilayah tahun ini ikut terhapus,
        dan tidak ada cara mengembalikannya. Kalau tahun ini hanya belum siap ditampilkan, buka
        halaman ubah dan hilangkan centang &ldquo;Terbitkan ke halaman monografi&rdquo; —
        datanya tetap tersimpan.
      </p>

      <form action={deleteMonographyAction} className="flex flex-wrap gap-3">
        <input type="hidden" name="id" value={stat.id} />

        <Button type="submit" size="lg" className="bg-error hover:brightness-95">
          <Trash2 className="size-5" aria-hidden="true" />
          Ya, Hapus
        </Button>

        <Link
          href={`/admin/monografi/${stat.id}`}
          className="inline-flex min-h-11 items-center rounded-xl px-4 text-muted transition-colors hover:bg-surface-muted"
        >
          Batal
        </Link>
      </form>
    </div>
  );
}
