"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Hand } from "lucide-react";
import { Skeleton } from "@/components/ui/states";
import type { BoundaryFeature } from "@/features/maps/boundaries";
import { cn } from "@/lib/utils";
import type { House, MapMarker } from "@/types/api";

/**
 * Pembungkus peta.
 *
 * Leaflet menyentuh `window` saat modulnya diimpor, jadi tidak bisa
 * dirender di server — `ssr: false` hanya diizinkan di dalam Client Component,
 * itulah sebabnya lapisan pembungkus ini ada.
 */
const MapView = dynamic(() => import("@/features/maps/map-view"), {
  ssr: false,
  loading: () => <Skeleton className="size-full rounded-none" />,
});

export function MapCanvas({
  markers,
  categoryIds,
  center,
  zoom,
  focusedMarker = null,
  onMarkerSelect,
  boundaries,
  houses,
  rtOrder,
  focusedHouseId,
  onHouseSelect,
  className,
}: {
  markers: MapMarker[];
  categoryIds: string[];
  center: [number, number];
  zoom: number;
  focusedMarker?: MapMarker | null;
  onMarkerSelect?: (marker: MapMarker) => void;
  boundaries?: BoundaryFeature[];
  houses?: House[];
  rtOrder?: string[];
  focusedHouseId?: string | null;
  onHouseSelect?: (house: House) => void;
  className?: string;
}) {
  const [isInteractive, setIsInteractive] = useState(false);

  return (
    // `isolate` wajib ada. Leaflet menyetel z-index sendiri lewat leaflet.css —
    // pane 400–700, kontrol 800, dan .leaflet-top/.leaflet-bottom sampai 1000 —
    // sementara navbar hanya z-50. `relative` saja tidak cukup: dengan
    // `z-index: auto` elemen ini tidak membentuk stacking context, sehingga
    // angka-angka Leaflet naik ke konteks akar dan menutupi navbar saat digulir.
    // `isolation: isolate` mengurung semuanya di dalam kotak peta.
    <div
      className={cn("relative isolate overflow-hidden rounded-xl border border-border", className)}
    >
      <MapView
        markers={markers}
        categoryIds={categoryIds}
        center={center}
        zoom={zoom}
        interactive={isInteractive}
        focusedMarker={focusedMarker}
        onMarkerSelect={onMarkerSelect}
        boundaries={boundaries}
        houses={houses}
        rtOrder={rtOrder}
        focusedHouseId={focusedHouseId}
        onHouseSelect={onHouseSelect}
      />

      {!isInteractive ? (
        <button
          type="button"
          onClick={() => setIsInteractive(true)}
          className="absolute inset-0 z-500 flex items-end justify-center bg-transparent pb-6"
        >
          <span className="glass inline-flex items-center gap-2 rounded-xl border px-4 py-2 font-medium shadow-sm">
            <Hand className="size-5" aria-hidden="true" />
            Ketuk untuk mengaktifkan peta
          </span>
        </button>
      ) : null}
    </div>
  );
}
