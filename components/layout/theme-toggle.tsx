"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useHydrated } from "@/hooks/use-hydrated";
import { cn } from "@/lib/utils";

/**
 * Tema sebenarnya baru diketahui setelah komponen terpasang di browser, jadi
 * sebelum itu tombol dirender sebagai kotak kosong berukuran sama. Kalau ikon
 * ditebak lebih dulu, React akan melaporkan hydration mismatch dan ikonnya
 * sempat berkedip ke bentuk yang salah.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const isHydrated = useHydrated();

  const isDark = resolvedTheme === "dark";

  // Bukan hanya ikonnya yang harus menunggu hydration — setiap atribut yang
  // diturunkan dari tema juga. Di server `resolvedTheme` masih undefined,
  // sedangkan pada render pertama di browser next-themes sudah membacanya dari
  // localStorage. Menghitung aria-label langsung dari `isDark` membuat kedua
  // render menghasilkan teks berbeda, dan React melaporkannya sebagai hydration
  // mismatch. Sebelum ter-hydrate dipakai label netral yang tetap bermakna
  // bagi pembaca layar.
  const label = !isHydrated
    ? "Ganti mode tampilan"
    : isDark
      ? "Aktifkan mode terang"
      : "Aktifkan mode gelap";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={label}
      className={cn(
        "inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl transition-colors hover:bg-surface-muted",
        className,
      )}
    >
      {isHydrated ? (
        isDark ? (
          <Sun className="size-5" aria-hidden="true" />
        ) : (
          <Moon className="size-5" aria-hidden="true" />
        )
      ) : (
        <span className="size-5" />
      )}
    </button>
  );
}
