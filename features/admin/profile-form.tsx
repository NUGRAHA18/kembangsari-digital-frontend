"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { useFormStatus } from "react-dom";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { Field, inputClasses } from "@/components/ui/field";
import { saveProfileAction, type ProfileFormState } from "@/app/admin/(dasbor)/profil/actions";
import { validateImage } from "@/lib/image";
import { slugify } from "@/lib/slug";
import { cn } from "@/lib/utils";
import type { Profile } from "@/types/api";

const INITIAL: ProfileFormState = {};

/**
 * Form halaman profil — sejarah, visi misi, letak geografis, struktur perangkat.
 *
 * Isinya Markdown, sama seperti berita. Yang tidak dimiliki berita: `metaTitle`
 * dan `metaDescription`, dua kolom khusus mesin pencari yang dipakai
 * `generateMetadata` di halaman publiknya.
 */
export function ProfileForm({ profile }: { profile?: Profile }) {
  const [state, formAction] = useActionState(saveProfileAction, INITIAL);

  const initial = { ...profile, ...state.values };

  const [title, setTitle] = useState(initial.title ?? "");
  const [slug, setSlug] = useState(initial.slug ?? "");
  const [slugEdited, setSlugEdited] = useState(Boolean(initial.slug));

  const [preview, setPreview] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [removeThumbnail, setRemoveThumbnail] = useState(false);

  const currentThumbnail = profile?.thumbnail ?? "";
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
      {profile ? <input type="hidden" name="id" value={profile.id} /> : null}
      <input type="hidden" name="currentThumbnail" value={currentThumbnail} />

      {state.error ? <Alert tone="error">{state.error}</Alert> : null}

      <Card>
        <CardBody className="flex flex-col gap-5">
          <h2 className="font-semibold">Isi Halaman</h2>

          <Field label="Judul halaman" htmlFor="title" required>
            <input
              id="title"
              name="title"
              required
              maxLength={150}
              value={title}
              placeholder="Misalnya: Sejarah Padukuhan"
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
                Alamat halaman: <span className="break-all">/profil/{slug || "…"}</span>. Terisi
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

          <Field
            label="Isi halaman"
            htmlFor="content"
            required
            hint="Mendukung Markdown: **tebal**, *miring*, - daftar, dan ## sub-judul. Pisahkan paragraf dengan satu baris kosong."
          >
            <textarea
              id="content"
              name="content"
              required
              rows={16}
              defaultValue={initial.content ?? ""}
              className={cn(inputClasses, "min-h-72 leading-relaxed")}
            />
          </Field>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="flex flex-col gap-4">
          <h2 className="font-semibold">Gambar Sampul</h2>

          <p className="text-sm text-muted text-pretty">
            Tampil di kartu daftar profil dan di bagian atas halamannya. Boleh dikosongkan.
          </p>

          {fileError ? <Alert tone="error">{fileError}</Alert> : null}

          {shownThumbnail ? (
            // Sengaja <img>, bukan next/image: sumbernya bisa berupa blob lokal
            // hasil pratinjau yang belum punya alamat publik.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={shownThumbnail}
              alt="Pratinjau gambar sampul halaman profil"
              className="aspect-16/9 w-full max-w-md rounded-xl border border-border object-cover"
            />
          ) : (
            <p className="text-muted">Belum ada gambar sampul.</p>
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
              Hapus gambar sampul yang sekarang
            </label>
          ) : null}
        </CardBody>
      </Card>

      <Card>
        <CardBody className="flex flex-col gap-5">
          <h2 className="font-semibold">Mesin Pencari</h2>

          <p className="text-sm text-muted text-pretty">
            Keduanya boleh dikosongkan. Kalau kosong, judul halaman dan ringkasan isinya yang
            dipakai — jadi isi hanya bila ingin menuliskannya berbeda.
          </p>

          <Field label="Judul untuk mesin pencari" htmlFor="metaTitle">
            <input
              id="metaTitle"
              name="metaTitle"
              maxLength={70}
              defaultValue={initial.metaTitle ?? ""}
              className={inputClasses}
            />
          </Field>

          <Field
            label="Ringkasan untuk mesin pencari"
            htmlFor="metaDescription"
            hint="Sekitar 160 huruf. Kalimat inilah yang tampil di bawah judul pada hasil pencarian."
          >
            <textarea
              id="metaDescription"
              name="metaDescription"
              rows={3}
              maxLength={200}
              defaultValue={initial.metaDescription ?? ""}
              className={cn(inputClasses, "min-h-20 leading-relaxed")}
            />
          </Field>
        </CardBody>
      </Card>

      <div className="flex flex-wrap gap-3">
        <SubmitButton isEdit={Boolean(profile)} />
        <Link
          href="/admin/profil"
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
      {pending ? "Menyimpan…" : isEdit ? "Simpan Perubahan" : "Simpan Halaman"}
    </Button>
  );
}
