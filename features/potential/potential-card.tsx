import Link from "next/link";
import { MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody } from "@/components/ui/card";
import { Thumbnail } from "@/components/ui/thumbnail";
import { excerpt, humanizeEnum } from "@/lib/format";
import type { Potential } from "@/types/api";

export function PotentialCard({ potential }: { potential: Potential }) {
  // Potensi punya `thumbnail` tersendiri; `images` dipakai sebagai cadangan
  // kalau thumbnail belum diisi admin.
  const image = potential.thumbnail ?? potential.images?.[0]?.url;

  return (
    <Card className="group relative flex h-full flex-col transition-shadow hover:shadow-md">
      <Thumbnail
        src={image}
        alt={potential.name}
        sizes="(min-width: 1024px) 22rem, (min-width: 768px) 50vw, 100vw"
      />

      <CardBody className="flex flex-1 flex-col gap-2">
        <Badge tone="secondary" className="w-fit">
          {humanizeEnum(potential.category)}
        </Badge>

        <h3 className="font-semibold text-pretty">
          <Link
            href={`/potensi/${potential.slug}`}
            className="after:absolute after:inset-0 group-hover:text-accent"
          >
            {potential.name}
          </Link>
        </h3>

        {potential.address ? (
          <p className="flex items-start gap-1.5 text-sm text-muted">
            <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <span>{potential.address}</span>
          </p>
        ) : null}

        <p className="text-muted">{excerpt(potential.description, 110)}</p>
      </CardBody>
    </Card>
  );
}
