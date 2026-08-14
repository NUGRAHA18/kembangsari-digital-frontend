import type { Metadata } from "next";
import { Alert } from "@/components/ui/alert";
import { UserForm } from "@/features/admin/user-form";
import { fetchAsAdmin } from "@/lib/admin-fetch";
import { requireAdmin } from "@/lib/session";
import { getUserById } from "@/services/user";

export const metadata: Metadata = { title: "Ubah Pengelola" };

type Props = { params: Promise<{ id: string }> };

export default async function EditUserPage({ params }: Props) {
  const { token, user: sesi } = await requireAdmin();
  const { id } = await params;

  const user = await fetchAsAdmin(getUserById(id, token));
  const diriSendiri = user.id === sesi.id;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Ubah pengelola</h1>
        <p className="mt-1 text-muted text-pretty">
          Nama, peran, dan kata sandi bisa diubah terpisah — mengganti salah satunya tidak
          menyentuh yang lain.
        </p>
      </div>

      {/* Backend menolak seorang ADMIN menurunkan perannya sendiri, karena itu
          tidak bisa dibatalkan sendiri: begitu jadi Editor, halaman ini pun
          tertutup baginya. Diberitahukan di depan, bukan setelah tombol simpan
          ditekan dan gagal. */}
      {diriSendiri ? (
        <Alert tone="warning">
          Ini akun Anda sendiri. Nama dan kata sandinya bisa diubah, tetapi perannya tidak — kalau
          Anda menurunkan diri menjadi Editor, tidak ada jalan kembali tanpa bantuan Admin lain.
        </Alert>
      ) : null}

      <UserForm user={user} />
    </div>
  );
}
