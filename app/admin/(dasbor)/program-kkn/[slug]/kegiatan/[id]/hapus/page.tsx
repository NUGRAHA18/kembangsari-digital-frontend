import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, Trash2 } from "lucide-react";
import { SubmitButton } from "@/components/ui/submit-button";
import { Card, CardBody } from "@/components/ui/card";
import { deleteKknActivityAction } from "@/app/admin/(dasbor)/program-kkn/actions";
import { fetchAsAdmin } from "@/lib/admin-fetch";
import { formatDate } from "@/lib/format";
import { requireSession } from "@/lib/session";
import { getKknActivityById } from "@/services/kkn";

export const metadata: Metadata = { title: "Hapus Kegiatan" };

type Props = { params: Promise<{ slug: string; id: string }> };

export default async function DeleteKknActivityPage({ params }: Props) {
  const { token } = await requireSession();
  const { slug, id } = await params;

  const activity = await fetchAsAdmin(getKknActivityById(id, token));

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6">
      <h1 className="text-2xl font-bold tracking-tight">Hapus kegiatan ini?</h1>

      <Card>
        {activity.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={activity.image}
            alt={activity.title}
            className="max-h-80 w-full object-contain"
          />
        ) : null}

        <CardBody className="flex flex-col gap-2">
          <p className="font-medium text-pretty">{activity.title}</p>

          {activity.date ? (
            <p className="flex items-center gap-1.5 text-sm text-muted">
              <CalendarDays className="size-4" aria-hidden="true" />
              <time dateTime={activity.date}>{formatDate(activity.date)}</time>
            </p>
          ) : null}

          {activity.description ? (
            <p className="text-muted text-pretty">{activity.description}</p>
          ) : null}
        </CardBody>
      </Card>

      <p className="text-muted text-pretty">
        Kegiatan ini hilang dari dokumentasi program di portal. Tindakan ini tidak bisa
        dibatalkan.
      </p>

      <form action={deleteKknActivityAction} className="flex flex-wrap gap-3">
        <input type="hidden" name="id" value={activity.id} />
        <input type="hidden" name="programSlug" value={slug} />

        <SubmitButton size="lg" pendingLabel="Menghapus…" className="bg-error hover:brightness-95">
          <Trash2 className="size-5" aria-hidden="true" />
          Ya, Hapus
        </SubmitButton>

        <Link
          href={`/admin/program-kkn/${slug}/kegiatan/${activity.id}`}
          className="inline-flex min-h-11 items-center rounded-xl px-4 text-muted transition-colors hover:bg-surface-muted"
        >
          Batal
        </Link>
      </form>
    </div>
  );
}
