import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, MapPin, Navigation, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { ShareButton } from "@/components/ui/share-button";
import { FAMILY_RELATION_LABELS } from "@/features/house/relations";
import { headOfFamily, houseTally, residentLabel } from "@/features/house/house";
import { fetchOrNotFound } from "@/lib/fetch-page";
import { formatDate, googleMapsDirectionsLink } from "@/lib/format";
import { getHouseBySlug } from "@/services/house";
import type { Family } from "@/types/api";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  try {
    const house = await getHouseBySlug(slug);
    return {
      title: house.label,
      description: `${house.label} — RT ${house.rt} / RW ${house.rw}, Padukuhan Kembangsari. ${houseTally(house)}.`,
      // Data rumah warga tidak perlu ikut terindeks mesin pencari. Halamannya
      // memang terbuka supaya tautannya bisa dibagikan antar warga, tetapi itu
      // berbeda dari menaruh nama dan umur penghuni di hasil penelusuran.
      robots: { index: false, follow: false },
    };
  } catch {
    return { title: "Rumah tidak ditemukan" };
  }
}

export default async function HouseDetailPage({ params }: Props) {
  const { slug } = await params;

  // Rumah yang disembunyikan dijawab 404 oleh backend untuk pemanggil tanpa
  // token, jadi tidak ada penyaringan `isActive` yang perlu dilakukan di sini.
  const house = await fetchOrNotFound(getHouseBySlug(slug));
  const families = house.families ?? [];

  return (
    <>
      <PageHeader
        title={house.label}
        description={`RT ${house.rt} / RW ${house.rw} · ${houseTally(house)}`}
        breadcrumbs={[{ label: "Peta Digital", href: "/peta" }, { label: house.label }]}
      />

      <Container className="py-8 md:py-12">
        <div className="mx-auto flex max-w-2xl flex-col gap-6">
          <Link
            href="/peta"
            className="inline-flex min-h-11 w-fit items-center gap-2 text-muted hover:text-accent"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Kembali ke peta digital
          </Link>

          {house.photo ? (
            <div className="relative aspect-16/9 w-full overflow-hidden rounded-xl bg-surface-muted">
              <Image
                src={house.photo}
                alt={`Foto ${house.label}`}
                fill
                sizes="(min-width: 768px) 42rem, 100vw"
                className="object-cover"
              />
            </div>
          ) : null}

          <div className="flex flex-col gap-2">
            {house.address ? (
              <p className="flex items-start gap-2 text-muted text-pretty">
                <MapPin className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
                {house.address}
              </p>
            ) : null}

            {/* `dataVerifiedAt`, bukan `updatedAt`: yang pertama menyatakan
                kapan pendata terakhir memeriksanya, yang kedua ikut berubah
                setiap kali salah ketik dibetulkan. */}
            <p className="text-sm text-muted">
              {house.dataVerifiedAt
                ? `Data diverifikasi ${formatDate(house.dataVerifiedAt)}`
                : "Tanggal verifikasi data belum dicatat"}
            </p>
          </div>

          {house.note ? <p className="text-muted text-pretty">{house.note}</p> : null}

          <div className="flex flex-wrap gap-2">
            <a
              href={googleMapsDirectionsLink(house.latitude, house.longitude)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-4 font-medium text-white transition-colors hover:bg-primary-hover"
            >
              <Navigation className="size-4" aria-hidden="true" />
              Petunjuk Arah
            </a>

            <ShareButton
              url={`/peta/rumah/${house.slug}`}
              title={house.label}
              text={`${house.label} — RT ${house.rt} / RW ${house.rw}, Padukuhan Kembangsari`}
            />
          </div>

          <section className="flex flex-col gap-4">
            <h2 className="text-xl font-bold tracking-tight">Penghuni</h2>

            {families.length === 0 ? (
              <p className="text-muted text-pretty">Data penghuni rumah ini belum didata.</p>
            ) : (
              families.map((family, index) => (
                <FamilyBlock key={family.id} family={family} index={index} />
              ))
            )}
          </section>
        </div>
      </Container>
    </>
  );
}

function FamilyBlock({ family, index }: { family: Family; index: number }) {
  const residents = family.residents ?? [];
  const head = headOfFamily(family);
  // Kepala keluarga ditampilkan di atas, sisanya menyusul — urutan yang sama
  // dengan cara sebuah kartu keluarga dibaca.
  const others = residents.filter((resident) => resident.id !== head?.id);

  return (
    <Card>
      <CardBody className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-semibold">KK {index + 1}</h3>
          <span className="inline-flex items-center gap-1.5 text-sm text-muted">
            <Users className="size-4" aria-hidden="true" />
            {residents.length} jiwa
          </span>
        </div>

        {head ? (
          <p className="flex flex-wrap items-center gap-2">
            {/* Yang ditebalkan adalah kepala keluarga. Tepat satu per KK,
                dijaga backend — tidak perlu ditambal di sini. */}
            <strong className="font-bold">{residentLabel(head)}</strong>
            <Badge tone="primary">Kepala keluarga</Badge>
          </p>
        ) : null}

        {others.length > 0 ? (
          <ul className="flex flex-col gap-1 text-muted">
            {others.map((resident) => (
              <li key={resident.id}>
                {residentLabel(resident)}
                <span className="text-sm"> — {FAMILY_RELATION_LABELS[resident.relation]}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </CardBody>
    </Card>
  );
}
