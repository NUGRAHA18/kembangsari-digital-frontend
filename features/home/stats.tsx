import Link from "next/link";
import { Home, Landmark, MapPin, Sprout, Store, Users } from "lucide-react";
import { Card, CardBody } from "@/components/ui/card";
import { formatNumber } from "@/lib/format";
import type { PopulationStat } from "@/types/api";

/**
 * Angka ringkas di beranda. KK, penduduk, dan RT diambil dari monografi tahun
 * terbaru; UMKM, potensi, dan titik lokasi dari `meta.total` daftar publiknya.
 * Angka yang tidak terambil (`null`) — kolom belum diisi atau permintaannya
 * gagal — kartunya tidak ditampilkan alih-alih menulis "0".
 */
export function HomeStats({
  stat,
  umkmCount,
  potentialCount,
  markerCount,
}: {
  stat: PopulationStat | null;
  umkmCount: number | null;
  potentialCount: number | null;
  markerCount: number | null;
}) {
  const items = [
    {
      label: "Kepala Keluarga",
      value: stat?.familyHeadCount ?? stat?.familyCount ?? null,
      Icon: Home,
    },
    { label: "Jumlah Penduduk", value: stat?.totalPopulation ?? null, Icon: Users },
    { label: "Rukun Tetangga", value: stat?.rtCount ?? null, Icon: Landmark },
    { label: "UMKM Warga", value: umkmCount, Icon: Store },
    { label: "Potensi Padukuhan", value: potentialCount, Icon: Sprout },
    { label: "Titik di Peta", value: markerCount, Icon: MapPin },
  ].filter((item) => item.value !== null && item.value !== undefined);

  if (items.length === 0) return null;

  return (
    <div>
      <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-6">
        {items.map(({ label, value, Icon }) => (
          <li key={label}>
            <Card className="h-full">
              <CardBody className="p-4">
                <Icon className="size-6 text-accent" aria-hidden="true" />
                <p className="mt-3 text-2xl font-bold tracking-tight md:text-3xl">
                  {formatNumber(value)}
                </p>
                <p className="text-sm text-muted">{label}</p>
              </CardBody>
            </Card>
          </li>
        ))}
      </ul>

      {stat ? (
        <p className="mt-3 text-sm text-muted">
          Data monografi tahun {stat.year}.{" "}
          <Link href="/monografi" className="text-accent hover:underline">
            Lihat statistik lengkap
          </Link>
        </p>
      ) : null}
    </div>
  );
}
