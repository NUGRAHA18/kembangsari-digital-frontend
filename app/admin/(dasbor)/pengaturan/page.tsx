import type { Metadata } from "next";
import { Alert } from "@/components/ui/alert";
import { SettingsForm } from "@/features/admin/settings-form";
import { fetchAsAdmin } from "@/lib/admin-fetch";
import { readParam, type RawSearchParams } from "@/lib/page-params";
import { getSettingsAsAdmin } from "@/services/settings";

export const metadata: Metadata = { title: "Pengaturan" };

const MESSAGES: Record<string, string> = {
  disimpan: "Pengaturan berhasil disimpan.",
};

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const message = MESSAGES[readParam(await searchParams, "pesan") ?? ""];

  // ARRAY POLOS berisi pasangan key-value, bukan `{ data, meta }`.
  const settings = await fetchAsAdmin(getSettingsAsAdmin());

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Pengaturan</h1>
        <p className="mt-1 text-muted text-pretty">
          Identitas situs, kontak, media sosial, dan tampilan awal peta. Perubahannya terlihat
          di seluruh halaman portal, termasuk navbar dan footer.
        </p>
      </div>

      {message ? <Alert tone="success">{message}</Alert> : null}

      <SettingsForm settings={settings} />
    </div>
  );
}
