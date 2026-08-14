import type { Metadata } from "next";
import { UserForm } from "@/features/admin/user-form";
import { requireAdmin } from "@/lib/session";

export const metadata: Metadata = { title: "Tambah Pengelola" };

export default async function NewUserPage() {
  await requireAdmin();

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Tambah pengelola</h1>
        <p className="mt-1 text-muted text-pretty">
          Orang yang ditambahkan di sini bisa langsung masuk ke dashboard. Alamat emailnya harus
          sama persis dengan akun Google yang akan dipakainya.
        </p>
      </div>

      <UserForm />
    </div>
  );
}
