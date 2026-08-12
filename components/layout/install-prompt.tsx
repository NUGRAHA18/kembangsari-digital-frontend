"use client";

import { useEffect, useState } from "react";
import { Download, Share, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useHydrated } from "@/hooks/use-hydrated";

/**
 * Ajakan memasang portal sebagai aplikasi di layar utama, sekaligus tempat
 * service worker didaftarkan.
 *
 * Dua peramban menangani ini dengan cara yang sama sekali berbeda:
 *
 *  - **Chrome/Android** memberi tahu lewat `beforeinstallprompt` ketika
 *    situsnya memenuhi syarat, dan pemasangannya bisa dijalankan dari kode.
 *  - **Safari/iOS** tidak punya event itu sama sekali dan tidak mengizinkan
 *    pemasangan dari kode. Yang bisa dilakukan hanya memberi tahu langkahnya:
 *    Bagikan → Tambahkan ke Layar Utama.
 *
 * Keduanya karena itu ditangani terpisah, bukan disatukan jadi satu tombol
 * yang di iOS tidak melakukan apa pun.
 */

/** Belum ada di lib.dom, dan hanya peramban berbasis Chromium yang punya. */
interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISSED_KEY = "kembangsari:ajakan-pasang-ditutup";

/** Sudah dibuka dari layar utama, jadi tidak ada lagi yang perlu dipasang. */
function isInstalled(): boolean {
  if (window.matchMedia("(display-mode: standalone)").matches) return true;
  // Milik Safari sendiri, dan satu-satunya penanda yang dipunyai iOS.
  return "standalone" in navigator && Boolean(navigator.standalone);
}

function shouldOffer(): boolean {
  return !isInstalled() && !localStorage.getItem(DISMISSED_KEY);
}

export function InstallPrompt() {
  // Penentuannya membaca `navigator` dan `localStorage`, yang tidak ada di
  // server. Tanpa penanda ini render pertama di browser akan berbeda dari
  // HTML kiriman server dan hydration-nya gagal.
  const hydrated = useHydrated();
  const [dismissed, setDismissed] = useState(false);
  const [installEvent, setInstallEvent] = useState<InstallPromptEvent | null>(null);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    // Tanpa service worker ber-penangan `fetch`, Chrome tidak pernah
    // memunculkan `beforeinstallprompt`. Kegagalan pendaftaran diabaikan:
    // portal tetap berjalan seperti biasa, hanya tanpa ajakan memasang.
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  }, []);

  useEffect(() => {
    if (!shouldOffer()) return;

    function onBeforeInstallPrompt(event: Event) {
      // Tanpa ini Chrome memunculkan ajakannya sendiri di tempat yang tidak
      // bisa diatur, dan event-nya hangus sebelum sempat disimpan.
      event.preventDefault();
      setInstallEvent(event as InstallPromptEvent);
    }

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
  }, []);

  function dismiss() {
    localStorage.setItem(DISMISSED_KEY, "1");
    setDismissed(true);
  }

  async function install() {
    if (!installEvent) return;

    await installEvent.prompt();
    await installEvent.userChoice;

    // Event ini hanya bisa dipakai sekali, diterima maupun ditolak. Kalau
    // ditolak, Chrome mengirimkannya lagi pada kunjungan berikutnya.
    setInstallEvent(null);
  }

  // Dihitung saat render, bukan disimpan lewat `setState` di dalam effect:
  // aturan `react-hooks/set-state-in-effect` melarang yang kedua, dan keadaan
  // ini memang turunan dari yang sudah diketahui — bukan keadaan tersendiri.
  const isIos = hydrated && /iphone|ipad|ipod/i.test(navigator.userAgent);
  const mode =
    dismissed || (hydrated && !shouldOffer())
      ? "none"
      : installEvent
        ? "chromium"
        : isIos
          ? "ios"
          : "none";

  if (mode === "none") return null;

  return (
    <div
      // z-40, satu tingkat di bawah navbar: ajakan ini tidak boleh menutupi
      // menu kalau keduanya kebetulan terlihat bersamaan.
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface p-4 shadow-lg"
      role="dialog"
      aria-labelledby="ajakan-pasang-judul"
    >
      <div className="mx-auto flex max-w-3xl items-start gap-3">
        <span
          aria-hidden="true"
          className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary text-sm font-bold text-white"
        >
          KD
        </span>

        <div className="min-w-0 flex-1">
          <p id="ajakan-pasang-judul" className="font-semibold">
            Pasang Kembangsari Digital
          </p>

          {mode === "chromium" ? (
            <>
              <p className="mt-1 text-muted text-pretty">
                Buka portal langsung dari layar utama, tanpa mengetik alamat.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button type="button" onClick={install}>
                  <Download className="size-5" aria-hidden="true" />
                  Pasang
                </Button>
                <Button type="button" variant="outline" onClick={dismiss}>
                  Nanti saja
                </Button>
              </div>
            </>
          ) : (
            <p className="mt-1 text-muted text-pretty">
              Ketuk <Share className="inline-block size-4 -translate-y-0.5" aria-hidden="true" />{" "}
              <strong className="font-medium text-foreground">Bagikan</strong> di bilah bawah
              Safari, lalu pilih{" "}
              <strong className="font-medium text-foreground">Tambahkan ke Layar Utama</strong>.
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={dismiss}
          aria-label="Tutup ajakan memasang aplikasi"
          className="-mt-1 -mr-1 inline-flex size-11 shrink-0 items-center justify-center rounded-xl hover:bg-surface-muted"
        >
          <X className="size-5" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
