"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { useFormStatus } from "react-dom";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { Field, inputClasses } from "@/components/ui/field";
import { saveHouseAction, type HouseFormState } from "@/app/admin/(dasbor)/rumah/actions";
import { toDateInput } from "@/lib/format";
import { IMAGE_MAX_LABEL, validateImage } from "@/lib/image";
import { cn } from "@/lib/utils";
import type { House } from "@/types/api";

const INITIAL: HouseFormState = {};

/**
 * Form rumah warga.
 *
 * Kartu keluarga dan penghuninya sengaja **tidak** ada di sini. Rumah harus
 * tersimpan lebih dulu supaya punya `id` yang bisa dijadikan induk, dan
 * menggabungkan ketiganya menjadi satu form panjang berarti pendata
 * kehilangan seluruh isian begitu satu kolom ditolak backend. Keduanya
 * dikelola di halaman ubah, setelah rumahnya ada.
 */
export function HouseForm({ house }: { house?: House }) {
  const [state, formAction] = useActionState(saveHouseAction, INITIAL);

  const values = state.values;
  const initial = (key: string, fallback: string | number | null = "") =>
    values?.[key] ??
    (house ? ((house[key as keyof House] as string | number | null) ?? "") : "") ??
    fallback;

  const [preview, setPreview] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [removePhoto, setRemovePhoto] = useState(false);

  const currentPhoto = house?.photo ?? "";
  const shownPhoto = preview ?? (removePhoto ? null : currentPhoto || null);

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
    setRemovePhoto(false);
    setPreview(URL.createObjectURL(file));
  }

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {house ? <input type="hidden" name="id" value={house.id} /> : null}
      <input type="hidden" name="currentPhoto" value={currentPhoto} />

      {state.error ? <Alert tone="error">{state.error}</Alert> : null}

      <Card>
        <CardBody className="flex flex-col gap-5">
          <h2 className="font-semibold">Identitas Rumah</h2>

          <Field
            label="Nama rumah"
            htmlFor="label"
            required
            hint="Yang tampil sebagai judul di peta. Biasanya nama penghuninya, misalnya “Rumah Agung & Melia”."
          >
            <input
              id="label"
              name="label"
              required
              maxLength={150}
              defaultValue={String(initial("label"))}
              className={inputClasses}
            />
          </Field>

          <div className="grid gap-5 md:grid-cols-2">
            <Field label="RT" htmlFor="rt" required>
              <input
                id="rt"
                name="rt"
                required
                maxLength={10}
                defaultValue={String(initial("rt"))}
                placeholder="06"
                className={inputClasses}
              />
            </Field>

            <Field label="RW" htmlFor="rw" required>
              <input
                id="rw"
                name="rw"
                required
                maxLength={10}
                defaultValue={String(initial("rw"))}
                placeholder="03"
                className={inputClasses}
              />
            </Field>
          </div>

          <p className="text-sm text-muted text-pretty">
            RT dan RW ditulis apa adanya, termasuk angka nol di depannya. Warna ikon rumah di peta
            mengikuti RT-nya.
          </p>
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
                placeholder="-7.690025"
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
                placeholder="110.228583"
                className={inputClasses}
              />
            </Field>
          </div>

          <p className="text-sm text-muted text-pretty">
            Tekan lama di lokasi rumahnya pada Google Maps, lalu salin angka yang muncul.
            Menempelkan kedua angka sekaligus ke kolom lintang juga boleh — akan dipisah sendiri.
          </p>

          <Field label="Alamat" htmlFor="address" hint="Boleh dikosongkan.">
            <input
              id="address"
              name="address"
              maxLength={250}
              defaultValue={String(initial("address"))}
              className={inputClasses}
            />
          </Field>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="flex flex-col gap-5">
          <h2 className="font-semibold">Pendataan</h2>

          <Field
            label="Data diverifikasi tanggal"
            htmlFor="dataVerifiedAt"
            hint="Kapan pendata terakhir memeriksa isi rumah ini. Tampil di halaman warga, dan berbeda dari waktu penyuntingan terakhir."
          >
            <input
              id="dataVerifiedAt"
              name="dataVerifiedAt"
              type="date"
              defaultValue={
                values?.dataVerifiedAt ??
                (house?.dataVerifiedAt ? toDateInput(house.dataVerifiedAt) : "")
              }
              className={inputClasses}
            />
          </Field>

          <Field
            label="Catatan"
            htmlFor="note"
            hint="Keterangan tambahan untuk pendata. Ikut terbaca warga di halaman rumah."
          >
            <textarea
              id="note"
              name="note"
              rows={3}
              defaultValue={String(initial("note"))}
              className={cn(inputClasses, "min-h-20 leading-relaxed")}
            />
          </Field>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="flex flex-col gap-4">
          <h2 className="font-semibold">Foto Rumah</h2>

          <p className="text-sm text-muted text-pretty">
            Membantu warga mengenali rumahnya. Boleh dikosongkan.
          </p>

          {fileError ? <Alert tone="error">{fileError}</Alert> : null}

          {shownPhoto ? (
            // Sengaja <img>, bukan next/image: sumbernya bisa berupa blob lokal
            // hasil pratinjau yang belum punya alamat publik.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={shownPhoto}
              alt="Pratinjau foto rumah"
              className="aspect-16/9 w-full max-w-md rounded-xl border border-border object-cover"
            />
          ) : (
            <p className="text-muted">Belum ada foto.</p>
          )}

          <Field
            label="Pilih gambar"
            htmlFor="photoFile"
            hint={`JPG, PNG, WEBP, GIF, atau AVIF. Maksimal ${IMAGE_MAX_LABEL}.`}
          >
            <input
              id="photoFile"
              name="photoFile"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
              onChange={onPickFile}
              className={cn(
                inputClasses,
                "py-2.5 file:mr-3 file:rounded-lg file:border-0 file:bg-surface-muted file:px-3 file:py-1.5 file:text-foreground",
              )}
            />
          </Field>

          {currentPhoto ? (
            <label className="flex min-h-11 items-center gap-3">
              <input
                type="checkbox"
                name="removePhoto"
                checked={removePhoto}
                onChange={(event) => setRemovePhoto(event.target.checked)}
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
              defaultChecked={house?.isActive ?? true}
              className="mt-0.5 size-5"
            />
            <span>
              <span className="font-medium">Tampilkan di peta warga</span>
              <span className="block text-sm text-muted text-pretty">
                Rumah yang disembunyikan hilang dari peta dan tidak ikut dihitung pada ringkasan per
                RT, tetapi datanya tetap tersimpan.
              </span>
            </span>
          </label>
        </CardBody>
      </Card>

      <div className="flex flex-wrap gap-3">
        <SubmitButton isEdit={Boolean(house)} />
        <Link
          href="/admin/rumah"
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
      {pending ? "Menyimpan…" : isEdit ? "Simpan Perubahan" : "Simpan Rumah"}
    </Button>
  );
}
