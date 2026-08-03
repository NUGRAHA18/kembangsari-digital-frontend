import type { Metadata } from "next";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { deleteUmkmAction } from "@/app/admin/(dasbor)/umkm/actions";
import { fetchAsAdmin } from "@/lib/admin-fetch";
import { excerpt } from "@/lib/format";
import { requireSession } from "@/lib/session";
import { getUmkmBySlugAsAdmin } from "@/services/umkm";

export const metadata: Metadata = { title: "Hapus UMKM" };

type Props = { params: Promise<{ slug: string }> };

export default async function DeleteUmkmPage({ params }: Props) {
  const { token } = await requireSession();
  const { slug } = await params;

  const umkm = await fetchAsAdmin(getUmkmBySlugAsAdmin(slug, token));
  const imageCount = umkm.images?.length ?? 0;

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6">
      <h1 className="text-2xl font-bold tracking-tight">Hapus UMKM ini?</h1>

      <Card>
        <CardBody className="flex flex-col gap-2">
          <p className="font-medium text-pretty">{umkm.name}</p>
          <p className="text-muted text-pretty">{excerpt(umkm.description, 200)}</p>
        </CardBody>
      </Card>

      {imageCount > 0 ? (
        <Alert tone="error">
          {imageCount} gambar milik usaha ini ikut terhapus. Tidak ada cara mengembalikannya.
        </Alert>
      ) : null}

      <p className="text-muted text-pretty">
        Kalau usahanya hanya sedang tutup sementara, buka halaman kelola dan hilangkan centang
        &ldquo;Tampilkan ke warga&rdquo; — datanya tetap tersimpan dan bisa ditampilkan lagi.
      </p>

      <form action={deleteUmkmAction} className="flex flex-wrap gap-3">
        <input type="hidden" name="id" value={umkm.id} />
        <input type="hidden" name="slug" value={umkm.slug} />

        <Button type="submit" size="lg" className="bg-error hover:brightness-95">
          <Trash2 className="size-5" aria-hidden="true" />
          Ya, Hapus
        </Button>

        <Link
          href={`/admin/umkm/${umkm.slug}`}
          className="inline-flex min-h-11 items-center rounded-xl px-4 text-muted transition-colors hover:bg-surface-muted"
        >
          Batal
        </Link>
      </form>
    </div>
  );
}
