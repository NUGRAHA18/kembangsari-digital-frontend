import { AlertTriangle, Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Tiga keadaan yang wajib dimiliki setiap daftar: memuat, galat, dan kosong.
 * Dikumpulkan di satu berkas supaya tampilannya seragam di seluruh halaman.
 */

/** Skeleton lebih baik daripada spinner untuk daftar — bentuk halaman terlihat lebih dulu. */
export function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("animate-pulse rounded-xl bg-surface-muted", className)}
      aria-hidden="true"
      {...props}
    />
  );
}

/** Kerangka kartu dengan gambar di atas — bentuk yang paling sering dipakai. */
export function CardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface">
      <Skeleton className="aspect-3/2 w-full rounded-none" />
      <div className="space-y-3 p-4 md:p-6">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-2/3" />
      </div>
    </div>
  );
}

export function CardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
      {Array.from({ length: count }, (_, index) => (
        <CardSkeleton key={index} />
      ))}
    </div>
  );
}

export function EmptyState({
  title = "Belum ada data",
  description,
  className,
}: {
  title?: string;
  description?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center rounded-xl border border-dashed border-border bg-surface px-4 py-12 text-center",
        className,
      )}
    >
      <Inbox className="size-8 text-muted" aria-hidden="true" />
      <p className="mt-3 font-medium">{title}</p>
      {description ? <p className="mt-1 max-w-prose text-muted">{description}</p> : null}
    </div>
  );
}

export function ErrorState({
  title = "Gagal memuat data",
  message,
  className,
}: {
  title?: string;
  message?: string;
  className?: string;
}) {
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center rounded-xl border border-dashed px-4 py-12 text-center",
        "border-error/40 bg-error/5",
        className,
      )}
    >
      <AlertTriangle className="size-8 text-error" aria-hidden="true" />
      <p className="mt-3 font-medium">{title}</p>
      <p className="mt-1 max-w-prose text-muted">
        {message ?? "Silakan coba muat ulang halaman beberapa saat lagi."}
      </p>
    </div>
  );
}
