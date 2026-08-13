"use client";

import { ButtonLink } from "@/components/ui/button";
import { LazyMount } from "@/components/ui/lazy-mount";
import { Skeleton } from "@/components/ui/states";
import { MapCanvas } from "@/features/maps/map-canvas";
import type { MapMarker } from "@/types/api";

/**
 * Pratinjau peta di samping daftar lokasi (`design-idea.md` §14).
 *
 * Menampilkan titik yang sedang tersaring, bukan seluruh titik: kalau pengelola
 * menyaring "Posyandu", yang ingin dilihatnya sebaran posyandu — bukan peta
 * yang sama persis setiap kali saringannya diganti.
 *
 * Titik yang disembunyikan dari peta warga tetap digambar di sini. Justru
 * itulah gunanya pratinjau di dashboard: melihat di mana lubangnya sebelum
 * memutuskan mana yang perlu ditampilkan.
 *
 * `LazyMount` dipakai dengan alasan yang sama seperti di beranda — Leaflet
 * berkas paling besar di halaman ini, dan pengelola yang datang untuk menyunting
 * satu nama tidak perlu mengunduhnya. Pembungkusnya **tidak boleh**
 * `display: contents`; itu pernah membuat peta beranda berhenti di rangka
 * pemuat selamanya.
 */
export function MapPreviewPanel({
  markers,
  categoryIds,
  center,
  zoom,
}: {
  markers: MapMarker[];
  categoryIds: string[];
  center: [number, number];
  zoom: number;
}) {
  return (
    <div className="flex flex-col gap-3">
      <LazyMount fallback={<Skeleton className="h-72 w-full" />}>
        <MapCanvas
          markers={markers}
          categoryIds={categoryIds}
          center={center}
          zoom={zoom}
          className="h-72"
        />
      </LazyMount>

      {/* Dibuka di tab baru: pengelola sedang di tengah menyunting daftar, dan
          meninggalkan halaman ini berarti kehilangan saringan yang sudah dipilih. */}
      <ButtonLink
        href="/peta"
        target="_blank"
        rel="noopener noreferrer"
        variant="outline"
        className="w-full"
      >
        Lihat Peta Lengkap
      </ButtonLink>
    </div>
  );
}
