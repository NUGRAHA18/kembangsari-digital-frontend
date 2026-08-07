"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { Field, inputClasses } from "@/components/ui/field";
import {
  saveSettingsAction,
  type SettingsFormState,
} from "@/app/admin/(dasbor)/pengaturan/actions";
import { SETTING_GROUPS, type SettingField } from "@/features/settings/fields";
import { validateImage } from "@/lib/image";
import { cn } from "@/lib/utils";
import type { Setting } from "@/types/api";

const INITIAL: SettingsFormState = {};

/**
 * Form pengaturan situs.
 *
 * Seluruh key disimpan dalam satu form, tetapi yang dikirim ke backend hanya
 * yang berubah — `PATCH /settings/:key` bekerja satu key per permintaan.
 *
 * Nilai bawaan `SETTINGS_FALLBACK` sengaja tidak dipakai di sini: yang harus
 * terlihat pengelola adalah apa yang benar-benar tersimpan, bukan cadangan
 * milik frontend yang akan ikut tertulis begitu tombol simpan ditekan.
 */
export function SettingsForm({ settings }: { settings: Setting[] }) {
  const [state, formAction] = useActionState(saveSettingsAction, INITIAL);

  const stored: Record<string, string> = {};
  for (const setting of settings) stored[setting.key] = setting.value ?? "";

  const initial = (key: string) => state.values?.[key] ?? stored[key] ?? "";

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {state.error ? <Alert tone="error">{state.error}</Alert> : null}

      {SETTING_GROUPS.map((group) => (
        <Card key={group.title}>
          <CardBody className="flex flex-col gap-5">
            <div>
              <h2 className="font-semibold">{group.title}</h2>
              {group.description ? (
                <p className="mt-1 text-sm text-muted text-pretty">{group.description}</p>
              ) : null}
            </div>

            {group.fields.map((field) =>
              field.kind === "image" ? (
                <ImageSetting key={field.key} field={field} current={initial(field.key)} />
              ) : (
                <Field key={field.key} label={field.label} htmlFor={field.key} hint={field.hint}>
                  {field.kind === "textarea" ? (
                    <textarea
                      id={field.key}
                      name={field.key}
                      rows={3}
                      defaultValue={initial(field.key)}
                      placeholder={field.placeholder}
                      className={cn(inputClasses, "min-h-20 leading-relaxed")}
                    />
                  ) : (
                    <input
                      id={field.key}
                      name={field.key}
                      defaultValue={initial(field.key)}
                      placeholder={field.placeholder}
                      className={inputClasses}
                    />
                  )}
                </Field>
              ),
            )}
          </CardBody>
        </Card>
      ))}

      <div className="flex flex-wrap gap-3">
        <SubmitButton />
      </div>
    </form>
  );
}

/**
 * Satu pengaturan berupa gambar.
 *
 * URL yang tersimpan ikut terkirim sebagai input tersembunyi, jadi menyimpan
 * form tanpa menyentuh gambarnya tidak menghapus apa pun — pola yang sama
 * dengan gambar sampul di form berita dan potensi.
 */
function ImageSetting({ field, current }: { field: SettingField; current: string }) {
  const [preview, setPreview] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [remove, setRemove] = useState(false);

  const shown = preview ?? (remove ? null : current || null);
  const fileId = `file_${field.key}`;

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
    setRemove(false);
    setPreview(URL.createObjectURL(file));
  }

  return (
    <div className="flex flex-col gap-3 border-t border-border pt-5 first:border-0 first:pt-0">
      <input type="hidden" name={`current_${field.key}`} value={current} />

      <p className="font-medium">{field.label}</p>
      {field.hint ? <p className="text-sm text-muted text-pretty">{field.hint}</p> : null}

      {fileError ? <Alert tone="error">{fileError}</Alert> : null}

      {shown ? (
        // Sengaja <img>: sumbernya bisa berupa blob lokal hasil pratinjau yang
        // belum punya alamat publik.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={shown}
          alt={`Pratinjau ${field.label.toLowerCase()}`}
          className="max-h-32 w-fit max-w-full rounded-xl border border-border bg-surface-muted object-contain p-2"
        />
      ) : (
        <p className="text-muted">Belum ada gambar.</p>
      )}

      <Field
        label={`Pilih berkas ${field.label.toLowerCase()}`}
        htmlFor={fileId}
        hint="JPG, PNG, WEBP, GIF, atau AVIF. Maksimal 5 MB."
      >
        <input
          id={fileId}
          name={fileId}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
          onChange={onPickFile}
          className={cn(
            inputClasses,
            "py-2.5 file:mr-3 file:rounded-lg file:border-0 file:bg-surface-muted file:px-3 file:py-1.5 file:text-foreground",
          )}
        />
      </Field>

      {current ? (
        <label className="flex min-h-11 items-center gap-3">
          <input
            type="checkbox"
            name={`remove_${field.key}`}
            checked={remove}
            onChange={(event) => setRemove(event.target.checked)}
            className="size-5"
          />
          Hapus {field.label.toLowerCase()} yang sekarang
        </label>
      ) : null}
    </div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" size="lg" disabled={pending}>
      {pending ? "Menyimpan…" : "Simpan Pengaturan"}
    </Button>
  );
}
