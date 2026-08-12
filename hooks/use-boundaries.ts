"use client";

import { useEffect, useState } from "react";
import { BOUNDARY_URL, parseBoundaries, type BoundaryFeature } from "@/features/maps/boundaries";

/**
 * Mengambil batas wilayah dari berkas statis.
 *
 * Sengaja diambil di browser, bukan diimpor sebagai JSON di Server Component:
 * polygon batas wilayah bisa berisi ribuan koordinat, dan mengimpornya akan
 * menyalin seluruh angka itu ke dalam muatan halaman yang harus diunduh setiap
 * pengunjung — termasuk yang tidak pernah membuka petanya.
 *
 * Kegagalan tidak dilaporkan ke pengguna. Batas wilayah adalah lapisan
 * pelengkap; kalau berkasnya belum diisi atau gagal diambil, peta tetap
 * berguna dengan pin-pinnya saja.
 */
export function useBoundaries(): BoundaryFeature[] {
  const [boundaries, setBoundaries] = useState<BoundaryFeature[]>([]);

  useEffect(() => {
    const controller = new AbortController();

    fetch(BOUNDARY_URL, { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : null))
      .then((payload) => setBoundaries(parseBoundaries(payload)))
      .catch(() => {
        // Termasuk pembatalan saat komponen dilepas — tidak ada yang perlu dilakukan.
      });

    return () => controller.abort();
  }, []);

  return boundaries;
}
