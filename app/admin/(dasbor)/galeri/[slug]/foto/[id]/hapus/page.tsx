import type { Metadata } from "next";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { deleteItemAction } from "@/app/admin/(dasbor)/galeri/actions";
import { fetchAsAdmin } from "@/lib/admin-fetch";
import { getGalleryItemById } from "@/services/gallery";

export const metadata: Metadata = { title: "Hapus Foto" };

type Props = { params: Promise<{ slug: string; id: string }> };

export default async function DeleteGalleryItemPage({ params }: Props) {
  const { slug, id } = await params;
  const item = await fetchAsAdmin(getGalleryItemById(id));

  const isVideo = item.type === "VIDEO";

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6">
      <h1 className="text-2xl font-bold tracking-tight">
        Hapus {isVideo ? "video" : "foto"} ini dari album?
      </h1>

      <Card>
        {isVideo ? (
          <CardBody>
            <p className="break-all text-muted">{item.url}</p>
          </CardBody>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.url}
            alt={item.caption ?? "Foto yang akan dihapus"}
            className="max-h-80 w-full object-contain"
          />
        )}

        {item.caption ? (
          <CardBody className="p-4">
            <p className="text-pretty">{item.caption}</p>
          </CardBody>
        ) : null}
      </Card>

      <p className="text-muted text-pretty">
        {isVideo
          ? "Yang dihapus hanya catatannya di album ini; videonya sendiri tetap ada di layanan asalnya."
          : "Foto ini akan hilang dari album dan dari beranda bila sedang ditandai sebagai pilihan."}
      </p>

      <form action={deleteItemAction} className="flex flex-wrap gap-3">
        <input type="hidden" name="id" value={item.id} />
        <input type="hidden" name="albumSlug" value={slug} />

        <Button type="submit" size="lg" className="bg-error hover:brightness-95">
          <Trash2 className="size-5" aria-hidden="true" />
          Ya, Hapus
        </Button>

        <Link
          href={`/admin/galeri/${slug}`}
          className="inline-flex min-h-11 items-center rounded-xl px-4 text-muted transition-colors hover:bg-surface-muted"
        >
          Batal
        </Link>
      </form>
    </div>
  );
}
