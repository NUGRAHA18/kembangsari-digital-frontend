import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Trash2 } from "lucide-react";
import { KknActivityForm } from "@/features/admin/kkn-activity-form";
import { fetchAsAdmin } from "@/lib/admin-fetch";
import { requireSession } from "@/lib/session";
import { getKknActivityById } from "@/services/kkn";

export const metadata: Metadata = { title: "Ubah Kegiatan" };

type Props = { params: Promise<{ slug: string; id: string }> };

export default async function EditKknActivityPage({ params }: Props) {
  const { token } = await requireSession();
  const { slug, id } = await params;

  const activity = await fetchAsAdmin(getKknActivityById(id, token));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href={`/admin/program-kkn/${slug}`}
          className="inline-flex min-h-11 items-center gap-2 text-muted hover:text-accent"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Kembali ke daftar kegiatan
        </Link>

        <h1 className="mt-2 text-2xl font-bold tracking-tight text-pretty">
          {activity.title}
        </h1>

        <Link
          href={`/admin/program-kkn/${slug}/kegiatan/${activity.id}/hapus`}
          className="mt-2 inline-flex min-h-11 items-center gap-2 rounded-xl px-3 text-error transition-colors hover:bg-error/10"
        >
          <Trash2 className="size-4" aria-hidden="true" />
          Hapus kegiatan
        </Link>
      </div>

      <KknActivityForm
        activity={activity}
        programId={activity.programId}
        programSlug={slug}
      />
    </div>
  );
}
