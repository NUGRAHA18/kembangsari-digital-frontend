"use client";

import { useSyncExternalStore } from "react";

// Tidak ada yang perlu dilanggan: nilainya hanya berubah sekali, dari render
// server ke render browser pertama.
const subscribe = () => () => {};

/**
 * Bernilai `false` saat dirender di server dan pada render hydration pertama,
 * lalu `true` setelahnya.
 *
 * Ini pengganti pola `useEffect(() => setMounted(true), [])`. Memanggil
 * setState langsung di dalam effect memicu render berantai, dan aturan
 * `react-hooks/set-state-in-effect` melarangnya. `useSyncExternalStore`
 * memberi hasil yang sama tanpa render tambahan.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
