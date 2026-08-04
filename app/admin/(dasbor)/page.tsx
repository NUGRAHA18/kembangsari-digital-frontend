import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, FileText, Megaphone, PenSquare, Plus } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/states";
import { safeFetch } from "@/lib/api";
import { fetchAsAdmin } from "@/lib/admin-fetch";
import { formatDateShort, formatNumber } from "@/lib/format";
import { requireSession } from "@/lib/session";
import { getUpcomingAgenda } from "@/services/agenda";
import { getActiveAnnouncements } from "@/services/announcement";
import { getAllNews } from "@/services/news";

export const metadata: Metadata = { title: "Ringkasan" };

export default async function DashboardHomePage() {
  const { token, user } = await requireSession();

  // Satu permintaan berita saja: `meta.total` memberi jumlah seluruhnya, dan
  // lima baris pertamanya sekaligus mengisi daftar "terakhir diperbarui".
  // Sisanya hanya diambil untuk angkanya, jadi cukup satu baris per modul.
  const [news, agenda, announcements] = await Promise.all([
    fetchAsAdmin(getAllNews({ limit: 5 }, token)),
    safeFetch(getUpcomingAgenda({ limit: 1 })),
    safeFetch(getActiveAnnouncements({ limit: 1 })),
  ]);

  const draftCount = news.data.filter((item) => !item.published).length;

  const stats = [
    { label: "Total berita", value: news.meta.total, Icon: FileText },
    {
      label: "Agenda mendatang",
      value: agenda.data?.meta.total ?? null,
      Icon: CalendarDays,
    },
    {
      label: "Pengumuman tampil",
      value: announcements.data?.meta.total ?? null,
      Icon: Megaphone,
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Halo, {user.name}</h1>
          <p className="mt-1 text-muted text-pretty">
            Kelola isi portal informasi Padukuhan Kembangsari dari sini.
          </p>
        </div>

        <ButtonLink href="/admin/berita/baru">
          <Plus className="size-5" aria-hidden="true" />
          Tulis Berita
        </ButtonLink>
      </div>

      <ul className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-3">
        {stats.map(({ label, value, Icon }) => (
          <li key={label}>
            <Card className="h-full">
              <CardBody className="p-4">
                <Icon className="size-6 text-accent" aria-hidden="true" />
                <p className="mt-3 text-2xl font-bold tracking-tight">{formatNumber(value)}</p>
                <p className="text-sm text-muted">{label}</p>
              </CardBody>
            </Card>
          </li>
        ))}
      </ul>

      <section aria-labelledby="terbaru">
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="terbaru" className="text-xl font-semibold tracking-tight">
            Berita Terbaru
          </h2>
          <Link href="/admin/berita" className="inline-flex min-h-11 items-center text-accent">
            Lihat semua
          </Link>
        </div>

        {/* Jumlah draf yang disebut di sini sengaja dibatasi pada lima baris
            yang tampil — `GET /news` tidak punya filter status, jadi menghitung
            seluruh draf berarti mengunduh semua berita hanya untuk satu angka. */}
        {draftCount > 0 ? (
          <p className="mb-3 text-muted">
            {draftCount} dari {news.data.length} berita terbaru masih berupa draf.
          </p>
        ) : null}

        {news.data.length > 0 ? (
          <ul className="flex flex-col gap-3">
            {news.data.map((item) => (
              <li key={item.id}>
                <Card>
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
