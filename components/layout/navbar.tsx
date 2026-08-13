"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu, X } from "lucide-react";
import { SiteLogo } from "@/components/layout/site-logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Container } from "@/components/ui/container";
import { NAV_ITEMS, isActivePath, isNavGroup, type NavItem } from "@/lib/navigation";
import { cn } from "@/lib/utils";

export function Navbar({ siteName, logo }: { siteName: string; logo?: string }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Di beranda navbar melayang di atas foto panorama yang gelap, jadi teksnya
  // putih. Begitu digulir, navbar berubah jadi solid dan teks kembali normal.
  const isOverHero = pathname === "/" && !isScrolled && !isOpen;

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Menu harus tertutup setelah pengguna berpindah halaman.
  //
  // Penyesuaian dilakukan saat render, bukan di dalam useEffect: menutup menu
  // lewat effect berarti overlay sempat terlihat sekejap di halaman baru
  // sebelum React sempat merender ulang.
  const [pathnameAtRender, setPathnameAtRender] = useState(pathname);
  if (pathname !== pathnameAtRender) {
    setPathnameAtRender(pathname);
    setIsOpen(false);
  }

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-300",
        isOverHero ? "border-b border-transparent text-white" : "glass border-b",
      )}
    >
      <Container>
        <div className="flex min-h-16 items-center justify-between gap-4">
          <Link
            href="/"
            className="flex min-h-11 items-center gap-2 font-semibold tracking-tight"
            aria-label={`${siteName} — kembali ke beranda`}
          >
            <SiteLogo src={logo} siteName={siteName} />
            <span className="hidden truncate sm:inline">{siteName}</span>
          </Link>

          <nav aria-label="Navigasi utama" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {NAV_ITEMS.map((item) => (
                <li key={item.label}>
                  <DesktopNavItem item={item} pathname={pathname} isOverHero={isOverHero} />
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-1">
            <ThemeToggle />
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              aria-label="Buka menu"
              aria-expanded={isOpen}
              aria-controls="menu-seluler"
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl transition-colors hover:bg-surface-muted lg:hidden"
            >
              <Menu className="size-6" aria-hidden="true" />
            </button>
          </div>
        </div>
      </Container>

      {isOpen ? <MobileMenu siteName={siteName} pathname={pathname} onClose={() => setIsOpen(false)} /> : null}
    </header>
  );
}

function DesktopNavItem({
  item,
  pathname,
  isOverHero,
}: {
  item: NavItem;
  pathname: string;
  isOverHero: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const linkClasses = (active: boolean) =>
    cn(
      "inline-flex min-h-11 items-center gap-1 rounded-xl px-3 text-sm font-medium transition-colors",
      isOverHero ? "hover:bg-white/15" : "hover:bg-surface-muted",
      active && !isOverHero && "text-accent",
      active && isOverHero && "underline underline-offset-4",
    );

  useEffect(() => {
    if (!isOpen) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  if (!isNavGroup(item)) {
    return (
      <Link href={item.href} className={linkClasses(isActivePath(pathname, item.href))}>
        {item.label}
      </Link>
    );
  }

  const hasActiveChild = item.children.some((child) => isActivePath(pathname, child.href));

  return (
    <div
      ref={containerRef}
      className="relative"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        className={linkClasses(hasActiveChild)}
      >
        {item.label}
        <ChevronDown
          className={cn("size-4 transition-transform", isOpen && "rotate-180")}
          aria-hidden="true"
        />
      </button>

      {isOpen ? (
        <ul className="absolute top-full left-0 w-64 rounded-xl border border-border bg-surface p-2 text-foreground shadow-lg">
          {item.children.map((child) => (
            <li key={child.href}>
              <Link
                href={child.href}
                className={cn(
                  "block rounded-xl px-3 py-2 transition-colors hover:bg-surface-muted",
                  isActivePath(pathname, child.href) && "text-accent",
                )}
              >
                <span className="font-medium">{child.label}</span>
                {child.description ? (
                  <span className="mt-0.5 block text-sm text-muted">{child.description}</span>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function MobileMenu({
  siteName,
  pathname,
  onClose,
}: {
  siteName: string;
  pathname: string;
  onClose: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  const focusableElements = useCallback(
    () =>
      Array.from(
        panelRef.current?.querySelectorAll<HTMLElement>("a[href], button:not([disabled])") ?? [],
      ),
    [],
  );

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    focusableElements()[0]?.focus();

    // Fokus keyboard tidak boleh "bocor" ke halaman di belakang overlay.
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab") return;

      const items = focusableElements();
      if (items.length === 0) return;

      const first = items[0];
      const last = items[items.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus();
    };
  }, [focusableElements, onClose]);

  return (
    <div
      id="menu-seluler"
      className="fixed inset-0 z-50 bg-background text-foreground lg:hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Menu navigasi"
      ref={panelRef}
    >
      <Container>
        <div className="flex min-h-16 items-center justify-between gap-4">
          <span className="truncate font-semibold">{siteName}</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup menu"
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl hover:bg-surface-muted"
          >
            <X className="size-6" aria-hidden="true" />
          </button>
        </div>

        <nav aria-label="Navigasi utama" className="h-[calc(100dvh-4rem)] overflow-y-auto pb-10">
          <ul className="flex flex-col gap-1">
            <li>
              <MobileLink href="/" label="Beranda" pathname={pathname} />
            </li>
            {NAV_ITEMS.map((item) =>
              isNavGroup(item) ? (
                // Grup tampil sebagai judul bagian, bukan menu bertingkat:
                // menu yang harus diketuk dua kali menyulitkan pengguna
                // yang tidak terbiasa dengan aplikasi.
                <li key={item.label} className="mt-4">
                  <p className="px-3 pb-1 text-sm font-semibold tracking-wide text-muted uppercase">
                    {item.label}
                  </p>
                  <ul className="flex flex-col gap-1">
                    {item.children.map((child) => (
                      <li key={child.href}>
                        <MobileLink href={child.href} label={child.label} pathname={pathname} />
                      </li>
                    ))}
                  </ul>
                </li>
              ) : (
                <li key={item.href}>
                  <MobileLink href={item.href} label={item.label} pathname={pathname} />
                </li>
              ),
            )}
          </ul>
        </nav>
      </Container>
    </div>
  );
}

function MobileLink({
  href,
  label,
  pathname,
}: {
  href: string;
  label: string;
  pathname: string;
}) {
  const active = isActivePath(pathname, href);
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex min-h-12 items-center rounded-xl px-3 text-lg transition-colors",
        active ? "bg-primary-soft font-medium text-primary-soft-foreground" : "hover:bg-surface-muted",
      )}
    >
      {label}
    </Link>
  );
}
