import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { UmkmForm } from "@/features/admin/umkm-form";

export const metadata: Metadata = { title: "Tambah UMKM" };

export default function NewUmkmPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/admin/umkm"
          className="inline-flex min-h-11 items-center gap-2 text-muted hover:text-accent"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Kembali ke daftar UMKM
        </Link>
        <h1 className="mt-2 text-2xl font-bold tracking-tight">Tambah UMKM</h1>
        <p className="mt-1 text-muted text-pretty">
          Gambarnya diunggah setelah data usahanya tersimpan.
        </p>
      </div>

      <UmkmForm />
    </div>
  );
}
