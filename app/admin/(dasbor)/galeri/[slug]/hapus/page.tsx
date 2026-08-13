import type { Metadata } from "next";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { SubmitButton } from "@/components/ui/submit-button";
import { Card, CardBody } from "@/components/ui/card";
import { deleteAlbumAction } from "@/app/admin/(dasbor)/galeri/actions";
import { fetchAsAdmin } from "@/lib/admin-fetch";
import { getGalleryAlbumBySlugAsAdmin } from "@/services/gallery";

export const metadata: Metadata = { title: "Hapus Album" };

type Props = { params: Promise<{ slug: string }> };

export default async function DeleteAlbumPage({ params }: Props) {
  const { slug } = await params;
  const album = await fetchAsAdmin(getGalleryAlbumBySlugAsAdmin(slug));

  const count = album.items?.length ?? 0;

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6">
      <h1 className="text-2xl font-bold tracking-tight">Hapus album ini?</h1>

      <Card>
        <CardBody className="flex flex-col gap-1">
          <p className="font-medium text-pretty">{album.name}</p>
          <p className="text-muted">/galeri/{album.slug}</p>
        </CardBody>
      </Card>

      {/* Berbeda dari kategori berita, album justru menghapus isinya sekaligus:
          backend membuang seluruh item dalam satu transaksi sebelum menghapus
          albumnya. Jumlahnya disebut supaya tidak ada yang mengira ini hanya
          membuang wadah kosong. */}
      {count > 0 ? (
        <Alert tone="error">
          {count} foto & video di dalamnya ikut terhapus. Tidak ada cara mengembalikannya.
        </Alert>
      ) : (
        <p className="text-muted">Album ini masih kosong.</p>
      )}

      <form action={deleteAlbumAction} className="flex flex-wrap gap-3">
        <input type="hidden" name="id" value={album.id} />
        <input type="hidden" name="slug" value={album.slug} />

        <SubmitButton size="lg" pendingLabel="Menghapus…" className="bg-error hover:brightness-95">
          <Trash2 className="size-5" aria-hidden="true" />
          Ya, Hapus Album
        </SubmitButton>

        <Link
          href={`/admin/galeri/${album.slug}`}
          className="inline-flex min-h-11 items-center rounded-xl px-4 text-muted transition-colors hover:bg-surface-muted"
        >
          Batal
        </Link>
      </form>
    </div>
  );
}
