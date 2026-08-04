import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { NewsForm } from "@/features/admin/news-form";
import { fetchAsAdmin } from "@/lib/admin-fetch";
import { formatDate } from "@/lib/format";
import { requireSession } from "@/lib/session";
import { getNewsBySlugAsAdmin, getNewsCategories } from "@/services/news";

export const metadata: Metadata = { title: "Ubah Berita" };

type Props = { params: Promise<{ slug: string }> };

export default async function EditNewsPage({ params }: Props) {
  const { token } = await requireSession();
  const { slug } = await params;

  // Dengan token, draf ikut terbaca — tanpa itu backend menjawab 404.
  const [news, categories] = await Promise.all([
    fetchAsAdmin(getNewsBySlugAsAdmin(slug, token)),
    fetchAsAdmin(getNewsCategories()),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/admin/berita"
          className="inline-flex min-h-11 items-center gap-2 text-muted hover:text-accent"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Kembali ke daftar berita
        </Link>

        <h1 className="mt-2 text-2xl font-bold tracking-tight text-pretty">{news.title}</h1>

        <div className="mt-2 flex flex-wrap items-center gap-3">
          <Badge tone={news.published ? "primary" : "neutral"}>
            {news.published ? "Terbit" : "Draf"}
          </Badge>
          <span className="text-sm text-muted">Dibuat {formatDate(news.createdAt)}</span>
          {news.createdBy ? (
            <span className="text-sm text-muted">oleh {news.createdBy.name}</span>
          ) : null}
        </div>
      </div>

      <NewsForm news={news} categories={categories} />
    </div>
  );
}
