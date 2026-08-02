import { Container } from "@/components/ui/container";
import { CardGridSkeleton, Skeleton } from "@/components/ui/states";

/**
 * Kerangka halaman daftar, dipakai oleh berkas `loading.tsx` tiap modul.
 *
 * Catatan penting: `loading.tsx` hanya diletakkan di route group `(daftar)`,
 * tidak pernah di folder `[slug]`. Berkas `loading.tsx` membuat batas streaming,
 * dan begitu potongan pertama respons terkirim, status HTTP-nya sudah terkunci
 * di 200 — sehingga `notFound()` pada halaman detail akan menghasilkan halaman
 * "tidak ditemukan" yang berstatus 200. Bagi mesin pencari itu terbaca sebagai
 * halaman sah dan slug yang salah ikut terindeks.
 */
export function ListPageSkeleton({
  withFilters = true,
  count = 6,
  variant = "grid",
}: {
  withFilters?: boolean;
  count?: number;
  variant?: "grid" | "stack";
}) {
  return (
    <>
      <div className="border-b border-border bg-surface">
        <Container className="py-8 md:py-12">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="mt-4 h-9 w-56" />
          <Skeleton className="mt-3 h-5 w-full max-w-xl" />
        </Container>
      </div>

      <Container className="py-8 md:py-12">
        {withFilters ? (
          <div className="flex flex-col gap-3">
            <Skeleton className="h-11 w-full" />
            <div className="flex gap-2">
              <Skeleton className="h-11 w-24 rounded-full" />
              <Skeleton className="h-11 w-28 rounded-full" />
              <Skeleton className="h-11 w-20 rounded-full" />
            </div>
          </div>
        ) : null}

        <div className="mt-8">
          {variant === "grid" ? (
            <CardGridSkeleton count={count} />
          ) : (
            <div className="flex flex-col gap-4">
              {Array.from({ length: count }, (_, index) => (
                <Skeleton key={index} className="h-32 w-full" />
              ))}
            </div>
          )}
        </div>
      </Container>
    </>
  );
}
