import type { Metadata } from "next";
import Link from "next/link";
import { Download } from "lucide-react";
import { Card, CardBody } from "@/components/ui/card";
import { PrintButton } from "@/features/admin/print-button";
import { renderQrSvg } from "@/lib/qr";
import { getSettingsMap } from "@/services/settings";

export const metadata: Metadata = { title: "QR Code Monografi" };

// Ditulis ulang di sini seperti pada sitemap.ts dan robots.ts, bukan diimpor
// dari layout: nilainya berasal dari environment, dan menariknya lewat modul
// lain hanya menambah keterkaitan tanpa menghemat apa pun.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3001";

/** Tujuan QR: halaman monografi di portal warga. */
const TARGET_PATH = "/monografi";

export default async function QrCodePage() {
  const target = `${SITE_URL}${TARGET_PATH}`;

  const [svg, settings] = await Promise.all([renderQrSvg(target), getSettingsMap()]);

  return (
    <div className="flex flex-col gap-6">
      <div className="print:hidden">
        <h1 className="text-2xl font-bold tracking-tight">QR Code Monografi</h1>
        <p className="mt-1 text-muted text-pretty">
          Cetak dan tempel di balai padukuhan atau papan pengumuman. Warga cukup mengarahkan
          kamera ponselnya untuk membuka data kependudukan terbaru — tanpa mengetik alamat.
        </p>
      </div>

      <div className="flex flex-wrap gap-3 print:hidden">
        <PrintButton />

        {/* Unduhan berupa tautan biasa, bukan tombol ber-JavaScript: berkasnya
            dibangkitkan Route Handler, jadi tetap berfungsi tanpa JS. */}
        <Link
          href="/admin/qr-code/unduh?format=png"
          className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border px-4 transition-colors hover:bg-surface-muted"
        >
          <Download className="size-5" aria-hidden="true" />
          Unduh PNG
        </Link>

        <Link
          href="/admin/qr-code/unduh?format=svg"
          className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border px-4 transition-colors hover:bg-surface-muted"
        >
          <Download className="size-5" aria-hidden="true" />
          Unduh SVG
        </Link>
      </div>

      {/*
        Lembar yang tercetak.

        Warnanya dipatok putih dan hitam, bukan token tema: kertas selalu putih,
        dan pemindai mencari modul gelap di atas latar terang — QR yang ikut
        membalik di mode gelap tidak terbaca sebagian ponsel.
      */}
      <Card className="mx-auto w-full max-w-md bg-white print:max-w-none print:border-0 print:shadow-none">
        <CardBody className="flex flex-col items-center gap-4 p-6 text-center text-slate-900 md:p-8">
          <p className="text-sm font-medium tracking-wide text-slate-500 uppercase">
            {settings.site_name}
          </p>

          <h2 className="text-2xl font-bold tracking-tight text-balance">
            Data Kependudukan Padukuhan
          </h2>

          <p className="text-slate-600 text-pretty">
            Pindai dengan kamera ponsel untuk melihat jumlah penduduk, pendidikan, mata
            pencaharian, dan agama warga.
          </p>

          {/*
            SVG disisipkan apa adanya karena dibangkitkan di server ini juga dari
            URL portal sendiri — bukan dari isian pengguna, jadi tidak ada teks
            asing yang bisa menyelinap ke dalamnya.
          */}
          <div
            className="w-full max-w-64 print:max-w-80"
            aria-hidden="true"
            dangerouslySetInnerHTML={{ __html: svg }}
          />

          {/* Alamatnya tetap ditulis: tidak semua ponsel warga punya pemindai
              yang andal, dan sebagian lebih memilih mengetiknya. */}
          <p className="text-sm break-all text-slate-600">{target}</p>
        </CardBody>
      </Card>

      <p className="text-sm text-muted text-pretty print:hidden">
        QR ini mengikuti alamat portal di <code>NEXT_PUBLIC_SITE_URL</code>. Sekarang bernilai{" "}
        <span className="break-all">{SITE_URL}</span> — setelah portal dipasang di domain
        sungguhan, cetak ulang QR-nya dari halaman ini.
      </p>
    </div>
  );
}
