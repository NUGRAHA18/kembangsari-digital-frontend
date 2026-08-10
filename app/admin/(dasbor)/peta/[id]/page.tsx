import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { MarkerForm } from "@/features/admin/marker-form";
import { fetchAsAdmin } from "@/lib/admin-fetch";
import { formatDate, googleMapsPointLink } from "@/lib/format";
import { requireSession } from "@/lib/session";
import { getMapCategoriesUncached, getMarkerById } from "@/services/maps";

export const metadata: Metadata = { title: "Ubah Lokasi" };

type Props = { params: Promise<{ id: string }> };

export default async function EditMarkerPage({ params }: Props) {
  const { token } = await requireSession();
  const { id } = await params;

  const [marker, categories] = await Promise.all([
    // Tanpa token, marker yang disembunyikan tidak terbaca — halaman ini justru
    // harus bisa menampilkannya kembali.
    fetchAsAdmin(getMarkerById(id, token)),
    fetchAsAdmin(getMapCategoriesUncached()),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/admin/peta"
          className="inline-flex min-h-11 items-center gap-2 text-muted hover:text-accent"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Kembali ke daftar lokasi
        </Link>

        <h1 className="mt-2 text-2xl font-bold tracking-tight text-pretty">{marker.name}</h1>

        <div className="mt-2 flex flex-wrap items-center gap-3">
          <Badge tone={marker.isActive ? "primary" : "neutral"}>
            {marker.isActive ? "Tampil" : "Disembunyikan"}
          </Badge>
          <span className="text-sm text-muted">{marker.category?.name ?? "Tanpa kategori"}</span>
          <span className="text-sm text-muted">Dibuat {formatDate(marker.createdAt)}</span>
        </div>

        <div className="mt-2 flex flex-wrap gap-1">
          <Link
            href={googleMapsPointLink(marker.latitude, marker.longitude)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center gap-2 rounded-xl px-3 text-muted transition-colors hover:bg-surface-muted"
          >
            <ExternalLink className="size-4" aria-hidden="true" />
            Periksa titik di Google Maps
          </Link>

          <Link
            href={`/admin/peta/${marker.id}/hapus`}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl px-3 text-error transition-colors hover:bg-error/10"
          >
            <Trash2 className="size-4" aria-hidden="true" />
            Hapus Lokasi
          </Link>
        </div>
      </div>

      <MarkerForm marker={marker} categories={categories} />
    </div>
  );
}
