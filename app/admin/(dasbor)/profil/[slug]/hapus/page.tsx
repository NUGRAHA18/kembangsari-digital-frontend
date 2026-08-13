import type { Metadata } from "next";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { SubmitButton } from "@/components/ui/submit-button";
import { Card, CardBody } from "@/components/ui/card";
import { deleteProfileAction } from "@/app/admin/(dasbor)/profil/actions";
import { fetchAsAdmin } from "@/lib/admin-fetch";
import { excerpt, stripMarkdown } from "@/lib/format";
import { getProfileBySlugAsAdmin } from "@/services/profile";

export const metadata: Metadata = { title: "Hapus Halaman Profil" };

type Props = { params: Promise<{ slug: string }> };

export default async function DeleteProfilePage({ params }: Props) {
  const { slug } = await params;
  const profile = await fetchAsAdmin(getProfileBySlugAsAdmin(slug));

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6">
      <h1 className="text-2xl font-bold tracking-tight">Hapus halaman profil ini?</h1>

      <Card>
        <CardBody className="flex flex-col gap-2">
          <p className="font-medium text-pretty">{profile.title}</p>
          <p className="text-sm text-muted">
            <span className="break-all">/profil/{profile.slug}</span>
          </p>
          <p className="text-muted text-pretty">
            {excerpt(stripMarkdown(profile.content), 200)}
          </p>
        </CardBody>
      </Card>

      <p className="text-muted text-pretty">
        Halaman ini hilang dari menu Profil dan alamatnya menjadi tidak ditemukan. Tidak ada
        cara mengembalikannya — kalau isinya masih dibutuhkan, salin dulu ke tempat lain.
      </p>

      <form action={deleteProfileAction} className="flex flex-wrap gap-3">
        {/* Slug saja: `DELETE /profile/:idOrSlug` menerima keduanya. */}
        <input type="hidden" name="slug" value={profile.slug} />

        <SubmitButton size="lg" pendingLabel="Menghapus…" className="bg-error hover:brightness-95">
          <Trash2 className="size-5" aria-hidden="true" />
          Ya, Hapus
        </SubmitButton>

        <Link
          href={`/admin/profil/${profile.slug}`}
          className="inline-flex min-h-11 items-center rounded-xl px-4 text-muted transition-colors hover:bg-surface-muted"
        >
          Batal
        </Link>
      </form>
    </div>
  );
}
