"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { useFormStatus } from "react-dom";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { Field, inputClasses } from "@/components/ui/field";
import { saveNewsAction, type NewsFormState } from "@/app/admin/(dasbor)/berita/actions";
import { IMAGE_MAX_LABEL, validateImage } from "@/lib/image";
import { slugify } from "@/lib/slug";
import { cn } from "@/lib/utils";
import type { Category, News } from "@/types/api";

const INITIAL: NewsFormState = {};

/**
 * Form tulis/ubah berita.
 *
 * Satu komponen untuk keduanya: bedanya hanya `news` yang terisi atau tidak.
 * Pengiriman ditangani Server Action, sehingga berkas gambar tidak perlu
 * diunggah lewat permintaan terpisah dari browser — token tetap tinggal di
 * server, dan unggahan berjalan dalam satu langkah dari sudut pandang pengguna.
 */
export function NewsForm({ news, categories }: { news?: News; categories: Category[] }) {
  const [state, formAction] = useActionState(saveNewsAction, INITIAL);

  // Nilai yang dikembalikan aksi didahulukan supaya isian tidak hilang ketika
  // penyimpanan ditolak backend.
  const initial = { ...news, ...state.values };

  const [title, setTitle] = useState(initial.title ?? "");
  const [slug, setSlug] = useState(initial.slug ?? "");
  // Begitu slug diketik sendiri, ia berhenti mengikuti judul.
  const [slugEdited, setSlugEdited] = useState(Boolean(initial.slug));

  const [preview, setPreview] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [removeThumbnail, setRemoveThumbnail] = useState(false);

  const currentThumbnail = news?.thumbnail ?? "";
  const shownThumbnail = preview ?? (removeThumbnail ? null : currentThumbnail || null);

  function onPickFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    // Alamat objek sebelumnya dilepas supaya berkas yang batal dipilih tidak
    // menetap di memori tab selama halaman terbuka.
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
      {news ? <input type="hidden" name="id" value={news.id} /> : null}
      <input type="hidden" name="currentThumbnail" value={currentThumbnail} />

      {state.error ? <Alert tone="error">{state.error}</Alert> : null}

      <Card>
        <CardBody className="flex flex-col gap-5">
          <Field label="Judul" htmlFor="title" required>
            <input
              id="title"
              name="title"
              required
              maxLength={200}
              value={title}
              onChange={(event) => {
                setTitle(event.target.value);
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
                Alamat halaman: <span className="break-all">/berita/{slug || "…"}</span>. Terisi
                otomatis dari judul; ubah bila perlu.
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

          <Field label="Kategori" htmlFor="categoryId" required>
            <select
              id="categoryId"
              name="categoryId"
              required
              defaultValue={initial.categoryId ?? ""}
              className={cn(inputClasses, "appearance-none")}
            >
              <option value="" disabled>
                Pilih kategori…
              </option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </Field>

          <Field
            label="Isi Berita"
            htmlFor="content"
            required
            hint="Ditampilkan sebagai teks biasa. Pisahkan paragraf dengan satu baris kosong."
          >
            <textarea
              id="content"
              name="content"
              required
              rows={14}
              defaultValue={initial.content ?? ""}
              className={cn(inputClasses, "min-h-64 leading-relaxed")}
            />
          </Field>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="flex flex-col gap-4">
          <h2 className="font-semibold">Gambar Utama</h2>

          {fileError ? <Alert tone="error">{fileError}</Alert> : null}

          {shownThumbnail ? (
            // Sengaja <img>, bukan next/image: sumbernya bisa berupa blob lokal
            // hasil pratinjau yang belum punya alamat publik.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={shownThumbnail}
              alt="Pratinjau gambar utama berita"
              className="aspect-16/9 w-full max-w-md rounded-xl border border-border object-cover"
            />
          ) : (
            <p className="text-muted">Belum ada gambar.</p>
          )}

          <Field
            label="Pilih gambar"
            htmlFor="thumbnailFile"
            hint={`JPG, PNG, WEBP, GIF, atau AVIF. Maksimal ${IMAGE_MAX_LABEL}.`}
          >
            <input
              id="thumbnailFile"
              name="thumbnailFile"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
              onChange={onPickFile}
              className={cn(inputClasses, "py-2.5 file:mr-3 file:rounded-lg file:border-0 file:bg-surface-muted file:px-3 file:py-1.5 file:text-foreground")}
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
              Hapus gambar yang sekarang
            </label>
          ) : null}
        </CardBody>
      </Card>

      <Card>
        <CardBody className="flex flex-col gap-3">
          <label className="flex min-h-11 items-start gap-3">
            <input
              type="checkbox"
              name="published"
              defaultChecked={initial.published ?? false}
              className="mt-0.5 size-5"
            />
            <span>
              <span className="font-medium">Terbitkan</span>
              <span className="block text-sm text-muted text-pretty">
                Berita yang belum diterbitkan tersimpan sebagai draf dan tidak terlihat warga.
              </span>
            </span>
          </label>
        </CardBody>
      </Card>

      <div className="flex flex-wrap gap-3">
        <SubmitButton isEdit={Boolean(news)} />
        <Link
          href="/admin/berita"
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
    <Button type="submit" size="lg" disabled={pending}>
      {pending ? "Menyimpan…" : isEdit ? "Simpan Perubahan" : "Simpan Berita"}
    </Button>
  );
}
