import type { Metadata } from "next";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody } from "@/components/ui/card";
import { SubmitButton } from "@/components/ui/submit-button";
import { deleteUserAction } from "@/app/admin/(dasbor)/pengelola/actions";
import { ROLE_LABELS } from "@/features/admin/roles";
import { fetchAsAdmin } from "@/lib/admin-fetch";
import { formatDateShort } from "@/lib/format";
import { requireAdmin } from "@/lib/session";
import { getUserById } from "@/services/user";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "Hapus Pengelola" };

type Props = { params: Promise<{ id: string }> };

/**
 * Konfirmasi sebagai halaman tersendiri, bukan `confirm()` — sepola dengan
 * seluruh penghapusan di dashboard ini.
 *
 * Dua penolakan backend tidak bisa diketahui dari sini: menghapus ADMIN
 * terakhir, dan menghapus pengelola yang masih tercatat sebagai penulis berita.
 * Keduanya ditangani sebagai galat saat muncul, dan pesannya dibawa kembali ke
 * halaman daftar lewat `?galat=`.
 */
export default async function DeleteUserPage({ params }: Props) {
  const { token, user: sesi } = await requireAdmin();
  const { id } = await params;

  const user = await fetchAsAdmin(getUserById(id, token));

  // Menghapus akun sendiri ditolak backend. Halamannya pun tidak perlu ada.
  if (user.id === sesi.id) redirect("/admin/pengelola");

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6">
      <h1 className="text-2xl font-bold tracking-tight">Hapus pengelola ini?</h1>

      <Card>
        <CardBody className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-medium text-pretty">{user.name}</p>
            <Badge tone={user.role === "ADMIN" ? "primary" : "neutral"}>
              {ROLE_LABELS[user.role]}
            </Badge>
          </div>
          <p className="break-all text-muted">{user.email}</p>
          <p className="text-sm text-muted">Bergabung {formatDateShort(user.createdAt)}</p>
        </CardBody>
      </Card>

      <p className="text-muted text-pretty">
        Orang ini langsung kehilangan akses ke dashboard, termasuk lewat akun Google. Isi portal
        yang pernah ditulisnya tidak ikut terhapus.
      </p>

      <Alert tone="warning">
        Kalau yang Anda inginkan hanya mencabut kewenangan — bukan menutup akses sama sekali —
        ubah perannya menjadi Editor. Berita yang ditulisnya membuat akun ini tidak bisa dihapus,
        dan menurunkan peran adalah satu-satunya jalan yang tersedia di situ.
      </Alert>

      <form action={deleteUserAction} className="flex flex-wrap gap-3">
        <input type="hidden" name="id" value={user.id} />

        <SubmitButton size="lg" pendingLabel="Menghapus…" className="bg-error hover:brightness-95">
          <Trash2 className="size-5" aria-hidden="true" />
          Ya, Hapus
        </SubmitButton>

        <Link
          href="/admin/pengelola"
          className="inline-flex min-h-11 items-center rounded-xl px-4 text-muted transition-colors hover:bg-surface-muted"
        >
          Batal
        </Link>
      </form>
    </div>
  );
}
