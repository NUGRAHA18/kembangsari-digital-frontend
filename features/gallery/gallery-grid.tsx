"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Play } from "lucide-react";
import { Lightbox } from "@/components/ui/lightbox";
import type { GalleryItem } from "@/types/api";

/**
 * Kisi galeri album.
 *
 * Rasio 1:1 dipakai agar kisi tetap rapi walau rasio foto unggahan berbeda-beda,
 * dan semua foto dimuat malas — ini halaman dengan gambar terbanyak.
 *
 * Item bertipe VIDEO dibuka di tab baru, bukan di pratinjau: `url` untuk video
 * bisa mengarah ke layanan luar dan bukan berkas gambar.
 */
export function GalleryGrid({ items }: { items: GalleryItem[] }) {
  const photos = useMemo(
    () =>
      items
        .filter((item) => item.type === "FOTO")
        .map((item) => ({ id: item.id, url: item.url, caption: item.caption })),
    [items],
  );

  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  return (
    <>
      <ul className="grid grid-cols-2 gap-2 md:grid-cols-3 md:gap-3 lg:grid-cols-4">
        {items.map((item) => {
          const photoIndex = photos.findIndex((photo) => photo.id === item.id);

          return (
            <li key={item.id}>
              {item.type === "VIDEO" ? (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative block aspect-square w-full overflow-hidden rounded-xl bg-surface-muted"
                >
                  <span className="absolute inset-0 grid place-items-center bg-foreground/10">
                    <Play className="size-10 text-white drop-shadow" aria-hidden="true" />
                  </span>
                  <span className="sr-only">
                    Putar video{item.caption ? `: ${item.caption}` : ""} (terbuka di tab baru)
                  </span>
                </a>
              ) : (
                <button
                  type="button"
                  onClick={() => setActiveIndex(photoIndex)}
                  className="group relative block aspect-square w-full overflow-hidden rounded-xl bg-surface-muted"
                >
                  <Image
                    src={item.url}
                    alt={item.caption ?? "Foto dokumentasi kegiatan Padukuhan Kembangsari"}
                    fill
                    loading="lazy"
                    sizes="(min-width: 1024px) 18rem, (min-width: 768px) 33vw, 50vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <span className="sr-only">Perbesar foto</span>
                </button>
              )}
            </li>
          );
        })}
      </ul>

      {activeIndex !== null && activeIndex >= 0 ? (
        <Lightbox
          photos={photos}
          index={activeIndex}
          onClose={() => setActiveIndex(null)}
          onIndexChange={setActiveIndex}
        />
      ) : null}
    </>
  );
}
