import type { MetadataRoute } from "next";
import { fetchOrNull } from "@/lib/fetch-page";
import { getGalleryAlbums } from "@/services/gallery";
import { getActiveKknPrograms } from "@/services/kkn";
import { getNewsList } from "@/services/news";
import { getActivePotentials } from "@/services/potential";
import { getProfiles } from "@/services/profile";
import { getActiveUmkm } from "@/services/umkm";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3001";

/**
 * Sitemap agar seluruh halaman berita dan profil dapat ditemukan mesin pencari
 * — salah satu alasan portal ini dibangun dengan Next.js.
 *
 * Kalau backend sedang mati, bagian dinamisnya dilewati (`fetchOrNull`) supaya
 * sitemap tetap terbentuk dengan halaman statis, bukan gagal seluruhnya.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = [
    { path: "", priority: 1 },
    { path: "/profil", priority: 0.8 },
    { path: "/berita", priority: 0.9 },
    { path: "/agenda", priority: 0.8 },
    { path: "/pengumuman", priority: 0.7 },
    { path: "/galeri", priority: 0.7 },
    { path: "/peta", priority: 0.8 },
    { path: "/monografi", priority: 0.7 },
    { path: "/umkm", priority: 0.8 },
    { path: "/potensi", priority: 0.8 },
    { path: "/program-kkn", priority: 0.8 },
    { path: "/kontak", priority: 0.6 },
  ].map((route) => ({
    url: `${SITE_URL}${route.path}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: route.priority,
  }));

  const [news, profiles, umkm, potentials, programs, albums] = await Promise.all([
    fetchOrNull(getNewsList({ limit: 100 })),
    fetchOrNull(getProfiles()),
    fetchOrNull(getActiveUmkm({ limit: 100 })),
    fetchOrNull(getActivePotentials({ limit: 100 })),
    fetchOrNull(getActiveKknPrograms({ limit: 100 })),
    fetchOrNull(getGalleryAlbums({ limit: 100 })),
  ]);

  const dynamicRoutes: MetadataRoute.Sitemap = [
    ...(news?.data ?? []).map((item) => ({
      url: `${SITE_URL}/berita/${item.slug}`,
      lastModified: new Date(item.updatedAt),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...(profiles ?? []).map((item) => ({
      url: `${SITE_URL}/profil/${item.slug}`,
      lastModified: new Date(item.updatedAt),
      changeFrequency: "yearly" as const,
      priority: 0.7,
    })),
    ...(umkm?.data ?? []).map((item) => ({
      url: `${SITE_URL}/umkm/${item.slug}`,
      lastModified: new Date(item.updatedAt),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...(potentials?.data ?? []).map((item) => ({
      url: `${SITE_URL}/potensi/${item.slug}`,
      lastModified: new Date(item.updatedAt),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...(programs?.data ?? []).map((item) => ({
      url: `${SITE_URL}/program-kkn/${item.slug}`,
      lastModified: new Date(item.updatedAt),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...(albums?.data ?? []).map((item) => ({
      url: `${SITE_URL}/galeri/${item.slug}`,
      lastModified: new Date(item.updatedAt),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
  ];

  return [...staticRoutes, ...dynamicRoutes];
}
