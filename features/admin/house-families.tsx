import Link from "next/link";
import { AlertTriangle, Plus, Trash2, UserPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody } from "@/components/ui/card";
import { inputClasses } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import { saveFamilyAction, saveResidentAction } from "@/app/admin/(dasbor)/rumah/actions";
import {
  FAMILY_RELATION_LABELS,
  FAMILY_RELATIONS,
  needsRelationReview,
} from "@/features/house/relations";
import { ageFromBirthYear } from "@/features/house/house";
import { cn } from "@/lib/utils";
import type { Family, House, Resident } from "@/types/api";

/**
 * Kartu keluarga dan penghuni sebuah rumah.
 *
 * Seluruhnya **Server Component dengan form biasa**, tanpa satu pun Client
 * Component. Satu rumah bisa berisi beberapa KK dan belasan warga, masing-masing
 * dengan formnya sendiri; menjadikannya komponen klien berarti mengirim belasan
 * salinan React ke browser demi dua isian per baris. Konsekuensinya formnya
 * juga tetap bekerja tanpa JavaScript — yang memang bukan kemewahan bagi
 * pendata yang mengisinya dari ponsel di lapangan.
 */
export function HouseFamilies({ house }: { house: House }) {
  const families = house.families ?? [];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-xl font-bold tracking-tight">Kartu Keluarga</h2>
        <p className="text-muted">
          {families.length} KK ·{" "}
          {families.reduce((sum, family) => sum + (family.residents?.length ?? 0), 0)} jiwa
        </p>
      </div>

      {families.length === 0 ? (
        <p className="text-muted text-pretty">
          Belum ada kartu keluarga di rumah ini. Tambahkan satu lebih dulu, baru penghuninya bisa
          didata.
        </p>
      ) : null}

      {families.map((family, index) => (
        <FamilyCard key={family.id} house={house} family={family} index={index} />
      ))}

      <Card>
        <CardBody>
          <form action={saveFamilyAction} className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <input type="hidden" name="houseId" value={house.id} />
            <input type="hidden" name="houseSlug" value={house.slug} />

            <div className="flex flex-1 flex-col gap-1.5">
              <label htmlFor="kkNumber-baru" className="font-medium">
                Tambah kartu keluarga
              </label>
              <input
                id="kkNumber-baru"
                name="kkNumber"
                maxLength={50}
                placeholder="Nomor KK (boleh dikosongkan)"
                className={inputClasses}
              />
            </div>

            <SubmitButton variant="outline" pendingLabel="Menyimpan…">
              <Plus className="size-5" aria-hidden="true" />
              Tambah KK
            </SubmitButton>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}

function FamilyCard({ house, family, index }: { house: House; family: Family; index: number }) {
  const residents = family.residents ?? [];

  return (
    <Card>
      <CardBody className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-semibold">KK {index + 1}</h3>

          <form action={saveFamilyAction} className="flex flex-wrap items-center gap-2">
            <input type="hidden" name="houseId" value={house.id} />
            <input type="hidden" name="houseSlug" value={house.slug} />
            <input type="hidden" name="familyId" value={family.id} />

            <label htmlFor={`kk-${family.id}`} className="sr-only">
              Nomor kartu keluarga
            </label>
            <input
              id={`kk-${family.id}`}
              name="kkNumber"
              maxLength={50}
              defaultValue={family.kkNumber ?? ""}
              placeholder="Nomor KK"
              className={cn(inputClasses, "w-48")}
            />

            <SubmitButton variant="outline" pendingLabel="Menyimpan…">
              Simpan
            </SubmitButton>

            <Link
              href={`/admin/rumah/${house.id}/kk/${family.id}/hapus`}
              className="inline-flex min-h-11 items-center gap-2 rounded-xl px-3 text-error transition-colors hover:bg-surface-muted"
            >
              <Trash2 className="size-4" aria-hidden="true" />
              Hapus KK
            </Link>
          </form>
        </div>

        {residents.length === 0 ? (
          <p className="text-muted text-pretty">
            Belum ada penghuni. Warga pertama yang ditambahkan otomatis menjadi kepala keluarga.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {residents.map((resident) => (
              <li key={resident.id}>
                <ResidentRow house={house} resident={resident} />
              </li>
            ))}
          </ul>
        )}

        <div className="rounded-xl border border-dashed border-border p-3">
          <ResidentFields house={house} familyId={family.id} />
        </div>
      </CardBody>
    </Card>
  );
}

function ResidentRow({ house, resident }: { house: House; resident: Resident }) {
  const age = ageFromBirthYear(resident.birthYear);

  return (
    <div className="flex flex-col gap-2 rounded-xl bg-surface-muted p-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className={cn("font-medium", resident.relation === "KEPALA_KELUARGA" && "font-bold")}>
          {resident.name}
          {age === null ? "" : ` (${age} th)`}
        </span>

        {resident.relation === "KEPALA_KELUARGA" ? (
          <Badge tone="primary">Kepala keluarga</Badge>
        ) : null}

        {/* `LAINNYA` bukan sekadar salah satu pilihan: backend menyetelnya
            sendiri ketika kepala keluarga berpindah, dan artinya "hubungan
            aslinya menunggu dibetulkan pendata". Kalau ditampilkan seperti
            keterangan biasa, baris ini akan terlewat selamanya. */}
        {needsRelationReview(resident.relation) ? (
          <span className="inline-flex items-center gap-1.5 text-sm text-error">
            <AlertTriangle className="size-4" aria-hidden="true" />
            Hubungan keluarganya belum ditentukan
          </span>
        ) : null}
      </div>

      <ResidentFields house={house} resident={resident} />
    </div>
  );
}

/**
 * Isian satu warga — dipakai baris yang sudah ada maupun baris tambah baru.
 * `residentId` yang kosong berarti menambah.
 */
function ResidentFields({
  house,
  familyId,
  resident,
}: {
  house: House;
  familyId?: string;
  resident?: Resident;
}) {
  const prefix = resident ? `warga-${resident.id}` : `warga-baru-${familyId}`;

  return (
    <form action={saveResidentAction} className="flex flex-wrap items-end gap-2">
      <input type="hidden" name="houseId" value={house.id} />
      <input type="hidden" name="houseSlug" value={house.slug} />
      {resident ? <input type="hidden" name="residentId" value={resident.id} /> : null}
      {familyId ? <input type="hidden" name="familyId" value={familyId} /> : null}

      <div className="flex min-w-40 flex-1 flex-col gap-1.5">
        <label htmlFor={`${prefix}-nama`} className="text-sm font-medium">
          Nama
        </label>
        <input
          id={`${prefix}-nama`}
          name="name"
          required
          maxLength={150}
          defaultValue={resident?.name ?? ""}
          className={inputClasses}
        />
      </div>

      <div className="flex w-28 flex-col gap-1.5">
        <label htmlFor={`${prefix}-tahun`} className="text-sm font-medium">
          Tahun lahir
        </label>
        <input
          id={`${prefix}-tahun`}
          name="birthYear"
          inputMode="numeric"
          defaultValue={resident?.birthYear ?? ""}
          placeholder="1982"
          className={inputClasses}
        />
      </div>

      <div className="flex w-36 flex-col gap-1.5">
        <label htmlFor={`${prefix}-hubungan`} className="text-sm font-medium">
          Hubungan
        </label>
        <select
          id={`${prefix}-hubungan`}
          name="relation"
          defaultValue={resident?.relation ?? "ANAK"}
          className={cn(inputClasses, "appearance-none")}
        >
          {FAMILY_RELATIONS.map((relation) => (
            <option key={relation} value={relation}>
              {FAMILY_RELATION_LABELS[relation]}
            </option>
          ))}
        </select>
      </div>

      <div className="flex w-32 flex-col gap-1.5">
        <label htmlFor={`${prefix}-gender`} className="text-sm font-medium">
          Jenis kelamin
        </label>
        <select
          id={`${prefix}-gender`}
          name="gender"
          defaultValue={resident?.gender ?? ""}
          className={cn(inputClasses, "appearance-none")}
        >
          <option value="">Belum didata</option>
          <option value="LAKI_LAKI">Laki-laki</option>
          <option value="PEREMPUAN">Perempuan</option>
        </select>
      </div>

      <SubmitButton variant="outline" pendingLabel="Menyimpan…">
        {resident ? (
          "Simpan"
        ) : (
          <>
            <UserPlus className="size-5" aria-hidden="true" />
            Tambah warga
          </>
        )}
      </SubmitButton>

      {resident ? (
        <Link
          href={`/admin/rumah/${house.id}/warga/${resident.id}/hapus`}
          className="inline-flex min-h-11 items-center gap-2 rounded-xl px-3 text-error transition-colors hover:bg-surface-muted"
        >
          <Trash2 className="size-4" aria-hidden="true" />
          <span className="sr-only">Hapus {resident.name}</span>
        </Link>
      ) : null}
    </form>
  );
}
