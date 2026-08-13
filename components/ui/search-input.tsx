import Link from "next/link";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Pencarian sebagai form GET biasa, bukan komponen klien.
 *
 * Konsekuensinya form tetap berfungsi kalau JavaScript gagal dimuat — hal yang
 * bukan sekadar teori di sini, karena warga sering mengakses dengan sinyal seadanya.
 * Nilai filter lain diteruskan lewat input tersembunyi supaya tidak hilang saat mencari;
 * `page` sengaja tidak diteruskan agar hasil pencarian selalu mulai dari halaman 1.
 */
export function SearchInput({
  action,
  defaultValue,
  placeholder = "Cari…",
  label = "Cari",
  hiddenFields = {},
}: {
  action: string;
  defaultValue?: string;
  placeholder?: string;
  label?: string;
  hiddenFields?: Record<string, string | undefined>;
}) {
  const clearHref = (() => {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(hiddenFields)) {
      if (value) params.set(key, value);
    }
    const query = params.toString();
    return query ? `${action}?${query}` : action;
  })();

  return (
    <form action={action} method="get" role="search" className="flex flex-wrap gap-2">
      {Object.entries(hiddenFields).map(([key, value]) =>
        value ? <input key={key} type="hidden" name={key} value={value} /> : null,
      )}

      <div className="relative min-w-0 flex-1">
        <Search
          className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-muted"
          aria-hidden="true"
        />
        {/* 48px, bukan 44px: `design-idea.md` §9 menjadikan pencarian salah satu
            titik pandang utama halaman, dan meminta 48–52px. Cincin fokusnya
            sama dengan isian form lain — lihat `inputClasses`. */}
        <input
          type="search"
          name="search"
          defaultValue={defaultValue}
          placeholder={placeholder}
          aria-label={label}
          className="min-h-12 w-full rounded-lg border border-border bg-surface py-2 pr-3 pl-10 text-foreground transition-[border-color,box-shadow] duration-150 placeholder:text-muted focus-visible:border-primary focus-visible:shadow-[0_0_0_3px_var(--ring)] focus-visible:outline-none"
        />
      </div>

      <Button type="submit">Cari</Button>

      {defaultValue ? (
        <Link
          href={clearHref}
          className="inline-flex min-h-11 items-center gap-1 rounded-xl px-3 text-muted hover:text-foreground"
        >
          <X className="size-4" aria-hidden="true" />
          Hapus
        </Link>
      ) : null}
    </form>
  );
}
