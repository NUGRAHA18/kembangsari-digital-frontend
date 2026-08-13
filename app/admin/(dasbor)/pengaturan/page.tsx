import type { Metadata } from "next";
import { Alert } from "@/components/ui/alert";
import { PageHero } from "@/features/admin/page-hero";
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
      <PageHero
        title="Pengaturan"
        description="Identitas situs, kontak, media sosial, dan tampilan awal peta. Perubahannya terlihat di seluruh halaman portal, termasuk navbar dan footer."
      />

      {message ? <Alert tone="success">{message}</Alert> : null}

      <SettingsForm settings={settings} />
    </div>
  );
}
