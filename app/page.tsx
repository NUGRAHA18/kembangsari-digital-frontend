import { Section, SectionHeading } from "@/components/ui/section";
import { EmptyState, ErrorState } from "@/components/ui/states";
import { safeFetch } from "@/lib/api";
import { AgendaCard } from "@/features/agenda/agenda-card";
import { AnnouncementCard } from "@/features/announcement/announcement-card";
import { GalleryGrid } from "@/features/gallery/gallery-grid";
import { Hero } from "@/features/home/hero";
import { HomeMapPreview } from "@/features/home/map-preview";
import { QuickAccess } from "@/features/home/quick-access";
import { HomeStats } from "@/features/home/stats";
import { KknCard } from "@/features/kkn/kkn-card";
import { NewsCard } from "@/features/news/news-card";
import { getUpcomingAgenda } from "@/services/agenda";
import { getActiveAnnouncements } from "@/services/announcement";
import { getFeaturedGalleryItems } from "@/services/gallery";
import { getActiveKknPrograms } from "@/services/kkn";
import { getActiveMarkers, getMapCategories } from "@/services/maps";
import { getPublishedMonography } from "@/services/monography";
import { getNewsList } from "@/services/news";
import { getMapView, getSettingsMap } from "@/services/settings";

export default async function HomePage() {
  const settings = await getSettingsMap();

  // Setiap bagian diambil terpisah lewat safeFetch: kalau satu endpoint gagal,
  // bagian lain tetap tampil dan yang gagal menampilkan pesannya sendiri.
  // Semua permintaan dimulai bersamaan, bukan berantai satu per satu.
  const [announcements, news, agenda, kknPrograms, gallery, monography, markers, mapCategories] =
    await Promise.all([
      safeFetch(getActiveAnnouncements({ limit: 3 })),
      safeFetch(getNewsList({ limit: 3 })),
      safeFetch(getUpcomingAgenda({ limit: 3 })),
      safeFetch(getActiveKknPrograms({ limit: 4 })),
      safeFetch(getFeaturedGalleryItems({ limit: 8 })),
      safeFetch(getPublishedMonography({ limit: 1 })),
      safeFetch(getActiveMarkers()),
      safeFetch(getMapCategories()),
    ]);

  const mapView = getMapView(settings);

  return (
    <>
      <Hero
        title={settings.site_name ?? "Padukuhan Kembangsari"}
        description={settings.site_description}
        imageUrl={settings.site_banner}
      />

      <QuickAccess />

      <Section className="pt-10 pb-0 md:pt-14 md:pb-0">
        <HomeStats
          stat={monography.data?.data[0] ?? null}
          kknProgramCount={kknPrograms.data?.meta.total ?? null}
        />
      </Section>

      {announcements.data && announcements.data.data.length > 0 ? (
        <Section className="pb-0">
          <SectionHeading
            title="Pengumuman"
            description="Informasi penting yang sedang berlaku di padukuhan."
            href="/pengumuman"
          />
          <ul className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {announcements.data.data.map((announcement) => (
              <li key={announcement.id}>
                <AnnouncementCard announcement={announcement} />
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      <Section>
        <SectionHeading
          title="Berita Terbaru"
          description="Kabar terkini dari kegiatan dan pembangunan padukuhan."
          href="/berita"
        />

        {news.error ? (
          <ErrorState message={news.error} />
        ) : news.data && news.data.data.length > 0 ? (
          <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
            {news.data.data.map((item) => (
              <li key={item.id}>
                <NewsCard news={item} />
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            title="Belum ada berita"
            description="Berita akan tampil di sini setelah dipublikasikan."
          />
        )}
      </Section>

      <Section className="bg-surface">
        <SectionHeading
          title="Agenda Terdekat"
          description="Jadwal kegiatan warga yang akan berlangsung."
          href="/agenda"
        />

        {agenda.error ? (
          <ErrorState message={agenda.error} />
        ) : agenda.data && agenda.data.data.length > 0 ? (
          <ul className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {agenda.data.data.map((item) => (
              <li key={item.id}>
                <AgendaCard agenda={item} />
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            title="Belum ada agenda mendatang"
            description="Kegiatan yang dijadwalkan akan muncul di sini."
          />
        )}
      </Section>

      <Section>
        <SectionHeading
          title="Program KKN"
          description="Empat program kerja yang dirancang untuk terus dimanfaatkan setelah KKN berakhir."
          href="/program-kkn"
        />

        {kknPrograms.error ? (
          <ErrorState message={kknPrograms.error} />
        ) : kknPrograms.data && kknPrograms.data.data.length > 0 ? (
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-4">
            {kknPrograms.data.data.map((program) => (
              <li key={program.id}>
                <KknCard program={program} />
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState title="Belum ada program" />
        )}
      </Section>

      {gallery.data && gallery.data.data.length > 0 ? (
        <Section className="bg-surface">
          <SectionHeading
            title="Galeri Kegiatan"
            description="Dokumentasi kegiatan warga Padukuhan Kembangsari."
            href="/galeri"
          />
          <GalleryGrid items={gallery.data.data} />
        </Section>
      ) : null}

      <Section>
        <SectionHeading
          title="Peta Digital"
          description="Titik fasilitas umum, rumah perangkat padukuhan, dan lokasi penting lainnya."
          href="/peta"
          hrefLabel="Buka peta"
        />

        {markers.error ? (
          <ErrorState message={markers.error} />
        ) : markers.data && markers.data.length > 0 ? (
          <HomeMapPreview
            markers={markers.data}
            categoryIds={(mapCategories.data ?? []).map((category) => category.id)}
            center={mapView.center}
            zoom={mapView.zoom}
          />
        ) : (
          <EmptyState title="Belum ada titik lokasi" />
        )}
      </Section>
    </>
  );
}
