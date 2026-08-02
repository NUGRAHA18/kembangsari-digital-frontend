import Link from "next/link";
import { cn } from "@/lib/utils";

export interface FilterOption {
  /** Nilai untuk query string. `undefined` berarti "semua". */
  value?: string;
  label: string;
  count?: number;
}

/**
 * Filter berbentuk deretan chip yang bisa digeser ke samping di ponsel.
 * Dibuat dari `<Link>` biasa, bukan tombol berstate, supaya setiap kombinasi
 * filter punya URL sendiri yang bisa dibagikan dan ditelusuri mesin pencari.
 */
export function FilterChips({
  options,
  activeValue,
  paramName,
  basePath,
  searchParams = {},
  label,
}: {
  options: FilterOption[];
  activeValue?: string;
  paramName: string;
  basePath: string;
  searchParams?: Record<string, string | undefined>;
  label: string;
}) {
  const hrefFor = (value?: string) => {
    const params = new URLSearchParams();
    for (const [key, current] of Object.entries(searchParams)) {
      // `page` direset: hasil filter baru harus dimulai dari halaman pertama.
      if (current && key !== paramName && key !== "page") params.set(key, current);
    }
    if (value) params.set(paramName, value);
    const query = params.toString();
    return query ? `${basePath}?${query}` : basePath;
  };

  return (
    <nav aria-label={label}>
      {/* Yang menggulir adalah daftar chip-nya, bukan halaman. */}
      <ul className="-mx-4 flex snap-x gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:flex-wrap md:px-0">
        {options.map((option) => {
          const isActive = option.value === activeValue;
          return (
            <li key={option.value ?? "semua"} className="snap-start">
              <Link
                href={hrefFor(option.value)}
                aria-current={isActive ? "true" : undefined}
                className={cn(
                  "inline-flex min-h-11 items-center gap-1.5 rounded-full border px-4 whitespace-nowrap transition-colors",
                  isActive
                    ? "border-primary bg-primary text-white"
                    : "border-border bg-surface text-foreground hover:bg-surface-muted",
                )}
              >
                {option.label}
                {option.count !== undefined ? (
                  <span className={cn("text-sm", isActive ? "text-white/80" : "text-muted")}>
                    {option.count}
                  </span>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
