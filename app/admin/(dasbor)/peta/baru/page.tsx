import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { MarkerForm } from "@/features/admin/marker-form";
import { fetchAsAdmin } from "@/lib/admin-fetch";
import { getMapCategoriesUncached } from "@/services/maps";

export const metadata: Metadata = { title: "Tambah Lokasi" };

export default async function NewMarkerPage() {
  // Kategori diambil di server, bukan di form: daftarnya dipakai juga oleh
  // Server Action untuk memeriksa id kategori yang dikirim.
  const categories = await fetchAsAdmin(getMapCategoriesUncached());

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/admin/peta"
          className="inline-flex min-h-11 items-center gap-2 text-muted hover:text-accent"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Kembali ke daftar lokasi
        </Link>

        <h1 className="mt-2 text-2xl font-bold tracking-tight">Tambah Titik Lokasi</h1>
      </div>

      <MarkerForm categories={categories} />
    </div>
  );
}
