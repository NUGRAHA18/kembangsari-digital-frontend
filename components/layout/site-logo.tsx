import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Lambang situs di navbar dan footer.
 *
 * `site_logo` di Pengaturan berisi URL dan boleh kosong — padukuhan belum tentu
 * punya berkas logo saat portal pertama dipasang. Karena itu monogram "KD"
 * tetap ada sebagai cadangan, bukan sebagai satu-satunya tampilan: logo yang
 * sudah diunggah pengelola harus benar-benar terpakai, dan sebelumnya tidak
 * ada satu pun tempat yang membacanya.
 *
 * Dipakai dari Server Component (footer) maupun Client Component (navbar),
 * jadi berkas ini sengaja tanpa hook dan tanpa "use client".
 */
export function SiteLogo({
  src,
  siteName,
  className,
}: {
  src?: string;
  siteName: string;
  className?: string;
}) {
  const box = cn("grid size-9 shrink-0 place-items-center overflow-hidden rounded-xl", className);

  if (!src) {
    return (
      <span aria-hidden="true" className={cn(box, "bg-primary text-sm font-bold text-white")}>
        KD
      </span>
    );
  }

  return (
    <span className={box}>
      <Image
        src={src}
        alt={`Logo ${siteName}`}
        width={44}
        height={44}
        // Rasio logo yang diunggah tidak dijamin persegi. `object-contain`
        // menyusutkannya utuh ke dalam kotak; `object-cover` akan memotong
        // sisi kiri-kanan lambang yang melebar.
        className="size-full object-contain"
      />
    </span>
  );
}
