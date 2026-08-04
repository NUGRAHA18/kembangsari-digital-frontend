import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Play, Trash2 } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { Field, inputClasses } from "@/components/ui/field";
import { EmptyState } from "@/components/ui/states";
import { AlbumForm } from "@/features/admin/album-form";
import { ImageUploadForm } from "@/features/admin/image-upload-form";
import { VideoLinkForm } from "@/features/admin/video-link-form";
import { addPhotosAction, updateItemAction } from "@/app/admin/(dasbor)/galeri/actions";
import { fetchAsAdmin } from "@/lib/admin-fetch";
import { readParam, type RawSearchParams } from "@/lib/page-params";
import { getGalleryAlbumBySlugAsAdmin } from "@/services/gallery";
import type { GalleryItem } from "@/types/api";

export const metadata: Metadata = { title: "Kelola Album" };

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<RawSearchParams>;
};

const MESSAGES: Record<string, string> = {
  dibuat: "Album berhasil dibuat. Sekarang unggah fotonya.",
  diperbarui: "Perubahan album berhasil disimpan.",
  "foto-ditambah": "Foto berhasil diunggah.",
  "video-ditambah": "Video berhasil ditambahkan.",
  "foto-disimpan": "Perubahan pada foto berhasil disimpan.",
  "foto-dihapus": "Foto berhasil dihapus dari album.",
};

export default async function ManageAlbumPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const message = MESSAGES[readParam(await searchParams, "pesan") ?? ""];

  const album = await fetchAsAdmin(getGalleryAlbumBySlugAsAdmin(slug));
  const items = album.items ?? [];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <Link
          href="/admin/galeri"
          className="inline-flex min-h-11 items-center gap-2 text-muted hover:text-accent"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Kembali ke daftar album
        </Link>

        <h1 className="mt-2 text-2xl font-bold tracking-tight text-pretty">{album.name}</h1>
        <p className="mt-1 text-muted">{items.length} foto & video di album ini.</p>

        <div className="mt-2 flex flex-wrap gap-1">
          <Link
            href={`/galeri/${album.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center gap-2 rounded-xl px-3 text-muted transition-colors hover:bg-surface-muted"
          >
            <ExternalLink className="size-4" aria-hidden="true" />
            Lihat di portal
          </Link>
          <Link
            href={`/admin/galeri/${album.slug}/hapus`}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl px-3 text-error transition-colors hover:bg-error/10"
          >
            <Trash2 className="size-4" aria-hidden="true" />
            Hapus album
          </Link>
        </div>
      </div>

      {message ? <Alert tone="success">{message}</Alert> : null}

      <section aria-labelledby="tambah" className="grid gap-4 lg:grid-cols-2">
        <h2 id="tambah" className="sr-only">
          Tambah isi album
        </h2>

        <Card>
          <CardBody className="flex flex-col gap-4">
            <h3 className="font-semibold">Unggah Foto</h3>
            <ImageUploadForm
              action={addPhotosAction}
              hiddenFields={{ albumId: album.id, albumSlug: album.slug }}
            />
          </CardBody>
        </Card>

        <Card>
          <CardBody className="flex flex-col gap-4">
            <h3 className="font-semibold">Tambah Video</h3>
            <VideoLinkForm albumId={album.id} albumSlug={album.slug} />
          </CardBody>
        </Card>
      </section>

      <section aria-labelledby="isi">
        <h2 id="isi" className="mb-4 text-xl font-semibold tracking-tight">
          Isi Album
        </h2>

        {items.length > 0 ? (
          <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <li key={item.id}>
                <ItemCard item={item} albumSlug={album.slug} />
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            title="Album masih kosong"
            description="Unggah foto lewat kotak di atas. Foto yang ditandai pilihan juga tampil di beranda."
          />
        )}
      </section>

      <section aria-labelledby="pengaturan">
        <h2 id="pengaturan" className="mb-4 text-xl font-semibold tracking-tight">
          Pengaturan Album
        </h2>
        <AlbumForm album={album} />
      </section>
    </div>
  );
}

/**
 * Satu foto beserta isian keterangannya.
 *
 * Formnya dirender di server tanpa Client Component: isiannya hanya keterangan
 * dan satu centang, jadi tidak ada yang perlu ditampilkan selama proses
 * berjalan — dan sebuah album bisa berisi puluhan kartu seperti ini, yang
 * semuanya akan ikut terkirim ke browser kalau dijadikan komponen klien.
 */
function ItemCard({ item, albumSlug }: { item: GalleryItem; albumSlug: string }) {
  const captionId = `caption-${item.id}`;

  return (
    <Card className="h-full">
      {item.type === "VIDEO" ? (
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="grid aspect-square w-full place-items-center bg-surface-muted"
        >
          <Play className="size-10 text-muted" aria-hidden="true" />
          <span className="sr-only">Buka video di tab baru</span>
        </a>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.url}
          alt={item.caption ?? "Foto dalam album"}
          loading="lazy"
          className="aspect-square w-full object-cover"
        />
      )}

      <CardBody className="flex flex-col gap-3 p-4">
        <form action={updateItemAction} className="flex flex-col gap-3">
          <input type="hidden" name="id" value={item.id} />
          <input type="hidden" name="albumSlug" value={albumSlug} />

          <Field label="Keterangan" htmlFor={captionId}>
            <input
              id={captionId}
              name="caption"
              maxLength={200}
              defaultValue={item.caption ?? ""}
              className={inputClasses}
            />
          </Field>

          <label className="flex min-h-11 items-center gap-3">
            <input
              type="checkbox"
              name="isFeatured"
              defaultChecked={item.isFeatured}
              className="size-5"
            />
            <span className="text-sm">Tampilkan di beranda</span>
          </label>

          <Button type="submit" size="sm" variant="outline">
            Simpan
          </Button>
        </form>

        <Link
          href={`/admin/galeri/${albumSlug}/foto/${item.id}/hapus`}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-3 text-sm text-error transition-colors hover:bg-error/10"
        >
          <Trash2 className="size-4" aria-hidden="true" />
          Hapus dari album
        </Link>
      </CardBody>
    </Card>
  );
}
