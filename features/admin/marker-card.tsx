import Link from "next/link";
import { ExternalLink, PenSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody } from "@/components/ui/card";
import { colorForCategory } from "@/features/maps/pin-colors";
import { formatCoordinatePair } from "@/lib/coordinates";
import { googleMapsPointLink } from "@/lib/format";
import type { MapMarker } from "@/types/api";

/**
 * Kartu satu titik lokasi di daftar dashboard (`design-idea.md` §13).
 *
 * Susunannya mengikuti hierarki yang diminta dokumen: kategori, nama, alamat,
 * koordinat, lalu status dan aksi. Koordinat sengaja paling kecil dan paling
 * redup — ia jarang dibaca, tetapi harus ada karena itu satu-satunya cara
 * pengelola memastikan titiknya tidak salah tempat.
 *
 * Titik warna di kiri memakai warna yang sama persis dengan pin di peta warga,
 * lewat `colorForCategory`. Itu gunanya: pengelola yang melihat pin biru di
 * peta bisa mencarinya di daftar ini tanpa membaca nama kategori satu per satu.
 * Warnanya ikut bergeser kalau kategori ditambah atau dihapus — konsekuensi
 * yang memang sudah disebutkan di halaman kategori.
 *
 * §27 dokumen meminta aksi disembunyikan di balik menu `⋮`. Tidak dipakai:
 * menu itu menuntut JavaScript, sedangkan seluruh dashboard ini dirancang tetap
 * bekerja tanpanya. Yang jadi maksud §27 — "Hapus jangan jadi tombol utama" —
 * tetap terpenuhi, karena hapus memang tidak ada di kartu ini sama sekali; ia
 * berada di halaman ubah, di balik satu halaman konfirmasi tersendiri.
 */
export function MarkerCard({
  marker,
  categoryIds,
}: {
  marker: MapMarker;
  categoryIds: string[];
}) {
  return (
    <Card interactive className="h-full">
      <CardBody className="flex flex-col gap-3 p-4">
        <div className="flex items-start gap-3">
          <span
            aria-hidden="true"
            className="mt-1 size-3 shrink-0 rounded-full"
            style={{ backgroundColor: colorForCategory(marker.categoryId, categoryIds) }}
          />

          <div className="min-w-0 flex-1">
            {/* `category` selalu disertakan backend, tetapi kartu ini tetap
                bertahan kalau suatu saat tidak. */}
            <p className="text-sm text-muted">{marker.category?.name ?? "Tanpa kategori"}</p>
            <h3 className="font-semibold text-pretty">{marker.name}</h3>

            {marker.address ? (
              <p className="mt-0.5 text-sm text-muted text-pretty">{marker.address}</p>
            ) : null}

            <p className="mt-1 font-mono text-xs text-muted">
              {formatCoordinatePair(marker.latitude, marker.longitude)}
            </p>
          </div>

          <Badge tone={marker.isActive ? "primary" : "neutral"} className="shrink-0">
            {marker.isActive ? "Tampil" : "Disembunyikan"}
          </Badge>
        </div>

        <div className="flex flex-wrap items-center gap-1 border-t border-border pt-2">
          <Link
            href={`/admin/peta/${marker.id}`}
            className="inline-flex min-h-11 items-center gap-2 rounded-lg px-3 font-medium text-accent transition-colors hover:bg-surface-muted"
          >
            <PenSquare className="size-4" aria-hidden="true" />
            Ubah
          </Link>

          <Link
            href={googleMapsPointLink(marker.latitude, marker.longitude)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center gap-2 rounded-lg px-3 text-muted transition-colors hover:bg-surface-muted"
          >
            <ExternalLink className="size-4" aria-hidden="true" />
            Periksa titik
          </Link>
        </div>
      </CardBody>
    </Card>
  );
}
