import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Trash2 } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { ProfileForm } from "@/features/admin/profile-form";
import { fetchAsAdmin } from "@/lib/admin-fetch";
import { formatDate } from "@/lib/format";
import { readParam, type RawSearchParams } from "@/lib/page-params";
import { getProfileBySlugAsAdmin } from "@/services/profile";

export const metadata: Metadata = { title: "Ubah Halaman Profil" };

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<RawSearchParams>;
};

const MESSAGES: Record<string, string> = {
  dibuat: "Halaman profil berhasil disimpan.",
  diperbarui: "Perubahan berhasil disimpan.",
};

export default async function EditProfilePage({ params, searchParams }: Props) {
  const { slug } = await params;
  const message = MESSAGES[readParam(await searchParams, "pesan") ?? ""];

  const profile = await fetchAsAdmin(getProfileBySlugAsAdmin(slug));

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

        <h1 className="mt-2 text-2xl font-bold tracking-tight text-pretty">{profile.title}</h1>

        <p className="mt-2 text-sm text-muted">
          Terakhir diperbarui {formatDate(profile.updatedAt)}
        </p>

        <div className="mt-2 flex flex-wrap gap-1">
          <Link
            href={`/profil/${profile.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center gap-2 rounded-xl px-3 text-muted transition-colors hover:bg-surface-muted"
          >
            <ExternalLink className="size-4" aria-hidden="true" />
            Lihat di portal
          </Link>

          <Link
            href={`/admin/profil/${profile.slug}/hapus`}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl px-3 text-error transition-colors hover:bg-error/10"
          >
            <Trash2 className="size-4" aria-hidden="true" />
            Hapus Halaman
          </Link>
        </div>
      </div>

      {message ? <Alert tone="success">{message}</Alert> : null}

      <ProfileForm profile={profile} />
    </div>
  );
}
