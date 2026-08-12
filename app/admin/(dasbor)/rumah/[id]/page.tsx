import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Trash2 } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { HouseFamilies } from "@/features/admin/house-families";
import { HouseForm } from "@/features/admin/house-form";
import { fetchAsAdmin } from "@/lib/admin-fetch";
import { readParam, type RawSearchParams } from "@/lib/page-params";
import { requireSession } from "@/lib/session";
import { getHouseByIdAsAdmin } from "@/services/house";

export const metadata: Metadata = { title: "Kelola Rumah" };

const MESSAGES: Record<string, string> = {
  "kk-disimpan": "Kartu keluarga berhasil disimpan.",
  "kk-dihapus": "Kartu keluarga berhasil dihapus beserta penghuninya.",
  "warga-disimpan": "Data warga berhasil disimpan.",
  "warga-dihapus": "Warga berhasil dihapus dari kartu keluarga.",
};

export default async function EditHousePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<RawSearchParams>;
}) {
  const { token } = await requireSession();
  const { id } = await params;
  const query = await searchParams;

  const house = await fetchAsAdmin(getHouseByIdAsAdmin(id, token));

  const message = MESSAGES[readParam(query, "pesan") ?? ""];
  // Form KK dan warga adalah form server biasa, jadi galatnya dibawa lewat
  // alamat halaman ini — bukan dikembalikan sebagai state.
  const error = readParam(query, "galat");

  return (
    <div className="flex flex-col gap-8">
      <div>
        <Link
          href="/admin/rumah"
          className="inline-flex min-h-11 items-center gap-2 text-muted hover:text-accent"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Kembali ke daftar rumah
        </Link>

        <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-pretty">{house.label}</h1>
            <p className="mt-1 text-muted">
              RT {house.rt} / RW {house.rw}
            </p>
          </div>

          <div className="flex flex-wrap gap-1">
            <Link
              href={`/peta/rumah/${house.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center gap-2 rounded-xl px-3 text-muted transition-colors hover:bg-surface-muted"
            >
              <ExternalLink className="size-4" aria-hidden="true" />
              Lihat halaman warganya
            </Link>

            <Link
              href={`/admin/rumah/${house.id}/hapus`}
              className="inline-flex min-h-11 items-center gap-2 rounded-xl px-3 text-error transition-colors hover:bg-surface-muted"
            >
              <Trash2 className="size-4" aria-hidden="true" />
              Hapus
            </Link>
          </div>
        </div>
      </div>

      {message ? <Alert tone="success">{message}</Alert> : null}
      {error ? <Alert tone="error">{error}</Alert> : null}

      <HouseFamilies house={house} />

      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-bold tracking-tight">Data Rumah</h2>
        <HouseForm house={house} />
      </div>
    </div>
  );
}
