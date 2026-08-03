"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { useFormStatus } from "react-dom";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { Field, inputClasses } from "@/components/ui/field";
import { saveUmkmAction, type UmkmFormState } from "@/app/admin/(dasbor)/umkm/actions";
import { slugify } from "@/lib/slug";
import { cn } from "@/lib/utils";
import type { UMKM } from "@/types/api";

const INITIAL: UmkmFormState = {};

/**
 * Form UMKM.
 *
 * Isian dikelompokkan menjadi tiga kartu — identitas, kontak, lokasi — karena
 * jumlahnya dua belas dan di layar ponsel deretan sepanjang itu tanpa jeda
 * membuat pengelola kehilangan tempat.
 */
export function UmkmForm({ umkm }: { umkm?: UMKM }) {
  const [state, formAction] = useActionState(saveUmkmAction, INITIAL);

  const values = state.values;
  const initial = (key: keyof UMKM & string, fallback = "") =>
    values?.[key as keyof typeof values] ?? (umkm?.[key] as string | number | null) ?? fallback;

  const [name, setName] = useState(String(initial("name")));
  const [slug, setSlug] = useState(String(initial("slug")));
  const [slugEdited, setSlugEdited] = useState(Boolean(umkm?.slug || values?.slug));

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {umkm ? <input type="hidden" name="id" value={umkm.id} /> : null}

      {state.error ? <Alert tone="error">{state.error}</Alert> : null}

      <Card>
        <CardBody className="flex flex-col gap-5">
          <h2 className="font-semibold">Identitas Usaha</h2>

          <Field label="Nama usaha" htmlFor="name" required>
            <input
              id="name"
              name="name"
              required
              maxLength={150}
              value={name}
              placeholder="Misalnya: Batik Tulis Sekar Arum"
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
                Alamat halaman: <span className="break-all">/umkm/{slug || "…"}</span>
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

          <Field
            label="Deskripsi"
            htmlFor="description"
            required
            hint="Ceritakan produk atau jasanya. Pisahkan paragraf dengan satu baris kosong."
          >
            <textarea
              id="description"
              name="description"
              required
              rows={8}
              defaultValue={String(initial("description"))}
              className={cn(inputClasses, "min-h-40 leading-relaxed")}
            />
          </Field>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="flex flex-col gap-5">
          <h2 className="font-semibold">Kontak</h2>

          <div className="grid gap-5 md:grid-cols-2">
            <Field
              label="WhatsApp"
              htmlFor="whatsapp"
              hint="Boleh ditulis 08…; disimpan otomatis sebagai 628…"
            >
              <input
                id="whatsapp"
                name="whatsapp"
                inputMode="tel"
                defaultValue={String(initial("whatsapp"))}
                placeholder="081234567890"
                className={inputClasses}
              />
            </Field>

            <Field label="Telepon" htmlFor="phone">
              <input
                id="phone"
                name="phone"
                inputMode="tel"
                defaultValue={String(initial("phone"))}
                className={inputClasses}
              />
            </Field>
          </div>

          <Field label="Email" htmlFor="email">
            <input
              id="email"
              name="email"
              type="email"
              defaultValue={String(initial("email"))}
              className={inputClasses}
            />
          </Field>

          <Field
            label="Instagram"
            htmlFor="instagram"
            hint="Tautan lengkap, bukan nama pengguna."
          >
            <input
              id="instagram"
              name="instagram"
              type="url"
              defaultValue={String(initial("instagram"))}
              placeholder="https://instagram.com/namausaha"
              className={inputClasses}
            />
          </Field>

          <Field label="Facebook" htmlFor="facebook">
            <input
              id="facebook"
              name="facebook"
              type="url"
              defaultValue={String(initial("facebook"))}
              placeholder="https://facebook.com/namausaha"
              className={inputClasses}
            />
          </Field>

          <Field label="Website" htmlFor="website">
            <input
              id="website"
              name="website"
              type="url"
              defaultValue={String(initial("website"))}
              placeholder="https://…"
              className={inputClasses}
            />
          </Field>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="flex flex-col gap-5">
          <h2 className="font-semibold">Lokasi</h2>

          <Field label="Alamat" htmlFor="address">
            <input
              id="address"
              name="address"
              maxLength={250}
              defaultValue={String(initial("address"))}
              className={inputClasses}
            />
          </Field>

          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Lintang (latitude)" htmlFor="latitude">
              <input
                id="latitude"
                name="latitude"
                inputMode="decimal"
                defaultValue={String(initial("latitude"))}
                placeholder="-7.7391"
                className={inputClasses}
              />
            </Field>

            <Field label="Bujur (longitude)" htmlFor="longitude">
              <input
                id="longitude"
                name="longitude"
                inputMode="decimal"
                defaultValue={String(initial("longitude"))}
                placeholder="110.2043"
                className={inputClasses}
              />
            </Field>
          </div>

          <p className="text-sm text-muted text-pretty">
            Koordinat dipakai untuk tombol &ldquo;Petunjuk Arah&rdquo;. Ambil dari Google Maps:
            tekan lama di lokasinya, lalu salin dua angka yang muncul. Isi keduanya atau
            kosongkan keduanya.
          </p>
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <label className="flex min-h-11 items-start gap-3">
            <input
              type="checkbox"
              name="isActive"
              defaultChecked={umkm?.isActive ?? true}
              className="mt-0.5 size-5"
            />
            <span>
              <span className="font-medium">Tampilkan ke warga</span>
              <span className="block text-sm text-muted text-pretty">
                UMKM yang tidak aktif hilang dari daftar dan halaman detailnya, tetapi datanya
                tetap tersimpan.
              </span>
            </span>
          </label>
        </CardBody>
      </Card>

      <div className="flex flex-wrap gap-3">
        <SubmitButton isEdit={Boolean(umkm)} />
        <Link
          href="/admin/umkm"
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
      {pending ? "Menyimpan…" : isEdit ? "Simpan Perubahan" : "Simpan UMKM"}
    </Button>
  );
}
