"use client";

import { useState } from "react";
import Image from "next/image";
import { Lightbox, type LightboxPhoto } from "@/components/ui/lightbox";
import { cn } from "@/lib/utils";

/**
 * Kisi foto sederhana dengan pratinjau layar penuh, untuk halaman detail
 * UMKM dan Potensi yang gambarnya berupa array `{ id, url, caption }`.
 */
export function PhotoGallery({
  photos,
  className,
  sizes = "(min-width: 1024px) 16rem, 33vw",
}: {
  photos: LightboxPhoto[];
  className?: string;
  sizes?: string;
}) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  if (photos.length === 0) return null;

  return (
    <>
      <ul className={cn("grid grid-cols-2 gap-2 md:grid-cols-3 md:gap-3", className)}>
        {photos.map((photo, index) => (
          <li key={photo.id}>
            <button
              type="button"
              onClick={() => setActiveIndex(index)}
              className="group relative block aspect-square w-full overflow-hidden rounded-xl bg-surface-muted"
            >
              <Image
                src={photo.url}
                alt={photo.caption ?? "Foto"}
                fill
                loading="lazy"
                sizes={sizes}
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <span className="sr-only">Perbesar foto</span>
            </button>
          </li>
        ))}
      </ul>

      {activeIndex !== null ? (
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
