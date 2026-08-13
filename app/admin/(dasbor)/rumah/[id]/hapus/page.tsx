import type { Metadata } from "next";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { SubmitButton } from "@/components/ui/submit-button";
import { Card, CardBody } from "@/components/ui/card";
import { deleteHouseAction } from "@/app/admin/(dasbor)/rumah/actions";
import { houseTally } from "@/features/house/house";
import { fetchAsAdmin } from "@/lib/admin-fetch";
import { requireSession } from "@/lib/session";
import { getHouseByIdAsAdmin } from "@/services/house";

export const metadata: Metadata = { title: "Hapus Rumah" };

export default async function DeleteHousePage({ params }: { params: Promise<{ id: string }> }) {
  const { token } = await requireSession();
  const { id } = await params;

  const house = await fetchAsAdmin(getHouseByIdAsAdmin(id, token));

  const families = house._count?.families ?? house.families?.length ?? 0;
  const residents = house._count?.residents ?? 0;

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6">
      <h1 className="text-2xl font-bold tracking-tight">Hapus rumah ini?</h1>

      <Card>
        <CardBody className="flex flex-col gap-2">
          <p className="font-medium text-pretty">{house.label}</p>
          <p className="text-sm text-muted">
            RT {house.rt} / RW {house.rw} · {houseTally(house)}
          </p>
          {house.address ? <p className="text-muted text-pretty">{house.address}</p> : null}
          <p className="text-sm text-muted">
            {house.latitude}, {house.longitude}
          </p>
        </CardBody>
      </Card>

      {/* Berantai di tingkat basis data, satu pernyataan DELETE — jadi tidak
          mungkin tertinggal KK yatim kalau koneksinya putus di tengah jalan.
          Diperingatkan, bukan diblokir: memblokirnya berarti memaksa pengelola
          menghapus belasan baris satu per satu lebih dulu. */}
      {families > 0 ? (
        <Alert tone="error">
          {families} kartu keluarga dan {residents} data warga di rumah ini akan ikut terhapus.
        </Alert>
      ) : null}

      <p className="text-muted text-pretty">
        Kalau rumahnya hanya sedang tidak ingin ditampilkan, buka halaman kelola dan hilangkan
        centang &ldquo;Tampilkan di peta warga&rdquo; — datanya tetap tersimpan dan bisa ditampilkan
        lagi. Menghapus tidak bisa dibatalkan.
      </p>

      <form action={deleteHouseAction} className="flex flex-wrap gap-3">
        <input type="hidden" name="id" value={house.id} />
        <input type="hidden" name="slug" value={house.slug} />

        <SubmitButton size="lg" pendingLabel="Menghapus…" className="bg-error hover:brightness-95">
          <Trash2 className="size-5" aria-hidden="true" />
          Ya, Hapus
        </SubmitButton>

        <Link
          href={`/admin/rumah/${house.id}`}
          className="inline-flex min-h-11 items-center rounded-xl px-4 text-muted transition-colors hover:bg-surface-muted"
        >
          Batal
        </Link>
      </form>
    </div>
  );
}
