"use client";

import "leaflet/dist/leaflet.css";

import { useEffect } from "react";
import L from "leaflet";
import { GeoJSON, MapContainer, Marker, Popup, TileLayer, Tooltip, useMap } from "react-leaflet";
import { boundaryStyle, type BoundaryFeature } from "@/features/maps/boundaries";
import { colorForCategory } from "@/features/maps/pin-colors";
import { GLYPH_TRANSFORM, iconNameFor, type PinGlyphs } from "@/features/maps/pin-icons";
import type { MapMarker } from "@/types/api";

/**
 * Peta OpenStreetMap.
 *
 * Berkas ini hanya boleh dimuat di browser — Leaflet menyentuh `window` saat
 * diimpor, jadi pemanggilnya (map-canvas.tsx) memuatnya lewat dynamic import
 * dengan `ssr: false`.
 */

/**
 * Ikon dibuat sebagai divIcon berisi SVG, bukan gambar bawaan Leaflet.
 * Ikon bawaan merujuk berkas PNG lewat jalur relatif yang rusak setelah
 * di-bundle, dan pendekatan ini sekaligus memungkinkan pin diwarnai per kategori.
 *
 * Isi kepalanya adalah ikon Material Symbols yang dipilih pengelola, digambar
 * putih di atas warna kategorinya. `glyph` sudah berupa jalur gambar yang
 * disiapkan di server (`lib/material-symbol.ts`); yang tidak tersedia jatuh ke
 * bulatan putih seperti sebelumnya, sehingga pin tetap terbaca sebagai pin.
 */
function createPinIcon(color: string, isActive: boolean, glyph: string | null) {
  const size = isActive ? 40 : 30;

  const head = glyph
    ? `<path d="${glyph}" transform="${GLYPH_TRANSFORM}" fill="white" stroke="none"/>`
    : `<circle cx="12" cy="10" r="2.6" fill="white" stroke="none"/>`;

  return L.divIcon({
    className: "",
    html: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${color}" stroke="white" stroke-width="1.5" aria-hidden="true" style="filter:drop-shadow(0 1px 2px rgba(0,0,0,.4))">
        <path d="M12 22s7-6.5 7-12A7 7 0 0 0 5 10c0 5.5 7 12 7 12z"/>
        ${head}
      </svg>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, isActive ? -38 : -28],
  });
}

/**
 * Peta yang menangkap gestur akan menjebak pengguna saat menggulir halaman di
 * ponsel. Interaksi baru dinyalakan setelah peta diketuk sekali.
 */
function InteractionGate({ enabled }: { enabled: boolean }) {
  const map = useMap();

  useEffect(() => {
    const handlers = [map.dragging, map.scrollWheelZoom, map.touchZoom, map.doubleClickZoom];
    for (const handler of handlers) {
      if (enabled) handler.enable();
      else handler.disable();
    }
  }, [enabled, map]);

  return null;
}

/** Menggeser peta ke marker yang dipilih dari daftar di samping/bawah peta. */
function FocusMarker({ marker }: { marker: MapMarker | null }) {
  const map = useMap();

  useEffect(() => {
    if (marker) map.flyTo([marker.latitude, marker.longitude], 17, { duration: 0.6 });
  }, [marker, map]);

  return null;
}

/**
 * Menjaga agar pin selalu berada di dalam layar.
 *
 * Titik tengah di Pengaturan diketik tangan dan bisa berjarak kilometer dari
 * pin yang sudah terdata. Ketika itu terjadi peta sebenarnya terbuka dengan
 * benar, tetapi yang tampak hanya petak kosong tanpa satu pun pin — dan itu
 * terbaca pengelola sebagai "petanya tidak muncul". Karena itu titik tengah
 * pilihan admin hanya dihormati kalau memang berada di sekitar pin-nya; kalau
 * tidak, peta dipaskan ke seluruh pin yang sedang ditampilkan.
 *
 * Seluruh propnya angka, bukan array atau objek: identitas array berubah pada
 * setiap render induknya, dan effect ini akan berjalan terus-menerus.
 */
function AutoFit({
  south,
  west,
  north,
  east,
  latitude,
  longitude,
  zoom,
  isFocused,
}: {
  south: number | null;
  west: number;
  north: number;
  east: number;
  latitude: number;
  longitude: number;
  zoom: number;
  isFocused: boolean;
}) {
  const map = useMap();

  useEffect(() => {
    // Marker yang sedang dibuka detailnya sudah diurus FocusMarker.
    if (isFocused) return;

    if (south === null) {
      map.setView([latitude, longitude], zoom);
      return;
    }

    const bounds = L.latLngBounds([south, west], [north, east]);

    // `pad` memberi kelonggaran: titik tengah yang berada tepat di tepi
    // sebaran pin tetap dianggap sah, bukan dilempar ke fitBounds.
    if (bounds.pad(0.25).contains([latitude, longitude])) {
      map.setView([latitude, longitude], zoom);
      return;
    }

    map.fitBounds(bounds, { padding: [40, 40], maxZoom: zoom });
  }, [south, west, north, east, latitude, longitude, zoom, isFocused, map]);

  return null;
}

/**
 * Batas padukuhan, RW, dan RT, beserta ruas jalan dan gang.
 *
 * Digambar di `overlayPane` bawaan Leaflet (z-index 400) sedangkan pin berada
 * di `markerPane` (600), jadi pin selalu berada di atas garis tanpa perlu
 * diatur — urutan penulisannya di sini tidak menentukan apa pun.
 */
function BoundaryLayers({ boundaries }: { boundaries: BoundaryFeature[] }) {
  return (
    <>
      {boundaries.map((feature, index) => (
        <GeoJSON
          // `GeoJSON` membaca `data` sekali saat dipasang dan mengabaikan
          // perubahan berikutnya; `key` yang ikut berubah memaksanya dibuat ulang.
          key={`${feature.properties.nama}-${index}`}
          data={feature}
          style={boundaryStyle(feature, index)}
        >
          <Tooltip sticky>{feature.properties.nama}</Tooltip>
        </GeoJSON>
      ))}
    </>
  );
}

export default function MapView({
  markers,
  categoryIds,
  center,
  zoom,
  interactive,
  focusedMarker,
  onMarkerSelect,
  boundaries = [],
  glyphs = {},
}: {
  markers: MapMarker[];
  categoryIds: string[];
  center: [number, number];
  zoom: number;
  interactive: boolean;
  focusedMarker: MapMarker | null;
  onMarkerSelect?: (marker: MapMarker) => void;
  boundaries?: BoundaryFeature[];
  /** Nama ikon → jalur gambarnya, disiapkan Server Component pemanggilnya. */
  glyphs?: PinGlyphs;
}) {
  // Koordinat yang bukan angka membuat Leaflet melempar saat menggambar pin,
  // dan yang runtuh bukan satu pin itu melainkan seluruh peta. Titik seperti
  // itu dibuang di sini, bukan dibiarkan menjatuhkan halaman.
  const hasCoordinates = (point: { latitude: number; longitude: number }) =>
    Number.isFinite(point.latitude) && Number.isFinite(point.longitude);

  const drawable = markers.filter(hasCoordinates);

  const latitudes = drawable.map((point) => point.latitude);
  const longitudes = drawable.map((point) => point.longitude);

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      scrollWheelZoom={false}
      dragging={false}
      className="size-full"
      // Peta murni visual bagi pembaca layar; informasi yang sama tersedia
      // sebagai daftar teks di bawahnya.
      aria-hidden="true"
    >
      <TileLayer
        attribution='&copy; kontributor <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={19}
      />

      <InteractionGate enabled={interactive} />
      <FocusMarker marker={focusedMarker} />
      <AutoFit
        south={latitudes.length > 0 ? Math.min(...latitudes) : null}
        west={Math.min(...longitudes)}
        north={Math.max(...latitudes)}
        east={Math.max(...longitudes)}
        latitude={center[0]}
        longitude={center[1]}
        zoom={zoom}
        isFocused={focusedMarker !== null}
      />

      <BoundaryLayers boundaries={boundaries} />

      {drawable.map((marker) => (
        <Marker
          key={marker.id}
          position={[marker.latitude, marker.longitude]}
          icon={createPinIcon(
            colorForCategory(marker.categoryId, categoryIds),
            focusedMarker?.id === marker.id,
            glyphs[iconNameFor(marker)] ?? null,
          )}
          eventHandlers={{ click: () => onMarkerSelect?.(marker) }}
        >
          <Popup>
            <span className="block font-semibold">{marker.name}</span>
            {marker.category ? (
              <span className="block text-slate-500">{marker.category.name}</span>
            ) : null}
            {marker.address ? <span className="mt-1 block">{marker.address}</span> : null}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
