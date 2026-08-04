import { AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { cn } from "@/lib/utils";

type Tone = "info" | "success" | "error";

/**
 * Pesan singkat hasil sebuah aksi — dipakai dashboard untuk memberitahu bahwa
 * data tersimpan atau permintaan ditolak.
 *
 * Warnanya memakai token dengan transparansi, mengikuti cara `ErrorState`
 * dibuat, supaya latar lembutnya tetap terbaca di mode terang maupun gelap
 * tanpa menambah token baru.
 */
const TONES: Record<Tone, { className: string; Icon: typeof Info; label: string }> = {
  info: { className: "border-border bg-surface-muted", Icon: Info, label: "Informasi" },
  success: {
    className: "border-success/40 bg-success/10",
    Icon: CheckCircle2,
    label: "Berhasil",
  },
  error: { className: "border-error/40 bg-error/5", Icon: AlertTriangle, label: "Galat" },
};

const ICON_COLORS: Record<Tone, string> = {
  info: "text-muted",
  success: "text-success",
  error: "text-error",
};

export function Alert({
  tone = "info",
  children,
  className,
}: {
  tone?: Tone;
  children: React.ReactNode;
  className?: string;
}) {
  const { className: toneClass, Icon, label } = TONES[tone];

  return (
    <div
      // Galat diumumkan segera oleh pembaca layar, keberhasilan menunggu giliran.
      role={tone === "error" ? "alert" : "status"}
      className={cn("flex items-start gap-2.5 rounded-xl border px-4 py-3", toneClass, className)}
    >
      <Icon className={cn("mt-0.5 size-5 shrink-0", ICON_COLORS[tone])} aria-hidden="true" />
      <div className="min-w-0 flex-1 text-pretty">
        <span className="sr-only">{label}: </span>
        {children}
      </div>
    </div>
  );
}
