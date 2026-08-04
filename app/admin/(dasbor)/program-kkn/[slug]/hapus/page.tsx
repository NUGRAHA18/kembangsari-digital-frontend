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
import { readParam, type RawSearchParams } from "@/lib/page-params";
import { requireSession } from "@/lib/session";
import { getKknProgramBySlugAsAdmin } from "@/services/kkn";

export const metadata: Metadata = { title: "Hapus Program KKN" };

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<RawSearchParams>;
};

export default async function DeleteKknProgramPage({ params, searchParams }: Props) {
  const { token } = await requireSession();
  const { slug } = await params;
  const blocked = readParam(await searchParams, "pesan") === "masih-ada-kegiatan";

  const program = await fetchAsAdmin(getKknProgramBySlugAsAdmin(slug, token));
  const activities = program.activities ?? [];

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

      {blocked ? (
        <Alert tone="error">
          Kegiatan terakhir ternyata belum terhapus. Halaman ini baru saja dimuat ulang
          dengan jumlah yang sebenarnya.
        </Alert>
      ) : null}

      {activities.length > 0 ? (
        // Kegiatan tidak ikut terhapus otomatis: `KKNActivity.programId` adalah
        // relasi wajib, dan menghapus seluruh dokumentasinya diam-diam jauh lebih
        // mahal daripada meminta pengelola membuangnya satu per satu lebih dulu.
        // Pemeriksaan yang sama diulang di Server Action-nya.
        <>
          <Alert tone="error">
            Program ini masih punya {activities.length} kegiatan, jadi belum bisa dihapus.
            Hapus kegiatannya lebih dahulu di halaman kelola.
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
        <>
          <p className="text-muted text-pretty">
            Program ini belum punya kegiatan, jadi menghapusnya tidak menghilangkan
            dokumentasi apa pun. Tindakan ini tidak bisa dibatalkan.
          </p>

          <form action={deleteKknProgramAction} className="flex flex-wrap gap-3">
            <input type="hidden" name="id" value={program.id} />
            <input type="hidden" name="slug" value={program.slug} />

            <Button type="submit" size="lg" className="bg-error hover:brightness-95">
              <Trash2 className="size-5" aria-hidden="true" />
              Ya, Hapus
            </Button>

            <Link
              href={`/admin/program-kkn/${program.slug}`}
              className="inline-flex min-h-11 items-center rounded-xl px-4 text-muted transition-colors hover:bg-surface-muted"
            >
              Batal
            </Link>
          </form>
        </>
      )}
    </div>
  );
}
