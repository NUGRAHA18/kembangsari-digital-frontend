import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody } from "@/components/ui/card";
import { Thumbnail } from "@/components/ui/thumbnail";
import { excerpt, formatDateShort } from "@/lib/format";
import type { News } from "@/types/api";

/**
 * Kartu berita. Seluruh permukaan kartu bisa diketuk lewat `after:absolute`
 * pada tautan judul — jadi target sentuhnya selebar kartu, tapi yang dibacakan
 * pembaca layar tetap judul beritanya, bukan "tautan" tanpa keterangan.
 */
export function NewsCard({ news, priority = false }: { news: News; priority?: boolean }) {
  return (
    <Card interactive className="group relative flex h-full flex-col">
      <Thumbnail
        src={news.thumbnail}
        alt={news.title}
        priority={priority}
        sizes="(min-width: 1024px) 25rem, (min-width: 768px) 50vw, 100vw"
      />

      <CardBody className="flex flex-1 flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          {news.category ? <Badge>{news.category.name}</Badge> : null}
          <time dateTime={news.createdAt} className="text-sm text-muted">
            {formatDateShort(news.createdAt)}
          </time>
        </div>

        <h3 className="font-semibold text-pretty">
          <Link
            href={`/berita/${news.slug}`}
            className="after:absolute after:inset-0 group-hover:text-accent"
          >
            {news.title}
          </Link>
        </h3>

        <p className="text-muted">{excerpt(news.content, 120)}</p>
      </CardBody>
    </Card>
  );
}
