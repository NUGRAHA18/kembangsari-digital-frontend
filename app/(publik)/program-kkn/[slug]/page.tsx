import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, CalendarDays } from "lucide-react";
import { Card, CardBody } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { Markdown } from "@/components/ui/markdown";
import { PageHeader } from "@/components/ui/page-header";
import { Thumbnail } from "@/components/ui/thumbnail";
import { SUB_PROGRAM_META } from "@/features/kkn/kkn-card";
import { excerpt, formatDate, stripMarkdown } from "@/lib/format";
import { fetchOrNotFound, fetchOrNull } from "@/lib/fetch-page";
import { getKknProgramBySlug } from "@/services/kkn";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const program = await fetchOrNull(getKknProgramBySlug(slug));

  if (!program) return { title: "Program tidak ditemukan" };

  const description = excerpt(program.description || stripMarkdown(program.content), 160);

  return {
    title: program.title,
    description,
    alternates: { canonical: `/program-kkn/${program.slug}` },
    openGraph: {
      title: program.title,
      description,
      images: program.thumbnail ? [{ url: program.thumbnail }] : undefined,
    },
  };
}

export default async function KknDetailPage({ params }: Props) {
  const { slug } = await params;
  // Endpoint detail sudah menyertakan `activities`, jadi cukup satu permintaan.
  const program = await fetchOrNotFound(getKknProgramBySlug(slug));

  const meta = SUB_PROGRAM_META[program.subProgram];
  const activities = program.activities ?? [];

  return (
    <>
      <PageHeader
        title={program.title}
        description={program.description}
        breadcrumbs={[
          { label: "Program KKN", href: "/program-kkn" },
          { label: meta?.label ?? program.title },
        ]}
      />

      <Container className="py-8 md:py-12">
        {program.thumbnail ? (
          <Thumbnail
            src={program.thumbnail}
            alt={program.title}
            priority
            ratio="aspect-16/9"
            sizes="(min-width: 1280px) 60rem, 100vw"
            className="mb-8 rounded-xl"
          />
        ) : null}

        {/* Isi program berupa Markdown, sesuai catatan pada types/api.ts. */}
        <Markdown>{program.content}</Markdown>

        {activities.length > 0 ? (
          <section className="mt-12">
            <h2 className="text-xl font-semibold tracking-tight md:text-2xl">
              Dokumentasi Kegiatan
            </h2>
            <p className="mt-1 text-muted">{activities.length} kegiatan tercatat.</p>

            <ul className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
              {activities.map((activity) => (
                <li key={activity.id}>
                  <Card className="h-full">
                    {activity.image ? (
                      <Thumbnail
                        src={activity.image}
                        alt={activity.title}
                        sizes="(min-width: 768px) 30rem, 100vw"
                      />
                    ) : null}
                    <CardBody className="flex flex-col gap-2">
                      <h3 className="font-semibold text-pretty">{activity.title}</h3>
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
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <Link
          href="/program-kkn"
          className="mt-10 inline-flex min-h-11 items-center gap-2 text-muted hover:text-accent"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Kembali ke Program KKN
        </Link>
      </Container>
    </>
  );
}
