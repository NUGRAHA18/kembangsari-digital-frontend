import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { Container } from "@/components/ui/container";
import { FacebookIcon, InstagramIcon, YoutubeIcon } from "@/components/ui/social-icons";
import { NAV_ITEMS, isNavGroup } from "@/lib/navigation";
import { telLink } from "@/lib/format";
import type { SettingsMap } from "@/services/settings";

/**
 * Footer diisi dari `GET /settings` supaya alamat, kontak, dan media sosial
 * bisa diubah admin lewat dashboard tanpa menyentuh kode. Setiap bagian
 * disembunyikan kalau key-nya belum diisi, bukan menampilkan baris kosong.
 */
export function Footer({ settings }: { settings: SettingsMap }) {
  const socials = [
    { href: settings.instagram, label: "Instagram", Icon: InstagramIcon },
    { href: settings.facebook, label: "Facebook", Icon: FacebookIcon },
    { href: settings.youtube, label: "YouTube", Icon: YoutubeIcon },
  ].filter((social): social is { href: string; label: string; Icon: typeof InstagramIcon } =>
    Boolean(social.href),
  );

  // Grup diratakan jadi satu daftar tautan cepat.
  const quickLinks = NAV_ITEMS.flatMap((item) => (isNavGroup(item) ? item.children : [item]));

  return (
    <footer className="mt-auto border-t border-border bg-surface">
      <Container className="py-10 md:py-14">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4 lg:gap-12">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary text-sm font-bold text-white"
              >
                KD
              </span>
              <span className="font-semibold">{settings.site_name}</span>
            </div>
            {settings.about_us ? (
              <p className="mt-4 max-w-prose text-muted text-pretty">{settings.about_us}</p>
            ) : settings.site_description ? (
              <p className="mt-4 max-w-prose text-muted text-pretty">{settings.site_description}</p>
            ) : null}

            {socials.length > 0 ? (
              <ul className="mt-6 flex flex-wrap gap-2">
                {socials.map(({ href, label, Icon }) => (
                  <li key={label}>
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-border transition-colors hover:bg-surface-muted"
                    >
                      <Icon className="size-5" aria-hidden="true" />
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          <nav aria-labelledby="footer-tautan">
            <h2 id="footer-tautan" className="font-semibold">
              Tautan Cepat
            </h2>
            <ul className="mt-4 flex flex-col">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="flex min-h-11 items-center text-muted transition-colors hover:text-accent"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="font-semibold">Kontak</h2>
            <ul className="mt-4 flex flex-col gap-3 text-muted">
              {settings.address ? (
                <li className="flex gap-3">
                  <MapPin className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
                  <span>{settings.address}</span>
                </li>
              ) : null}
              {/* Nomor telepon dan surel adalah tautan yang benar-benar diketuk
                  warga, jadi tingginya disamakan dengan target sentuh minimum. */}
              {settings.phone ? (
                <li className="flex items-center gap-3">
                  <Phone className="size-5 shrink-0" aria-hidden="true" />
                  <a
                    href={telLink(settings.phone)}
                    className="inline-flex min-h-11 items-center hover:text-accent"
                  >
                    {settings.phone}
                  </a>
                </li>
              ) : null}
              {settings.email ? (
                <li className="flex items-center gap-3">
                  <Mail className="size-5 shrink-0" aria-hidden="true" />
                  <a
                    href={`mailto:${settings.email}`}
                    className="inline-flex min-h-11 items-center break-all hover:text-accent"
                  >
                    {settings.email}
                  </a>
                </li>
              ) : null}
            </ul>
          </div>
        </div>

        <p className="mt-10 border-t border-border pt-6 text-sm text-muted">
          {settings.footer_text ?? `© ${new Date().getFullYear()} ${settings.site_name}`}
        </p>
      </Container>
    </footer>
  );
}
