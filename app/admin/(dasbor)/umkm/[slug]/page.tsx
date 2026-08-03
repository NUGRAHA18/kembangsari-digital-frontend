import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Star, Trash2 } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { Field, inputClasses } from "@/components/ui/field";
import { EmptyState } from "@/components/ui/states";
import { ImageUploadForm } from "@/features/admin/image-upload-form";
import { UmkmForm } from "@/features/admin/umkm-form";
import {
  addUmkmImagesAction,
  setPrimaryImageAction,
  updateUmkmImageAction,
} from "@/app/admin/(dasbor)/umkm/actions";
import { fetchAsAdmin } from "@/lib/admin-fetch";
import { readParam, type RawSearchParams } from "@/lib/page-params";
import { requireSession } from "@/lib/session";
import { getUmkmBySlugAsAdmin } from "@/services/umkm";
import type { UMKMImage } from "@/types/api";

export const metadata: Metadata = { title: "Kelola UMKM" };

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<RawSearchParams>;
};

const MESSAGES: Record<string, string> = {
  dibuat: "UMKM berhasil disimpan. Sekarang unggah gambarnya.",
  diperbarui: "Perubahan berhasil disimpan.",
  "gambar-ditambah": "Gambar berhasil diunggah.",
  "gambar-disimpan": "Keterangan gambar berhasil disimpan.",
  "gambar-utama": "Gambar utama berhasil diganti.",
  "gambar-dihapus": "Gambar berhasil dihapus.",
};

export default async function ManageUmkmPage({ params, searchParams }: Props) {
  const { token } = await requireSession();
  const { slug } = await params;
  const message = MESSAGES[readParam(await searchParams, "pesan") ?? ""];

  const umkm = await fetchAsAdmin(getUmkmBySlugAsAdmin(slug, token));
  const images = umkm.images ?? [];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <Link
          href="/admin/umkm"
          className="inline-flex min-h-11 items-center gap-2 text-muted hover:text-accent"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Kembali ke daftar UMKM
        </Link>

        <h1 className="mt-2 text-2xl font-bold tracking-tight text-pretty">{umkm.name}</h1>

        <div className="mt-2 flex flex-wrap items-center gap-3">
          <Badge tone={umkm.isActive ? "primary" : "neutral"}>
            {umkm.isActive ? "Tampil" : "Disembunyikan"}
          </Badge>
          <span className="text-sm text-muted">{images.length} gambar</span>
        </div>

        <div className="mt-2 flex flex-wrap gap-1">
          {umkm.isActive ? (
            <Link
              href={`/umkm/${umkm.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center gap-2 rounded-xl px-3 text-muted transition-colors hover:bg-surface-muted"
            >
              <ExternalLink className="size-4" aria-hidden="true" />
              Lihat di portal
            </Link>
          ) : null}
          <Link
            href={`/admin/umkm/${umkm.slug}/hapus`}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl px-3 text-error transition-colors hover:bg-error/10"
          >
            <Trash2 className="size-4" aria-hidden="true" />
            Hapus UMKM
          </Link>
        </div>
      </div>

      {message ? <Alert tone="success">{message}</Alert> : null}

      <section aria-labelledby="gambar">
        <h2 id="gambar" className="mb-4 text-xl font-semibold tracking-tight">
          Gambar Usaha
        </h2>

        <Card className="mb-4">
          <CardBody>
            <ImageUploadForm
              action={addUmkmImagesAction}
              hiddenFields={{ umkmId: umkm.id, umkmSlug: umkm.slug }}
              hint="Gambar pertama otomatis menjadi gambar utama yang tampil di kartu daftar UMKM."
            />
          </CardBody>
        </Card>

        {images.length > 0 ? (
          <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {images.map((image) => (
              <li key={image.id}>
                <ImageCard image={image} umkmId={umkm.id} umkmSlug={umkm.slug} />
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            title="Belum ada gambar"
            description="Kartu UMKM di halaman daftar akan tampil tanpa foto sampai gambar pertama diunggah."
          />
        )}
      </section>

      <section aria-labelledby="data">
        <h2 id="data" className="mb-4 text-xl font-semibold tracking-tight">
          Data Usaha
        </h2>
        <UmkmForm umkm={umkm} />
      </section>
    </div>
  );
}

/** Form-form kecil ini dirender di server; lihat alasannya di modul galeri. */
function ImageCard({
  image,
  umkmId,
  umkmSlug,
}: {
  image: UMKMImage;
  umkmId: string;
  umkmSlug: string;
}) {
  const captionId = `caption-${image.id}`;

  return (
    <Card className="h-full">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={image.url}
        alt={image.caption ?? "Gambar UMKM"}
        loading="lazy"
        className="aspect-square w-full object-cover"
      />

      <CardBody className="flex flex-col gap-3 p-4">
        {image.isPrimary ? (
          <p className="flex items-center gap-2 text-sm font-medium text-accent">
            <Star className="size-4 fill-current" aria-hidden="true" />
            Gambar utama
          </p>
        ) : (
          <form action={setPrimaryImageAction}>
            <input type="hidden" name="id" value={image.id} />
            <input type="hidden" name="umkmId" value={umkmId} />
            <input type="hidden" name="umkmSlug" value={umkmSlug} />
            <Button type="submit" size="sm" variant="ghost" className="px-0 text-muted">
              <Star className="size-4" aria-hidden="true" />
              Jadikan gambar utama
            </Button>
          </form>
        )}

        <form action={updateUmkmImageAction} className="flex flex-col gap-3">
          <input type="hidden" name="id" value={image.id} />
          <input type="hidden" name="umkmSlug" value={umkmSlug} />

          <Field label="Keterangan" htmlFor={captionId}>
            <input
              id={captionId}
              name="caption"
              maxLength={200}
              defaultValue={image.caption ?? ""}
              className={inputClasses}
            />
          </Field>

          <Button type="submit" size="sm" variant="outline">
            Simpan
          </Button>
        </form>

        <Link
          href={`/admin/umkm/${umkmSlug}/gambar/${image.id}/hapus`}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-3 text-sm text-error transition-colors hover:bg-error/10"
        >
          <Trash2 className="size-4" aria-hidden="true" />
          Hapus gambar
        </Link>
      </CardBody>
    </Card>
  );
}
