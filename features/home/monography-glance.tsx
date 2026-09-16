import { Card, CardBody } from "@/components/ui/card";
import { toEmploymentItems } from "@/features/monography/employment";
import { educationBands, religionShares } from "@/features/monography/insights";
import { DonutShare, StackedShare } from "@/features/monography/share-charts";
import { StatBars } from "@/features/monography/stat-bars";
import { formatNumber, formatPercent } from "@/lib/format";
import type { PopulationStat } from "@/types/api";

/**
 * Potret warga di beranda: ringkasan grafik dari monografi tahun terbaru.
 *
 * Setiap kartu hanya dirender kalau datanya ada — padukuhan yang belum mendata
 * pekerjaan tidak mendapat kartu kosong bertuliskan "belum diisi" di halaman
 * depan. Kalau tidak satu pun tersisa, seluruh bagian ikut hilang.
 */
export function MonographyGlance({ stat }: { stat: PopulationStat }) {
  const genderTotal = stat.maleCount + stat.femaleCount;
  const education = educationBands(stat);
  const religion = religionShares(stat);
  // Lima pekerjaan terbanyak saja; daftar lengkapnya ada di /monografi.
  const employment = toEmploymentItems(stat.employmentData)
    .filter((item) => (item.value ?? 0) > 0)
    .sort((a, b) => (b.value ?? 0) - (a.value ?? 0))
    .slice(0, 5);

  return (
    <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
      {genderTotal > 0 ? (
        <li>
          <GlanceCard title="Jenis Kelamin">
            <div className="flex flex-wrap justify-between gap-4">
              <div>
                <p className="text-2xl font-bold">{formatNumber(stat.maleCount)}</p>
                <p className="text-muted">
                  Laki-laki · {formatPercent(stat.maleCount, genderTotal)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">{formatNumber(stat.femaleCount)}</p>
                <p className="text-muted">
                  Perempuan · {formatPercent(stat.femaleCount, genderTotal)}
                </p>
              </div>
            </div>
            <div
              aria-hidden="true"
              className="mt-4 flex h-3 w-full gap-0.5 overflow-hidden rounded-full"
            >
              <div
                className="bg-primary"
                style={{ width: `${(stat.maleCount / genderTotal) * 100}%` }}
              />
              <div
                className="bg-secondary"
                style={{ width: `${(stat.femaleCount / genderTotal) * 100}%` }}
              />
            </div>
          </GlanceCard>
        </li>
      ) : null}

      {education.length > 0 ? (
        <li>
          <GlanceCard title="Pendidikan">
            <StackedShare items={education} />
          </GlanceCard>
        </li>
      ) : null}

      {employment.length > 0 ? (
        <li>
          <GlanceCard title="Pekerjaan Terbanyak">
            <StatBars tone="secondary" items={employment} />
          </GlanceCard>
        </li>
      ) : null}

      {religion.length > 0 ? (
        <li>
          <GlanceCard title="Pemeluk Agama">
            <DonutShare items={religion} centerLabel="jiwa terdata" />
          </GlanceCard>
        </li>
      ) : null}
    </ul>
  );
}

function GlanceCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="h-full">
      <CardBody>
        <h3 className="mb-4 text-lg font-semibold">{title}</h3>
        {children}
      </CardBody>
    </Card>
  );
}
