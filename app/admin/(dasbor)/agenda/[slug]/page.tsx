import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AgendaForm } from "@/features/admin/agenda-form";
import { fetchAsAdmin } from "@/lib/admin-fetch";
import { formatDateRange } from "@/lib/format";
import { requireSession } from "@/lib/session";
import { getAgendaBySlugAsAdmin } from "@/services/agenda";

export const metadata: Metadata = { title: "Ubah Agenda" };

type Props = { params: Promise<{ slug: string }> };

export default async function EditAgendaPage({ params }: Props) {
  const { token } = await requireSession();
  const { slug } = await params;

  const agenda = await fetchAsAdmin(getAgendaBySlugAsAdmin(slug, token));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/admin/agenda"
          className="inline-flex min-h-11 items-center gap-2 text-muted hover:text-accent"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Kembali ke daftar agenda
        </Link>

        <h1 className="mt-2 text-2xl font-bold tracking-tight text-pretty">{agenda.title}</h1>
        <p className="mt-1 text-muted">
          <time dateTime={agenda.startDate}>
            {formatDateRange(agenda.startDate, agenda.endDate)}
          </time>
        </p>
      </div>

      <AgendaForm agenda={agenda} />
    </div>
  );
}
