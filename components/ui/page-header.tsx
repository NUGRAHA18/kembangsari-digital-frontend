import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Container } from "@/components/ui/container";

export interface Crumb {
  label: string;
  href?: string;
}

/**
 * Kepala halaman untuk seluruh halaman selain beranda: judul, deskripsi singkat,
 * dan remah roti. Ukuran judul mengikuti pedoman mobile-first — 28px di ponsel,
 * naik ke 40px di laptop, bukan 48px di semua ukuran.
 */
export function PageHeader({
  title,
  description,
  breadcrumbs,
  children,
}: {
  title: string;
  description?: string;
  breadcrumbs?: Crumb[];
  children?: React.ReactNode;
}) {
  return (
    <div className="border-b border-border bg-surface">
      <Container className="py-8 md:py-12">
        {/* Tautan remah roti dibuat setinggi 44px lewat `min-h-11`, bukan hanya
            setinggi barisan teksnya — di ponsel inilah yang menentukan seberapa
            mudah ia diketuk. */}
        {breadcrumbs && breadcrumbs.length > 0 ? (
          <nav aria-label="Remah roti" className="mb-2">
            <ol className="flex flex-wrap items-center gap-x-1 text-sm text-muted">
              <li>
                <Link href="/" className="inline-flex min-h-11 items-center hover:text-accent hover:underline">
                  Beranda
                </Link>
              </li>
              {breadcrumbs.map((crumb) => (
                <li key={crumb.label} className="flex items-center gap-x-1">
                  <ChevronRight className="size-4 shrink-0" aria-hidden="true" />
                  {crumb.href ? (
                    <Link
                      href={crumb.href}
                      className="inline-flex min-h-11 items-center hover:text-accent hover:underline"
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span
                      aria-current="page"
                      className="inline-flex min-h-11 items-center text-foreground"
                    >
                      {crumb.label}
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        ) : null}

        <h1 className="text-[1.75rem] leading-tight font-bold tracking-tight text-balance lg:text-4xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-3 max-w-2xl text-muted text-pretty">{description}</p>
        ) : null}
        {children}
      </Container>
    </div>
  );
}
