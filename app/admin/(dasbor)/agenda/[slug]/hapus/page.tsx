import type { Metadata } from "next";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { SubmitButton } from "@/components/ui/submit-button";
import { Card, CardBody } from "@/components/ui/card";
import { deleteAgendaAction } from "@/app/admin/(dasbor)/agenda/actions";
import { fetchAsAdmin } from "@/lib/admin-fetch";
import { formatDateRange } from "@/lib/format";
import { requireSession } from "@/lib/session";
import { getAgendaBySlugAsAdmin } from "@/services/agenda";

export const metadata: Metadata = { title: "Hapus Agenda" };

type Props = { params: Promise<{ slug: string }> };

export default async function DeleteAgendaPage({ params }: Props) {
  const { token } = await requireSession();
  const { slug } = await params;

  const agenda = await fetchAsAdmin(getAgendaBySlugAsAdmin(slug, token));

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6">
      <h1 className="text-2xl font-bold tracking-tight">Hapus agenda ini?</h1>

      <Card>
        <CardBody className="flex flex-col gap-1">
          <p className="font-medium text-pretty">{agenda.title}</p>
          <p className="text-muted">
            <time dateTime={agenda.startDate}>
              {formatDateRange(agenda.startDate, agenda.endDate)}
            </time>
          </p>
          {agenda.location ? <p className="text-muted">{agenda.location}</p> : null}
        </CardBody>
      </Card>

      <p className="text-muted text-pretty">
        Tautan yang sudah dibagikan ke grup WhatsApp akan berhenti bekerja setelah agenda ini
        dihapus. Kegiatan yang sudah berlalu boleh dibiarkan saja — halaman agenda memisahkan
        yang akan datang dari riwayatnya.
      </p>

      <form action={deleteAgendaAction} className="flex flex-wrap gap-3">
        <input type="hidden" name="id" value={agenda.id} />
        <input type="hidden" name="slug" value={agenda.slug} />

        <SubmitButton size="lg" pendingLabel="Menghapus…" className="bg-error hover:brightness-95">
          <Trash2 className="size-5" aria-hidden="true" />
          Ya, Hapus
        </SubmitButton>

        <Link
          href={`/admin/agenda/${agenda.slug}`}
          className="inline-flex min-h-11 items-center rounded-xl px-4 text-muted transition-colors hover:bg-surface-muted"
        >
          Batal
        </Link>
      </form>
    </div>
  );
}
