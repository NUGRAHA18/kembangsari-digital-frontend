import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/components/ui/pagination";
import { EmptyState, ErrorState } from "@/components/ui/states";
import { AnnouncementCard } from "@/features/announcement/announcement-card";
import { safeFetch } from "@/lib/api";
import { readPage, type RawSearchParams } from "@/lib/page-params";
import { getActiveAnnouncements } from "@/services/announcement";

const PER_PAGE = 10;

export const metadata: Metadata = {
  title: "Pengumuman",
  description: "Pengumuman resmi yang sedang berlaku di Padukuhan Kembangsari.",
};

export default async function AnnouncementPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const params = await searchParams;
  const page = readPage(params);

  const announcements = await safeFetch(getActiveAnnouncements({ page, limit: PER_PAGE }));

  return (
    <>
      <PageHeader
        title="Pengumuman"
        description="Informasi resmi yang sedang berlaku. Halaman ini hanya menampilkan pengumuman yang masih aktif."
        breadcrumbs={[{ label: "Pengumuman" }]}
      />

      <Container className="py-8 md:py-12">
        {announcements.error ? (
          <ErrorState message={announcements.error} />
        ) : announcements.data && announcements.data.data.length > 0 ? (
          <>
            <ul className="flex flex-col gap-4">
              {announcements.data.data.map((announcement) => (
                <li key={announcement.id}>
                  <AnnouncementCard announcement={announcement} />
                </li>
              ))}
            </ul>
            <Pagination
              meta={announcements.data.meta}
              basePath="/pengumuman"
              searchParams={{ page: page > 1 ? String(page) : undefined }}
            />
          </>
        ) : (
          <EmptyState
            title="Belum ada pengumuman aktif"
            description="Pengumuman yang sedang berlaku akan tampil di sini."
          />
        )}
      </Container>
    </>
  );
}
