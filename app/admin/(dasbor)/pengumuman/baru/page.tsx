import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AnnouncementForm } from "@/features/admin/announcement-form";

export const metadata: Metadata = { title: "Tulis Pengumuman" };

export default function NewAnnouncementPage() {
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
        <h1 className="mt-2 text-2xl font-bold tracking-tight">Tulis Pengumuman</h1>
      </div>

      <AnnouncementForm />
    </div>
  );
}
