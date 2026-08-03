import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, CalendarDays, Clock, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { PlainText } from "@/components/ui/plain-text";
import { excerpt, formatDate, formatDateRange } from "@/lib/format";
import { fetchOrNotFound, fetchOrNull } from "@/lib/fetch-page";
import { getAgendaBySlug } from "@/services/agenda";
import type { Agenda } from "@/types/api";

type Props = { params: Promise<{ slug: string }> };

/** Kegiatan dianggap selesai setelah waktu akhirnya lewat — atau setelah hari mulainya, kalau tidak ada waktu akhir. */
function hasPassed(agenda: Agenda): boolean {
  const end = new Date(agenda.endDate ?? agenda.startDate);
  return Number.isFinite(end.getTime()) && end.getTime() < Date.now();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const agenda = await fetchOrNull(getAgendaBySlug(slug));

  if (!agenda) return { title: "Agenda tidak ditemukan" };

  // Tautan agenda paling sering dibagikan ke grup WhatsApp, dan yang tampil di
  // sana adalah judul beserta deskripsi ini — jadi tanggal selalu ikut disebut
  // walaupun agendanya tidak punya keterangan.
  const description = agenda.description
    ? excerpt(agenda.description, 160)
    : `${formatDate(agenda.startDate)}${agenda.location ? ` · ${agenda.location}` : ""}`;

  return {
    title: agenda.title,
    description,
    alternates: { canonical: `/agenda/${agenda.slug}` },
    openGraph: { title: agenda.title, description },
  };
}

export default async function AgendaDetailPage({ params }: Props) {
  const { slug } = await params;
  const agenda = await fetchOrNotFound(getAgendaBySlug(slug));

  return (
    <>
      <PageHeader
        title={agenda.title}
        breadcrumbs={[{ label: "Agenda", href: "/agenda" }, { label: agenda.title }]}
      >
        {hasPassed(agenda) ? (
          <Badge tone="neutral" className="mt-4">
            Sudah berlangsung
          </Badge>
        ) : (
          <Badge className="mt-4">Akan datang</Badge>
        )}
      </PageHeader>

      <Container className="py-8 md:py-12">
        {/* Waktu dan tempat didahulukan di ponsel — itulah yang dicari warga saat
            membuka tautan dari grup WhatsApp; di laptop ia pindah ke sisi kanan. */}
        <div className="grid gap-8 lg:grid-cols-3 lg:gap-12">
          <aside className="lg:order-last lg:col-span-1">
            <Card>
              <CardBody className="flex flex-col gap-4">
                <h2 className="font-semibold">Waktu & Tempat</h2>

                <ul className="flex flex-col gap-3 text-muted">
                  <li className="flex gap-3">
                    <CalendarDays className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
                    <time dateTime={agenda.startDate}>
                      {formatDateRange(agenda.startDate, agenda.endDate)}
                    </time>
                  </li>
                  {agenda.location ? (
                    <li className="flex gap-3">
                      <MapPin className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
                      <span>{agenda.location}</span>
                    </li>
                  ) : null}
                  <li className="flex gap-3">
                    <Clock className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
                    <span>Dipublikasikan {formatDate(agenda.createdAt)}</span>
                  </li>
                </ul>
              </CardBody>
            </Card>
          </aside>

          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold tracking-tight">Keterangan</h2>
            {agenda.description ? (
              <PlainText className="mt-3">{agenda.description}</PlainText>
            ) : (
              <p className="mt-3 text-muted">
                Belum ada keterangan tambahan untuk kegiatan ini. Hubungi perangkat padukuhan
                melalui{" "}
                <Link href="/kontak" className="text-accent hover:underline">
                  halaman kontak
                </Link>{" "}
                bila membutuhkan penjelasan.
              </p>
            )}
          </div>
        </div>

        <Link
          href="/agenda"
          className="mt-10 inline-flex min-h-11 items-center gap-2 text-muted hover:text-accent"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Kembali ke daftar agenda
        </Link>
      </Container>
    </>
  );
}
