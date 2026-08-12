import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { deleteResidentAction } from "@/app/admin/(dasbor)/rumah/actions";
import { FAMILY_RELATION_LABELS } from "@/features/house/relations";
import { residentLabel } from "@/features/house/house";
import { fetchAsAdmin } from "@/lib/admin-fetch";
import { requireSession } from "@/lib/session";
import { getHouseByIdAsAdmin } from "@/services/house";

export const metadata: Metadata = { title: "Hapus Warga" };

export default async function DeleteResidentPage({
  params,
}: {
  params: Promise<{ id: string; residentId: string }>;
}) {
  const { token } = await requireSession();
  const { id, residentId } = await params;

  const house = await fetchAsAdmin(getHouseByIdAsAdmin(id, token));

  const families = house.families ?? [];
  const family = families.find((item) =>
    (item.residents ?? []).some((resident) => resident.id === residentId),
  );
  const resident = family?.residents?.find((item) => item.id === residentId);

  if (!family || !resident) notFound();

  const isHead = resident.relation === "KEPALA_KELUARGA";
  const remaining = (family.residents ?? []).filter((item) => item.id !== resident.id);

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6">
      <h1 className="text-2xl font-bold tracking-tight">Hapus warga ini?</h1>

      <Card>
        <CardBody className="flex flex-col gap-2">
          <p className="font-medium text-pretty">{residentLabel(resident)}</p>
          <p className="text-sm text-muted">{FAMILY_RELATION_LABELS[resident.relation]}</p>
          <p className="text-sm text-muted text-pretty">
            Di rumah {house.label} — RT {house.rt} / RW {house.rw}
          </p>
        </CardBody>
      </Card>

      {/* Kepala keluarga tidak pernah kosong: backend mengangkat penghuni
          teratas menurut `order` sebagai penggantinya. "Teratas" berarti
          teratas, bukan tertua — jadi pengelola perlu tahu siapa yang akan
          naik, bukan diberi tahu setelahnya. */}
      {isHead && remaining.length > 0 ? (
        <Alert tone="error">
          Warga ini kepala keluarga. Setelah dihapus, {remaining[0].name} otomatis menggantikannya —
          periksa lagi hubungan keluarganya setelah ini.
        </Alert>
      ) : null}

      {isHead && remaining.length === 0 ? (
        <Alert>
          Ini satu-satunya penghuni. Kartu keluarganya akan tersisa tanpa warga sama sekali.
        </Alert>
      ) : null}

      <p className="text-muted text-pretty">Menghapus tidak bisa dibatalkan.</p>

      <form action={deleteResidentAction} className="flex flex-wrap gap-3">
        <input type="hidden" name="houseId" value={house.id} />
        <input type="hidden" name="houseSlug" value={house.slug} />
        <input type="hidden" name="residentId" value={resident.id} />

        <Button type="submit" size="lg" className="bg-error hover:brightness-95">
          <Trash2 className="size-5" aria-hidden="true" />
          Ya, Hapus
        </Button>

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
