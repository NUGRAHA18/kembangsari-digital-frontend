import { Megaphone } from "lucide-react";
import { Card, CardBody } from "@/components/ui/card";
import { formatDate } from "@/lib/format";
import type { Announcement } from "@/types/api";

/**
 * Pengumuman memakai aksen amber, bukan hijau, supaya terbaca sebagai
 * "perlu diperhatikan" dan tidak melebur dengan kartu berita di sekitarnya.
 */
export function AnnouncementCard({ announcement }: { announcement: Announcement }) {
  return (
    <Card className="h-full border-secondary/40 bg-secondary-soft/40">
      <CardBody className="flex gap-4">
        <Megaphone className="mt-0.5 size-5 shrink-0 text-secondary" aria-hidden="true" />

        <div className="min-w-0">
          <h3 className="font-semibold text-pretty">{announcement.title}</h3>
          <time dateTime={announcement.createdAt} className="mt-1 block text-sm text-muted">
            {formatDate(announcement.createdAt)}
          </time>
          <p className="mt-2 whitespace-pre-line text-pretty">{announcement.content}</p>
        </div>
      </CardBody>
    </Card>
  );
}
