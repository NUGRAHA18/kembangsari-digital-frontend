"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useFormStatus } from "react-dom";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { Field, inputClasses } from "@/components/ui/field";
import { saveAgendaAction, type AgendaFormState } from "@/app/admin/(dasbor)/agenda/actions";
import { toDateTimeLocal } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Agenda } from "@/types/api";

const INITIAL: AgendaFormState = {};

/**
 * Form agenda.
 *
 * Waktu diisi lewat `datetime-local`, yang menampilkan pemilih tanggal bawaan
 * ponsel — jauh lebih nyaman daripada mengetik tanggal di layar kecil.
 * Nilainya ditafsirkan sebagai WIB di kedua arah; lihat `lib/format.ts`.
 */
export function AgendaForm({ agenda }: { agenda?: Agenda }) {
  const [state, formAction] = useActionState(saveAgendaAction, INITIAL);

  const startDate = state.values?.startDate ?? (agenda ? toDateTimeLocal(agenda.startDate) : "");
  const endDate =
    state.values?.endDate ?? (agenda?.endDate ? toDateTimeLocal(agenda.endDate) : "");

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {agenda ? <input type="hidden" name="id" value={agenda.id} /> : null}

      {state.error ? <Alert tone="error">{state.error}</Alert> : null}

      <Card>
        <CardBody className="flex flex-col gap-5">
          <Field label="Judul kegiatan" htmlFor="title" required>
            <input
              id="title"
              name="title"
              required
              maxLength={200}
              defaultValue={state.values?.title ?? agenda?.title ?? ""}
              placeholder="Misalnya: Posyandu Balita Melati"
              className={inputClasses}
            />
          </Field>

          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Waktu mulai" htmlFor="startDate" required>
              <input
                id="startDate"
                name="startDate"
                type="datetime-local"
                required
                defaultValue={startDate}
                className={inputClasses}
              />
            </Field>

            <Field
              label="Waktu selesai"
              htmlFor="endDate"
              hint="Boleh dikosongkan bila kegiatannya tidak berjadwal selesai."
            >
              <input
                id="endDate"
                name="endDate"
                type="datetime-local"
                defaultValue={endDate}
                className={inputClasses}
              />
            </Field>
          </div>

          <Field label="Tempat" htmlFor="location">
            <input
              id="location"
              name="location"
              maxLength={200}
              defaultValue={state.values?.location ?? agenda?.location ?? ""}
              placeholder="Misalnya: Balai Padukuhan Kembangsari"
              className={inputClasses}
            />
          </Field>

          <Field
            label="Keterangan"
            htmlFor="description"
            hint="Ditampilkan di halaman detail agenda. Pisahkan paragraf dengan satu baris kosong."
          >
            <textarea
              id="description"
              name="description"
              rows={6}
              defaultValue={state.values?.description ?? agenda?.description ?? ""}
              className={cn(inputClasses, "min-h-32 leading-relaxed")}
            />
          </Field>

          <Field
            label="Slug"
            htmlFor="slug"
            hint={
              agenda
                ? "Alamat halaman detailnya. Mengubahnya memutus tautan yang sudah dibagikan ke grup WhatsApp."
                : "Biarkan kosong. Sistem membuatnya sendiri dari judul, dan menambahkan angka bila judulnya berulang seperti Posyandu bulanan."
            }
          >
            <input
              id="slug"
              name="slug"
              defaultValue={state.values?.slug ?? agenda?.slug ?? ""}
              placeholder={agenda ? undefined : "dibuat otomatis"}
              className={inputClasses}
            />
          </Field>
        </CardBody>
      </Card>

      <div className="flex flex-wrap gap-3">
        <SubmitButton isEdit={Boolean(agenda)} />
        <Link
          href="/admin/agenda"
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
      {pending ? "Menyimpan…" : isEdit ? "Simpan Perubahan" : "Simpan Agenda"}
    </Button>
  );
}
