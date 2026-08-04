import type { Metadata } from "next";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { deletePotentialAction } from "@/app/admin/(dasbor)/potensi/actions";
import { fetchAsAdmin } from "@/lib/admin-fetch";
import { excerpt, humanizeEnum } from "@/lib/format";
import { requireSession } from "@/lib/session";
import { getPotentialBySlugAsAdmin } from "@/services/potential";

export const metadata: Metadata = { title: "Hapus Potensi" };

type Props = { params: Promise<{ slug: string }> };

export default async function DeletePotentialPage({ params }: Props) {
  const { token } = await requireSession();
  const { slug } = await params;

  const potential = await fetchAsAdmin(getPotentialBySlugAsAdmin(slug, token));
  const imageCount = potential.images?.length ?? 0;

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6">
      <h1 className="text-2xl font-bold tracking-tight">Hapus potensi ini?</h1>

      <Card>
        <CardBody className="flex flex-col gap-2">
          <p className="font-medium text-pretty">{potential.name}</p>
          <p className="text-sm text-muted">{humanizeEnum(potential.category)}</p>
          <p className="text-muted text-pretty">{excerpt(potential.description, 200)}</p>
        </CardBody>
      </Card>

      {imageCount > 0 ? (
        <Alert tone="error">
          {imageCount} gambar dokumentasi potensi ini ikut terhapus. Tidak ada cara
          mengembalikannya.
        </Alert>
      ) : null}

      <p className="text-muted text-pretty">
        Kalau potensinya hanya sedang tidak ingin ditampilkan, buka halaman kelola dan
        hilangkan centang &ldquo;Tampilkan ke warga&rdquo; — datanya tetap tersimpan dan bisa
        ditampilkan lagi.
      </p>

      <form action={deletePotentialAction} className="flex flex-wrap gap-3">
        <input type="hidden" name="id" value={potential.id} />
        <input type="hidden" name="slug" value={potential.slug} />

        <Button type="submit" size="lg" className="bg-error hover:brightness-95">
          <Trash2 className="size-5" aria-hidden="true" />
          Ya, Hapus
        </Button>

        <Link
          href={`/admin/potensi/${potential.slug}`}
          className="inline-flex min-h-11 items-center rounded-xl px-4 text-muted transition-colors hover:bg-surface-muted"
        >
          Batal
        </Link>
      </form>
    </div>
  );
}
