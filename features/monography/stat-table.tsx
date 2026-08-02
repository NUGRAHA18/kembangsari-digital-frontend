import { Card, CardBody } from "@/components/ui/card";
import { formatNumber } from "@/lib/format";

export interface StatRow {
  label: string;
  value: number | null;
}

/**
 * Data monografi lengkap dalam dua bentuk.
 *
 * Tabel adalah musuh layar sempit. Dua pendekatan yang mungkin adalah
 * membungkus tabel dengan scroll horizontal, atau mengubahnya jadi kartu
 * pasangan label-nilai di ponsel. Yang kedua dipakai di sini karena data ini
 * dibaca warga awam satu per satu, bukan dianalisis berdampingan.
 */
export function StatTable({ caption, rows }: { caption: string; rows: StatRow[] }) {
  const filled = rows.filter((row) => row.value !== null && row.value !== undefined);

  if (filled.length === 0) return null;

  return (
    <>
      {/* Ponsel & tablet: daftar kartu */}
      <Card className="lg:hidden">
        <CardBody className="p-0">
          <h3 className="border-b border-border px-4 py-3 font-semibold">{caption}</h3>
          <dl className="divide-y divide-border">
            {filled.map((row) => (
              <div key={row.label} className="flex items-baseline justify-between gap-4 px-4 py-3">
                <dt className="text-muted">{row.label}</dt>
                <dd className="font-semibold tabular-nums">{formatNumber(row.value)}</dd>
              </div>
            ))}
          </dl>
        </CardBody>
      </Card>

      {/* Laptop ke atas: tabel biasa */}
      <div className="hidden lg:block">
        <table className="w-full border-collapse overflow-hidden rounded-xl border border-border bg-surface">
          <caption className="sr-only">{caption}</caption>
          <thead>
            <tr className="border-b border-border bg-surface-muted text-left">
              <th scope="col" className="px-4 py-3 font-semibold">
                {caption}
              </th>
              <th scope="col" className="px-4 py-3 text-right font-semibold">
                Jumlah
              </th>
            </tr>
          </thead>
          <tbody>
            {filled.map((row) => (
              <tr key={row.label} className="border-b border-border last:border-b-0">
                <th scope="row" className="px-4 py-3 text-left font-normal text-muted">
                  {row.label}
                </th>
                <td className="px-4 py-3 text-right font-semibold tabular-nums">
                  {formatNumber(row.value)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
