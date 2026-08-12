"use client";

import { useState } from "react";
import { Check, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Tombol bagikan dengan dua jalur.
 *
 * Di ponsel, `navigator.share` membuka lembar berbagi bawaan sistem — WhatsApp,
 * Telegram, salin tautan, semuanya sekaligus. Itu jalur yang benar-benar
 * dipakai warga. Di komputer API itu hampir selalu tidak ada, dan yang tersisa
 * adalah menyalin tautannya ke papan klip.
 *
 * Keduanya perlu ada. Menyediakan hanya `navigator.share` membuat tombolnya
 * mati di desktop; menyediakan hanya salin-tautan membuang cara termudah
 * membagikan sesuatu dari ponsel.
 */
export function ShareButton({
  url,
  title,
  text,
  label = "Bagikan",
  className,
}: {
  /** Boleh relatif — dijadikan absolut sebelum dibagikan. */
  url: string;
  title: string;
  text?: string;
  label?: string;
  className?: string;
}) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");

  async function onShare() {
    const absolute = new URL(url, window.location.origin).toString();

    if (navigator.share) {
      try {
        await navigator.share({ title, text, url: absolute });
        return;
      } catch (error) {
        // Menutup lembar berbagi bukan kegagalan, dan tidak boleh berakhir
        // dengan tautan yang diam-diam tersalin ke papan klip.
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }

    try {
      await navigator.clipboard.writeText(absolute);
      setState("copied");
    } catch {
      // Papan klip ditolak peramban — biasanya karena halaman tidak dilayani
      // lewat HTTPS. Tautannya ditampilkan supaya masih bisa disalin tangan.
      setState("failed");
    }
  }

  return (
    <span className="inline-flex flex-col gap-1">
      <button
        type="button"
        onClick={onShare}
        className={cn(
          "inline-flex min-h-11 items-center gap-2 rounded-xl border border-border px-4 font-medium transition-colors hover:bg-surface-muted",
          className,
        )}
      >
        {state === "copied" ? (
          <Check className="size-4 text-success" aria-hidden="true" />
        ) : (
          <Share2 className="size-4" aria-hidden="true" />
        )}
        {state === "copied" ? "Tautan disalin" : label}
      </button>

      {state === "failed" ? (
        <span className="text-sm break-all text-muted" aria-live="polite">
          Salin tautan ini: {url}
        </span>
      ) : null}
    </span>
  );
}
