import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { SubmitButton } from "@/components/ui/submit-button";
import { Card, CardBody } from "@/components/ui/card";
import { deleteFamilyAction } from "@/app/admin/(dasbor)/rumah/actions";
import { residentLabel } from "@/features/house/house";
import { fetchAsAdmin } from "@/lib/admin-fetch";
import { requireSession } from "@/lib/session";
import { getHouseByIdAsAdmin } from "@/services/house";

export const metadata: Metadata = { title: "Hapus Kartu Keluarga" };

export default async function DeleteFamilyPage({
  params,
}: {
  params: Promise<{ id: string; familyId: string }>;
}) {
  const { token } = await requireSession();
  const { id, familyId } = await params;

  // Satu permintaan sudah membawa seluruh KK beserta penghuninya, jadi tidak
  // ada endpoint `GET /house/family/:id` yang perlu dipanggil terpisah.
  const house = await fetchAsAdmin(getHouseByIdAsAdmin(id, token));
  const families = house.families ?? [];
  const index = families.findIndex((item) => item.id === familyId);

  if (index < 0) notFound();

  const family = families[index];
  const residents = family.residents ?? [];

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6">
      <h1 className="text-2xl font-bold tracking-tight">Hapus kartu keluarga ini?</h1>

      <Card>
        <CardBody className="flex flex-col gap-2">
          <p className="font-medium">KK {index + 1}</p>
          {family.kkNumber ? (
            <p className="text-sm text-muted">Nomor KK {family.kkNumber}</p>
          ) : null}
          <p className="text-sm text-muted text-pretty">
            Di rumah {house.label} — RT {house.rt} / RW {house.rw}
          </p>

          {residents.length > 0 ? (
            <ul className="mt-2 flex flex-col gap-1 text-muted">
              {residents.map((resident) => (
                <li key={resident.id}>{residentLabel(resident)}</li>
              ))}
            </ul>
          ) : null}
        </CardBody>
      </Card>

      {residents.length > 0 ? (
        <Alert tone="error">
          {residents.length} data warga di kartu keluarga ini akan ikut terhapus.
        </Alert>
      ) : null}

      <p className="text-muted text-pretty">
        Menghapus tidak bisa dibatalkan. Kalau yang ingin dibetulkan hanya nomor KK-nya, tutup
        halaman ini dan sunting langsung di halaman rumahnya.
      </p>

      <form action={deleteFamilyAction} className="flex flex-wrap gap-3">
        <input type="hidden" name="houseId" value={house.id} />
        <input type="hidden" name="houseSlug" value={house.slug} />
        <input type="hidden" name="familyId" value={family.id} />

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
