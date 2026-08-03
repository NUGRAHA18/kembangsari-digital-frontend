"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, inputClasses } from "@/components/ui/field";
import type { FormState } from "@/lib/form-state";
import { validateImage } from "@/lib/image";
import { cn } from "@/lib/utils";
import { UPLOAD_MAX_FILES } from "@/types/api";

const INITIAL: FormState = {};

/**
 * Unggah beberapa gambar sekaligus ke sebuah induk — album galeri, UMKM, atau
 * potensi. Yang berbeda antar-modul hanya aksinya, jadi aksinya diterima
 * sebagai prop alih-alih komponennya disalin per modul.
 *
 * Berkas diperiksa di sini sebelum dikirim karena unggahan gambar adalah
 * permintaan terberat di seluruh dashboard: sepuluh foto ponsel bisa puluhan
 * megabita, dan menunggunya terkirim hanya untuk ditolak backend adalah hukuman
 * berat di jaringan padukuhan.
 */
export function ImageUploadForm({
  action,
  hiddenFields,
  hint,
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  /** Penanda induk, mis. `{ albumId, albumSlug }`. */
  hiddenFields: Record<string, string>;
  hint?: string;
}) {
  const [state, formAction] = useActionState(action, INITIAL);
  const [localError, setLocalError] = useState<string | null>(null);
  const [count, setCount] = useState(0);

  function onPickFiles(event: React.ChangeEvent<HTMLInputElement>) {
    const files = [...(event.target.files ?? [])];
    setCount(files.length);

    if (files.length > UPLOAD_MAX_FILES) {
      setLocalError(
        `Maksimal ${UPLOAD_MAX_FILES} gambar sekali unggah. Anda memilih ${files.length}.`,
      );
      return;
    }

    const rejected = files.map((file) => [file, validateImage(file)] as const).find(([, e]) => e);
    setLocalError(rejected ? `${rejected[0].name}: ${rejected[1]}` : null);
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {Object.entries(hiddenFields).map(([key, value]) => (
        <input key={key} type="hidden" name={key} value={value} />
      ))}

      {localError ?? state.error ? (
        <Alert tone="error">{localError ?? state.error}</Alert>
      ) : null}

      <Field
        label="Pilih gambar"
        htmlFor="images"
        hint={
          hint ??
          `Bisa memilih beberapa sekaligus, maksimal ${UPLOAD_MAX_FILES} gambar per unggahan dan 5 MB per gambar.`
        }
      >
        <input
          id="images"
          name="images"
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
        {pending ? "Mengunggah…" : "Unggah Gambar"}
      </Button>

      {/* Unggahan bisa berjalan lama; tanpa keterangan ini layarnya tampak diam
          saja dan tombolnya cenderung ditekan berulang. */}
      {pending ? (
        <span className="text-muted" aria-live="polite">
          {count > 1 ? `Mengirim ${count} gambar, mohon tunggu…` : "Mohon tunggu…"}
        </span>
      ) : count > 0 ? (
        <span className="text-muted">{count} gambar dipilih</span>
      ) : null}
    </div>
  );
}
