import Link from "next/link";
import { Home, Landmark, Sprout, Users } from "lucide-react";
import { Card, CardBody } from "@/components/ui/card";
import { formatNumber } from "@/lib/format";
import type { PopulationStat } from "@/types/api";

/**
 * Empat angka ringkas di beranda: KK, penduduk, RT, dan jumlah program KKN.
 * Angka diambil dari data monografi tahun terbaru; kalau admin belum mengisi
 * salah satu kolom, kartunya tidak ditampilkan alih-alih menulis "0".
 */
export function HomeStats({
  stat,
  kknProgramCount,
}: {
  stat: PopulationStat | null;
  kknProgramCount: number | null;
}) {
  const items = [
    {
      label: "Kepala Keluarga",
      value: stat?.familyHeadCount ?? stat?.familyCount ?? null,
      Icon: Home,
    },
    { label: "Jumlah Penduduk", value: stat?.totalPopulation ?? null, Icon: Users },
    { label: "Rukun Tetangga", value: stat?.rtCount ?? null, Icon: Landmark },
    { label: "Program KKN", value: kknProgramCount, Icon: Sprout },
  ].filter((item) => item.value !== null && item.value !== undefined);

  if (items.length === 0) return null;

  return (
    <div>
      <ul className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
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
