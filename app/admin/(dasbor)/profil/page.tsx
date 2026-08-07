import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, FileText, PenSquare, Plus } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/states";
import { fetchAsAdmin } from "@/lib/admin-fetch";
import { excerpt, stripMarkdown } from "@/lib/format";
import { readParam, type RawSearchParams } from "@/lib/page-params";
import { getProfilesAsAdmin } from "@/services/profile";

export const metadata: Metadata = { title: "Profil" };

const MESSAGES: Record<string, string> = {
  dihapus: "Halaman profil berhasil dihapus.",
};

export default async function AdminProfilePage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const message = MESSAGES[readParam(await searchParams, "pesan") ?? ""];

  // ARRAY POLOS dan tidak dipaginasi: halaman profil hanya beberapa buah.
  const profiles = await fetchAsAdmin(getProfilesAsAdmin());

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Profil</h1>
          <p className="mt-1 text-muted text-pretty">
            {profiles.length} halaman profil padukuhan — sejarah, visi misi, letak geografis,
            dan susunan perangkat. Tidak ada status draf di sini: setiap perubahan langsung
            terlihat warga.
          </p>
        </div>

        <ButtonLink href="/admin/profil/baru">
          <Plus className="size-5" aria-hidden="true" />
          Tambah Halaman
        </ButtonLink>
      </div>

      {message ? <Alert tone="success">{message}</Alert> : null}

      {/* Tanpa badge terbit/draf: model `Profile` memang tidak punya kolom
          statusnya, jadi tidak ada yang bisa ditampilkan di sana. */}
      {profiles.length > 0 ? (
        <ul className="flex flex-col gap-3">
          {profiles.map((profile) => (
            <li key={profile.id}>
              <Card>
                <CardBody className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center">
                  <span
                    aria-hidden="true"
                    className="grid size-12 shrink-0 place-items-center rounded-xl bg-surface-muted"
                  >
                    <FileText className="size-5 text-muted" />
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-pretty">{profile.title}</p>
                    <p className="text-sm text-muted">
                      <span className="break-all">/profil/{profile.slug}</span>
                    </p>
                    <p className="text-sm text-muted text-pretty">
                      {excerpt(stripMarkdown(profile.content), 120)}
                    </p>
                  </div>

                  <div className="flex shrink-0 flex-wrap gap-1">
                    <Link
                      href={`/profil/${profile.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-11 items-center gap-2 rounded-xl px-3 text-muted transition-colors hover:bg-surface-muted"
                    >
                      <ExternalLink className="size-4" aria-hidden="true" />
                      <span className="sr-only lg:not-sr-only">Lihat</span>
                    </Link>

                    <Link
                      href={`/admin/profil/${profile.slug}`}
                      className="inline-flex min-h-11 items-center gap-2 rounded-xl px-3 transition-colors hover:bg-surface-muted"
                    >
                      <PenSquare className="size-4" aria-hidden="true" />
                      Ubah
                    </Link>
                  </div>
                </CardBody>
              </Card>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          title="Belum ada halaman profil"
          description="Tambahkan halaman sejarah atau visi misi untuk mulai mengisi menu Profil."
        />
      )}
    </div>
  );
}
