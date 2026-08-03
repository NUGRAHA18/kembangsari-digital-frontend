import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { NewsForm } from "@/features/admin/news-form";
import { fetchAsAdmin } from "@/lib/admin-fetch";
import { getNewsCategories } from "@/services/news";

export const metadata: Metadata = { title: "Tulis Berita" };

export default async function NewNewsPage() {
  const categories = await fetchAsAdmin(getNewsCategories());

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/admin/berita"
          className="inline-flex min-h-11 items-center gap-2 text-muted hover:text-accent"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Kembali ke daftar berita
        </Link>
        <h1 className="mt-2 text-2xl font-bold tracking-tight">Tulis Berita</h1>
      </div>

      {categories.length > 0 ? (
        <NewsForm categories={categories} />
      ) : (
        // Kategori wajib diisi saat menyimpan, jadi tanpa satu pun kategori
        // form ini tidak akan pernah bisa dikirim.
        <Alert tone="error">
          Belum ada kategori berita. Kategori harus dibuat lebih dulu lewat backend sebelum berita
          bisa ditulis.
        </Alert>
      )}
    </div>
  );
}
