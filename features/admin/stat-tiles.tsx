import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Kartu ringkasan angka di kepala halaman daftar (`design-idea.md` §11).
 *
 * Latarnya lembut, bukan warna pekat — dokumen menyebutnya khusus, dan
 * alasannya terbaca sendiri begitu empat kartu berjajar: empat blok warna
 * penuh menenggelamkan daftar di bawahnya, yang justru isi halamannya.
 *
 * Angkanya boleh `null`, dan itu bukan sama dengan nol: kalau permintaan
 * penghitungnya gagal, yang tampil "—". Menampilkan 0 di sana akan terbaca
 * pengelola sebagai "tidak ada satu pun", padahal datanya hanya tidak terambil.
 */
export type StatTone = "primary" | "info" | "neutral" | "secondary";

const TONES: Record<StatTone, string> = {
  primary: "bg-primary-soft text-primary-soft-foreground",
  info: "bg-info-soft text-info-soft-foreground",
  neutral: "bg-surface-muted text-muted",
  secondary: "bg-secondary-soft text-secondary-soft-foreground",
};

export interface StatTile {
  label: string;
  value: number | null;
  /** Satuan di bawah angka, mis. "titik lokasi". */
  unit?: string;
  tone: StatTone;
  Icon: LucideIcon;
}

export function StatTiles({ tiles }: { tiles: StatTile[] }) {
  return (
    // Dua kolom di ponsel, bukan satu: angkanya pendek, dan empat kartu
    // bertumpuk vertikal mendorong daftar lokasi jauh ke bawah lipatan layar.
    <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {tiles.map(({ label, value, unit, tone, Icon }) => (
        <li key={label} className="rounded-xl border border-border bg-surface p-4">
          <span
            aria-hidden="true"
            className={cn("mb-3 grid size-9 place-items-center rounded-lg", TONES[tone])}
          >
            <Icon className="size-5" />
          </span>

          <p className="text-sm text-muted">{label}</p>
          <p className="text-2xl leading-tight font-bold tracking-tight">
            {value === null ? "—" : value.toLocaleString("id-ID")}
          </p>
          {unit ? <p className="text-sm text-muted">{unit}</p> : null}
        </li>
      ))}
    </ul>
  );
}
