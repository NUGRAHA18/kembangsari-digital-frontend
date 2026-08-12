"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Menunda pemasangan komponen berat sampai pengguna hampir mencapainya.
 *
 * Dipakai untuk pratinjau peta di beranda: pustaka peta berukuran besar dan
 * beranda adalah halaman yang paling menentukan kesan kecepatan situs. Tanpa ini
 * berkas peta ikut diunduh walau pengguna tidak pernah menggulir sejauh itu.
 */
export function LazyMount({
  children,
  fallback,
  rootMargin = "200px",
}: {
  children: React.ReactNode;
  fallback: React.ReactNode;
  rootMargin?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    // Tidak ada jalur cadangan untuk peramban tanpa IntersectionObserver:
    // Next.js 16 sendiri hanya mendukung Chrome/Edge/Firefox 111+ dan
    // Safari 16.4+, dan API ini sudah tersedia jauh sebelum versi-versi itu.
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [rootMargin]);

  // Pembungkusnya WAJIB punya kotak sendiri. Sebelumnya di sini ada
  // `className="contents"` agar susunan induknya tidak bergeser — tetapi
  // `display: contents` membuat elemen tidak menghasilkan kotak layout sama
  // sekali, dan IntersectionObserver menghitung perpotongan dari kotak itu.
  // Targetnya karena itu tidak pernah dilaporkan terlihat, `isVisible` tetap
  // false selamanya, dan peta beranda berhenti pada rangka pemuatnya.
  return <div ref={containerRef}>{isVisible ? children : fallback}</div>;
}
