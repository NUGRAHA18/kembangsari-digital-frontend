"use client";

import "leaflet/dist/leaflet.css";

import { useEffect } from "react";
import L from "leaflet";
import { GeoJSON, MapContainer, Marker, Popup, TileLayer, Tooltip, useMap } from "react-leaflet";
import { boundaryStyle, type BoundaryFeature } from "@/features/maps/boundaries";
import { colorForRt, houseTally } from "@/features/house/house";
import type { House, MapMarker } from "@/types/api";

/**
 * Peta OpenStreetMap.
 *
 * Berkas ini hanya boleh dimuat di browser — Leaflet menyentuh `window` saat
 * diimpor, jadi pemanggilnya (map-canvas.tsx) memuatnya lewat dynamic import
 * dengan `ssr: false`.
 */

/** Warna pin per kategori; diulang kalau kategorinya lebih banyak dari palet. */
const PIN_COLORS = ["#15803d", "#f59e0b", "#0ea5e9", "#a855f7", "#ef4444", "#0d9488", "#e11d48"];

export function colorForCategory(categoryId: string, categoryIds: string[]): string {
  const index = categoryIds.indexOf(categoryId);
  return PIN_COLORS[(index < 0 ? 0 : index) % PIN_COLORS.length];
}

/**
 * Ikon dibuat sebagai divIcon berisi SVG, bukan gambar bawaan Leaflet.
 * Ikon bawaan merujuk berkas PNG lewat jalur relatif yang rusak setelah
 * di-bundle, dan pendekatan ini sekaligus memungkinkan pin diwarnai per kategori.
 */
function createPinIcon(color: string, isActive: boolean) {
  return L.divIcon({
    className: "",
    html: `<svg width="${isActive ? 40 : 30}" height="${isActive ? 40 : 30}" viewBox="0 0 24 24" fill="${color}" stroke="white" stroke-width="1.5" aria-hidden="true" style="filter:drop-shadow(0 1px 2px rgba(0,0,0,.4))">
        <path d="M12 22s7-6.5 7-12A7 7 0 0 0 5 10c0 5.5 7 12 7 12z"/>
        <circle cx="12" cy="10" r="2.6" fill="white" stroke="none"/>
      </svg>`,
    iconSize: isActive ? [40, 40] : [30, 30],
    iconAnchor: isActive ? [20, 40] : [15, 30],
    popupAnchor: [0, isActive ? -38 : -28],
  });
}

/**
 * Ikon rumah warga.
 *
 * Sengaja berbentuk rumah, bukan pin bulat seperti fasilitas umum: dengan
 * tujuh puluh rumah di layar, bentuknyalah yang membedakan keduanya sekilas —
 * warna saja tidak cukup, karena warna di sini sudah dipakai membedakan RT.
 *
 * Ukurannya lebih kecil daripada pin kategori. Rumah warga jumlahnya berkali
 * lipat, dan pada zoom kampung ikon sebesar pin akan saling menimpa sampai
 * jalan di bawahnya tidak terbaca lagi.
 */
function createHouseIcon(color: string, isActive: boolean) {
  const size = isActive ? 32 : 22;

  return L.divIcon({
    className: "",
    html: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${color}" stroke="white" stroke-width="1.6" stroke-linejoin="round" aria-hidden="true" style="filter:drop-shadow(0 1px 2px rgba(0,0,0,.4))">
        <path d="M12 3 2.5 10.5V21h19V10.5z"/>
        <path d="M9.5 21v-5.5h5V21" fill="white" stroke="none"/>
      </svg>`,
    iconSize: [size, size],
    // Ikon rumah ditambatkan di tengah, bukan di ujung bawah seperti pin:
    // bentuknya memang menandai bidang, bukan menunjuk satu titik.
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
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
  houses = [],
  rtOrder = [],
  focusedHouseId = null,
  onHouseSelect,
}: {
  markers: MapMarker[];
  categoryIds: string[];
  center: [number, number];
  zoom: number;
  interactive: boolean;
  focusedMarker: MapMarker | null;
  onMarkerSelect?: (marker: MapMarker) => void;
  boundaries?: BoundaryFeature[];
  houses?: House[];
  /** Urutan RT yang menentukan warna ikon rumah. Lihat `colorForRt`. */
  rtOrder?: string[];
  focusedHouseId?: string | null;
  onHouseSelect?: (house: House) => void;
}) {
  // Koordinat yang bukan angka membuat Leaflet melempar saat menggambar pin,
  // dan yang runtuh bukan satu pin itu melainkan seluruh peta. Titik seperti
  // itu dibuang di sini, bukan dibiarkan menjatuhkan halaman.
  const hasCoordinates = (point: { latitude: number; longitude: number }) =>
    Number.isFinite(point.latitude) && Number.isFinite(point.longitude);

  const drawable = markers.filter(hasCoordinates);
  const drawableHouses = houses.filter(hasCoordinates);

  // Rumah warga ikut menentukan bidang yang dipaskan AutoFit. Tanpa itu, peta
  // yang hanya berisi rumah — belum ada satu pun fasilitas umum terdata —
  // akan jatuh ke titik tengah pengaturan dan tampak kosong.
  const points = [...drawable, ...drawableHouses];
  const latitudes = points.map((point) => point.latitude);
  const longitudes = points.map((point) => point.longitude);

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

      {/* Rumah digambar lebih dulu supaya pin fasilitas umum berada di atasnya
          ketika keduanya berimpit — yang dicari orang di peta padukuhan
          hampir selalu balai atau posyandu, bukan rumah yang kebetulan
          bersebelahan dengannya. */}
      {drawableHouses.map((house) => (
        <Marker
          key={house.id}
          position={[house.latitude, house.longitude]}
          icon={createHouseIcon(colorForRt(house.rt, rtOrder), focusedHouseId === house.id)}
          eventHandlers={{ click: () => onHouseSelect?.(house) }}
        >
          <Popup>
            <span className="block font-semibold">{house.label}</span>
            <span className="block text-slate-500">
              RT {house.rt} / RW {house.rw}
            </span>
            <span className="mt-1 block">{houseTally(house)}</span>
          </Popup>
        </Marker>
      ))}

      {drawable.map((marker) => (
        <Marker
          key={marker.id}
          position={[marker.latitude, marker.longitude]}
          icon={createPinIcon(
            colorForCategory(marker.categoryId, categoryIds),
            focusedMarker?.id === marker.id,
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
