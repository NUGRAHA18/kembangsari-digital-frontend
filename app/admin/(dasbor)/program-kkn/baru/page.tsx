import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { KknProgramForm } from "@/features/admin/kkn-program-form";

export const metadata: Metadata = { title: "Tambah Program KKN" };

export default function NewKknProgramPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/admin/program-kkn"
          className="inline-flex min-h-11 items-center gap-2 text-muted hover:text-accent"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Kembali ke daftar program
        </Link>
        <h1 className="mt-2 text-2xl font-bold tracking-tight">Tambah Program KKN</h1>
        <p className="mt-1 text-muted text-pretty">
          Dokumentasi kegiatannya ditambahkan setelah programnya tersimpan.
        </p>
      </div>

      <KknProgramForm />
    </div>
  );
}
