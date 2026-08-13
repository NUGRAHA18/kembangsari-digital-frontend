"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { useFormStatus } from "react-dom";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, inputClasses } from "@/components/ui/field";
import {
  saveMapCategoryAction,
  type MapCategoryFormState,
} from "@/app/admin/(dasbor)/peta/kategori/actions";
import { slugify } from "@/lib/slug";
import type { MapCategory } from "@/types/api";

const INITIAL: MapCategoryFormState = {};

/**
 * Form kategori lokasi peta — dipakai untuk menambah (di halaman daftar)
 * maupun mengubah (di halamannya sendiri), sama seperti kategori berita.
 */
export function MapCategoryForm({ category }: { category?: MapCategory }) {
  const [state, formAction] = useActionState(saveMapCategoryAction, INITIAL);

  const initial = { ...category, ...state.values };

  const [name, setName] = useState(initial.name ?? "");
  const [slug, setSlug] = useState(initial.slug ?? "");
  const [slugEdited, setSlugEdited] = useState(Boolean(initial.slug));

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {category ? <input type="hidden" name="id" value={category.id} /> : null}

      {state.error ? <Alert tone="error">{state.error}</Alert> : null}

      <Field label="Nama kategori" htmlFor="name" required>
        <input
          id="name"
          name="name"
          required
          maxLength={60}
          value={name}
          placeholder="Misalnya: Fasilitas Umum"
          onChange={(event) => {
            setName(event.target.value);
            if (!slugEdited) setSlug(slugify(event.target.value));
          }}
          className={inputClasses}
        />
      </Field>

      <Field label="Slug" htmlFor="slug" hint="Penanda kategori yang tidak tampil ke warga.">
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

      {/* Kolom `icon` disediakan backend, tetapi peta di portal belum
          memakainya: pin diwarnai berdasarkan urutan kategori, bukan digambar
          dari nama ikon. Kolomnya tetap ada supaya nama ikon yang sudah
          terlanjur tersimpan tidak terhapus diam-diam saat kategori disunting. */}
      <Field
        label="Nama ikon"
        htmlFor="icon"
        hint="Opsional. Belum dipakai peta di portal — pin masih diwarnai menurut urutan kategori."
      >
        <input
          id="icon"
          name="icon"
          maxLength={40}
          defaultValue={initial.icon ?? ""}
          placeholder="Misalnya: home"
          className={inputClasses}
        />
      </Field>

      <div className="flex flex-wrap gap-3">
        <SubmitButton isEdit={Boolean(category)} />
        {category ? (
          <Link
            href="/admin/peta/kategori"
            className="inline-flex min-h-11 items-center rounded-xl px-4 text-muted transition-colors hover:bg-surface-muted"
          >
            Batal
          </Link>
        ) : null}
      </div>
    </form>
  );
}

function SubmitButton({ isEdit }: { isEdit: boolean }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" loading={pending}>
      {pending ? "Menyimpan…" : isEdit ? "Simpan Perubahan" : "Tambah Kategori"}
    </Button>
  );
}
