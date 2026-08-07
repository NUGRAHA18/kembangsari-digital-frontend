import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { MonographyForm } from "@/features/admin/monography-form";

export const metadata: Metadata = { title: "Tambah Data Monografi" };

export default function NewMonographyPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/admin/monografi"
          className="inline-flex min-h-11 items-center gap-2 text-muted hover:text-accent"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Kembali ke daftar tahun
        </Link>

        <h1 className="mt-2 text-2xl font-bold tracking-tight">Tambah Data Monografi</h1>
        <p className="mt-1 text-muted text-pretty">
          Isi kolom yang datanya sudah ada. Kolom lain bisa dilengkapi kemudian tanpa
          mengganggu yang sudah tersimpan.
        </p>
      </div>

      <MonographyForm />
    </div>
  );
}
