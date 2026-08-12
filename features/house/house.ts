import type { Family, House, Resident } from "@/types/api";

/**
 * Pembantu rumah warga yang dipakai bersama halaman publik, dashboard, dan
 * Server Action-nya. Sengaja bebas React karena aksi-aksi itu mengimpornya.
 */

/** Batas bawah yang sama dengan validasi backend. */
export const MIN_BIRTH_YEAR = 1900;

/**
 * Umur dihitung di sini, bukan disimpan backend.
 *
 * Yang tersimpan tahun lahir, dan itu keputusan yang disengaja: menyimpan
 * umur sebagai angka membuat seluruh data salah setahun kemudian, sementara
 * pendata di lapangan hampir selalu tahu "44 tahun" dan jarang tahu tanggal
 * persisnya.
 *
 * Ketelitiannya karena itu ±1 tahun — cukup untuk "Antonius (44 th)", dan
 * tidak boleh dipakai untuk apa pun yang menuntut tanggal.
 */
export function ageFromBirthYear(birthYear: number | null | undefined): number | null {
  if (!birthYear) return null;

  const age = new Date().getFullYear() - birthYear;
  return age >= 0 ? age : null;
}

/** "Antonius (44 th)", atau namanya saja kalau tahun lahirnya belum didata. */
export function residentLabel(resident: Resident): string {
  const age = ageFromBirthYear(resident.birthYear);
  return age === null ? resident.name : `${resident.name} (${age} th)`;
}

/** "2 KK · 5 jiwa", memakai `_count` dari backend supaya angkanya tidak pernah berbeda. */
export function houseTally(house: House): string {
  const families = house._count?.families ?? house.families?.length ?? 0;
  const residents =
    house._count?.residents ??
    house.families?.reduce((sum, family) => sum + (family.residents?.length ?? 0), 0) ??
    0;

  return `${families} KK · ${residents} jiwa`;
}

/** Yang ditebalkan di kartu rumah. Tepat satu per KK, dijaga backend. */
export function headOfFamily(family: Family): Resident | null {
  return family.residents?.find((resident) => resident.relation === "KEPALA_KELUARGA") ?? null;
}

/**
 * RT dan RW berupa teks, sehingga urutan alfabetis menaruh "10" sebelum "6".
 * Yang dibandingkan angkanya lebih dulu, lalu teksnya — supaya "6A" tetap
 * berada tepat setelah "6" alih-alih terlempar ke ujung.
 */
export function compareArea(a: string, b: string): number {
  const numberA = Number.parseInt(a, 10);
  const numberB = Number.parseInt(b, 10);

  if (Number.isFinite(numberA) && Number.isFinite(numberB) && numberA !== numberB) {
    return numberA - numberB;
  }

  return a.localeCompare(b, "id-ID");
}

/**
 * Palet rumah per RT.
 *
 * Berbeda dari `PIN_COLORS` milik kategori lokasi supaya pin rumah tidak
 * pernah tertukar dengan balai atau posyandu, dan berbeda pula dari
 * `BOUNDARY_COLORS` milik batas wilayah.
 *
 * Warnanya ditentukan urutan RT yang benar-benar ada, bukan angkanya: sebuah
 * padukuhan bisa saja bernomor RT 05–08 seperti Kembangsari, dan memetakan
 * "RT 05" ke indeks 5 akan menyisakan lima warna pertama tidak terpakai
 * sementara RT-RT-nya sendiri berdesakan di ujung palet.
 */
const HOUSE_COLORS = ["#2563eb", "#db2777", "#ca8a04", "#7c3aed", "#059669", "#dc2626"];

export function colorForRt(rt: string, orderedRts: string[]): string {
  const index = orderedRts.indexOf(rt);
  return HOUSE_COLORS[(index < 0 ? 0 : index) % HOUSE_COLORS.length];
}

/** Daftar RT yang benar-benar dipakai, terurut — sumber indeks `colorForRt`. */
export function rtsOf(houses: House[]): string[] {
  return [...new Set(houses.map((house) => house.rt))].sort(compareArea);
}
