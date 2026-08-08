import type { Metadata } from "next";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { deleteKknProgramAction } from "@/app/admin/(dasbor)/program-kkn/actions";
import { SUB_PROGRAM_LABELS } from "@/features/kkn/sub-programs";
import { fetchAsAdmin } from "@/lib/admin-fetch";
import { excerpt } from "@/lib/format";
import { requireSession } from "@/lib/session";
import { getKknProgramBySlugAsAdmin } from "@/services/kkn";

export const metadata: Metadata = { title: "Hapus Program KKN" };

type Props = { params: Promise<{ slug: string }> };

export default async function DeleteKknProgramPage({ params }: Props) {
  const { token } = await requireSession();
  const { slug } = await params;

  const program = await fetchAsAdmin(getKknProgramBySlugAsAdmin(slug, token));
  const activityCount = program.activities?.length ?? program._count?.activities ?? 0;

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6">
      <h1 className="text-2xl font-bold tracking-tight">Hapus program ini?</h1>

      <Card>
        <CardBody className="flex flex-col gap-2">
          <p className="font-medium text-pretty">{program.title}</p>
          <p className="text-sm text-muted">
            {SUB_PROGRAM_LABELS[program.subProgram] ?? program.subProgram}
          </p>
          <p className="text-muted text-pretty">{excerpt(program.description, 200)}</p>
        </CardBody>
      </Card>

      {/* Backend menghapus kegiatannya berantai dalam satu transaksi, seperti
          gambar UMKM. Jadi halaman ini memperingatkan, bukan memblokir —
          menuntut pengelola menghapus kegiatan satu per satu lebih dulu hanya
          menambah pekerjaan tanpa mencegah apa pun. */}
      {activityCount > 0 ? (
        <>
          <Alert tone="error">
            {activityCount} kegiatan beserta dokumentasinya akan ikut terhapus. Tindakan ini
            tidak bisa dibatalkan.
          </Alert>

          <p className="text-muted text-pretty">
            Kalau yang Anda inginkan hanya menyembunyikannya dari warga, buka halaman kelola
            dan hilangkan centang &ldquo;Tampilkan ke warga&rdquo; — programnya beserta seluruh
            kegiatannya tetap tersimpan.
          </p>

          <Link
            href={`/admin/program-kkn/${program.slug}`}
            className="inline-flex min-h-11 w-fit items-center rounded-xl border border-border px-4 transition-colors hover:bg-surface-muted"
          >
            Buka halaman kelola
          </Link>
        </>
      ) : (
        <p className="text-muted text-pretty">
          Program ini belum punya kegiatan, jadi menghapusnya tidak menghilangkan
          dokumentasi apa pun. Tindakan ini tidak bisa dibatalkan.
        </p>
      )}

      <form action={deleteKknProgramAction} className="flex flex-wrap gap-3">
        <input type="hidden" name="id" value={program.id} />
        <input type="hidden" name="slug" value={program.slug} />

        <Button type="submit" size="lg" className="bg-error hover:brightness-95">
          <Trash2 className="size-5" aria-hidden="true" />
          {activityCount > 0 ? `Ya, Hapus Beserta ${activityCount} Kegiatan` : "Ya, Hapus"}
        </Button>

        <Link
          href={`/admin/program-kkn/${program.slug}`}
          className="inline-flex min-h-11 items-center rounded-xl px-4 text-muted transition-colors hover:bg-surface-muted"
        >
          Batal
        </Link>
      </form>
    </div>
  );
}
