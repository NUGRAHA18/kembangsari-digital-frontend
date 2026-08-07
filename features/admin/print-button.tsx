"use client";

import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useHydrated } from "@/hooks/use-hydrated";

/**
 * Tombol cetak.
 *
 * Satu-satunya bagian halaman QR yang butuh JavaScript, dan karena itu ia
 * menyembunyikan dirinya sendiri sampai halaman ter-hydrate: tanpa JS, tombol
 * yang tidak melakukan apa-apa lebih membingungkan daripada tidak ada tombol.
 * Menu cetak peramban tetap bisa dipakai — halamannya sudah punya gaya cetak.
 */
export function PrintButton() {
  const hydrated = useHydrated();

  if (!hydrated) return null;

  return (
    <Button type="button" onClick={() => window.print()}>
      <Printer className="size-5" aria-hidden="true" />
      Cetak
    </Button>
  );
}
