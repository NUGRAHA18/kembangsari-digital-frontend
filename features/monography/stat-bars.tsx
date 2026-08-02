import { formatNumber, formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";

export interface StatBarItem {
  label: string;
  value: number | null;
}

/**
 * Grafik batang horizontal untuk data monografi.
 *
 * Dibuat dari CSS biasa, bukan pustaka grafik: pustaka grafik berjalan di
 * browser sehingga memaksa halaman ini menjadi Client Component, menambah
 * berkas yang harus diunduh, dan angkanya tidak terbaca mesin pencari.
 * Batang horizontal juga tidak pernah memaksa halaman menggulir ke samping —
 * masalah utama grafik batang vertikal di layar 320px.
 *
 * Angka ditulis sebagai teks di sebelah setiap batang, jadi informasinya tetap
 * lengkap bagi pembaca layar; batangnya sendiri murni visual.
 */
export function StatBars({
  items,
  tone = "primary",
}: {
  items: StatBarItem[];
  tone?: "primary" | "secondary";
}) {
  const values = items.filter((item): item is { label: string; value: number } =>
    typeof item.value === "number",
  );

  if (values.length === 0) {
    return <p className="text-muted">Data belum diisi untuk tahun ini.</p>;
  }

  const total = values.reduce((sum, item) => sum + item.value, 0);
  // Skala batang mengikuti nilai terbesar, bukan total — kalau memakai total,
  // kategori kecil akan tampak sebagai garis tipis yang tidak terbaca.
  const largest = Math.max(...values.map((item) => item.value), 1);

  return (
    <ul className="flex flex-col gap-3">
      {values.map((item) => (
        <li key={item.label}>
          <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
            <span className="font-medium">{item.label}</span>
            <span className="text-sm text-muted">
              {formatNumber(item.value)} jiwa · {formatPercent(item.value, total)}
            </span>
          </div>
          <div aria-hidden="true" className="mt-1.5 h-2.5 w-full rounded-full bg-surface-muted">
            <div
              className={cn(
                "h-full rounded-full",
                tone === "primary" ? "bg-primary" : "bg-secondary",
              )}
              style={{ width: `${Math.max((item.value / largest) * 100, 2)}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
