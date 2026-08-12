"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { useFormStatus } from "react-dom";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { Field, inputClasses } from "@/components/ui/field";
import { savePotentialAction, type PotentialFormState } from "@/app/admin/(dasbor)/potensi/actions";
import { POTENTIAL_CATEGORIES } from "@/features/potential/categories";
import { humanizeEnum } from "@/lib/format";
import { IMAGE_MAX_LABEL, validateImage } from "@/lib/image";
import { slugify } from "@/lib/slug";
import { cn } from "@/lib/utils";
import type { Potential } from "@/types/api";

const INITIAL: PotentialFormState = {};

/**
 * Form potensi padukuhan.
 *
 * Bentuknya mengikuti form UMKM — isian dikelompokkan per kartu — dengan dua
 * perbedaan: kategorinya wajib dipilih dari delapan nilai enum backend, dan
 * potensi punya gambar sampul tersendiri di luar galeri dokumentasinya.
 */
export function PotentialForm({ potential }: { potential?: Potential }) {
  const [state, formAction] = useActionState(savePotentialAction, INITIAL);

  // Nilai yang dikembalikan aksi didahulukan supaya isian tidak hilang ketika
  // penyimpanan ditolak backend.
  const values = state.values;
  const initial = (key: keyof Potential & string, fallback = "") =>
    values?.[key as keyof typeof values] ?? (potential?.[key] as string | number | null) ?? fallback;

  const [name, setName] = useState(String(initial("name")));
  const [slug, setSlug] = useState(String(initial("slug")));
  const [slugEdited, setSlugEdited] = useState(Boolean(potential?.slug || values?.slug));

  const [preview, setPreview] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [removeThumbnail, setRemoveThumbnail] = useState(false);

  const currentThumbnail = potential?.thumbnail ?? "";
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
      {potential ? <input type="hidden" name="id" value={potential.id} /> : null}
      <input type="hidden" name="currentThumbnail" value={currentThumbnail} />

      {state.error ? <Alert tone="error">{state.error}</Alert> : null}

      <Card>
        <CardBody className="flex flex-col gap-5">
          <h2 className="font-semibold">Identitas Potensi</h2>

          <Field label="Nama potensi" htmlFor="name" required>
            <input
              id="name"
              name="name"
              required
              maxLength={150}
              value={name}
              placeholder="Misalnya: Kebun Kopi Kembangsari"
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
                Alamat halaman: <span className="break-all">/potensi/{slug || "…"}</span>
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
            label="Kategori"
            htmlFor="category"
            required
            hint="Menentukan letaknya pada saringan kategori di halaman potensi."
          >
            <select
              id="category"
              name="category"
              required
              defaultValue={String(initial("category"))}
              className={cn(inputClasses, "appearance-none")}
            >
              <option value="" disabled>
                Pilih kategori…
              </option>
              {POTENTIAL_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {humanizeEnum(category)}
                </option>
              ))}
            </select>
          </Field>

          <Field
            label="Deskripsi"
            htmlFor="description"
            required
            hint="Ceritakan potensinya. Pisahkan paragraf dengan satu baris kosong."
          >
            <textarea
              id="description"
              name="description"
              required
              rows={8}
              defaultValue={String(initial("description"))}
              className={cn(inputClasses, "min-h-40 leading-relaxed")}
            />
          </Field>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="flex flex-col gap-4">
          <h2 className="font-semibold">Gambar Sampul</h2>

          <p className="text-sm text-muted text-pretty">
            Tampil di kartu daftar potensi dan di bagian atas halaman detailnya. Kalau
            dikosongkan, kartu memakai gambar utama dari dokumentasi di bawah.
          </p>

          {fileError ? <Alert tone="error">{fileError}</Alert> : null}

          {shownThumbnail ? (
            // Sengaja <img>, bukan next/image: sumbernya bisa berupa blob lokal
            // hasil pratinjau yang belum punya alamat publik.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={shownThumbnail}
              alt="Pratinjau gambar sampul potensi"
              className="aspect-16/9 w-full max-w-md rounded-xl border border-border object-cover"
            />
          ) : (
            <p className="text-muted">Belum ada gambar sampul.</p>
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
          <h2 className="font-semibold">Narahubung</h2>

          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Nama narahubung" htmlFor="contactPerson">
              <input
                id="contactPerson"
                name="contactPerson"
                maxLength={100}
                defaultValue={String(initial("contactPerson"))}
                placeholder="Misalnya: Pak Sujiman"
                className={inputClasses}
              />
            </Field>

            <Field label="Nomor telepon" htmlFor="contactPhone">
              <input
                id="contactPhone"
                name="contactPhone"
                inputMode="tel"
                defaultValue={String(initial("contactPhone"))}
                placeholder="081234567890"
                className={inputClasses}
              />
            </Field>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="flex flex-col gap-5">
          <h2 className="font-semibold">Lokasi</h2>

          <Field label="Alamat" htmlFor="address">
            <input
              id="address"
              name="address"
              maxLength={250}
              defaultValue={String(initial("address"))}
              className={inputClasses}
            />
          </Field>

          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Lintang (latitude)" htmlFor="latitude">
              <input
                id="latitude"
                name="latitude"
                inputMode="decimal"
                defaultValue={String(initial("latitude"))}
                placeholder="-7.7391"
                className={inputClasses}
              />
            </Field>

            <Field label="Bujur (longitude)" htmlFor="longitude">
              <input
                id="longitude"
                name="longitude"
                inputMode="decimal"
                defaultValue={String(initial("longitude"))}
                placeholder="110.2043"
                className={inputClasses}
              />
            </Field>
          </div>

          <p className="text-sm text-muted text-pretty">
            Koordinat dipakai untuk tombol &ldquo;Petunjuk Arah&rdquo;. Ambil dari Google Maps:
            tekan lama di lokasinya, lalu salin dua angka yang muncul. Isi keduanya atau
            kosongkan keduanya.
          </p>
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <label className="flex min-h-11 items-start gap-3">
            <input
              type="checkbox"
              name="isActive"
              defaultChecked={potential?.isActive ?? true}
              className="mt-0.5 size-5"
            />
            <span>
              <span className="font-medium">Tampilkan ke warga</span>
              <span className="block text-sm text-muted text-pretty">
                Potensi yang tidak aktif hilang dari daftar dan halaman detailnya, tetapi
                datanya tetap tersimpan.
              </span>
            </span>
          </label>
        </CardBody>
      </Card>

      <div className="flex flex-wrap gap-3">
        <SubmitButton isEdit={Boolean(potential)} />
        <Link
          href="/admin/potensi"
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
      {pending ? "Menyimpan…" : isEdit ? "Simpan Perubahan" : "Simpan Potensi"}
    </Button>
  );
}
