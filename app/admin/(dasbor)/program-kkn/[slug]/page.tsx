import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, CalendarDays, ExternalLink, ImageOff, PenSquare, Plus, Trash2 } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/states";
import { KknProgramForm } from "@/features/admin/kkn-program-form";
import { SUB_PROGRAM_LABELS } from "@/features/kkn/sub-programs";
import { fetchAsAdmin } from "@/lib/admin-fetch";
import { formatDate } from "@/lib/format";
import { readParam, type RawSearchParams } from "@/lib/page-params";
import { requireSession } from "@/lib/session";
import { getKknProgramBySlugAsAdmin } from "@/services/kkn";
import type { KKNActivity } from "@/types/api";

export const metadata: Metadata = { title: "Kelola Program KKN" };

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<RawSearchParams>;
};

const MESSAGES: Record<string, string> = {
  dibuat: "Program berhasil disimpan. Sekarang tambahkan dokumentasi kegiatannya.",
  diperbarui: "Perubahan berhasil disimpan.",
  "kegiatan-dibuat": "Kegiatan berhasil ditambahkan.",
  "kegiatan-diperbarui": "Perubahan kegiatan berhasil disimpan.",
  "kegiatan-dihapus": "Kegiatan berhasil dihapus.",
};

export default async function ManageKknProgramPage({ params, searchParams }: Props) {
  const { token } = await requireSession();
  const { slug } = await params;
  const message = MESSAGES[readParam(await searchParams, "pesan") ?? ""];

  // Endpoint detail sudah menyertakan `activities`, jadi daftar kegiatannya
  // tidak perlu permintaan sendiri.
  const program = await fetchAsAdmin(getKknProgramBySlugAsAdmin(slug, token));
  const activities = program.activities ?? [];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <Link
          href="/admin/program-kkn"
          className="inline-flex min-h-11 items-center gap-2 text-muted hover:text-accent"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Kembali ke daftar program
        </Link>

        <h1 className="mt-2 text-2xl font-bold tracking-tight text-pretty">{program.title}</h1>

        <div className="mt-2 flex flex-wrap items-center gap-3">
          <Badge tone={program.isActive ? "primary" : "neutral"}>
            {program.isActive ? "Tampil" : "Disembunyikan"}
          </Badge>
          <span className="text-sm text-muted">
            {SUB_PROGRAM_LABELS[program.subProgram] ?? program.subProgram}
          </span>
          <span className="text-sm text-muted">{activities.length} kegiatan</span>
        </div>

        <div className="mt-2 flex flex-wrap gap-1">
          {program.isActive ? (
            <Link
              href={`/program-kkn/${program.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center gap-2 rounded-xl px-3 text-muted transition-colors hover:bg-surface-muted"
            >
              <ExternalLink className="size-4" aria-hidden="true" />
              Lihat di portal
            </Link>
          ) : null}
          <Link
            href={`/admin/program-kkn/${program.slug}/hapus`}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl px-3 text-error transition-colors hover:bg-error/10"
          >
            <Trash2 className="size-4" aria-hidden="true" />
            Hapus Program
          </Link>
        </div>
      </div>

      {message ? <Alert tone="success">{message}</Alert> : null}

      <section aria-labelledby="kegiatan">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <h2 id="kegiatan" className="text-xl font-semibold tracking-tight">
            Dokumentasi Kegiatan
          </h2>

          <ButtonLink href={`/admin/program-kkn/${program.slug}/kegiatan/baru`} size="sm">
            <Plus className="size-4" aria-hidden="true" />
            Tambah Kegiatan
          </ButtonLink>
        </div>

        {activities.length > 0 ? (
          <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {activities.map((activity) => (
              <li key={activity.id}>
                <ActivityCard activity={activity} programSlug={program.slug} />
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            title="Belum ada kegiatan"
            description="Bagian dokumentasi tidak muncul di halaman program sampai kegiatan pertama ditambahkan."
          />
        )}
      </section>

      <section aria-labelledby="data">
        <h2 id="data" className="mb-4 text-xl font-semibold tracking-tight">
          Data Program
        </h2>
        <KknProgramForm program={program} />
      </section>
    </div>
  );
}

/**
 * Satu kegiatan. Isiannya empat kolom termasuk berkas gambar, jadi mengubahnya
 * dilakukan di halaman tersendiri — berbeda dari kartu foto galeri yang hanya
 * punya satu keterangan dan bisa disimpan di tempat.
 */
function ActivityCard({
  activity,
  programSlug,
}: {
  activity: KKNActivity;
  programSlug: string;
}) {
  return (
    <Card className="flex h-full flex-col">
      {activity.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={activity.image}
          alt={activity.title}
          loading="lazy"
          className="aspect-16/9 w-full object-cover"
        />
      ) : (
        <div
          aria-hidden="true"
          className="grid aspect-16/9 w-full place-items-center bg-surface-muted"
        >
          <ImageOff className="size-8 text-muted" />
        </div>
      )}

      <CardBody className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="font-medium text-pretty">{activity.title}</h3>

        {activity.date ? (
          <p className="flex items-center gap-1.5 text-sm text-muted">
            <CalendarDays className="size-4" aria-hidden="true" />
            <time dateTime={activity.date}>{formatDate(activity.date)}</time>
          </p>
        ) : (
          <p className="text-sm text-muted">Tanpa tanggal</p>
        )}

        {activity.description ? (
          <p className="text-sm text-muted text-pretty">{activity.description}</p>
        ) : null}

        <div className="mt-auto flex flex-wrap gap-1 pt-2">
          <Link
            href={`/admin/program-kkn/${programSlug}/kegiatan/${activity.id}`}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm transition-colors hover:bg-surface-muted"
          >
            <PenSquare className="size-4" aria-hidden="true" />
            Ubah
          </Link>

          <Link
            href={`/admin/program-kkn/${programSlug}/kegiatan/${activity.id}/hapus`}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm text-error transition-colors hover:bg-error/10"
          >
            <Trash2 className="size-4" aria-hidden="true" />
            Hapus
          </Link>
        </div>
      </CardBody>
    </Card>
  );
}
