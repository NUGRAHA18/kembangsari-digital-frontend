"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useFormStatus } from "react-dom";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { Field, inputClasses } from "@/components/ui/field";
import {
  saveAnnouncementAction,
  type AnnouncementFormState,
} from "@/app/admin/(dasbor)/pengumuman/actions";
import { cn } from "@/lib/utils";
import type { Announcement } from "@/types/api";

const INITIAL: AnnouncementFormState = {};

/**
 * Form pengumuman. Hanya tiga isian, jadi tidak dipecah menjadi beberapa kartu
 * seperti form berita.
 *
 * Pengumuman baru dicentang aktif sejak awal: yang menulisnya hampir selalu
 * memang ingin langsung mengumumkan, berbeda dari berita yang sering disiapkan
 * sebagai draf lebih dulu.
 */
export function AnnouncementForm({ announcement }: { announcement?: Announcement }) {
  const [state, formAction] = useActionState(saveAnnouncementAction, INITIAL);

  const initial = { ...announcement, ...state.values };

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {announcement ? <input type="hidden" name="id" value={announcement.id} /> : null}

      {state.error ? <Alert tone="error">{state.error}</Alert> : null}

      <Card>
        <CardBody className="flex flex-col gap-5">
          <Field label="Judul" htmlFor="title" required>
            <input
              id="title"
              name="title"
              required
              maxLength={200}
              defaultValue={initial.title ?? ""}
              placeholder="Misalnya: Kerja Bakti Membersihkan Saluran Air"
              className={inputClasses}
            />
          </Field>

          <Field
            label="Isi pengumuman"
            htmlFor="content"
            required
            hint="Ditampilkan sebagai teks biasa. Pisahkan paragraf dengan satu baris kosong."
          >
            <textarea
              id="content"
              name="content"
              required
              rows={10}
              defaultValue={initial.content ?? ""}
              className={cn(inputClasses, "min-h-48 leading-relaxed")}
            />
          </Field>

          <label className="flex min-h-11 items-start gap-3">
            <input
              type="checkbox"
              name="isActive"
              defaultChecked={initial.isActive ?? true}
              className="mt-0.5 size-5"
            />
            <span>
              <span className="font-medium">Tampilkan ke warga</span>
              <span className="block text-sm text-muted text-pretty">
                Pengumuman yang tidak aktif hilang dari beranda dan halaman pengumuman, tetapi
                tidak terhapus.
              </span>
            </span>
          </label>
        </CardBody>
      </Card>

      <div className="flex flex-wrap gap-3">
        <SubmitButton isEdit={Boolean(announcement)} />
        <Link
          href="/admin/pengumuman"
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
      {pending ? "Menyimpan…" : isEdit ? "Simpan Perubahan" : "Simpan Pengumuman"}
    </Button>
  );
}
