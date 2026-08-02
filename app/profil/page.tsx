import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card, CardBody } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState, ErrorState } from "@/components/ui/states";
import { Thumbnail } from "@/components/ui/thumbnail";
import { excerpt, stripMarkdown } from "@/lib/format";
import { safeFetch } from "@/lib/api";
import { getProfiles } from "@/services/profile";

export const metadata: Metadata = {
  title: "Profil Padukuhan",
  description:
    "Sejarah, visi misi, letak geografis, dan struktur organisasi Padukuhan Kembangsari, Kalurahan Banjararum, Kulon Progo.",
};

export default async function ProfileListPage() {
  // ARRAY POLOS — bukan `{ data, meta }`. Halaman profil jumlahnya tetap sedikit.
  const profiles = await safeFetch(getProfiles());

  return (
    <>
      <PageHeader
        title="Profil Padukuhan"
        description="Mengenal Padukuhan Kembangsari: sejarah, visi misi, letak geografis, dan susunan perangkatnya."
        breadcrumbs={[{ label: "Profil" }]}
      />

      <Container className="py-8 md:py-12">
        {profiles.error ? (
          <ErrorState message={profiles.error} />
        ) : profiles.data && profiles.data.length > 0 ? (
          <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
            {profiles.data.map((profile) => (
              <li key={profile.id}>
                <Card className="group relative flex h-full flex-col transition-shadow hover:shadow-md">
                  <Thumbnail
                    src={profile.thumbnail}
                    alt={profile.title}
                    sizes="(min-width: 1024px) 22rem, (min-width: 768px) 50vw, 100vw"
                  />
                  <CardBody className="flex flex-1 flex-col gap-2">
                    <h2 className="font-semibold text-pretty">
                      <Link
                        href={`/profil/${profile.slug}`}
                        className="after:absolute after:inset-0 group-hover:text-accent"
                      >
                        {profile.title}
                      </Link>
                    </h2>
                    <p className="text-muted">
                      {profile.metaDescription ?? excerpt(stripMarkdown(profile.content), 120)}
                    </p>
                    <span className="mt-auto inline-flex items-center gap-1 pt-2 font-medium text-accent">
                      Selengkapnya
                      <ArrowRight className="size-4" aria-hidden="true" />
                    </span>
                  </CardBody>
                </Card>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            title="Belum ada halaman profil"
            description="Halaman sejarah, visi misi, dan struktur organisasi akan tampil di sini."
          />
        )}
      </Container>
    </>
  );
}
