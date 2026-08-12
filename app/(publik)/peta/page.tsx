import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState, ErrorState } from "@/components/ui/states";
import { DigitalMap } from "@/features/maps/digital-map";
import { safeFetch } from "@/lib/api";
import { getActiveHouses, getHouseSummary } from "@/services/house";
import { getActiveMarkers, getMapCategories } from "@/services/maps";
import { getMapView, getSettingsMap } from "@/services/settings";

export const metadata: Metadata = {
  title: "Peta Digital",
  description:
    "Peta digital Padukuhan Kembangsari: rumah dukuh, posyandu, perpustakaan, tempat sampah, penerangan jalan, dan fasilitas umum lainnya.",
};

export default async function MapPage() {
  const [settings, markers, categories, houses, summary] = await Promise.all([
    getSettingsMap(),
    // ARRAY POLOS dan tidak dipaginasi — peta harus menggambar semua pin sekaligus.
    safeFetch(getActiveMarkers()),
    safeFetch(getMapCategories()),
    // Sama: ARRAY POLOS. Rumah warga digambar seluruhnya sekaligus.
    safeFetch(getActiveHouses()),
    // Ringkasan per RT datang jadi dari backend, bukan dihitung dari daftar di
    // atas — angkanya sama persis dengan yang dipakai halaman monografi.
    safeFetch(getHouseSummary()),
  ]);

  const mapView = getMapView(settings);

  return (
    <>
      <PageHeader
        title="Peta Digital"
        description="Temukan lokasi fasilitas umum dan titik penting di Padukuhan Kembangsari. Ketuk sebuah pin atau pilih dari daftar untuk melihat detail dan petunjuk arah."
        breadcrumbs={[{ label: "Peta Digital" }]}
      />

      <Container className="py-8 md:py-12">
        {markers.error ? (
          <ErrorState message={markers.error} />
        ) : (markers.data && markers.data.length > 0) || (houses.data && houses.data.length > 0) ? (
          <DigitalMap
            markers={markers.data ?? []}
            categories={categories.data ?? []}
            houses={houses.data ?? []}
            summary={summary.data ?? []}
            center={mapView.center}
            zoom={mapView.zoom}
          />
        ) : (
          <EmptyState
            title="Belum ada titik lokasi"
            description="Marker lokasi akan tampil di peta setelah ditambahkan admin."
          />
        )}
      </Container>
    </>
  );
}
