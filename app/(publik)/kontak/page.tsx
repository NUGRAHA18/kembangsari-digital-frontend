import type { Metadata } from "next";
import { Mail, MapPin, Navigation, Phone } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { FacebookIcon, InstagramIcon, YoutubeIcon } from "@/components/ui/social-icons";
import { googleMapsDirectionsLink, socialLink, telLink } from "@/lib/format";
import { getMapView, getSettingsMap } from "@/services/settings";

export const metadata: Metadata = {
  title: "Kontak",
  description:
    "Alamat, nomor telepon, surel, dan media sosial resmi Padukuhan Kembangsari, Kalurahan Banjararum, Kulon Progo.",
};

export default async function ContactPage() {
  const settings = await getSettingsMap();
  const mapView = getMapView(settings);

  // Sama seperti di footer: isian tanpa `https://` harus dibetulkan lebih dulu,
  // kalau tidak peramban membacanya sebagai alamat relatif di portal ini.
  const socials = [
    { href: socialLink(settings.instagram), label: "Instagram", Icon: InstagramIcon },
    { href: socialLink(settings.facebook), label: "Facebook", Icon: FacebookIcon },
    { href: socialLink(settings.youtube), label: "YouTube", Icon: YoutubeIcon },
  ].filter((social): social is { href: string; label: string; Icon: typeof InstagramIcon } =>
    Boolean(social.href),
  );

  return (
    <>
      <PageHeader
        title="Kontak"
        description="Hubungi perangkat Padukuhan Kembangsari melalui saluran resmi berikut."
        breadcrumbs={[{ label: "Kontak" }]}
      />

      <Container className="py-8 md:py-12">
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
          <Card>
            <CardBody className="flex flex-col gap-5">
              <h2 className="text-xl font-semibold tracking-tight">Informasi Kontak</h2>

              <ul className="flex flex-col gap-4">
                {settings.address ? (
                  <li className="flex gap-3">
                    <MapPin className="mt-0.5 size-5 shrink-0 text-accent" aria-hidden="true" />
                    <div>
                      <p className="font-medium">Alamat</p>
                      <p className="text-muted text-pretty">{settings.address}</p>
                    </div>
                  </li>
                ) : null}

                {settings.phone ? (
                  <li className="flex gap-3">
                    <Phone className="mt-0.5 size-5 shrink-0 text-accent" aria-hidden="true" />
                    <div>
                      <p className="font-medium">Telepon</p>
                      <a
                        href={telLink(settings.phone)}
                        className="inline-flex min-h-11 items-center text-muted hover:text-accent"
                      >
                        {settings.phone}
                      </a>
                    </div>
                  </li>
                ) : null}

                {settings.email ? (
                  <li className="flex gap-3">
                    <Mail className="mt-0.5 size-5 shrink-0 text-accent" aria-hidden="true" />
                    <div>
                      <p className="font-medium">Surel</p>
                      <a
                        href={`mailto:${settings.email}`}
                        className="inline-flex min-h-11 items-center break-all text-muted hover:text-accent"
                      >
                        {settings.email}
                      </a>
                    </div>
                  </li>
                ) : null}
              </ul>

              {socials.length > 0 ? (
                <div>
                  <p className="font-medium">Media Sosial</p>
                  <ul className="mt-2 flex flex-wrap gap-2">
                    {socials.map(({ href, label, Icon }) => (
                      <li key={label}>
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border px-4 transition-colors hover:bg-surface-muted"
                        >
                          <Icon className="size-5" />
                          {label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </CardBody>
          </Card>

          <Card>
            <CardBody className="flex flex-col gap-5">
              <h2 className="text-xl font-semibold tracking-tight">Lokasi Padukuhan</h2>
              <p className="text-muted text-pretty">
                {settings.about_us ??
                  "Padukuhan Kembangsari berada di Kalurahan Banjararum, Kapanewon Kalibawang, Kabupaten Kulon Progo, Daerah Istimewa Yogyakarta."}
              </p>

              <div className="mt-auto flex flex-wrap gap-3">
                <ButtonLink href="/peta">Buka Peta Digital</ButtonLink>
                <a
                  href={googleMapsDirectionsLink(mapView.center[0], mapView.center[1])}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border px-4 font-medium transition-colors hover:bg-surface-muted"
                >
                  <Navigation className="size-4" aria-hidden="true" />
                  Petunjuk Arah
                </a>
              </div>
            </CardBody>
          </Card>
        </div>
      </Container>
    </>
  );
}
