import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AgendaForm } from "@/features/admin/agenda-form";

export const metadata: Metadata = { title: "Tambah Agenda" };

export default function NewAgendaPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/admin/agenda"
          className="inline-flex min-h-11 items-center gap-2 text-muted hover:text-accent"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Kembali ke daftar agenda
        </Link>
        <h1 className="mt-2 text-2xl font-bold tracking-tight">Tambah Agenda</h1>
      </div>

      <AgendaForm />
    </div>
  );
}
