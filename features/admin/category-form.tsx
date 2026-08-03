"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { useFormStatus } from "react-dom";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, inputClasses } from "@/components/ui/field";
import { saveCategoryAction, type CategoryFormState } from "@/app/admin/(dasbor)/kategori/actions";
import { slugify } from "@/lib/slug";
import type { Category } from "@/types/api";

const INITIAL: CategoryFormState = {};

/**
 * Form kategori — dipakai untuk menambah (di halaman daftar) maupun mengubah
 * (di halamannya sendiri). Isinya hanya dua kolom, jadi tidak ada gunanya
 * memberi halaman tersendiri untuk menambah.
 */
export function CategoryForm({ category }: { category?: Category }) {
  const [state, formAction] = useActionState(saveCategoryAction, INITIAL);

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
          placeholder="Misalnya: Pembangunan"
          onChange={(event) => {
            setName(event.target.value);
            if (!slugEdited) setSlug(slugify(event.target.value));
          }}
          className={inputClasses}
        />
      </Field>

      <Field
        label="Slug"
        htmlFor="slug"
        hint={
          <>
            Dipakai pada alamat filter: <span className="break-all">/berita?kategori={slug || "…"}</span>
          </>
        }
      >
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

      <div className="flex flex-wrap gap-3">
        <SubmitButton isEdit={Boolean(category)} />
        {category ? (
          <Link
            href="/admin/kategori"
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
    <Button type="submit" disabled={pending}>
      {pending ? "Menyimpan…" : isEdit ? "Simpan Perubahan" : "Tambah Kategori"}
    </Button>
  );
}
