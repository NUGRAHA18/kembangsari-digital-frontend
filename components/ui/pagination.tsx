import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";
import type { PaginationMeta } from "@/types/api";

/**
 * Dua bentuk navigasi halaman dari satu sumber data `meta`.
 *
 * Ponsel  : dua tombol besar Sebelumnya/Selanjutnya + keterangan "Halaman X dari Y".
 * Desktop : nomor halaman, yang membantu orientasi saat daftarnya panjang.
 *
 * Pedoman frontend menyarankan tombol "Muat lebih banyak" di ponsel dengan alasan
 * nomor halaman terlalu kecil dan berdempetan. Tombol besar di sini menyelesaikan
 * masalah itu tanpa mengorbankan dua hal yang penting untuk portal informasi:
 * URL setiap halaman tetap bisa dibagikan, dan mesin pencari tetap bisa menelusuri
 * seluruh daftar. "Muat lebih banyak" memerlukan state di klien dan menghapus keduanya.
 */
export function Pagination({
  meta,
  basePath,
  searchParams = {},
}: {
  meta: PaginationMeta;
  basePath: string;
  /** Filter yang sedang aktif, agar tidak hilang saat berpindah halaman. */
  searchParams?: Record<string, string | undefined>;
}) {
  if (meta.lastPage <= 1) return null;

  const hrefFor = (page: number) => {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(searchParams)) {
      if (value && key !== "page") params.set(key, value);
    }
    if (page > 1) params.set("page", String(page));
    const query = params.toString();
    return query ? `${basePath}?${query}` : basePath;
  };

  return (
    <nav aria-label="Navigasi halaman" className="mt-8 md:mt-10">
      {/* Ponsel — tombol bertumpuk selebar layar.
          Menempatkan "Sebelumnya", keterangan halaman, dan "Selanjutnya" dalam
          satu baris membutuhkan sekitar 370px, sementara ruang isi di layar
          320px hanya 288px — susunan itu memaksa halaman menggulir ke samping.
          Bertumpuk sekaligus membuat target sentuhnya selebar layar. */}
      <div className="flex flex-col gap-3 md:hidden">
        <div className="flex flex-col gap-2 sm:flex-row">
          {meta.hasPrevPage ? (
            <Link
              href={hrefFor(meta.page - 1)}
              rel="prev"
              className={buttonClasses({ variant: "outline", className: "w-full sm:flex-1" })}
            >
              <ChevronLeft className="size-4 shrink-0" aria-hidden="true" />
              Sebelumnya
            </Link>
          ) : null}

          {meta.hasNextPage ? (
            <Link
              href={hrefFor(meta.page + 1)}
              rel="next"
              className={buttonClasses({ variant: "outline", className: "w-full sm:flex-1" })}
            >
              Selanjutnya
              <ChevronRight className="size-4 shrink-0" aria-hidden="true" />
            </Link>
          ) : null}
        </div>

        <p className="text-center text-sm text-muted">
          Halaman {meta.page} dari {meta.lastPage}
        </p>
      </div>

      {/* Desktop */}
      <ol className="hidden items-center justify-center gap-1 md:flex">
        <li>
          {meta.hasPrevPage ? (
            <Link
              href={hrefFor(meta.page - 1)}
              aria-label="Halaman sebelumnya"
              className={buttonClasses({ variant: "ghost", size: "icon" })}
            >
              <ChevronLeft className="size-5" aria-hidden="true" />
            </Link>
          ) : null}
        </li>

        {buildPageRange(meta.page, meta.lastPage).map((entry, index) =>
          entry === "…" ? (
            <li key={`gap-${index}`} className="px-2 text-muted" aria-hidden="true">
              …
            </li>
          ) : (
            <li key={entry}>
              <Link
                href={hrefFor(entry)}
                aria-label={`Halaman ${entry}`}
                aria-current={entry === meta.page ? "page" : undefined}
                className={buttonClasses({
                  variant: entry === meta.page ? "primary" : "ghost",
                  size: "icon",
                })}
              >
                {entry}
              </Link>
            </li>
          ),
        )}

        <li>
          {meta.hasNextPage ? (
            <Link
              href={hrefFor(meta.page + 1)}
              aria-label="Halaman selanjutnya"
              className={buttonClasses({ variant: "ghost", size: "icon" })}
            >
              <ChevronRight className="size-5" aria-hidden="true" />
            </Link>
          ) : null}
        </li>
      </ol>
    </nav>
  );
}

/** Selalu tampilkan halaman pertama, terakhir, dan tetangga halaman aktif. */
function buildPageRange(current: number, last: number): (number | "…")[] {
  if (last <= 7) return Array.from({ length: last }, (_, index) => index + 1);

  const pages = new Set<number>([1, last, current, current - 1, current + 1]);
  const sorted = [...pages].filter((page) => page >= 1 && page <= last).sort((a, b) => a - b);

  const result: (number | "…")[] = [];
  let previous = 0;
  for (const page of sorted) {
    if (previous && page - previous > 1) result.push("…");
    result.push(page);
    previous = page;
  }
  return result;
}
