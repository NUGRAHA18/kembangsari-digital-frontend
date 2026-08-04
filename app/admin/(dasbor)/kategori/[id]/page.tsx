import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card, CardBody } from "@/components/ui/card";
import { CategoryForm } from "@/features/admin/category-form";
import { fetchAsAdmin } from "@/lib/admin-fetch";
import { getNewsCategoryById } from "@/services/news";

export const metadata: Metadata = { title: "Ubah Kategori" };

type Props = { params: Promise<{ id: string }> };

export default async function EditCategoryPage({ params }: Props) {
  const { id } = await params;
  const category = await fetchAsAdmin(getNewsCategoryById(id));

  const newsCount = category._count?.news ?? 0;

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-6">
      <div>
        <Link
          href="/admin/kategori"
          className="inline-flex min-h-11 items-center gap-2 text-muted hover:text-accent"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Kembali ke daftar kategori
        </Link>
        <h1 className="mt-2 text-2xl font-bold tracking-tight">Ubah Kategori</h1>
        <p className="mt-1 text-muted">
          {newsCount === 0 ? "Belum dipakai berita mana pun." : `Dipakai ${newsCount} berita.`}
        </p>
      </div>

      <Card>
        <CardBody>
          <CategoryForm category={category} />
        </CardBody>
      </Card>

      {newsCount > 0 ? (
        <p className="text-sm text-muted text-pretty">
          Mengubah slug akan mengubah alamat filter kategori ini. Tautan lama seperti{" "}
          <span className="break-all">/berita?kategori={category.slug}</span> akan berhenti
          menyaring dan menampilkan seluruh berita.
        </p>
      ) : null}
    </div>
  );
}
