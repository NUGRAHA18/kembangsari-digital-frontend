import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, CalendarDays, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/ui/container";
import { PlainText } from "@/components/ui/plain-text";
import { Thumbnail } from "@/components/ui/thumbnail";
import { excerpt, formatDate } from "@/lib/format";
import { fetchOrNotFound, fetchOrNull } from "@/lib/fetch-page";
import { getNewsBySlug } from "@/services/news";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const news = await fetchOrNull(getNewsBySlug(slug));

  // Judul dan ringkasan berita inilah yang muncul di hasil pencarian dan saat
  // tautannya dibagikan ke WhatsApp — bagian terpenting untuk portal berita.
  if (!news) return { title: "Berita tidak ditemukan" };

  const description = excerpt(news.content, 160);

  return {
    title: news.title,
    description,
    alternates: { canonical: `/berita/${news.slug}` },
    openGraph: {
      type: "article",
      title: news.title,
      description,
      publishedTime: news.createdAt,
      modifiedTime: news.updatedAt,
      images: news.thumbnail ? [{ url: news.thumbnail }] : undefined,
    },
  };
}

export default async function NewsDetailPage({ params }: Props) {
  const { slug } = await params;
  // Draf tidak perlu disaring di sini: `GET /news/:slug` menjawab 404 untuk
  // pemanggil tanpa token, dan `fetchOrNotFound` menerjemahkannya jadi halaman
  // "tidak ditemukan" berstatus 404.
  const news = await fetchOrNotFound(getNewsBySlug(slug));

  return (
    <Container className="py-8 md:py-12">
      <Link
        href="/berita"
        className="inline-flex min-h-11 items-center gap-2 text-muted hover:text-accent"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Kembali ke daftar berita
      </Link>

      <article className="mt-4">
        <header>
          {news.category ? <Badge>{news.category.name}</Badge> : null}

          <h1 className="mt-3 max-w-[24ch] text-[1.75rem] leading-tight font-bold tracking-tight text-balance lg:text-4xl">
            {news.title}
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted">
            <span className="flex items-center gap-1.5">
              <CalendarDays className="size-4" aria-hidden="true" />
              <time dateTime={news.createdAt}>{formatDate(news.createdAt)}</time>
            </span>
            {news.createdBy ? (
              <span className="flex items-center gap-1.5">
                <User className="size-4" aria-hidden="true" />
                {news.createdBy.name}
              </span>
            ) : null}
          </div>
        </header>

        {news.thumbnail ? (
          <Thumbnail
            src={news.thumbnail}
            alt={news.title}
            priority
            ratio="aspect-16/9"
            sizes="(min-width: 1280px) 60rem, 100vw"
            className="mt-6 rounded-xl"
          />
        ) : null}

        <PlainText className="mt-8 text-lg">{news.content}</PlainText>
      </article>
    </Container>
  );
}
