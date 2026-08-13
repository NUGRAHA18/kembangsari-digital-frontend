"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { useFormStatus } from "react-dom";
import { Alert } from "@/components/ui/alert";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { Field, inputClasses } from "@/components/ui/field";
import { saveMarkerAction, type MarkerFormState } from "@/app/admin/(dasbor)/peta/actions";
import { IMAGE_MAX_LABEL, validateImage } from "@/lib/image";
import { cn } from "@/lib/utils";
import type { MapCategory, MapMarker } from "@/types/api";

const INITIAL: MarkerFormState = {};

/**
 * Form titik lokasi peta.
 *
 * Bedanya dari form potensi: koordinat di sini **wajib**. Marker tanpa lintang
 * dan bujur tidak punya tempat di peta — ia hanya akan tersimpan tanpa pernah
 * tampil, dan pengelola tidak punya cara mengetahuinya.
 */
export function MarkerForm({
  marker,
  categories,
}: {
  marker?: MapMarker;
  categories: MapCategory[];
}) {
  const [state, formAction] = useActionState(saveMarkerAction, INITIAL);

  // Nilai yang dikembalikan aksi didahulukan supaya isian tidak hilang ketika
  // penyimpanan ditolak backend.
  const values = state.values;
  const initial = (key: keyof MapMarker & string, fallback = "") =>
    values?.[key as keyof typeof values] ?? (marker?.[key] as string | number | null) ?? fallback;

  const [preview, setPreview] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [removeImage, setRemoveImage] = useState(false);

  const currentImage = marker?.image ?? "";
  const shownImage = preview ?? (removeImage ? null : currentImage || null);

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
    setRemoveImage(false);
    setPreview(URL.createObjectURL(file));
  }

  // Kategori adalah relasi wajib, jadi tanpa satu pun kategori tidak ada marker
  // yang bisa disimpan. Menampilkan form yang pasti gagal hanya membuang waktu
  // pengelola yang sudah mengisinya.
  if (categories.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <Alert tone="error">
          Belum ada kategori lokasi. Setiap titik wajib punya kategori, jadi tambahkan
          kategorinya terlebih dahulu.
        </Alert>

        <ButtonLink href="/admin/peta/kategori">Kelola Kategori Lokasi</ButtonLink>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {marker ? <input type="hidden" name="id" value={marker.id} /> : null}
      <input type="hidden" name="currentImage" value={currentImage} />

      {state.error ? <Alert tone="error">{state.error}</Alert> : null}

      <Card>
        <CardBody className="flex flex-col gap-5">
          <h2 className="font-semibold">Identitas Lokasi</h2>

          <Field label="Nama lokasi" htmlFor="name" required>
            <input
              id="name"
              name="name"
              required
              maxLength={150}
              defaultValue={String(initial("name"))}
              placeholder="Misalnya: Balai Padukuhan Kembangsari"
              className={inputClasses}
            />
          </Field>

          <Field
            label="Kategori"
            htmlFor="categoryId"
            required
            hint="Menentukan warna pin dan letaknya pada saringan di halaman peta."
          >
            <select
              id="categoryId"
              name="categoryId"
              required
              defaultValue={String(initial("categoryId"))}
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
            label="Keterangan"
            htmlFor="description"
            hint="Tampil pada kartu lokasi di bawah peta. Boleh dikosongkan."
          >
            <textarea
              id="description"
              name="description"
              rows={4}
              defaultValue={String(initial("description"))}
              className={cn(inputClasses, "min-h-24 leading-relaxed")}
            />
          </Field>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="flex flex-col gap-5">
          <h2 className="font-semibold">Titik Koordinat</h2>

          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Lintang (latitude)" htmlFor="latitude" required>
              <input
                id="latitude"
                name="latitude"
                required
                inputMode="decimal"
                defaultValue={String(initial("latitude"))}
                placeholder="-7.7391"
                className={inputClasses}
              />
            </Field>

            <Field label="Bujur (longitude)" htmlFor="longitude" required>
              <input
                id="longitude"
                name="longitude"
                required
                inputMode="decimal"
                defaultValue={String(initial("longitude"))}
                placeholder="110.2043"
                className={inputClasses}
              />
            </Field>
          </div>

          <p className="text-sm text-muted text-pretty">
            Ambil dari Google Maps: tekan lama di lokasinya, lalu salin dua angka yang muncul.
            Angka pertama lintang, angka kedua bujur. Keduanya wajib — tanpa itu titik ini
            tidak bisa digambar di peta.
          </p>

          <Field label="Alamat" htmlFor="address">
            <input
              id="address"
              name="address"
              maxLength={250}
              defaultValue={String(initial("address"))}
              className={inputClasses}
            />
          </Field>

          <Field label="Nomor telepon" htmlFor="phone">
            <input
              id="phone"
              name="phone"
              inputMode="tel"
              defaultValue={String(initial("phone"))}
              placeholder="081234567890"
              className={inputClasses}
            />
          </Field>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="flex flex-col gap-4">
          <h2 className="font-semibold">Foto Lokasi</h2>

          <p className="text-sm text-muted text-pretty">
            Membantu warga mengenali tempatnya. Boleh dikosongkan.
          </p>

          {fileError ? <Alert tone="error">{fileError}</Alert> : null}

          {shownImage ? (
            // Sengaja <img>, bukan next/image: sumbernya bisa berupa blob lokal
            // hasil pratinjau yang belum punya alamat publik.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={shownImage}
              alt="Pratinjau foto lokasi"
              className="aspect-16/9 w-full max-w-md rounded-xl border border-border object-cover"
            />
          ) : (
            <p className="text-muted">Belum ada foto.</p>
          )}

          <Field
            label="Pilih gambar"
            htmlFor="imageFile"
            hint={`JPG, PNG, WEBP, GIF, atau AVIF. Maksimal ${IMAGE_MAX_LABEL}.`}
          >
            <input
              id="imageFile"
              name="imageFile"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
              onChange={onPickFile}
              className={cn(
                inputClasses,
                "py-2.5 file:mr-3 file:rounded-lg file:border-0 file:bg-surface-muted file:px-3 file:py-1.5 file:text-foreground",
              )}
            />
          </Field>

          {currentImage ? (
            <label className="flex min-h-11 items-center gap-3">
              <input
                type="checkbox"
                name="removeImage"
                checked={removeImage}
                onChange={(event) => setRemoveImage(event.target.checked)}
                className="size-5"
              />
              Hapus foto yang sekarang
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
              defaultChecked={marker?.isActive ?? true}
              className="mt-0.5 size-5"
            />
            <span>
              <span className="font-medium">Tampilkan di peta warga</span>
              <span className="block text-sm text-muted text-pretty">
                Titik yang tidak aktif hilang dari peta dan daftarnya, tetapi datanya tetap
                tersimpan.
              </span>
            </span>
          </label>
        </CardBody>
      </Card>

      <div className="flex flex-wrap gap-3">
        <SubmitButton isEdit={Boolean(marker)} />
        <Link
          href="/admin/peta"
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
      {pending ? "Menyimpan…" : isEdit ? "Simpan Perubahan" : "Simpan Lokasi"}
    </Button>
  );
}
