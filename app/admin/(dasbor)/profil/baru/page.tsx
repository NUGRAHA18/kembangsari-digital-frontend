import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ProfileForm } from "@/features/admin/profile-form";

export const metadata: Metadata = { title: "Tambah Halaman Profil" };

export default function NewProfilePage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/admin/profil"
          className="inline-flex min-h-11 items-center gap-2 text-muted hover:text-accent"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Kembali ke daftar profil
        </Link>

        <h1 className="mt-2 text-2xl font-bold tracking-tight">Tambah Halaman Profil</h1>
        <p className="mt-1 text-muted text-pretty">
          Halaman ini langsung terbaca warga begitu disimpan — tidak ada status draf.
        </p>
      </div>

      <ProfileForm />
    </div>
  );
}
