"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { MapPin, Navigation, Phone, Search, X } from "lucide-react";
import { Card, CardBody } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/states";
import { MapCanvas } from "@/features/maps/map-canvas";
import { googleMapsDirectionsLink, telLink } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { MapCategory, MapMarker } from "@/types/api";

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
 */
export function DigitalMap({
  markers,
  categories,
  center,
  zoom,
}: {
  markers: MapMarker[];
  categories: MapCategory[];
  center: [number, number];
  zoom: number;
}) {
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [focusedMarker, setFocusedMarker] = useState<MapMarker | null>(null);

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
        <div className="lg:col-span-2">
          <MapCanvas
            markers={filtered}
            categoryIds={categoryIds}
            center={focusedMarker ? [focusedMarker.latitude, focusedMarker.longitude] : center}
            zoom={zoom}
            focusedMarker={focusedMarker}
            onMarkerSelect={setFocusedMarker}
            className="h-[60vh] lg:h-[70vh]"
          />
        </div>

        <div className="flex flex-col gap-3 lg:max-h-[70vh] lg:overflow-y-auto">
          {focusedMarker ? (
            <MarkerDetail marker={focusedMarker} onClose={() => setFocusedMarker(null)} />
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
            <ul className="flex flex-col gap-2">
              {filtered.map((marker) => (
                <li key={marker.id}>
                  <button
                    type="button"
                    onClick={() => setFocusedMarker(marker)}
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
    <Card className="border-primary">
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
            {marker.category ? (
              <p className="text-sm text-muted">{marker.category.name}</p>
            ) : null}
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
        </div>
      </CardBody>
    </Card>
  );
}
