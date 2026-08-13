"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { useFormStatus } from "react-dom";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { Field, inputClasses } from "@/components/ui/field";
import { saveAlbumAction, type AlbumFormState } from "@/app/admin/(dasbor)/galeri/actions";
import { IMAGE_MAX_LABEL, validateImage } from "@/lib/image";
import { slugify } from "@/lib/slug";
import { cn } from "@/lib/utils";
import type { GalleryAlbum } from "@/types/api";

const INITIAL: AlbumFormState = {};

/**
 * Form album galeri.
 *
 * Sampul album adalah satu gambar tersendiri, terpisah dari foto-foto di
 * dalamnya: album bisa saja belum punya isi tetapi sudah perlu tampil rapi di
 * halaman daftar galeri.
 */
export function AlbumForm({ album }: { album?: GalleryAlbum }) {
  const [state, formAction] = useActionState(saveAlbumAction, INITIAL);

  const initial = { ...album, ...state.values };

  const [name, setName] = useState(initial.name ?? "");
  const [slug, setSlug] = useState(initial.slug ?? "");
  const [slugEdited, setSlugEdited] = useState(Boolean(initial.slug));

  const [preview, setPreview] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [removeThumbnail, setRemoveThumbnail] = useState(false);

  const currentThumbnail = album?.thumbnail ?? "";
  const shownThumbnail = preview ?? (removeThumbnail ? null : currentThumbnail || null);

  function onPickFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    setPreview((previous) => {
      if (previous) URL.revokeObjectURL(previous);
      return null;
    });

    if (!file) {
      setFileError(null);
      return;
    }

    const invalid = validateImage(file);
    if (invalid) {
      setFileError(invalid);
      event.target.value = "";
      return;
    }

    setFileError(null);
    setRemoveThumbnail(false);
    setPreview(URL.createObjectURL(file));
  }

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {album ? <input type="hidden" name="id" value={album.id} /> : null}
      <input type="hidden" name="currentThumbnail" value={currentThumbnail} />

      {state.error ? <Alert tone="error">{state.error}</Alert> : null}

      <Card>
        <CardBody className="flex flex-col gap-5">
          <Field label="Nama album" htmlFor="name" required>
            <input
              id="name"
              name="name"
              required
              maxLength={120}
              value={name}
              placeholder="Misalnya: Kerja Bakti Agustus 2026"
              onChange={(event) => {
                setName(event.target.value);
                if (!slugEdited) setSlug(slugify(event.target.value));
              }}
              className={inputClasses}
            />
          </Field>

          <Field
            label="Slug"
            htmlFor="slug"
            hint={
              <>
                Alamat halaman album: <span className="break-all">/galeri/{slug || "…"}</span>
              </>
            }
          >
            <input
              id="slug"
              name="slug"
              value={slug}
              onChange={(event) => {
                setSlug(event.target.value);
                setSlugEdited(true);
              }}
              className={inputClasses}
            />
          </Field>

          <Field label="Keterangan" htmlFor="description">
            <textarea
              id="description"
              name="description"
              rows={4}
              defaultValue={initial.description ?? ""}
              className={cn(inputClasses, "min-h-24 leading-relaxed")}
            />
          </Field>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="flex flex-col gap-4">
          <h2 className="font-semibold">Sampul Album</h2>

          {fileError ? <Alert tone="error">{fileError}</Alert> : null}

          {shownThumbnail ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={shownThumbnail}
              alt="Pratinjau sampul album"
              className="aspect-16/9 w-full max-w-md rounded-xl border border-border object-cover"
            />
          ) : (
            <p className="text-muted">Belum ada sampul.</p>
          )}

          <Field
            label="Pilih sampul"
            htmlFor="thumbnailFile"
            hint={`JPG, PNG, WEBP, GIF, atau AVIF. Maksimal ${IMAGE_MAX_LABEL}.`}
          >
            <input
              id="thumbnailFile"
              name="thumbnailFile"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
              onChange={onPickFile}
              className={cn(
                inputClasses,
                "py-2.5 file:mr-3 file:rounded-lg file:border-0 file:bg-surface-muted file:px-3 file:py-1.5 file:text-foreground",
              )}
            />
          </Field>

          {currentThumbnail ? (
            <label className="flex min-h-11 items-center gap-3">
              <input
                type="checkbox"
                name="removeThumbnail"
                checked={removeThumbnail}
                onChange={(event) => setRemoveThumbnail(event.target.checked)}
                className="size-5"
              />
              Hapus sampul yang sekarang
            </label>
          ) : null}
        </CardBody>
      </Card>

      <div className="flex flex-wrap gap-3">
        <SubmitButton isEdit={Boolean(album)} />
        <Link
          href="/admin/galeri"
          className="inline-flex min-h-11 items-center rounded-xl px-4 text-muted transition-colors hover:bg-surface-muted"
        >
          Batal
        </Link>
      </div>
    </form>
  );
}

function SubmitButton({ isEdit }: { isEdit: boolean }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" size="lg" loading={pending}>
      {pending ? "Menyimpan…" : isEdit ? "Simpan Perubahan" : "Buat Album"}
    </Button>
  );
}
