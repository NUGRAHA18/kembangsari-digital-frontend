import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AnnouncementForm } from "@/features/admin/announcement-form";
import { fetchAsAdmin } from "@/lib/admin-fetch";
import { formatDate } from "@/lib/format";
import { requireSession } from "@/lib/session";
import { getAnnouncementByIdAsAdmin } from "@/services/announcement";

export const metadata: Metadata = { title: "Ubah Pengumuman" };

type Props = { params: Promise<{ id: string }> };

export default async function EditAnnouncementPage({ params }: Props) {
  const { token } = await requireSession();
  const { id } = await params;

  // Tanpa token, pengumuman yang disembunyikan dijawab 404 — halaman ini
  // justru harus bisa membukanya kembali.
  const announcement = await fetchAsAdmin(getAnnouncementByIdAsAdmin(id, token));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/admin/pengumuman"
          className="inline-flex min-h-11 items-center gap-2 text-muted hover:text-accent"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Kembali ke daftar pengumuman
        </Link>

        <h1 className="mt-2 text-2xl font-bold tracking-tight text-pretty">
          {announcement.title}
        </h1>

        <div className="mt-2 flex flex-wrap items-center gap-3">
          <Badge tone={announcement.isActive ? "primary" : "neutral"}>
            {announcement.isActive ? "Tampil" : "Disembunyikan"}
          </Badge>
          <span className="text-sm text-muted">Dibuat {formatDate(announcement.createdAt)}</span>
        </div>
      </div>

      <AnnouncementForm announcement={announcement} />
    </div>
  );
}
