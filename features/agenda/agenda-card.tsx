import { Clock, MapPin } from "lucide-react";
import { Card, CardBody } from "@/components/ui/card";
import { formatDateRange, getDateParts } from "@/lib/format";
import type { Agenda } from "@/types/api";

/**
 * Kartu agenda dengan penanda tanggal bergaya kalender di sisi kiri.
 * Agenda tidak punya halaman detail sendiri di API (hanya `GET /agenda/:id`
 * tanpa slug), jadi seluruh keterangan ditampilkan langsung di kartu ini.
 */
export function AgendaCard({ agenda }: { agenda: Agenda }) {
  const { day, month } = getDateParts(agenda.startDate);

  return (
    <Card className="h-full">
      <CardBody className="flex gap-4">
        <div
          aria-hidden="true"
          className="flex size-14 shrink-0 flex-col items-center justify-center rounded-xl bg-primary-soft text-primary-soft-foreground"
        >
          <span className="text-lg leading-none font-bold">{day}</span>
          <span className="text-sm leading-tight uppercase">{month}</span>
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-pretty">{agenda.title}</h3>

          <p className="mt-1 flex items-start gap-1.5 text-sm text-muted">
            <Clock className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <time dateTime={agenda.startDate}>
              {formatDateRange(agenda.startDate, agenda.endDate)}
            </time>
          </p>

          {agenda.location ? (
            <p className="mt-1 flex items-start gap-1.5 text-sm text-muted">
              <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <span>{agenda.location}</span>
            </p>
          ) : null}

          {agenda.description ? (
            <p className="mt-2 text-muted text-pretty">{agenda.description}</p>
          ) : null}
        </div>
      </CardBody>
    </Card>
  );
}
