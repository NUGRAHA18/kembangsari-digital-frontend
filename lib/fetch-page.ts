import { notFound } from "next/navigation";
import { ApiRequestError } from "@/lib/api";

/**
 * Menerjemahkan 404 dari backend menjadi halaman "tidak ditemukan" milik Next.js.
 *
 * Galat lain sengaja dilempar ulang supaya ditangkap `error.tsx` — slug yang
 * salah ketik dan backend yang mati adalah dua masalah berbeda dan tidak boleh
 * menampilkan halaman yang sama.
 */
export async function fetchOrNotFound<T>(promise: Promise<T>): Promise<T> {
  try {
    return await promise;
  } catch (error) {
    if (error instanceof ApiRequestError && error.isNotFound) notFound();
    throw error;
  }
}

/** Versi yang mengembalikan null alih-alih menampilkan halaman 404. */
export async function fetchOrNull<T>(promise: Promise<T>): Promise<T | null> {
  try {
    return await promise;
  } catch {
    return null;
  }
}
