"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  CalendarDays,
  FileText,
  GraduationCap,
  Images,
  LayoutDashboard,
  MapPin,
  Megaphone,
  QrCode,
  Settings,
  Sprout,
  Store,
  Tags,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface AdminNavItem {
  label: string;
  href: string;
  Icon: LucideIcon;
}

/**
 * Menu dashboard.
 *
 * Hanya modul yang sudah jadi yang dicantumkan — tautan menuju halaman yang
 * belum ada lebih membingungkan daripada menu pendek.
 */
export const ADMIN_NAV: AdminNavItem[] = [
  { label: "Ringkasan", href: "/admin", Icon: LayoutDashboard },
  { label: "Berita", href: "/admin/berita", Icon: FileText },
  { label: "Kategori", href: "/admin/kategori", Icon: Tags },
  { label: "Agenda", href: "/admin/agenda", Icon: CalendarDays },
  { label: "Pengumuman", href: "/admin/pengumuman", Icon: Megaphone },
  { label: "Galeri", href: "/admin/galeri", Icon: Images },
  { label: "UMKM", href: "/admin/umkm", Icon: Store },
  { label: "Potensi", href: "/admin/potensi", Icon: Sprout },
  { label: "Program KKN", href: "/admin/program-kkn", Icon: GraduationCap },
  { label: "Peta", href: "/admin/peta", Icon: MapPin },
  { label: "Monografi", href: "/admin/monografi", Icon: BarChart3 },
  { label: "QR Code", href: "/admin/qr-code", Icon: QrCode },
  { label: "Profil", href: "/admin/profil", Icon: UserRound },
  { label: "Pengaturan", href: "/admin/pengaturan", Icon: Settings },
];

/** `/admin` hanya aktif kalau persis dibuka; menu lain juga aktif di halaman turunannya. */
function isActive(pathname: string, href: string) {
  return href === "/admin" ? pathname === href : pathname.startsWith(href);
}

/**
 * Di ponsel menu tampil sebagai deretan chip yang bisa digeser — bukan drawer
 * yang harus dibuka dulu. Dengan dua atau tiga modul, drawer justru menambah
 * satu ketukan untuk setiap perpindahan. Di layar lebar deretan yang sama
 * ditumpuk menjadi sidebar.
 */
export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Menu dashboard">
      <ul className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
        {ADMIN_NAV.map(({ label, href, Icon }) => {
          const active = isActive(pathname, href);

          return (
            <li key={href} className="lg:w-full">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex min-h-11 items-center gap-2 rounded-xl px-3 whitespace-nowrap transition-colors lg:w-full",
                  active
                    ? "bg-primary text-white"
                    : "text-foreground hover:bg-surface-muted lg:text-muted",
                )}
              >
                <Icon className="size-5 shrink-0" aria-hidden="true" />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
