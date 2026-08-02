import Link from "next/link";
import { Images } from "lucide-react";
import { Card, CardBody } from "@/components/ui/card";
import { Thumbnail } from "@/components/ui/thumbnail";
import type { GalleryAlbum } from "@/types/api";

export function AlbumCard({ album }: { album: GalleryAlbum }) {
  return (
    <Card className="group relative flex h-full flex-col transition-shadow hover:shadow-md">
      <Thumbnail
        src={album.thumbnail}
        alt={album.name}
        sizes="(min-width: 1024px) 22rem, (min-width: 768px) 50vw, 100vw"
      />

      <CardBody className="flex flex-1 flex-col gap-2">
        <h3 className="font-semibold text-pretty">
          <Link
            href={`/galeri/${album.slug}`}
            className="after:absolute after:inset-0 group-hover:text-accent"
          >
            {album.name}
          </Link>
        </h3>

        {album.description ? <p className="text-muted text-pretty">{album.description}</p> : null}

        {album._count ? (
          <p className="mt-auto flex items-center gap-1.5 pt-2 text-sm text-muted">
            <Images className="size-4" aria-hidden="true" />
            {album._count.items} media
          </p>
        ) : null}
      </CardBody>
    </Card>
  );
}
