import type { Metadata } from "next";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { SubmitButton } from "@/components/ui/submit-button";
import { Card, CardBody } from "@/components/ui/card";
import { deleteCategoryAction } from "@/app/admin/(dasbor)/kategori/actions";
import { fetchAsAdmin } from "@/lib/admin-fetch";
import { getNewsCategoryById } from "@/services/news";

export const metadata: Metadata = { title: "Hapus Kategori" };

type Props = { params: Promise<{ id: string }> };

export default async function DeleteCategoryPage({ params }: Props) {
  const { id } = await params;
  const category = await fetchAsAdmin(getNewsCategoryById(id));

  const newsCount = category._count?.news ?? 0;

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6">
      <h1 className="text-2xl font-bold tracking-tight">Hapus kategori ini?</h1>

      <Card>
        <CardBody className="flex flex-col gap-1">
          <p className="font-medium">{category.name}</p>
          <p className="text-muted">/{category.slug}</p>
        </CardBody>
      </Card>

      {newsCount > 0 ? (
        // Pemeriksaan ini diulang di sini, bukan hanya di daftar: alamat
        // halaman ini bisa dibuka langsung, dan berita bisa saja baru
        // dipindahkan ke kategori ini sejak daftarnya dimuat.
        <>
          <Alert tone="error">
            Kategori ini masih dipakai {newsCount} berita, jadi tidak bisa dihapus. Pindahkan
            berita-berita itu ke kategori lain terlebih dahulu.
          </Alert>

          <Link
            href={`/admin/berita?kategori=${category.slug}`}
            className="inline-flex min-h-11 w-fit items-center rounded-xl border border-border px-4 transition-colors hover:bg-surface-muted"
          >
            Lihat berita di kategori ini
          </Link>
        </>
      ) : (
        <>
          <p className="text-muted text-pretty">
            Kategori ini belum dipakai berita mana pun, jadi menghapusnya tidak menghilangkan
            tulisan apa pun. Tindakan ini tidak bisa dibatalkan.
          </p>

          <form action={deleteCategoryAction} className="flex flex-wrap gap-3">
            <input type="hidden" name="id" value={category.id} />

            <SubmitButton size="lg" pendingLabel="Menghapus…" className="bg-error hover:brightness-95">
              <Trash2 className="size-5" aria-hidden="true" />
              Ya, Hapus
            </SubmitButton>

            <Link
              href="/admin/kategori"
              className="inline-flex min-h-11 items-center rounded-xl px-4 text-muted transition-colors hover:bg-surface-muted"
            >
              Batal
            </Link>
          </form>
        </>
      )}

      {newsCount > 0 ? (
        <Link
          href="/admin/kategori"
          className="inline-flex min-h-11 w-fit items-center text-muted hover:text-accent"
        >
          Kembali ke daftar kategori
        </Link>
      ) : null}
    </div>
  );
}
