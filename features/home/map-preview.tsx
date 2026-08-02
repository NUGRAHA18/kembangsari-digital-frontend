"use client";

import { ButtonLink } from "@/components/ui/button";
import { LazyMount } from "@/components/ui/lazy-mount";
import { Skeleton } from "@/components/ui/states";
import { MapCanvas } from "@/features/maps/map-canvas";
import type { MapMarker } from "@/types/api";

/**
 * Pratinjau peta di beranda.
 *
 * Peta baru dimuat saat pengguna hampir menggulir ke bagian ini. Beranda adalah
 * halaman yang menentukan kesan cepat atau lambatnya situs, dan pustaka peta
 * termasuk berkas paling besar yang dimuat halaman ini.
 */
export function HomeMapPreview({
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
    <div>
      <LazyMount fallback={<Skeleton className="h-[18rem] w-full md:h-[24rem]" />}>
        <MapCanvas
          markers={markers}
          categoryIds={categoryIds}
          center={center}
          zoom={zoom}
          className="h-[18rem] md:h-[24rem]"
        />
      </LazyMount>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-muted">
          {markers.length} titik lokasi terdata: balai padukuhan, posyandu, tempat sampah,
          penerangan jalan, dan lainnya.
        </p>
        <ButtonLink href="/peta" variant="outline">
          Lihat Peta Lengkap
        </ButtonLink>
      </div>
    </div>
  );
}
