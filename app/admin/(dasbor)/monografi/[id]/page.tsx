import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { MonographyForm } from "@/features/admin/monography-form";
import { fetchAsAdmin } from "@/lib/admin-fetch";
import { formatDate } from "@/lib/format";
import { requireSession } from "@/lib/session";
import { getMonographyByIdAsAdmin } from "@/services/monography";

export const metadata: Metadata = { title: "Ubah Data Monografi" };

type Props = { params: Promise<{ id: string }> };

export default async function EditMonographyPage({ params }: Props) {
  const { token } = await requireSession();
  const { id } = await params;

  // Tanpa token, tahun yang belum diterbitkan tidak terbaca — halaman ini
  // justru dibuka untuk menyelesaikannya.
  const stat = await fetchAsAdmin(getMonographyByIdAsAdmin(id, token));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/admin/monografi"
          className="inline-flex min-h-11 items-center gap-2 text-muted hover:text-accent"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Kembali ke daftar tahun
        </Link>

        <h1 className="mt-2 text-2xl font-bold tracking-tight">Data Tahun {stat.year}</h1>

        <div className="mt-2 flex flex-wrap items-center gap-3">
          <Badge tone={stat.isPublished ? "primary" : "neutral"}>
            {stat.isPublished ? "Terbit" : "Draf"}
          </Badge>
          <span className="text-sm text-muted">
            Terakhir diperbarui {formatDate(stat.updatedAt)}
          </span>
        </div>

        <div className="mt-2 flex flex-wrap gap-1">
          {stat.isPublished ? (
            <Link
              href={`/monografi?tahun=${stat.year}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center gap-2 rounded-xl px-3 text-muted transition-colors hover:bg-surface-muted"
            >
              <ExternalLink className="size-4" aria-hidden="true" />
              Lihat di portal
            </Link>
          ) : null}

          <Link
            href={`/admin/monografi/${stat.id}/hapus`}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl px-3 text-error transition-colors hover:bg-error/10"
          >
            <Trash2 className="size-4" aria-hidden="true" />
            Hapus Data Tahun Ini
          </Link>
        </div>
      </div>

      <MonographyForm stat={stat} />
    </div>
  );
}
