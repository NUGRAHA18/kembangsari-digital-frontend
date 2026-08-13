import { cn } from "@/lib/utils";

/**
 * Gaya dasar isian form.
 *
 * `text-base` (16px) bukan pilihan estetika: di bawah ukuran itu iOS otomatis
 * memperbesar halaman begitu kolomnya difokuskan, dan halaman tidak pernah
 * kembali ke ukuran semula. `min-h-11` menjaga tinggi ketuk 44px.
 *
 * Keadaan fokus mengikuti `design-idea.md` §9: tepi berubah hijau dan cincin
 * tipis muncul di sekelilingnya. Garis luar bawaan sengaja dimatikan **hanya
 * di sini**, karena penggantinya lebih kuat, bukan lebih lemah — tepinya
 * berpindah dari abu-abu #E2E8F0 ke hijau pekat, perubahan yang jauh melampaui
 * ambang 3:1. Di tempat lain garis luar bawaan tetap berlaku.
 */
export const inputClasses =
  "min-h-11 w-full rounded-lg border border-border bg-surface px-3 py-2 text-base text-foreground transition-[color,border-color,box-shadow] duration-150 placeholder:text-muted " +
  "focus-visible:border-primary focus-visible:shadow-[0_0_0_3px_var(--ring)] focus-visible:outline-none";

export function Field({
  label,
  htmlFor,
  hint,
  required,
  children,
  className,
}: {
  label: string;
  htmlFor: string;
  hint?: React.ReactNode;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  const hintId = hint ? `${htmlFor}-keterangan` : undefined;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={htmlFor} className="font-medium">
        {label}
        {required ? (
          <>
            <span aria-hidden="true" className="text-error">
              {" "}
              *
            </span>
            <span className="sr-only"> (wajib diisi)</span>
          </>
        ) : null}
      </label>

      {children}

      {hint ? (
        <p id={hintId} className="text-sm text-muted text-pretty">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
