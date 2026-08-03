import Link from "next/link";
import { Clock, MapPin } from "lucide-react";
import { Card, CardBody } from "@/components/ui/card";
import { excerpt, formatDateRange, getDateParts } from "@/lib/format";
import type { Agenda } from "@/types/api";

/**
 * Kartu agenda dengan penanda tanggal bergaya kalender di sisi kiri.
 *
 * Judulnya menjadi tautan ke `/agenda/<slug>`. Seluruh kartu sengaja tidak
 * dibungkus satu tautan besar supaya teks di dalamnya tetap bisa disorot dan
 * disalin — yang sering dilakukan warga saat meneruskan jadwal ke grup WhatsApp.
 * Keterangan panjang dipotong di kartu dan ditampilkan utuh di halaman detail.
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
          <h3 className="font-semibold text-pretty">
            <Link
              href={`/agenda/${agenda.slug}`}
              className="hover:text-accent hover:underline focus-visible:text-accent"
            >
              {agenda.title}
            </Link>
          </h3>

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
            <p className="mt-2 text-muted text-pretty">{excerpt(agenda.description, 140)}</p>
          ) : null}
        </div>
      </CardBody>
    </Card>
  );
}
