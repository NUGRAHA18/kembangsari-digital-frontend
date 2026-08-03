import type { Metadata } from "next";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { deleteAnnouncementAction } from "@/app/admin/(dasbor)/pengumuman/actions";
import { fetchAsAdmin } from "@/lib/admin-fetch";
import { excerpt } from "@/lib/format";
import { requireSession } from "@/lib/session";
import { getAnnouncementByIdAsAdmin } from "@/services/announcement";

export const metadata: Metadata = { title: "Hapus Pengumuman" };

type Props = { params: Promise<{ id: string }> };

export default async function DeleteAnnouncementPage({ params }: Props) {
  const { token } = await requireSession();
  const { id } = await params;

  const announcement = await fetchAsAdmin(getAnnouncementByIdAsAdmin(id, token));

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6">
      <h1 className="text-2xl font-bold tracking-tight">Hapus pengumuman ini?</h1>

      <Card>
        <CardBody className="flex flex-col gap-2">
          <p className="font-medium text-pretty">{announcement.title}</p>
          <p className="text-muted text-pretty">{excerpt(announcement.content, 200)}</p>
        </CardBody>
      </Card>

      <p className="text-muted text-pretty">
        Kalau hanya ingin menghentikan tampilnya di beranda, buka halaman ubah dan hilangkan
        centang &ldquo;Tampilkan ke warga&rdquo; — isinya tetap tersimpan dan bisa ditampilkan
        lagi kapan saja. Penghapusan tidak bisa dibatalkan.
      </p>

      <form action={deleteAnnouncementAction} className="flex flex-wrap gap-3">
        <input type="hidden" name="id" value={announcement.id} />

        <Button type="submit" size="lg" className="bg-error hover:brightness-95">
          <Trash2 className="size-5" aria-hidden="true" />
          Ya, Hapus
        </Button>

        <Link
          href={`/admin/pengumuman/${announcement.id}`}
          className="inline-flex min-h-11 items-center rounded-xl px-4 text-muted transition-colors hover:bg-surface-muted"
        >
          Batal
        </Link>
      </form>
    </div>
  );
}
