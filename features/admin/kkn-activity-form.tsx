"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { useFormStatus } from "react-dom";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { Field, inputClasses } from "@/components/ui/field";
import {
  saveKknActivityAction,
  type KknActivityFormState,
} from "@/app/admin/(dasbor)/program-kkn/actions";
import { toDateInput } from "@/lib/format";
import { IMAGE_MAX_LABEL, validateImage } from "@/lib/image";
import { cn } from "@/lib/utils";
import type { KKNActivity } from "@/types/api";

const INITIAL: KknActivityFormState = {};

/**
 * Form satu kegiatan dalam sebuah program KKN.
 *
 * Kegiatan punya satu gambar saja — bukan galeri seperti UMKM dan potensi —
 * sehingga penanganannya sama persis dengan gambar utama berita: unggah berkas,
 * atau centang untuk menghapus yang sekarang.
 */
export function KknActivityForm({
  activity,
  programId,
  programSlug,
}: {
  activity?: KKNActivity;
  programId: string;
  programSlug: string;
}) {
  const [state, formAction] = useActionState(saveKknActivityAction, INITIAL);

  const values = state.values;

  const [preview, setPreview] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [removeImage, setRemoveImage] = useState(false);

  const currentImage = activity?.image ?? "";
  const shownImage = preview ?? (removeImage ? null : currentImage || null);

  // Tanggal disimpan sebagai string ISO, sedangkan input date memakai
  // "YYYY-MM-DD" — keduanya dibaca sebagai WIB, lihat lib/format.ts.
  const defaultDate = values?.date ?? (activity?.date ? toDateInput(activity.date) : "");

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
    setRemoveImage(false);
    setPreview(URL.createObjectURL(file));
  }

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {activity ? <input type="hidden" name="id" value={activity.id} /> : null}
      <input type="hidden" name="programId" value={programId} />
      <input type="hidden" name="programSlug" value={programSlug} />
      <input type="hidden" name="currentImage" value={currentImage} />

      {state.error ? <Alert tone="error">{state.error}</Alert> : null}

      <Card>
        <CardBody className="flex flex-col gap-5">
          <Field label="Judul kegiatan" htmlFor="title" required>
            <input
              id="title"
              name="title"
              required
              maxLength={200}
              defaultValue={values?.title ?? activity?.title ?? ""}
              placeholder="Misalnya: Pelatihan pemilahan sampah RT 03"
              className={inputClasses}
            />
          </Field>

          <Field
            label="Tanggal"
            htmlFor="date"
            hint="Boleh dikosongkan bila kegiatannya berjalan beberapa minggu."
          >
            <input
              id="date"
              name="date"
              type="date"
              defaultValue={defaultDate}
              className={inputClasses}
            />
          </Field>

          <Field
            label="Keterangan"
            htmlFor="description"
            hint="Ditampilkan sebagai teks biasa di bawah judul kegiatan."
          >
            <textarea
              id="description"
              name="description"
              rows={5}
              defaultValue={values?.description ?? activity?.description ?? ""}
              className={cn(inputClasses, "leading-relaxed")}
            />
          </Field>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="flex flex-col gap-4">
          <h2 className="font-semibold">Foto Kegiatan</h2>

          {fileError ? <Alert tone="error">{fileError}</Alert> : null}

          {shownImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={shownImage}
              alt="Pratinjau foto kegiatan"
              className="aspect-16/9 w-full max-w-md rounded-xl border border-border object-cover"
            />
          ) : (
            <p className="text-muted">Belum ada foto.</p>
          )}

          <Field
            label="Pilih foto"
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

      <div className="flex flex-wrap gap-3">
        <SubmitButton isEdit={Boolean(activity)} />
        <Link
          href={`/admin/program-kkn/${programSlug}`}
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
      {pending ? "Menyimpan…" : isEdit ? "Simpan Perubahan" : "Simpan Kegiatan"}
    </Button>
  );
}
