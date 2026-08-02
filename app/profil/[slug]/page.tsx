import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Markdown } from "@/components/ui/markdown";
import { PageHeader } from "@/components/ui/page-header";
import { Thumbnail } from "@/components/ui/thumbnail";
import { excerpt, stripMarkdown } from "@/lib/format";
import { fetchOrNotFound, fetchOrNull } from "@/lib/fetch-page";
import { getProfileBySlug } from "@/services/profile";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const profile = await fetchOrNull(getProfileBySlug(slug));

  if (!profile) return { title: "Halaman profil tidak ditemukan" };

  // Backend menyediakan metaTitle/metaDescription khusus SEO; kalau admin
  // belum mengisinya, judul dan ringkasan isi dipakai sebagai penggantinya.
  const description = profile.metaDescription ?? excerpt(stripMarkdown(profile.content), 160);

  return {
    title: profile.metaTitle ?? profile.title,
    description,
    alternates: { canonical: `/profil/${profile.slug}` },
    openGraph: {
      type: "article",
      title: profile.metaTitle ?? profile.title,
      description,
      images: profile.thumbnail ? [{ url: profile.thumbnail }] : undefined,
    },
  };
}

export default async function ProfileDetailPage({ params }: Props) {
  const { slug } = await params;
  const profile = await fetchOrNotFound(getProfileBySlug(slug));

  return (
    <>
      <PageHeader
        title={profile.title}
        breadcrumbs={[{ label: "Profil", href: "/profil" }, { label: profile.title }]}
      />

      <Container className="py-8 md:py-12">
        {profile.thumbnail ? (
          <Thumbnail
            src={profile.thumbnail}
            alt={profile.title}
            priority
            ratio="aspect-16/9"
            sizes="(min-width: 1280px) 60rem, 100vw"
            className="mb-8 rounded-xl"
          />
        ) : null}

        {/* Isi profil berupa Markdown, sesuai catatan pada types/api.ts. */}
        <Markdown>{profile.content}</Markdown>

        <Link
          href="/profil"
          className="mt-10 inline-flex min-h-11 items-center gap-2 text-muted hover:text-accent"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Kembali ke Profil
        </Link>
      </Container>
    </>
  );
}
