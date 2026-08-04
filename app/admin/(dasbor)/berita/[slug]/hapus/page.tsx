import type { Metadata } from "next";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { deleteNewsAction } from "@/app/admin/(dasbor)/berita/actions";
import { fetchAsAdmin } from "@/lib/admin-fetch";
import { excerpt } from "@/lib/format";
import { requireSession } from "@/lib/session";
import { getNewsBySlugAsAdmin } from "@/services/news";

export const metadata: Metadata = { title: "Hapus Berita" };

type Props = { params: Promise<{ slug: string }> };

/**
 * Konfirmasi penghapusan sebagai halaman tersendiri, bukan dialog `confirm()`.
 *
 * Dialog itu hanya muncul kalau JavaScript berjalan; kalau tidak, tombol hapus
 * akan langsung menghapus tanpa pertanyaan apa pun. Halaman ini juga memberi
 * ruang untuk menampilkan berita mana yang akan hilang — pengaman yang lebih
 * baik daripada kalimat "Anda yakin?" tanpa konteks.
 */
export default async function DeleteNewsPage({ params }: Props) {
  const { token } = await requireSession();
  const { slug } = await params;

  const news = await fetchAsAdmin(getNewsBySlugAsAdmin(slug, token));

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6">
      <h1 className="text-2xl font-bold tracking-tight">Hapus berita ini?</h1>

      <Card>
        <CardBody className="flex flex-col gap-2">
          <p className="font-medium text-pretty">{news.title}</p>
          <p className="text-muted text-pretty">{excerpt(news.content, 200)}</p>
          <p className="text-sm text-muted">
            Status: {news.published ? "sudah terbit" : "masih draf"}
          </p>
        </CardBody>
      </Card>

      <p className="text-muted text-pretty">
        Berita yang dihapus tidak bisa dikembalikan. Kalau hanya ingin menyembunyikannya dari
        warga, buka halaman ubah dan hilangkan centang &ldquo;Terbitkan&rdquo;.
      </p>

      <form action={deleteNewsAction} className="flex flex-wrap gap-3">
        <input type="hidden" name="id" value={news.id} />
        <input type="hidden" name="slug" value={news.slug} />

        <Button type="submit" size="lg" className="bg-error hover:brightness-95">
          <Trash2 className="size-5" aria-hidden="true" />
          Ya, Hapus
        </Button>

        <Link
          href={`/admin/berita/${news.slug}`}
          className="inline-flex min-h-11 items-center rounded-xl px-4 text-muted transition-colors hover:bg-surface-muted"
        >
          Batal
        </Link>
      </form>
    </div>
  );
}
