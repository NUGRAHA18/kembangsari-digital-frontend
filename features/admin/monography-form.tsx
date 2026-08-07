"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useFormStatus } from "react-dom";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { Field, inputClasses } from "@/components/ui/field";
import {
  saveMonographyAction,
  type MonographyFormState,
} from "@/app/admin/(dasbor)/monografi/actions";
import { EMPLOYMENT_KEYS, EMPLOYMENT_LABELS } from "@/features/monography/employment";
import {
  EDUCATION_FIELDS,
  HOUSEHOLD_FIELDS,
  RELIGION_FIELDS,
  type StatField,
} from "@/features/monography/fields";
import type { PopulationStat } from "@/types/api";

const INITIAL: MonographyFormState = {};

/**
 * Form monografi.
 *
 * Berisi 30-an kolom angka, jadi seluruhnya `defaultValue` — form ini tidak
 * punya satu pun isian yang perlu berubah mengikuti isian lain, dan menahan
 * semuanya sebagai state hanya menambah kerja tanpa memberi apa pun.
 *
 * Kolom kosong berarti **tidak didata**, bukan nol. Bedanya terasa di halaman
 * publik: kategori kosong tidak ditampilkan, sedangkan 0 tampil sebagai batang
 * kosong yang menyatakan angkanya memang nihil.
 */
export function MonographyForm({ stat }: { stat?: PopulationStat }) {
  const [state, formAction] = useActionState(saveMonographyAction, INITIAL);

  // Nilai yang dikembalikan aksi didahulukan supaya isian tidak hilang ketika
  // penyimpanan ditolak — mengetik ulang 30 kolom karena satu salah ketik
  // adalah cara tercepat membuat pengelola berhenti memakai dashboard.
  const initial = (key: string, fallback: unknown) => {
    const returned = state.values?.[key];
    if (returned !== undefined) return returned;
    return fallback === null || fallback === undefined ? "" : String(fallback);
  };

  const countField = (field: StatField) => (
    <Field key={field.key} label={field.label} htmlFor={field.key}>
      <input
        id={field.key}
        name={field.key}
        type="number"
        inputMode="numeric"
        min={0}
        step={1}
        defaultValue={initial(field.key, stat?.[field.key])}
        placeholder="Belum didata"
        className={inputClasses}
      />
    </Field>
  );

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {stat ? <input type="hidden" name="id" value={stat.id} /> : null}

      {state.error ? <Alert tone="error">{state.error}</Alert> : null}

      <Card>
        <CardBody className="flex flex-col gap-5">
          <h2 className="font-semibold">Kependudukan</h2>

          <div className="grid gap-5 md:grid-cols-2">
            <Field
              label="Tahun data"
              htmlFor="year"
              required
              hint="Satu tahun hanya boleh punya satu baris data."
            >
              <input
                id="year"
                name="year"
                type="number"
                inputMode="numeric"
                required
                min={1900}
                step={1}
                defaultValue={initial("year", stat?.year)}
                placeholder="2026"
                className={inputClasses}
              />
            </Field>

            <Field label="Jumlah penduduk" htmlFor="totalPopulation" required>
              <input
                id="totalPopulation"
                name="totalPopulation"
                type="number"
                inputMode="numeric"
                required
                min={0}
                step={1}
                defaultValue={initial("totalPopulation", stat?.totalPopulation)}
                className={inputClasses}
              />
            </Field>

            <Field label="Laki-laki" htmlFor="maleCount" required>
              <input
                id="maleCount"
                name="maleCount"
                type="number"
                inputMode="numeric"
                required
                min={0}
                step={1}
                defaultValue={initial("maleCount", stat?.maleCount)}
                className={inputClasses}
              />
            </Field>

            <Field label="Perempuan" htmlFor="femaleCount" required>
              <input
                id="femaleCount"
                name="femaleCount"
                type="number"
                inputMode="numeric"
                required
                min={0}
                step={1}
                defaultValue={initial("femaleCount", stat?.femaleCount)}
                className={inputClasses}
              />
            </Field>
          </div>

          <p className="text-sm text-muted text-pretty">
            Laki-laki dan perempuan harus berjumlah persis sama dengan jumlah penduduk —
            keduanya tampil berdampingan di halaman monografi.
          </p>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="flex flex-col gap-5">
          <h2 className="font-semibold">Tingkat Pendidikan</h2>
          <FieldNote />
          <div className="grid gap-5 md:grid-cols-2">{EDUCATION_FIELDS.map(countField)}</div>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="flex flex-col gap-5">
          <h2 className="font-semibold">Mata Pencaharian</h2>
          <FieldNote />

          <div className="grid gap-5 md:grid-cols-2">
            {EMPLOYMENT_KEYS.map((key) => {
              const name = `employment_${key}`;

              return (
                <Field key={key} label={EMPLOYMENT_LABELS[key]} htmlFor={name}>
                  <input
                    id={name}
                    name={name}
                    type="number"
                    inputMode="numeric"
                    min={0}
                    step={1}
                    defaultValue={initial(name, stat?.employmentData?.[key])}
                    placeholder="Belum didata"
                    className={inputClasses}
                  />
                </Field>
              );
            })}
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="flex flex-col gap-5">
          <h2 className="font-semibold">Pemeluk Agama</h2>
          <FieldNote />
          <div className="grid gap-5 md:grid-cols-2">{RELIGION_FIELDS.map(countField)}</div>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="flex flex-col gap-5">
          <h2 className="font-semibold">Keluarga &amp; Wilayah</h2>
          <FieldNote />
          <div className="grid gap-5 md:grid-cols-2">{HOUSEHOLD_FIELDS.map(countField)}</div>
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <label className="flex min-h-11 items-start gap-3">
            <input
              type="checkbox"
              name="isPublished"
              defaultChecked={stat?.isPublished ?? false}
              className="mt-0.5 size-5"
            />
            <span>
              <span className="font-medium">Terbitkan ke halaman monografi</span>
              <span className="block text-sm text-muted text-pretty">
                Selama belum diterbitkan, data tahun ini hanya terlihat di dashboard.
              </span>
            </span>
          </label>
        </CardBody>
      </Card>

      <div className="flex flex-wrap gap-3">
        <SubmitButton isEdit={Boolean(stat)} />
        <Link
          href="/admin/monografi"
          className="inline-flex min-h-11 items-center rounded-xl px-4 text-muted transition-colors hover:bg-surface-muted"
        >
          Batal
        </Link>
      </div>
    </form>
  );
}

/** Diulang di setiap kelompok karena formnya panjang dan aturannya mudah terlupa. */
function FieldNote() {
  return (
    <p className="text-sm text-muted text-pretty">
      Kosongkan kolom yang belum didata — kolom kosong tidak ditampilkan ke warga, sedangkan 0
      berarti sudah dihitung dan hasilnya memang nihil.
    </p>
  );
}

function SubmitButton({ isEdit }: { isEdit: boolean }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" size="lg" disabled={pending}>
      {pending ? "Menyimpan…" : isEdit ? "Simpan Perubahan" : "Simpan Data"}
    </Button>
  );
}
