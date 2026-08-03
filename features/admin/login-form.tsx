"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { loginAction, type LoginFormState } from "@/app/admin/login/actions";

const INITIAL: LoginFormState = {};

/**
 * Form masuk dashboard.
 *
 * Memakai Server Action, bukan `fetch` dari browser: kredensial dan token tidak
 * pernah melewati JavaScript di sisi klien, dan formnya tetap terkirim ketika
 * JavaScript gagal dimuat — hal yang bukan sekadar teori bagi pengguna yang
 * mengelola portal ini dari ponsel dengan sinyal seadanya.
 */
export function LoginForm({ next }: { next?: string }) {
  const [state, formAction] = useActionState(loginAction, INITIAL);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {next ? <input type="hidden" name="next" value={next} /> : null}

      {state.error ? <Alert tone="error">{state.error}</Alert> : null}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="font-medium">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="username"
          defaultValue={state.email}
          placeholder="admin@kembangsari.id"
          className="min-h-11 rounded-xl border border-border bg-surface px-3 text-base text-foreground placeholder:text-muted"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="font-medium">
          Kata Sandi
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="min-h-11 rounded-xl border border-border bg-surface px-3 text-base text-foreground"
        />
      </div>

      <SubmitButton />
    </form>
  );
}

/**
 * Tombolnya dipisah karena `useFormStatus` hanya melaporkan status form yang
 * membungkusnya — dipanggil di komponen yang sama dengan `<form>`, hasilnya
 * selalu `false`.
 */
function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" size="lg" disabled={pending} className="mt-2 w-full">
      {pending ? "Memproses…" : "Masuk"}
    </Button>
  );
}
