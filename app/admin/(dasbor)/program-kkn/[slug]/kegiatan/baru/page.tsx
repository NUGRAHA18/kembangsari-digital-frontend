import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { KknActivityForm } from "@/features/admin/kkn-activity-form";
import { fetchAsAdmin } from "@/lib/admin-fetch";
import { requireSession } from "@/lib/session";
import { getKknProgramBySlugAsAdmin } from "@/services/kkn";

export const metadata: Metadata = { title: "Tambah Kegiatan" };

type Props = { params: Promise<{ slug: string }> };

export default async function NewKknActivityPage({ params }: Props) {
  const { token } = await requireSession();
  const { slug } = await params;

  // Programnya diambil demi `id`-nya: kegiatan disimpan dengan `programId`,
  // sedangkan alamat halaman ini memakai slug.
  const program = await fetchAsAdmin(getKknProgramBySlugAsAdmin(slug, token));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href={`/admin/program-kkn/${program.slug}`}
          className="inline-flex min-h-11 items-center gap-2 text-muted hover:text-accent"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Kembali ke {program.title}
        </Link>
        <h1 className="mt-2 text-2xl font-bold tracking-tight">Tambah Kegiatan</h1>
      </div>

      <KknActivityForm programId={program.id} programSlug={program.slug} />
    </div>
  );
}
