import type { Metadata } from "next";
import { Home, Landmark, Users, UsersRound } from "lucide-react";
import { Card, CardBody } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { FilterChips } from "@/components/ui/filter-chips";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState, ErrorState } from "@/components/ui/states";
import { StatBars } from "@/features/monography/stat-bars";
import { StatTable } from "@/features/monography/stat-table";
import { safeFetch } from "@/lib/api";
import { formatNumber, formatPercent } from "@/lib/format";
import { readParam, type RawSearchParams } from "@/lib/page-params";
import { getPublishedMonography } from "@/services/monography";
import type { PopulationStat } from "@/types/api";

export const metadata: Metadata = {
  title: "Monografi",
  description:
    "Statistik kependudukan Padukuhan Kembangsari: jumlah penduduk, komposisi jenis kelamin, tingkat pendidikan, dan agama.",
};

export default async function MonographyPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const params = await searchParams;
  const selectedYear = readParam(params, "tahun");

  // Satu permintaan untuk semua tahun: datanya hanya beberapa baris, dan
  // seluruh tahun tetap dibutuhkan untuk mengisi pemilih tahun.
  const monography = await safeFetch(getPublishedMonography({ limit: 50 }));

  const years = monography.data?.data ?? [];
  const stat = years.find((item) => String(item.year) === selectedYear) ?? years[0];

  return (
    <>
      <PageHeader
        title="Monografi Padukuhan"
        description="Data kependudukan Padukuhan Kembangsari yang diperbarui perangkat padukuhan."
        breadcrumbs={[{ label: "Monografi" }]}
      />

      <Container className="py-8 md:py-12">
        {monography.error ? (
          <ErrorState message={monography.error} />
        ) : !stat ? (
          <EmptyState
            title="Belum ada data monografi"
            description="Data kependudukan akan tampil di sini setelah dipublikasikan."
          />
        ) : (
          <>
            {years.length > 1 ? (
              <FilterChips
                label="Pilih tahun data"
                basePath="/monografi"
                paramName="tahun"
                activeValue={String(stat.year)}
                options={years.map((item) => ({
                  value: String(item.year),
                  label: `Tahun ${item.year}`,
                }))}
              />
            ) : null}

            <MonographyContent stat={stat} />
          </>
        )}
      </Container>
    </>
  );
}

function MonographyContent({ stat }: { stat: PopulationStat }) {
  const summary = [
    { label: "Jumlah Penduduk", value: stat.totalPopulation, Icon: Users },
    { label: "Kepala Keluarga", value: stat.familyHeadCount, Icon: Home },
    { label: "Jumlah Keluarga", value: stat.familyCount, Icon: UsersRound },
    { label: "Rukun Tetangga", value: stat.rtCount, Icon: Landmark },
  ].filter((item) => item.value !== null && item.value !== undefined);

  const genderTotal = stat.maleCount + stat.femaleCount;

  return (
    <div className="mt-8 flex flex-col gap-10 md:gap-14">
      <section aria-labelledby="ringkasan">
        <h2 id="ringkasan" className="sr-only">
          Ringkasan data tahun {stat.year}
        </h2>
        <ul className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
          {summary.map(({ label, value, Icon }) => (
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
      </section>

      <section aria-labelledby="jenis-kelamin">
        <h2 id="jenis-kelamin" className="mb-4 text-xl font-semibold tracking-tight md:text-2xl">
          Komposisi Jenis Kelamin
        </h2>

        <Card>
          <CardBody>
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
              className="mt-4 flex h-3 w-full overflow-hidden rounded-full bg-surface-muted"
            >
              <div
                className="bg-primary"
                style={{ width: `${(stat.maleCount / (genderTotal || 1)) * 100}%` }}
              />
              <div
                className="bg-secondary"
                style={{ width: `${(stat.femaleCount / (genderTotal || 1)) * 100}%` }}
              />
            </div>
          </CardBody>
        </Card>
      </section>

      <section aria-labelledby="pendidikan">
        <h2 id="pendidikan" className="mb-4 text-xl font-semibold tracking-tight md:text-2xl">
          Tingkat Pendidikan
        </h2>
        <Card>
          <CardBody>
            <StatBars
              items={[
                { label: "Tidak/Belum Sekolah", value: stat.educationNoSchool },
                { label: "SD/Sederajat", value: stat.educationSD },
                { label: "SLTP/Sederajat", value: stat.educationSLTP },
                { label: "SLTA/Sederajat", value: stat.educationSLTA },
                { label: "Diploma (D1–D3)", value: stat.educationD1_D3 },
                { label: "Sarjana (S1)", value: stat.educationS1 },
                { label: "Magister (S2)", value: stat.educationS2 },
                { label: "Doktor (S3)", value: stat.educationS3 },
              ]}
            />
          </CardBody>
        </Card>
      </section>

      <section aria-labelledby="agama">
        <h2 id="agama" className="mb-4 text-xl font-semibold tracking-tight md:text-2xl">
          Pemeluk Agama
        </h2>
        <Card>
          <CardBody>
            <StatBars
              tone="secondary"
              items={[
                { label: "Islam", value: stat.religionIslam },
                { label: "Kristen Protestan", value: stat.religionProtestant },
                { label: "Katolik", value: stat.religionCatholic },
                { label: "Hindu", value: stat.religionHindu },
                { label: "Buddha", value: stat.religionBuddha },
                { label: "Konghucu", value: stat.religionKonghucu },
                { label: "Lainnya", value: stat.religionOther },
              ]}
            />
          </CardBody>
        </Card>
      </section>

      <section aria-labelledby="rincian">
        <h2 id="rincian" className="mb-4 text-xl font-semibold tracking-tight md:text-2xl">
          Rincian Data Tahun {stat.year}
        </h2>
        <div className="flex flex-col gap-4">
          <StatTable
            caption="Kependudukan"
            rows={[
              { label: "Total penduduk", value: stat.totalPopulation },
              { label: "Laki-laki", value: stat.maleCount },
              { label: "Perempuan", value: stat.femaleCount },
            ]}
          />
          <StatTable
            caption="Keluarga & Wilayah"
            rows={[
              { label: "Kepala keluarga", value: stat.familyHeadCount },
              { label: "Jumlah keluarga", value: stat.familyCount },
              { label: "Jumlah RT", value: stat.rtCount },
              { label: "Jumlah RW", value: stat.rwCount },
            ]}
          />
        </div>

        {/* `employmentData` bertipe JSON bebas dan strukturnya belum dibakukan
            di backend, jadi belum ditampilkan — menebak bentuknya berisiko
            menampilkan angka yang keliru. */}
      </section>
    </div>
  );
}
