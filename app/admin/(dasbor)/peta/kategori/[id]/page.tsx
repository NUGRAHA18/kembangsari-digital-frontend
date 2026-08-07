import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card, CardBody } from "@/components/ui/card";
import { MapCategoryForm } from "@/features/admin/map-category-form";
import { fetchAsAdmin } from "@/lib/admin-fetch";
import { getMapCategoryById } from "@/services/maps";

export const metadata: Metadata = { title: "Ubah Kategori Lokasi" };

type Props = { params: Promise<{ id: string }> };

export default async function EditMapCategoryPage({ params }: Props) {
  const { id } = await params;
  const category = await fetchAsAdmin(getMapCategoryById(id));

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-6">
      <div>
        <Link
          href="/admin/peta/kategori"
          className="inline-flex min-h-11 items-center gap-2 text-muted hover:text-accent"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Kembali ke daftar kategori
        </Link>

        <h1 className="mt-2 text-2xl font-bold tracking-tight text-pretty">{category.name}</h1>
      </div>

      <Card>
        <CardBody>
          <MapCategoryForm category={category} />
        </CardBody>
      </Card>

      <Link
        href={`/admin/peta/kategori/${category.id}/hapus`}
        className="inline-flex min-h-11 w-fit items-center rounded-xl px-3 text-error transition-colors hover:bg-error/10"
      >
        Hapus kategori ini
      </Link>
    </div>
  );
}
