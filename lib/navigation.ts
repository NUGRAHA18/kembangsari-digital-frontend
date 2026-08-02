/**
 * Struktur navigasi, diturunkan dari dokumen Information Architecture.
 *
 * Ada 11 halaman publik — terlalu banyak untuk satu baris menu di laptop, jadi
 * yang saling berkerabat dikelompokkan. Di ponsel pengelompokan ini tampil
 * sebagai judul bagian di dalam drawer, bukan menu bertingkat yang harus
 * diketuk dua kali.
 */

export interface NavLink {
  label: string;
  href: string;
  description?: string;
}

export interface NavGroup {
  label: string;
  children: NavLink[];
}

export type NavItem = NavLink | NavGroup;

export function isNavGroup(item: NavItem): item is NavGroup {
  return "children" in item;
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Profil", href: "/profil", description: "Sejarah, visi misi, dan struktur organisasi" },
  {
    label: "Informasi",
    children: [
      { label: "Berita", href: "/berita", description: "Kabar terbaru dari padukuhan" },
      { label: "Agenda", href: "/agenda", description: "Jadwal kegiatan warga" },
      { label: "Pengumuman", href: "/pengumuman", description: "Informasi penting yang berlaku" },
      { label: "Galeri", href: "/galeri", description: "Dokumentasi foto kegiatan" },
    ],
  },
  { label: "Peta Digital", href: "/peta", description: "Lokasi fasilitas dan titik penting" },
  {
    label: "Potensi",
    children: [
      { label: "UMKM", href: "/umkm", description: "Usaha warga Kembangsari" },
      { label: "Potensi Padukuhan", href: "/potensi", description: "Pertanian, peternakan, wisata" },
    ],
  },
  { label: "Program KKN", href: "/program-kkn", description: "Empat program kerja KKN" },
  { label: "Monografi", href: "/monografi", description: "Statistik kependudukan" },
  { label: "Kontak", href: "/kontak", description: "Hubungi perangkat padukuhan" },
];

/** Mencocokkan tautan aktif, termasuk saat pengguna berada di halaman detail. */
export function isActivePath(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
