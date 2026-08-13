import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, FileText, Megaphone, PenSquare, Plus } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/states";
import { PageHero } from "@/features/admin/page-hero";
import { StatTiles, type StatTile } from "@/features/admin/stat-tiles";
import { safeFetch } from "@/lib/api";
import { fetchAsAdmin } from "@/lib/admin-fetch";
import { formatDateShort } from "@/lib/format";
import { requireSession } from "@/lib/session";
import { getUpcomingAgenda } from "@/services/agenda";
import { getActiveAnnouncements } from "@/services/announcement";
import { getAllNews } from "@/services/news";

export const metadata: Metadata = { title: "Ringkasan" };

export default async function DashboardHomePage() {
  const { token, user } = await requireSession();

  // Yang diambil untuk angka saja cukup satu baris: `meta.total` sudah ikut
  // menyesuaikan saringannya, jadi `?published=false&limit=1` menghitung
  // seluruh draf tanpa mengunduh satu pun isinya.
  const [news, drafts, agenda, announcements] = await Promise.all([
    fetchAsAdmin(getAllNews({ limit: 5 }, token)),
    fetchAsAdmin(getAllNews({ published: false, limit: 1 }, token)),
    safeFetch(getUpcomingAgenda({ limit: 1 })),
    safeFetch(getActiveAnnouncements({ limit: 1 })),
  ]);

  const draftCount = drafts.meta.total;

  // Empat kartu, bukan tiga: draf ikut ditampilkan karena itu satu-satunya
  // angka di halaman ini yang menuntut tindakan — sisanya sekadar kabar.
  const stats: StatTile[] = [
    {
      label: "Total berita",
      value: news.meta.total,
      unit: "tulisan",
      tone: "primary",
      Icon: FileText,
    },
    {
      label: "Masih draf",
      value: draftCount,
      unit: "belum terbit",
      tone: "neutral",
      Icon: PenSquare,
    },
    {
      label: "Agenda mendatang",
      value: agenda.data?.meta.total ?? null,
      unit: "kegiatan",
      tone: "info",
      Icon: CalendarDays,
    },
    {
      label: "Pengumuman tampil",
      value: announcements.data?.meta.total ?? null,
      unit: "sedang berlaku",
      tone: "secondary",
      Icon: Megaphone,
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <PageHero
        title={`Halo, ${user.name}`}
        description="Kelola isi portal informasi Padukuhan Kembangsari dari sini."
      >
        <ButtonLink href="/admin/berita/baru">
          <Plus className="size-5" aria-hidden="true" />
          Tulis Berita
        </ButtonLink>
      </PageHero>

      <StatTiles tiles={stats} />

      <section aria-labelledby="terbaru">
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="terbaru" className="text-xl font-semibold tracking-tight">
            Berita Terbaru
          </h2>
          <Link href="/admin/berita" className="inline-flex min-h-11 items-center text-accent">
            Lihat semua
          </Link>
        </div>

        {draftCount > 0 ? (
          <p className="mb-3 text-muted">
            {draftCount} dari {news.meta.total} berita masih berupa draf.{" "}
            <Link href="/admin/berita?status=draf" className="text-accent">
              Lihat drafnya
            </Link>
            .
          </p>
        ) : null}

        {news.data.length > 0 ? (
          <ul className="flex flex-col gap-3">
            {news.data.map((item) => (
              <li key={item.id}>
                <Card interactive>
                  <CardBody className="flex flex-wrap items-center gap-3 p-4">
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{item.title}</p>
                      <p className="text-sm text-muted">
                        {item.published ? "Terbit" : "Draf"} ·{" "}
                        {formatDateShort(item.updatedAt)}
                      </p>
                    </div>
                    <Link
                      href={`/admin/berita/${item.slug}`}
                      className="inline-flex min-h-11 items-center gap-2 rounded-xl px-3 text-muted transition-colors hover:bg-surface-muted"
                    >
                      <PenSquare className="size-4" aria-hidden="true" />
                      Ubah
                    </Link>
                  </CardBody>
                </Card>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            title="Belum ada berita"
            description="Berita yang Anda tulis akan tampil di sini."
          />
        )}
      </section>
    </div>
  );
}
