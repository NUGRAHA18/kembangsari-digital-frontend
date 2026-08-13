import Link from "next/link";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "outline" | "ghost";
type Size = "sm" | "md" | "lg" | "icon";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-primary text-white hover:bg-primary-hover",
  secondary: "bg-secondary text-slate-900 hover:brightness-95",
  outline: "border border-border bg-surface text-foreground hover:bg-surface-muted",
  ghost: "text-foreground hover:bg-surface-muted",
};

/**
 * Semua ukuran minimal 44px tinggi — jari bukan kursor, dan target di bawah
 * 44px membuat pengguna sering salah ketuk.
 */
const SIZES: Record<Size, string> = {
  sm: "min-h-11 px-3 text-sm",
  md: "min-h-11 px-4 text-base",
  lg: "min-h-12 px-6 text-base",
  icon: "min-h-11 min-w-11 p-0",
};

/**
 * `active:scale-[0.98]` adalah satu-satunya gerakan pada tombol (§22): ditekan
 * lalu mengecil sedikit. Bounce dan glow sengaja tidak ada — dokumen desain
 * menyebut keduanya secara khusus sebagai yang harus dihindari.
 *
 * `rounded-lg` (12px), bukan 16px seperti kartu: §18 memberi tombol dan isian
 * form anak tangga yang lebih rapat daripada kartu yang menaunginya.
 */
const BASE =
  "inline-flex items-center justify-center gap-2 rounded-lg font-medium " +
  "transition-[background-color,border-color,color,transform] duration-150 active:scale-[0.98] " +
  "disabled:pointer-events-none disabled:opacity-50 disabled:active:scale-100";

export function buttonClasses({
  variant = "primary",
  size = "md",
  className,
}: { variant?: Variant; size?: Size; className?: string } = {}) {
  return cn(BASE, VARIANTS[variant], SIZES[size], className);
}

/**
 * `loading` memasang spinner di depan label dan mematikan tombolnya.
 *
 * Ada alasannya kenapa spinner, bukan sekadar teks "Menyimpan…": permintaan
 * tulis ke backend padukuhan sering makan beberapa detik, dan tombol yang hanya
 * berganti kata terbaca sebagai layar yang membeku. Yang berputar menyatakan
 * "sedang jalan" tanpa perlu dibaca.
 *
 * Ikonnya `aria-hidden`: yang mengumumkan keadaan ke pembaca layar adalah
 * `aria-busy` beserta label tombol yang ikut berganti, bukan gambarnya.
 */
export function Button({
  variant,
  size,
  className,
  loading = false,
  disabled,
  children,
  ...props
}: React.ComponentProps<"button"> & { variant?: Variant; size?: Size; loading?: boolean }) {
  return (
    <button
      className={buttonClasses({ variant, size, className })}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? <Loader2 className="size-5 shrink-0 animate-spin" aria-hidden="true" /> : null}
      {children}
    </button>
  );
}

/** Versi tautan — dipakai kalau aksinya berpindah halaman, bukan menjalankan sesuatu. */
export function ButtonLink({
  variant,
  size,
  className,
  ...props
}: React.ComponentProps<typeof Link> & { variant?: Variant; size?: Size }) {
  return <Link className={buttonClasses({ variant, size, className })} {...props} />;
}
