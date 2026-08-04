import Link from "next/link";
import { BookOpen, Lightbulb, Sprout, Trash2 } from "lucide-react";
import { Card, CardBody } from "@/components/ui/card";
import { Thumbnail } from "@/components/ui/thumbnail";
import { SUB_PROGRAM_LABELS } from "@/features/kkn/sub-programs";
import { excerpt } from "@/lib/format";
import type { KKNProgram, KKNSubProgram } from "@/types/api";

/** Ikon tiap sub-program; labelnya diambil dari `sub-programs.ts`. */
export const SUB_PROGRAM_META: Record<
  KKNSubProgram,
  { label: string; Icon: typeof BookOpen }
> = {
  RUMAH_BELAJAR: { label: SUB_PROGRAM_LABELS.RUMAH_BELAJAR, Icon: BookOpen },
  PEKARANGAN_PRODUKTIF: { label: SUB_PROGRAM_LABELS.PEKARANGAN_PRODUKTIF, Icon: Sprout },
  PENGELOLAAN_SAMPAH: { label: SUB_PROGRAM_LABELS.PENGELOLAAN_SAMPAH, Icon: Trash2 },
  PENERANGAN_JALAN: { label: SUB_PROGRAM_LABELS.PENERANGAN_JALAN, Icon: Lightbulb },
};

export function KknCard({ program }: { program: KKNProgram }) {
  const meta = SUB_PROGRAM_META[program.subProgram];
  const Icon = meta?.Icon ?? BookOpen;

  return (
    <Card className="group relative flex h-full flex-col transition-shadow hover:shadow-md">
      <Thumbnail
        src={program.thumbnail}
        alt={program.title}
        sizes="(min-width: 1024px) 20rem, (min-width: 768px) 50vw, 100vw"
      />

      <CardBody className="flex flex-1 flex-col gap-2">
        <p className="flex items-center gap-2 text-sm font-medium text-accent">
          <Icon className="size-4 shrink-0" aria-hidden="true" />
          {meta?.label ?? "Program KKN"}
        </p>

        <h3 className="font-semibold text-pretty">
          <Link
            href={`/program-kkn/${program.slug}`}
            className="after:absolute after:inset-0 group-hover:text-accent"
          >
            {program.title}
          </Link>
        </h3>

        <p className="text-muted">{excerpt(program.description, 110)}</p>

        {program._count ? (
          <p className="mt-auto pt-2 text-sm text-muted">
            {program._count.activities} kegiatan terdokumentasi
          </p>
        ) : null}
      </CardBody>
    </Card>
  );
}
