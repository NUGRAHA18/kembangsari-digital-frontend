import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PotentialForm } from "@/features/admin/potential-form";

export const metadata: Metadata = { title: "Tambah Potensi" };

export default function NewPotentialPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/admin/potensi"
          className="inline-flex min-h-11 items-center gap-2 text-muted hover:text-accent"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Kembali ke daftar potensi
        </Link>
        <h1 className="mt-2 text-2xl font-bold tracking-tight">Tambah Potensi</h1>
        <p className="mt-1 text-muted text-pretty">
          Gambar dokumentasinya diunggah setelah data potensinya tersimpan.
        </p>
      </div>

      <PotentialForm />
    </div>
  );
}
