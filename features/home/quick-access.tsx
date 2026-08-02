import Link from "next/link";
import { Calendar, MapPin, Newspaper, Store, Users } from "lucide-react";
import { Container } from "@/components/ui/container";

/** Lima tujuan yang paling sering dicari, sesuai wireframe beranda. */
const QUICK_ACCESS = [
  { label: "Profil", href: "/profil", Icon: Users },
  { label: "Agenda", href: "/agenda", Icon: Calendar },
  { label: "Berita", href: "/berita", Icon: Newspaper },
  { label: "Peta", href: "/peta", Icon: MapPin },
  { label: "UMKM", href: "/umkm", Icon: Store },
];

/**
 * Kartu pintasan yang menumpang di batas bawah hero.
 *
 * Latarnya solid, bukan glassmorphism. Kartu ini berdiri separuh di atas foto
 * hero dan separuh di atas latar halaman; dengan latar tembus pandang, kedua
 * separuh itu menghasilkan warna berbeda dan muncul pita mendatar di tengah
 * kartu. Efek kaca tetap dipakai di navbar, tempat ia bekerja dengan benar.
 *
 * Di ponsel dibuat tiga kolom, bukan lima: dengan lima kolom pada layar 320px
 * setiap pintasan hanya selebar ±56px, di bawah ambang target sentuh yang nyaman.
 * Susunan flex dipakai supaya dua item sisa di baris kedua berada di tengah,
 * bukan menyisakan sel kosong di kanan.
 */
export function QuickAccess() {
  return (
    <Container className="relative z-10 -mt-12 md:-mt-16">
      <nav
        aria-label="Pintasan"
        className="rounded-2xl border border-border bg-surface p-3 shadow-lg md:p-4"
      >
        <ul className="flex flex-wrap justify-center gap-2 md:gap-3">
          {QUICK_ACCESS.map(({ label, href, Icon }) => (
            <li
              key={href}
              className="basis-[calc(33.333%-0.5rem)] md:basis-[calc(20%-0.75rem)]"
            >
              <Link
                href={href}
                className="flex min-h-20 flex-col items-center justify-center gap-2 rounded-xl px-2 py-3 text-center transition-colors hover:bg-surface-muted"
              >
                <Icon className="size-6 text-accent" aria-hidden="true" />
                <span className="text-sm font-medium">{label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </Container>
  );
}
