import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { HouseForm } from "@/features/admin/house-form";

export const metadata: Metadata = { title: "Tambah Rumah" };

export default function NewHousePage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/admin/rumah"
          className="inline-flex min-h-11 items-center gap-2 text-muted hover:text-accent"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Kembali ke daftar rumah
        </Link>

        <h1 className="mt-2 text-2xl font-bold tracking-tight">Tambah Rumah Warga</h1>
        <p className="mt-1 text-muted text-pretty">
          Simpan rumahnya lebih dulu. Kartu keluarga dan penghuninya diisi setelah itu, di halaman
          yang sama.
        </p>
      </div>

      <HouseForm />
    </div>
  );
}
