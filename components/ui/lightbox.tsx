"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

export interface LightboxPhoto {
  id: string;
  url: string;
  caption?: string | null;
}

/**
 * Pratinjau foto layar penuh.
 *
 * Dipakai bersama oleh galeri album dan halaman detail UMKM/Potensi.
 * Bisa ditutup dengan tombol ×, tombol Esc, ketukan di luar foto, dan usapan
 * ke bawah — yang terakhir jauh lebih mudah dijangkau di ponsel daripada
 * tombol kecil di pojok layar.
 */
export function Lightbox({
  photos,
  index,
  onClose,
  onIndexChange,
}: {
  photos: LightboxPhoto[];
  index: number;
  onClose: () => void;
  onIndexChange: (index: number) => void;
}) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const touchStartY = useRef<number | null>(null);

  const photo = photos[index];
  const hasSiblings = photos.length > 1;

  useEffect(() => {
    closeButtonRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft") onIndexChange((index - 1 + photos.length) % photos.length);
      if (event.key === "ArrowRight") onIndexChange((index + 1) % photos.length);
    };

    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [index, photos.length, onClose, onIndexChange]);

  if (!photo) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={photo.caption ?? "Pratinjau foto"}
      className="fixed inset-0 z-100 flex flex-col bg-slate-950/95"
      onClick={onClose}
      onTouchStart={(event) => {
        touchStartY.current = event.touches[0]?.clientY ?? null;
      }}
      onTouchEnd={(event) => {
        const start = touchStartY.current;
        const end = event.changedTouches[0]?.clientY;
        if (start !== null && end !== undefined && end - start > 80) onClose();
        touchStartY.current = null;
      }}
    >
      <div className="flex items-center justify-between gap-4 p-3 text-white">
        <span className="text-sm">
          {index + 1} dari {photos.length}
        </span>
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          aria-label="Tutup pratinjau"
          className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl hover:bg-white/15"
        >
          <X className="size-6" aria-hidden="true" />
        </button>
      </div>

      <div
        className="relative flex min-h-0 flex-1 items-center justify-center px-2 pb-4"
        onClick={(event) => event.stopPropagation()}
      >
        {hasSiblings ? (
          <button
            type="button"
            onClick={() => onIndexChange((index - 1 + photos.length) % photos.length)}
            aria-label="Foto sebelumnya"
            className="absolute left-1 z-10 inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl bg-slate-950/50 text-white hover:bg-slate-950/70"
          >
            <ChevronLeft className="size-6" aria-hidden="true" />
          </button>
        ) : null}

        <figure className="flex h-full max-w-5xl flex-col items-center justify-center gap-3">
          <div className="relative min-h-0 w-full flex-1">
            <Image
              src={photo.url}
              alt={photo.caption ?? "Foto dokumentasi Padukuhan Kembangsari"}
              fill
              sizes="100vw"
              className="object-contain"
            />
          </div>
          {photo.caption ? (
            <figcaption className="px-4 text-center text-white text-pretty">
              {photo.caption}
            </figcaption>
          ) : null}
        </figure>

        {hasSiblings ? (
          <button
            type="button"
            onClick={() => onIndexChange((index + 1) % photos.length)}
            aria-label="Foto selanjutnya"
            className="absolute right-1 z-10 inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl bg-slate-950/50 text-white hover:bg-slate-950/70"
          >
            <ChevronRight className="size-6" aria-hidden="true" />
          </button>
        ) : null}
      </div>
    </div>
  );
}
