import Image from "next/image";
import { ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Gambar dari API selalu berupa URL dan boleh bernilai null, jadi setiap
 * pemakaian butuh penampung berukuran tetap plus keadaan "tidak ada gambar".
 *
 * `object-cover` wajib: rasio gambar yang diunggah admin tidak seragam, dan
 * tanpa ini tinggi kartu akan berbeda-beda.
 */
export function Thumbnail({
  src,
  alt,
  sizes,
  className,
  priority = false,
  ratio = "aspect-3/2",
}: {
  src: string | null | undefined;
  /** Wajib bermakna — dibaca pembaca layar sekaligus dipakai mesin pencari. */
  alt: string;
  /** Beri tahu browser lebar tayang sebenarnya agar ponsel tidak mengunduh gambar 1200px. */
  sizes: string;
  className?: string;
  /** Hanya untuk gambar di atas lipatan layar (hero). Sisanya dimuat malas. */
  priority?: boolean;
  ratio?: string;
}) {
  return (
    <div className={cn("relative overflow-hidden bg-surface-muted", ratio, className)}>
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          loading={priority ? undefined : "lazy"}
          className="object-cover"
        />
      ) : (
        <div className="flex size-full items-center justify-center" role="img" aria-label={alt}>
          <ImageOff className="size-8 text-muted" aria-hidden="true" />
        </div>
      )}
    </div>
  );
}
