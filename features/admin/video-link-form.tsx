"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, inputClasses } from "@/components/ui/field";
import { addVideoAction } from "@/app/admin/(dasbor)/galeri/actions";
import type { FormState } from "@/lib/form-state";

const INITIAL: FormState = {};

/**
 * Menambahkan video ke album galeri.
 *
 * Videonya tidak diunggah, hanya tautannya yang dicatat: halaman publik memang
 * membukanya di tab baru, dan berkas video akan menghabiskan kuota bucket jauh
 * lebih cepat daripada foto.
 */
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
    <Button type="submit" variant="outline" loading={pending}>
      {pending ? "Menyimpan…" : "Tambah Video"}
    </Button>
  );
}
