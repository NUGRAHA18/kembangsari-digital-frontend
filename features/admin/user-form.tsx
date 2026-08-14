"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { SubmitButton } from "@/components/ui/submit-button";
import { Alert } from "@/components/ui/alert";
import { Field, inputClasses } from "@/components/ui/field";
import { saveUserAction, type UserFormState } from "@/app/admin/(dasbor)/pengelola/actions";
import { ROLE_HINTS, ROLE_LABELS, ROLE_MATRIX, ROLES } from "@/features/admin/roles";
import { cn } from "@/lib/utils";
import type { User } from "@/types/api";

const INITIAL: UserFormState = {};

/**
 * Form tambah dan ubah pengelola.
 *
 * Dua hal yang membentuk susunannya, keduanya dari kontrak backend:
 *
 * 1. **Peran tidak punya pilihan terpilih otomatis.** Backend menolak `POST`
 *    tanpa `role`, dan alasannya bukan teknis: nilai bawaan apa pun akan salah
 *    untuk sebagian kasus, dan yang paling berbahaya adalah seseorang menjadi
 *    Admin karena satu kolom terlewat. Karena itu radio, bukan `<select>` —
 *    `<select>` selalu punya opsi pertama yang terlihat seperti sudah dipilih.
 * 2. **Email tidak bisa diubah, selamanya.** Di form ubah ia tampil sebagai
 *    teks biasa, bukan input yang dinonaktifkan: input abu-abu mengundang orang
 *    mencari cara mengaktifkannya, teks tidak.
 */
export function UserForm({ user }: { user?: User }) {
  const [state, formAction] = useActionState(saveUserAction, INITIAL);
  const isEdit = Boolean(user);

  const initial = {
    email: state.values?.email ?? user?.email ?? "",
    name: state.values?.name ?? user?.name ?? "",
    role: state.values?.role ?? user?.role ?? "",
  };

  const [role, setRole] = useState(initial.role);

  // Tercentang secara bawaan saat menambah: akun tanpa kata sandi hanya bisa
  // masuk lewat akun Google, dan itu menghilangkan seluruh urusan "kata sandi
  // awal ini harus dikirim ke orangnya lewat apa".
  const [googleOnly, setGoogleOnly] = useState(state.values?.googleOnly ?? true);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {user ? <input type="hidden" name="id" value={user.id} /> : null}

      {state.error ? <Alert tone="error">{state.error}</Alert> : null}

      {isEdit ? (
        <div>
          <p className="font-medium">Email</p>
          <p className="mt-1 break-all text-muted">{user!.email}</p>
          <p className="mt-1 text-sm text-muted text-pretty">
            Email tidak bisa diubah — ia satu-satunya penghubung ke akun Google. Kalau alamatnya
            salah, hapus pengelola ini lalu buat yang baru.
          </p>
        </div>
      ) : (
        <Field
          label="Email"
          htmlFor="email"
          required
          hint="Harus sama persis dengan alamat akun Google yang akan dipakai masuk."
        >
          <input
            id="email"
            name="email"
            type="email"
            required
            defaultValue={initial.email}
            placeholder="nama@gmail.com"
            aria-invalid={state.emailError ? true : undefined}
            aria-describedby={state.emailError ? "email-galat" : undefined}
            className={cn(inputClasses, state.emailError && "border-error")}
          />
          {state.emailError ? (
            <p id="email-galat" className="text-sm text-error text-pretty">
              {state.emailError}
            </p>
          ) : null}
        </Field>
      )}

      <Field label="Nama" htmlFor="name" required>
        <input
          id="name"
          name="name"
          required
          minLength={2}
          maxLength={80}
          defaultValue={initial.name}
          placeholder="Misalnya: Sri Lestari"
          className={inputClasses}
        />
      </Field>

      <fieldset className="flex flex-col gap-2">
        <legend className="font-medium">
          Peran
          <span aria-hidden="true" className="text-error">
            {" "}
            *
          </span>
          <span className="sr-only"> (wajib dipilih)</span>
        </legend>

        {ROLES.map((value) => (
          <label
            key={value}
            className={cn(
              "flex cursor-pointer gap-3 rounded-xl border p-3 transition-colors",
              role === value ? "border-primary bg-primary-soft/40" : "border-border",
            )}
          >
            <input
              type="radio"
              name="role"
              value={value}
              required
              checked={role === value}
              onChange={() => setRole(value)}
              className="mt-1 size-4 shrink-0 accent-[var(--primary)]"
            />
            <span className="min-w-0">
              <span className="block font-medium">{ROLE_LABELS[value]}</span>
              <span className="block text-sm text-muted text-pretty">{ROLE_HINTS[value]}</span>
            </span>
          </label>
        ))}

        <RoleMatrix />
      </fieldset>

      {isEdit ? (
        <Field
          label="Kata sandi baru"
          htmlFor="password"
          hint="Kosongkan kalau tidak ingin menggantinya. Kata sandi lama tidak perlu dimasukkan."
        >
          <input
            id="password"
            name="password"
            type="password"
            minLength={8}
            autoComplete="new-password"
            className={inputClasses}
          />
        </Field>
      ) : (
        <div className="flex flex-col gap-3">
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              name="googleOnly"
              checked={googleOnly}
              onChange={(event) => setGoogleOnly(event.target.checked)}
              className="mt-1 size-4 shrink-0 accent-[var(--primary)]"
            />
            <span className="min-w-0">
              <span className="block font-medium">Cukup masuk lewat akun Google</span>
              <span className="block text-sm text-muted text-pretty">
                Disarankan. Tidak ada kata sandi yang perlu dibuat maupun dikirimkan — orangnya
                masuk dengan akun Google beralamat sama. Kata sandi selalu bisa ditambahkan nanti.
              </span>
            </span>
          </label>

          {/* Tetap dirender walau tersembunyi, supaya formnya bekerja tanpa
              JavaScript: di sana centang di atas tidak menyembunyikan apa pun,
              dan Server Action yang menentukan artinya. */}
          <div className={googleOnly ? "hidden" : undefined}>
            <Field
              label="Kata sandi awal"
              htmlFor="password"
              required={!googleOnly}
              hint="Minimal 8 karakter. Sampaikan langsung ke orangnya, jangan lewat pesan yang tersimpan."
            >
              <input
                id="password"
                name="password"
                type="password"
                minLength={8}
                autoComplete="new-password"
                className={inputClasses}
              />
            </Field>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <SubmitButton size="lg" pendingLabel="Menyimpan…">
          {isEdit ? "Simpan Perubahan" : "Tambah Pengelola"}
        </SubmitButton>

        <Link
          href="/admin/pengelola"
          className="inline-flex min-h-11 items-center rounded-xl px-4 text-muted transition-colors hover:bg-surface-muted"
        >
          Batal
        </Link>
      </div>
    </form>
  );
}

/** Tabel pembanding dua peran. Ringkas, dan hanya berisi yang benar-benar berbeda. */
function RoleMatrix() {
  return (
    <div className="mt-1 overflow-x-auto rounded-xl border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-muted">
            <th scope="col" className="px-3 py-2 text-left font-medium">
              Kemampuan
            </th>
            <th scope="col" className="px-3 py-2 font-medium">
              Admin
            </th>
            <th scope="col" className="px-3 py-2 font-medium">
              Editor
            </th>
          </tr>
        </thead>
        <tbody>
          {ROLE_MATRIX.map((baris) => (
            <tr key={baris.kemampuan} className="border-b border-border last:border-0">
              <td className="px-3 py-2 text-pretty">{baris.kemampuan}</td>
              <td className="px-3 py-2 text-center">
                <Tanda ada={baris.admin} />
              </td>
              <td className="px-3 py-2 text-center">
                <Tanda ada={baris.editor} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Warna saja tidak cukup menandai bisa/tidak — hurufnya ikut berbeda, dan ada teks untuk pembaca layar. */
function Tanda({ ada }: { ada: boolean }) {
  return (
    <>
      <span aria-hidden="true" className={ada ? "text-accent" : "text-muted"}>
        {ada ? "✓" : "—"}
      </span>
      <span className="sr-only">{ada ? "bisa" : "tidak bisa"}</span>
    </>
  );
}
