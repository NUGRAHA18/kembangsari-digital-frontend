import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import { cn } from "@/lib/utils";

/**
 * Pola bagian halaman: Container → Heading → Deskripsi → Isi.
 *
 * Jarak antarbagian dokumen UI/UX menyebut 120px; itu terlalu longgar di layar
 * ponsel dan membuat pengguna banyak menggulir tanpa melihat apa pun, jadi
 * dimulai dari 56px lalu naik bertahap ke 120px di desktop.
 */
export function Section({
  className,
  children,
  ...props
}: React.ComponentProps<"section">) {
  return (
    <section className={cn("py-14 md:py-20 lg:py-30", className)} {...props}>
      <Container>{children}</Container>
    </section>
  );
}

export function SectionHeading({
  title,
  description,
  href,
  hrefLabel = "Lihat semua",
  as: Heading = "h2",
  className,
}: {
  title: string;
  description?: string;
  href?: string;
  hrefLabel?: string;
  as?: "h1" | "h2" | "h3";
  className?: string;
}) {
  return (
    <div className={cn("mb-6 md:mb-8", className)}>
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
        <Heading className="text-2xl font-semibold tracking-tight text-balance md:text-3xl lg:text-4xl">
          {title}
        </Heading>
        {href ? (
          <Link
            href={href}
            className="inline-flex min-h-11 items-center gap-1 font-medium text-accent hover:underline"
          >
            {hrefLabel}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        ) : null}
      </div>
      {description ? (
        <p className="mt-2 max-w-2xl text-muted text-pretty">{description}</p>
      ) : null}
    </div>
  );
}
