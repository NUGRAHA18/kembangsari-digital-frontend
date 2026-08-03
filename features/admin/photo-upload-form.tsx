"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, inputClasses } from "@/components/ui/field";
import {
  addPhotosAction,
  addVideoAction,
  type PhotoFormState,
} from "@/app/admin/(dasbor)/galeri/actions";
import { validateImage } from "@/lib/image";
import { cn } from "@/lib/utils";
import { UPLOAD_MAX_FILES } from "@/types/api";

const INITIAL: PhotoFormState = {};

/**
 * Unggah foto ke sebuah album, beberapa sekaligus.
 *
 * Berkas diperiksa di sini sebelum dikirim karena unggahan galeri adalah yang
 * paling berat di seluruh dashboard: sepuluh foto ponsel bisa puluhan megabita,
 * dan menunggunya terkirim hanya untuk ditolak backend adalah hukuman berat di
 * jaringan padukuhan.
 */
export function PhotoUploadForm({ albumId, albumSlug }: { albumId: string; albumSlug: string }) {
  const [state, formAction] = useActionState(addPhotosAction, INITIAL);
  const [localError, setLocalError] = useState<string | null>(null);
  const [count, setCount] = useState(0);

  function onPickFiles(event: React.ChangeEvent<HTMLInputElement>) {
    const files = [...(event.target.files ?? [])];
    setCount(files.length);

    if (files.length > UPLOAD_MAX_FILES) {
      setLocalError(`Maksimal ${UPLOAD_MAX_FILES} foto sekali unggah. Anda memilih ${files.length}.`);
      return;
    }

    const rejected = files.map((file) => [file, validateImage(file)] as const).find(([, e]) => e);
    setLocalError(rejected ? `${rejected[0].name}: ${rejected[1]}` : null);
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="albumId" value={albumId} />
      <input type="hidden" name="albumSlug" value={albumSlug} />

      {localError ?? state.error ? (
        <Alert tone="error">{localError ?? state.error}</Alert>
      ) : null}

      <Field
        label="Pilih foto"
        htmlFor="photos"
        hint={`Bisa memilih beberapa sekaligus, maksimal ${UPLOAD_MAX_FILES} foto per unggahan dan 5 MB per foto.`}
      >
        <input
          id="photos"
          name="photos"
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
          onChange={onPickFiles}
          className={cn(
            inputClasses,
            "py-2.5 file:mr-3 file:rounded-lg file:border-0 file:bg-surface-muted file:px-3 file:py-1.5 file:text-foreground",
          )}
        />
      </Field>

      <UploadButton count={count} disabled={Boolean(localError)} />
    </form>
  );
}

function UploadButton({ count, disabled }: { count: number; disabled: boolean }) {
  const { pending } = useFormStatus();

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button type="submit" disabled={pending || disabled}>
        {pending ? "Mengunggah…" : "Unggah Foto"}
      </Button>

      {/* Unggahan galeri bisa berjalan lama; tanpa keterangan ini layarnya
          tampak diam saja dan pengguna cenderung menekan tombolnya lagi. */}
      {pending ? (
        <span className="text-muted" aria-live="polite">
          {count > 1 ? `Mengirim ${count} foto, mohon tunggu…` : "Mohon tunggu…"}
        </span>
      ) : count > 0 ? (
        <span className="text-muted">{count} foto dipilih</span>
      ) : null}
    </div>
  );
}

/** Video tidak diunggah, hanya dicatat tautannya — halaman publik membukanya di tab baru. */
export function VideoLinkForm({ albumId, albumSlug }: { albumId: string; albumSlug: string }) {
  const [state, formAction] = useActionState(addVideoAction, INITIAL);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="albumId" value={albumId} />
      <input type="hidden" name="albumSlug" value={albumSlug} />

      {state.error ? <Alert tone="error">{state.error}</Alert> : null}

      <Field
        label="Tautan video"
        htmlFor="url"
        required
        hint="Tempelkan alamat video dari YouTube atau layanan lain. Videonya tidak ikut tersimpan di server padukuhan."
      >
        <input
          id="url"
          name="url"
          type="url"
          required
          placeholder="https://youtube.com/watch?v=…"
          className={inputClasses}
        />
      </Field>

      <Field label="Keterangan" htmlFor="videoCaption">
        <input id="videoCaption" name="caption" maxLength={200} className={inputClasses} />
      </Field>

      <VideoButton />
    </form>
  );
}

function VideoButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" variant="outline" disabled={pending}>
      {pending ? "Menyimpan…" : "Tambah Video"}
    </Button>
  );
}
