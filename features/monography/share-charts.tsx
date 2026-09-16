import { formatNumber, formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ShareItem } from "@/features/monography/insights";

/**
 * Grafik bagian-dari-keseluruhan untuk monografi, seluruhnya dirender server.
 *
 * Sama seperti `StatBars`: tanpa pustaka grafik, jadi halaman tetap Server
 * Component dan angkanya terbaca mesin pencari. Setiap grafik datang dengan
 * legenda berisi angka dan persentase, sehingga warna tidak pernah menjadi
 * satu-satunya pembawa makna — legenda itulah "tabel"-nya.
 */

/** Kelas latar per irisan. Ditulis utuh supaya Tailwind menemukannya. */
const CATEGORICAL = ["bg-chart-1", "bg-chart-2", "bg-chart-3", "bg-chart-4", "bg-chart-5"];
const CATEGORICAL_STROKE = [
  "stroke-chart-1",
  "stroke-chart-2",
  "stroke-chart-3",
  "stroke-chart-4",
  "stroke-chart-5",
];
const STEPS = ["bg-chart-step-1", "bg-chart-step-2", "bg-chart-step-3", "bg-chart-step-4"];

function Legend({ items, swatches }: { items: ShareItem[]; swatches: string[] }) {
  const total = items.reduce((sum, item) => sum + item.value, 0);

  return (
    <ul className="flex flex-col gap-2">
      {items.map((item, index) => (
        <li key={item.label} className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className={cn("size-3 shrink-0 rounded-sm", swatches[index % swatches.length])}
          />
          <span className="min-w-0 flex-1">{item.label}</span>
          <span className="text-sm text-muted tabular-nums">
            {formatNumber(item.value)} · {formatPercent(item.value, total)}
          </span>
        </li>
      ))}
    </ul>
  );
}

/**
 * Satu batang 100% untuk jenjang yang berurutan. Warnanya satu hue yang makin
 * pekat makin tinggi jenjangnya, jadi urutannya terbaca tanpa legenda sekalipun.
 * Celah 2px antaririsan memisahkan warna yang bertetangga.
 */
export function StackedShare({ items }: { items: ShareItem[] }) {
  const total = items.reduce((sum, item) => sum + item.value, 0);
  if (total === 0) return <p className="text-muted">Data belum diisi untuk tahun ini.</p>;

  return (
    <div className="flex flex-col gap-4">
      <div aria-hidden="true" className="flex h-4 w-full gap-0.5 overflow-hidden rounded-full">
        {items.map((item, index) =>
          item.value > 0 ? (
            <div
              key={item.label}
              title={`${item.label}: ${formatNumber(item.value)} (${formatPercent(item.value, total)})`}
              className={cn("h-full", STEPS[index % STEPS.length])}
              style={{ width: `${(item.value / total) * 100}%` }}
            />
          ) : null,
        )}
      </div>
      <Legend items={items} swatches={STEPS} />
    </div>
  );
}

/**
 * Donat untuk komposisi dengan sedikit irisan (paling banyak lima). Dibuat dari
 * lingkaran SVG ber-`stroke-dasharray`, satu lingkaran per irisan.
 */
export function DonutShare({ items, centerLabel }: { items: ShareItem[]; centerLabel: string }) {
  const total = items.reduce((sum, item) => sum + item.value, 0);
  if (total === 0) return <p className="text-muted">Data belum diisi untuk tahun ini.</p>;

  const radius = 15.9155; // keliling ≈ 100, jadi panjang busur = persentase
  const gap = items.length > 1 ? 0.8 : 0;
  // Titik mulai setiap busur = jumlah panjang busur sebelumnya.
  const arcs = items.map((item, index) => ({
    item,
    length: (item.value / total) * 100,
    start: items.slice(0, index).reduce((sum, prev) => sum + (prev.value / total) * 100, 0),
  }));

  return (
    <div className="flex flex-col items-center gap-6 md:flex-row md:items-center md:gap-10">
      <div className="relative size-44 shrink-0 md:size-48">
        <svg viewBox="0 0 42 42" className="size-full -rotate-90" aria-hidden="true">
          <circle
            cx="21"
            cy="21"
            r={radius}
            fill="none"
            strokeWidth="5"
            className="stroke-surface-muted"
          />
          {arcs.map(({ item, length, start }, index) => {
            const dash = Math.max(length - gap, 0.4);
            return (
              <circle
                key={item.label}
                cx="21"
                cy="21"
                r={radius}
                fill="none"
                strokeWidth="5"
                strokeDasharray={`${dash} ${100 - dash}`}
                strokeDashoffset={-start}
                className={CATEGORICAL_STROKE[index % CATEGORICAL_STROKE.length]}
              >
                <title>{`${item.label}: ${formatNumber(item.value)} (${formatPercent(item.value, total)})`}</title>
              </circle>
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-2xl font-bold">{formatNumber(total)}</span>
          <span className="text-sm text-muted">{centerLabel}</span>
        </div>
      </div>
      <div className="w-full min-w-0">
        <Legend items={items} swatches={CATEGORICAL} />
      </div>
    </div>
  );
}

export interface TrendPoint {
  year: number;
  value: number;
}

/**
 * Jumlah penduduk per tahun sebagai kolom. Hanya muncul kalau ada dua tahun
 * atau lebih; dibatasi enam tahun terakhir supaya kolomnya tetap selebar
 * jempol di layar 320px. Tahun yang sedang dipilih diberi warna utama, sisanya
 * diredam — ceritanya "tahun ini dibanding sebelumnya", bukan enam seri.
 */
export function PopulationTrend({
  points,
  activeYear,
}: {
  points: TrendPoint[];
  activeYear: number;
}) {
  const shown = [...points].sort((a, b) => a.year - b.year).slice(-6);
  const largest = Math.max(...shown.map((point) => point.value), 1);

  return (
    <ol className="flex h-48 items-end gap-2 md:h-56 md:gap-4">
      {shown.map((point) => {
        const active = point.year === activeYear;
        return (
          <li
            key={point.year}
            className="flex h-full min-w-0 flex-1 flex-col items-center justify-end"
          >
            <span
              className={cn(
                "mb-1 text-xs tabular-nums md:text-sm",
                active ? "font-semibold text-foreground" : "text-muted",
              )}
            >
              {formatNumber(point.value)}
            </span>
            <div
              aria-hidden="true"
              className={cn(
                "w-full max-w-14 rounded-t-md",
                active ? "bg-primary" : "bg-primary/30",
              )}
              style={{
                height: `${Math.max((point.value / largest) * 75, 3)}%`,
              }}
            />
            <span
              className={cn(
                "mt-2 text-sm tabular-nums",
                active ? "font-semibold text-accent" : "text-muted",
              )}
            >
              {point.year}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
