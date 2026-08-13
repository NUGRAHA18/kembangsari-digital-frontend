"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";

/**
 * Tombol kirim yang tahu sendiri kapan formnya sedang dikirim.
 *
 * Menggantikan delapan belas komponen `SubmitButton` yang nyaris identik di
 * `features/admin/` — semuanya memanggil `useFormStatus` lalu mengganti label
 * menjadi "Menyimpan…". Yang berubah sekarang: labelnya didampingi spinner.
 *
 * `useFormStatus` wajib dipanggil dari komponen **di dalam** `<form>`, bukan
 * dari komponen yang merender form itu — karena itu tombolnya berdiri sebagai
 * komponen tersendiri dan bukan sekadar prop `pending` yang dioper dari atas.
 *
 * Dipakai juga dari halaman konfirmasi hapus, yang seluruhnya Server Component:
 * komponen klien sekecil ini adalah satu-satunya bagian yang ikut terkirim ke
 * peramban di sana. Formnya tetap terkirim tanpa JavaScript — `pending` hanya
 * tidak pernah bernilai true, dan tombolnya berperilaku seperti tombol biasa.
 */
export function SubmitButton({
  children,
  pendingLabel,
  ...props
}: React.ComponentProps<typeof Button> & { pendingLabel: string }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" loading={pending} {...props}>
      {pending ? pendingLabel : children}
    </Button>
  );
}
