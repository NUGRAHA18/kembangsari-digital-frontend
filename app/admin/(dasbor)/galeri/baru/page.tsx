import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AlbumForm } from "@/features/admin/album-form";

export const metadata: Metadata = { title: "Buat Album" };

export default function NewAlbumPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/admin/galeri"
          className="inline-flex min-h-11 items-center gap-2 text-muted hover:text-accent"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Kembali ke daftar album
        </Link>
        <h1 className="mt-2 text-2xl font-bold tracking-tight">Buat Album</h1>
        <p className="mt-1 text-muted text-pretty">
          Fotonya diunggah setelah album tersimpan.
        </p>
      </div>

      <AlbumForm />
    </div>
  );
}
