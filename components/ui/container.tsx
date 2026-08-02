import { cn } from "@/lib/utils";

/**
 * Pembungkus lebar konsisten untuk seluruh halaman.
 *
 * Padding samping dimulai dari 1rem, bukan 1.5rem seperti di dokumen UI/UX:
 * pada layar 320px, padding 24px di dua sisi hanya menyisakan 272px untuk isi
 * dan kartu jadi terasa sempit. Naik ke 1.5rem mulai `md`.
 */
export function Container({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div className={cn("mx-auto w-full max-w-7xl px-4 md:px-6 lg:px-8", className)} {...props}>
      {children}
    </div>
  );
}
