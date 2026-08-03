import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, Leaf, LogOut } from "lucide-react";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { AdminNav } from "@/features/admin/admin-nav";
import { requireSession } from "@/lib/session";

export const metadata: Metadata = {
  title: { default: "Dashboard", template: "%s — Dashboard Kembangsari" },
  robots: { index: false, follow: false },
};

/**
 * Kerangka dashboard: bilah atas yang menempel, menu, dan area isi.
 *
 * Seluruhnya Server Component kecuali menu dan tombol tema — keduanya perlu
 * tahu halaman aktif dan tema browser. Sesi diperiksa di sini, satu kali untuk
 * semua halaman di dalamnya.
 */
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user } = await requireSession();

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-50 border-b border-border bg-surface">
        <div className="flex items-center gap-2 px-4 py-2">
          <Link href="/admin" className="flex min-h-11 items-center gap-2 font-semibold">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-white">
              <Leaf className="size-4" aria-hidden="true" />
            </span>
            <span className="hidden sm:inline">Dashboard Kembangsari</span>
            <span className="sm:hidden">Dashboard</span>
          </Link>

          <div className="ml-auto flex items-center gap-1">
            {/* Nama pengelola hanya muat di layar lebar; di ponsel yang penting tombol keluarnya. */}
            <span className="hidden max-w-40 truncate text-muted md:inline" title={user.email}>
              {user.name}
            </span>

            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl text-muted transition-colors hover:bg-surface-muted"
              aria-label="Buka portal warga di tab baru"
            >
              <ExternalLink className="size-5" aria-hidden="true" />
            </Link>

            <ThemeToggle />

            <Link
              href="/admin/keluar"
              className="inline-flex min-h-11 items-center gap-2 rounded-xl px-3 text-muted transition-colors hover:bg-surface-muted"
            >
              <LogOut className="size-5" aria-hidden="true" />
              <span className="hidden sm:inline">Keluar</span>
              <span className="sr-only sm:hidden">Keluar</span>
            </Link>
          </div>
        </div>

        {/* Menu ikut menempel di ponsel, dan pindah ke sidebar mulai lg. */}
        <div className="px-4 pb-2 lg:hidden">
          <AdminNav />
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-7xl flex-1 gap-8 px-4 py-6 lg:py-8">
        <aside className="hidden w-56 shrink-0 lg:block">
          <div className="sticky top-24">
            <AdminNav />
          </div>
        </aside>

        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
