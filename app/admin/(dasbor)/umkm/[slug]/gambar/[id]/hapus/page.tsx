import type { Metadata } from "next";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { SubmitButton } from "@/components/ui/submit-button";
import { Card, CardBody } from "@/components/ui/card";
import { deleteUmkmImageAction } from "@/app/admin/(dasbor)/umkm/actions";
import { fetchAsAdmin } from "@/lib/admin-fetch";
import { getUmkmImageById } from "@/services/umkm";

export const metadata: Metadata = { title: "Hapus Gambar" };

type Props = { params: Promise<{ slug: string; id: string }> };

export default async function DeleteUmkmImagePage({ params }: Props) {
  const { slug, id } = await params;
  const image = await fetchAsAdmin(getUmkmImageById(id));

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6">
      <h1 className="text-2xl font-bold tracking-tight">Hapus gambar ini?</h1>

      <Card>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image.url}
          alt={image.caption ?? "Gambar yang akan dihapus"}
          className="max-h-80 w-full object-contain"
        />
        {image.caption ? (
          <CardBody className="p-4">
            <p className="text-pretty">{image.caption}</p>
          </CardBody>
        ) : null}
      </Card>

      {image.isPrimary ? (
        <Alert>
          Ini gambar utama. Setelah dihapus, backend otomatis mengangkat gambar teratas
          berikutnya sebagai gambar utama.
        </Alert>
      ) : null}

      <form action={deleteUmkmImageAction} className="flex flex-wrap gap-3">
        <input type="hidden" name="id" value={image.id} />
        <input type="hidden" name="umkmSlug" value={slug} />

        <SubmitButton size="lg" pendingLabel="Menghapus…" className="bg-error hover:brightness-95">
          <Trash2 className="size-5" aria-hidden="true" />
          Ya, Hapus
        </SubmitButton>

        <Link
          href={`/admin/umkm/${slug}`}
          className="inline-flex min-h-11 items-center rounded-xl px-4 text-muted transition-colors hover:bg-surface-muted"
        >
          Batal
        </Link>
      </form>
    </div>
  );
}
