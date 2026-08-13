"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Eye, EyeOff, MapPin, Navigation, Phone, Search, Users, X } from "lucide-react";
import { Card, CardBody } from "@/components/ui/card";
import { ShareButton } from "@/components/ui/share-button";
import { EmptyState } from "@/components/ui/states";
import { useBoundaries } from "@/hooks/use-boundaries";
import { useHydrated } from "@/hooks/use-hydrated";
import { boundaryColor, type BoundaryFeature } from "@/features/maps/boundaries";
import { colorForRt, compareArea, houseTally, rtsOf } from "@/features/house/house";
import { MapCanvas } from "@/features/maps/map-canvas";
import { googleMapsDirectionsLink, telLink } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { House, HouseSummary, MapCategory, MapMarker } from "@/types/api";

/**
 * Peta digital lengkap: filter kategori, pencarian, peta, dan daftar lokasi.
 *
 * Susunan mengikuti pedoman mobile-first — di ponsel peta selebar layar dengan
 * tinggi tetap dan daftar lokasi diletakkan di bawahnya; mulai `lg` keduanya
 * berdampingan dan daftar punya area gulirnya sendiri.
 *
 * Filter di sini memakai state klien, bukan URL, karena peta memang komponen
 * interaktif yang menuntut JavaScript — menyimpan filternya ke URL hanya akan
 * memuat ulang halaman setiap kali kategori diganti.
 *
 * Satu pengecualian: **lokasi yang sedang dibuka ikut ditulis ke alamat**
 * sebagai `?lokasi=<id>`, supaya satu titik bisa dibagikan lewat tautan.
 * Penulisannya memakai `history.replaceState`, bukan router Next.js, sehingga
 * tidak ada permintaan apa pun yang berangkat dan alasan di atas tetap utuh.
 */
export function DigitalMap({
  markers,
  categories,
  houses = [],
  summary = [],
  center,
  zoom,
}: {
  markers: MapMarker[];
  categories: MapCategory[];
  houses?: House[];
  summary?: HouseSummary[];
  center: [number, number];
  zoom: number;
}) {
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [showBoundaries, setShowBoundaries] = useState(true);
  const [showHouses, setShowHouses] = useState(true);
  const [focusedHouse, setFocusedHouse] = useState<House | null>(null);

  // Warna ikon rumah ditentukan urutan RT yang benar-benar ada, bukan angkanya
  // — RT di Kembangsari bernomor 05–08, dan memetakan "05" ke indeks 5 akan
  // menyisakan lima warna pertama tidak terpakai.
  const rtOrder = useMemo(() => rtsOf(houses), [houses]);

  // Berkas batas wilayah boleh saja belum diisi; selama itu sakelar dan
  // legendanya tidak ditampilkan sama sekali, bukan tampil tanpa isi.
  const boundaries = useBoundaries();

  const hydrated = useHydrated();

  // Alamat dibaca saat render, bukan lewat `useSearchParams`: hook itu memaksa
  // `/peta` dirender per permintaan, padahal halamannya sekarang dipranyatakan
  // statis. Sebelum hydration nilainya sengaja kosong supaya HTML dari server
  // dan render pertama di browser tetap sama.
  const sharedId = hydrated ? new URLSearchParams(window.location.search).get("lokasi") : null;

  // `undefined` berarti pengguna belum menyentuh apa pun, jadi yang berlaku
  // masih pilihan dari tautan yang dibagikan. `null` berarti ia menutupnya
  // sendiri — dan itu harus mengalahkan isi alamat, bukan dibatalkan olehnya.
  const [picked, setPicked] = useState<MapMarker | null | undefined>(undefined);

  const focusedMarker =
    picked !== undefined ? picked : (markers.find((marker) => marker.id === sharedId) ?? null);

  useEffect(() => {
    // Sebelum hydration `focusedMarker` selalu null, dan menulisnya ke alamat
    // justru akan menghapus `?lokasi=` dari tautan yang baru saja dibuka.
    if (!hydrated) return;

    const url = new URL(window.location.href);
    if (focusedMarker) url.searchParams.set("lokasi", focusedMarker.id);
    else url.searchParams.delete("lokasi");

    window.history.replaceState(null, "", url);
  }, [focusedMarker, hydrated]);

  const categoryIds = useMemo(() => categories.map((category) => category.id), [categories]);

  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase();

    return markers.filter((marker) => {
      if (categoryId && marker.categoryId !== categoryId) return false;
      if (!keyword) return true;

      return [marker.name, marker.address, marker.description, marker.category?.name]
        .filter(Boolean)
        .some((field) => field!.toLowerCase().includes(keyword));
    });
  }, [markers, categoryId, query]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        <div className="relative">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-muted"
            aria-hidden="true"
          />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Cari nama lokasi atau alamat…"
            aria-label="Cari lokasi di peta"
            className="min-h-11 w-full rounded-xl border border-border bg-surface py-2 pr-3 pl-10 placeholder:text-muted"
          />
        </div>

        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:flex-wrap md:px-0">
          <CategoryChip
            label="Semua"
            count={markers.length}
            isActive={categoryId === null}
            onClick={() => setCategoryId(null)}
          />
          {categories.map((category) => {
            const count = markers.filter((marker) => marker.categoryId === category.id).length;
            if (count === 0) return null;

            return (
              <CategoryChip
                key={category.id}
                label={category.name}
                count={count}
                isActive={categoryId === category.id}
                onClick={() => setCategoryId(category.id)}
              />
            );
          })}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="flex flex-col gap-3 lg:col-span-2">
          <MapCanvas
            markers={filtered}
            categoryIds={categoryIds}
            center={focusedMarker ? [focusedMarker.latitude, focusedMarker.longitude] : center}
            zoom={zoom}
            focusedMarker={focusedMarker}
            onMarkerSelect={setPicked}
            boundaries={showBoundaries ? boundaries : []}
            houses={showHouses ? houses : []}
            rtOrder={rtOrder}
            focusedHouseId={focusedHouse?.id ?? null}
            onHouseSelect={setFocusedHouse}
            className="h-[60vh] lg:h-[70vh]"
          />

          {houses.length > 0 ? (
            <HouseLegend
              rtOrder={rtOrder}
              summary={summary}
              total={houses.length}
              isShown={showHouses}
              onToggle={() => setShowHouses((shown) => !shown)}
            />
          ) : null}

          {boundaries.length > 0 ? (
            <BoundaryLegend
              boundaries={boundaries}
              isShown={showBoundaries}
              onToggle={() => setShowBoundaries((shown) => !shown)}
            />
          ) : null}
        </div>

        {/* Yang menggulir hanya daftarnya, bukan seluruh kolom. Ketika kartu
            detail masih ikut berada di dalam area gulir, memilih lokasi dari
            bagian bawah daftar menyisipkan kartu itu di atas posisi gulir yang
            sedang dilihat — kartunya tersembunyi dan yang terlihat hanya
            daftar yang terdorong. Semakin banyak lokasi yang tampil semakin
            jauh tersembunyinya, itulah sebabnya hanya muncul pada "Semua". */}
        <div className="flex min-w-0 flex-col gap-3 lg:max-h-[70vh]">
          {focusedHouse ? (
            <HouseDetail house={focusedHouse} onClose={() => setFocusedHouse(null)} />
          ) : null}

          {focusedMarker ? (
            <MarkerDetail marker={focusedMarker} onClose={() => setPicked(null)} />
          ) : null}

          <h2 className="font-semibold">
            {filtered.length} lokasi{query ? ` untuk “${query}”` : ""}
          </h2>

          {filtered.length === 0 ? (
            <EmptyState
              title="Lokasi tidak ditemukan"
              description="Coba kata kunci lain atau pilih kategori Semua."
            />
          ) : (
            // `min-h-0` wajib: anak dari flex container tidak boleh menyusut di
            // bawah tinggi isinya secara bawaan, sehingga tanpa ini area gulir
            // memanjang dan `max-h` induknya tidak pernah berlaku.
            <ul className="flex flex-col gap-2 lg:min-h-0 lg:overflow-y-auto">
              {filtered.map((marker) => (
                <li key={marker.id}>
                  <button
                    type="button"
                    onClick={() => setPicked(marker)}
                    aria-pressed={focusedMarker?.id === marker.id}
                    className={cn(
                      "flex w-full min-h-11 items-start gap-3 rounded-xl border p-3 text-left transition-colors",
                      focusedMarker?.id === marker.id
                        ? "border-primary bg-primary-soft"
                        : "border-border bg-surface hover:bg-surface-muted",
                    )}
                  >
                    <MapPin className="mt-0.5 size-5 shrink-0 text-accent" aria-hidden="true" />
                    <span className="min-w-0">
                      <span className="block font-medium">{marker.name}</span>
                      {marker.category ? (
                        <span className="block text-sm text-muted">{marker.category.name}</span>
                      ) : null}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Legenda batas wilayah, sekaligus sakelarnya.
 *
 * Garis batas menumpuk di atas pin dan jalan, dan tidak semua orang yang
 * membuka peta sedang mencari wilayah — jadi harus bisa dimatikan. Sakelarnya
 * disatukan dengan legenda karena keduanya menjawab pertanyaan yang sama:
 * garis warna ini artinya apa, dan bagaimana menghilangkannya.
 */
function BoundaryLegend({
  boundaries,
  isShown,
  onToggle,
}: {
  boundaries: BoundaryFeature[];
  isShown: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border border-border bg-surface px-4 py-2">
      <button
        type="button"
        onClick={onToggle}
        aria-pressed={isShown}
        className="inline-flex min-h-11 items-center gap-2 font-medium transition-colors hover:text-accent"
      >
        {isShown ? (
          <Eye className="size-5" aria-hidden="true" />
        ) : (
          <EyeOff className="size-5" aria-hidden="true" />
        )}
        Batas wilayah
      </button>

      {isShown ? (
        <ul className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
          {boundaries.map((feature, index) => (
            <li key={`${feature.properties.nama}-${index}`} className="flex items-center gap-1.5">
              <span
                aria-hidden="true"
                className="inline-block h-0.5 w-5 rounded-full"
                style={{ backgroundColor: boundaryColor(feature, index) }}
              />
              {feature.properties.nama}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

/**
 * Legenda rumah warga per RT, sekaligus sakelarnya.
 *
 * Jumlah rumah dan jiwa diambil dari `GET /house/summary`, bukan dihitung dari
 * daftar rumah yang sedang digambar — dengan begitu angka di sini selalu sama
 * dengan yang dipakai halaman monografi, dan tidak ikut berubah kalau suatu
 * saat peta hanya memuat sebagian rumah.
 */
function HouseLegend({
  rtOrder,
  summary,
  total,
  isShown,
  onToggle,
}: {
  rtOrder: string[];
  summary: HouseSummary[];
  total: number;
  isShown: boolean;
  onToggle: () => void;
}) {
  const sorted = [...summary].sort((a, b) => compareArea(a.rw, b.rw) || compareArea(a.rt, b.rt));

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border border-border bg-surface px-4 py-2">
      <button
        type="button"
        onClick={onToggle}
        aria-pressed={isShown}
        className="inline-flex min-h-11 items-center gap-2 font-medium transition-colors hover:text-accent"
      >
        {isShown ? (
          <Eye className="size-5" aria-hidden="true" />
        ) : (
          <EyeOff className="size-5" aria-hidden="true" />
        )}
        Rumah warga
        <span className="text-sm text-muted">{total}</span>
      </button>

      {isShown && sorted.length > 0 ? (
        <ul className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
          {sorted.map((row) => (
            <li key={`${row.rw}-${row.rt}`} className="flex items-center gap-1.5">
              <span
                aria-hidden="true"
                className="inline-block size-3 rounded-sm"
                style={{ backgroundColor: colorForRt(row.rt, rtOrder) }}
              />
              RT {row.rt}
              <span className="text-xs">
                ({row.houses} rumah · {row.residents} jiwa)
              </span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

/**
 * Kartu rumah di samping peta.
 *
 * Sengaja hanya ringkasan: `GET /house/active` membawa `_count`, bukan daftar
 * penghuninya. Mengambil seluruh penghuni ketujuh puluh rumah hanya untuk
 * berjaga-jaga kalau salah satunya diketuk adalah unduhan yang tidak masuk
 * akal di jaringan padukuhan — jadi nama-namanya menyusul di halamannya
 * sendiri, yang sekaligus alamat yang bisa dibagikan.
 */
function HouseDetail({ house, onClose }: { house: House; onClose: () => void }) {
  return (
    <Card className="border-primary lg:shrink-0">
      {house.photo ? (
        <div className="relative aspect-3/2 w-full bg-surface-muted">
          <Image
            src={house.photo}
            alt={`Foto ${house.label}`}
            fill
            loading="lazy"
            sizes="(min-width: 1024px) 24rem, 100vw"
            className="object-cover"
          />
        </div>
      ) : null}

      <CardBody className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h2 className="font-semibold text-pretty">{house.label}</h2>
            <p className="text-sm text-muted">
              RT {house.rt} / RW {house.rw} · {houseTally(house)}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup detail rumah"
            className="-mt-1 -mr-1 inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-xl hover:bg-surface-muted"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>

        {house.address ? (
          <p className="mt-2 flex items-start gap-1.5 text-sm text-muted">
            <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            {house.address}
          </p>
        ) : null}

        {/* Catatan pendata ikut di kartu, bukan hanya di halaman rumahnya.
            Isinya sering justru yang paling dicari — "rumah paling ujung",
            "gang sempit, motor saja" — dan menyembunyikannya di balik satu
            ketukan lagi membuat catatan itu praktis tidak pernah terbaca. */}
        {house.note ? <p className="mt-2 text-sm text-muted text-pretty">{house.note}</p> : null}

        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href={`/peta/rumah/${house.slug}`}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-4 font-medium text-white transition-colors hover:bg-primary-hover"
          >
            <Users className="size-4" aria-hidden="true" />
            Lihat Penghuni
          </Link>

          <a
            href={googleMapsDirectionsLink(house.latitude, house.longitude)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border px-4 font-medium transition-colors hover:bg-surface-muted"
          >
            <Navigation className="size-4" aria-hidden="true" />
            Petunjuk Arah
          </a>

          {/* Kartu lokasi sudah punya tombol ini sejak awal; kartu rumah belum,
              jadi membagikan sebuah rumah menuntut membuka halamannya dulu. */}
          <ShareButton
            url={`/peta/rumah/${house.slug}`}
            title={house.label}
            text={`${house.label} — RT ${house.rt} / RW ${house.rw}, Padukuhan Kembangsari`}
          />
        </div>
      </CardBody>
    </Card>
  );
}

function CategoryChip({
  label,
  count,
  isActive,
  onClick,
}: {
  label: string;
  count: number;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isActive}
      className={cn(
        "inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-full border px-4 whitespace-nowrap transition-colors",
        isActive
          ? "border-primary bg-primary text-white"
          : "border-border bg-surface hover:bg-surface-muted",
      )}
    >
      {label}
      <span className={cn("text-sm", isActive ? "text-white/80" : "text-muted")}>{count}</span>
    </button>
  );
}

function MarkerDetail({ marker, onClose }: { marker: MapMarker; onClose: () => void }) {
  return (
    // `shrink-0` menjaga kartu tetap seukuran isinya ketika kolomnya sudah
    // mentok `max-h`; tanpa itu kartu yang dipilih ikut dipipihkan dan
    // deskripsinya terpotong — yang menyisakan sisa gejala bug yang sama.
    <Card className="border-primary lg:shrink-0">
      {marker.image ? (
        <div className="relative aspect-3/2 w-full bg-surface-muted">
          <Image
            src={marker.image}
            alt={marker.name}
            fill
            loading="lazy"
            sizes="(min-width: 1024px) 24rem, 100vw"
            className="object-cover"
          />
        </div>
      ) : null}

      <CardBody className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h2 className="font-semibold text-pretty">{marker.name}</h2>
            {marker.category ? <p className="text-sm text-muted">{marker.category.name}</p> : null}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup detail lokasi"
            className="-mt-1 -mr-1 inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-xl hover:bg-surface-muted"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>

        {marker.description ? (
          <p className="mt-2 text-muted text-pretty">{marker.description}</p>
        ) : null}

        {marker.address ? (
          <p className="mt-2 flex items-start gap-1.5 text-sm text-muted">
            <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            {marker.address}
          </p>
        ) : null}

        <div className="mt-4 flex flex-wrap gap-2">
          {/* Peta memakai OpenStreetMap, tapi navigasi diserahkan ke Google Maps
              karena aplikasi itulah yang sudah terpasang di ponsel warga. */}
          <a
            href={googleMapsDirectionsLink(marker.latitude, marker.longitude)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-4 font-medium text-white transition-colors hover:bg-primary-hover"
          >
            <Navigation className="size-4" aria-hidden="true" />
            Petunjuk Arah
          </a>

          {marker.phone ? (
            <a
              href={telLink(marker.phone)}
              className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border px-4 font-medium transition-colors hover:bg-surface-muted"
            >
              <Phone className="size-4" aria-hidden="true" />
              {marker.phone}
            </a>
          ) : null}

          {/* Tautannya membuka peta dengan lokasi ini sudah terpilih, bukan
              sekadar halaman petanya. */}
          <ShareButton
            url={`/peta?lokasi=${marker.id}`}
            title={marker.name}
            text={marker.address ?? undefined}
            label="Bagikan"
          />
        </div>
      </CardBody>
    </Card>
  );
}
