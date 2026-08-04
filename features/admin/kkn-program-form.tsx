"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { useFormStatus } from "react-dom";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { Field, inputClasses } from "@/components/ui/field";
import {
  saveKknProgramAction,
  type KknProgramFormState,
} from "@/app/admin/(dasbor)/program-kkn/actions";
import { KKN_SUB_PROGRAMS, SUB_PROGRAM_LABELS } from "@/features/kkn/sub-programs";
import { validateImage } from "@/lib/image";
import { slugify } from "@/lib/slug";
import { cn } from "@/lib/utils";
import type { KKNProgram } from "@/types/api";

const INITIAL: KknProgramFormState = {};

/**
 * Form program KKN.
 *
 * Berbeda dari modul lain, isi programnya berupa Markdown — itu satu-satunya
 * kolom Markdown di seluruh dashboard, jadi keterangannya ditulis lengkap di
 * bawah isian alih-alih menganggap pengelola sudah tahu.
 */
export function KknProgramForm({ program }: { program?: KKNProgram }) {
  const [state, formAction] = useActionState(saveKknProgramAction, INITIAL);

  const initial = { ...program, ...state.values };

  const [title, setTitle] = useState(initial.title ?? "");
  const [slug, setSlug] = useState(initial.slug ?? "");
  const [slugEdited, setSlugEdited] = useState(Boolean(initial.slug));

  const [preview, setPreview] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [removeThumbnail, setRemoveThumbnail] = useState(false);

  const currentThumbnail = program?.thumbnail ?? "";
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
      {program ? <input type="hidden" name="id" value={program.id} /> : null}
      <input type="hidden" name="currentThumbnail" value={currentThumbnail} />

      {state.error ? <Alert tone="error">{state.error}</Alert> : null}

      <Card>
        <CardBody className="flex flex-col gap-5">
          <h2 className="font-semibold">Identitas Program</h2>

          <Field label="Sub-program" htmlFor="subProgram" required>
            <select
              id="subProgram"
              name="subProgram"
              required
              defaultValue={initial.subProgram ?? ""}
              className={cn(inputClasses, "appearance-none")}
            >
              <option value="" disabled>
                Pilih sub-program…
              </option>
              {KKN_SUB_PROGRAMS.map((subProgram) => (
                <option key={subProgram} value={subProgram}>
                  {SUB_PROGRAM_LABELS[subProgram]}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Judul program" htmlFor="title" required>
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
                Alamat halaman: <span className="break-all">/program-kkn/{slug || "…"}</span>
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

          <Field
            label="Ringkasan"
            htmlFor="description"
            required
            hint="Satu atau dua kalimat. Tampil di kartu daftar program dan pada hasil pencarian Google."
          >
            <textarea
              id="description"
              name="description"
              required
              rows={3}
              maxLength={300}
              defaultValue={initial.description ?? ""}
              className={cn(inputClasses, "leading-relaxed")}
            />
          </Field>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="flex flex-col gap-5">
          <h2 className="font-semibold">Isi Program</h2>

          <Field
            label="Isi lengkap"
            htmlFor="content"
            required
            hint="Ditulis dengan Markdown."
          >
            <textarea
              id="content"
              name="content"
              required
              rows={16}
              defaultValue={initial.content ?? ""}
              className={cn(inputClasses, "min-h-72 font-mono text-sm leading-relaxed")}
            />
          </Field>

          <div className="rounded-xl bg-surface-muted p-4 text-sm text-muted">
            <p className="font-medium text-foreground">Penulisan Markdown</p>
            <ul className="mt-2 flex flex-col gap-1">
              <li>
                <code>## Judul bagian</code> — judul; tanda pagarnya boleh sampai tiga
              </li>
              <li>
                <code>**tebal**</code> dan <code>*miring*</code>
              </li>
              <li>
                <code>- </code> di awal baris untuk daftar berpoin
              </li>
              <li>
                <code>[teks](https://…)</code> untuk tautan
              </li>
              <li>Pisahkan paragraf dengan satu baris kosong.</li>
            </ul>
          </div>
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
              alt="Pratinjau gambar utama program"
              className="aspect-16/9 w-full max-w-md rounded-xl border border-border object-cover"
            />
          ) : (
            <p className="text-muted">Belum ada gambar.</p>
          )}

          <Field
            label="Pilih gambar"
            htmlFor="thumbnailFile"
            hint="JPG, PNG, WEBP, GIF, atau AVIF. Maksimal 5 MB."
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
              Hapus gambar yang sekarang
            </label>
          ) : null}
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <label className="flex min-h-11 items-start gap-3">
            <input
              type="checkbox"
              name="isActive"
              defaultChecked={program?.isActive ?? true}
              className="mt-0.5 size-5"
            />
            <span>
              <span className="font-medium">Tampilkan ke warga</span>
              <span className="block text-sm text-muted text-pretty">
                Program yang tidak aktif hilang dari daftar dan halaman detailnya, beserta
                seluruh dokumentasi kegiatannya.
              </span>
            </span>
          </label>
        </CardBody>
      </Card>

      <div className="flex flex-wrap gap-3">
        <SubmitButton isEdit={Boolean(program)} />
        <Link
          href="/admin/program-kkn"
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
      {pending ? "Menyimpan…" : isEdit ? "Simpan Perubahan" : "Simpan Program"}
    </Button>
  );
}
