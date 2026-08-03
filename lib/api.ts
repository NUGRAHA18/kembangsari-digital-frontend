/**
 * Klien HTTP tunggal untuk backend Kembangsari Digital.
 *
 * Semua pemanggilan API melewati berkas ini supaya tiga hal ditangani di satu
 * tempat, bukan tersebar di komponen:
 *
 *  1. Backend punya TIGA bentuk respons — `{ data, meta }`, objek tunggal, dan
 *     array polos. Lihat `getPaginated` / `getOne` / `getList`.
 *  2. Error 400 mengirim `message` berupa string ATAU array string.
 *  3. Base URL hanya boleh berasal dari environment variable.
 */

import type { Paginated, PaginationQuery } from "@/types/api";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_BASE_URL) {
  throw new Error(
    "NEXT_PUBLIC_API_URL belum diatur. Salin .env.example menjadi .env.local terlebih dahulu.",
  );
}

/** Batas yang diberlakukan backend; melebihi ini dijawab 400. */
export const MAX_PAGE_LIMIT = 100;

export class ApiRequestError extends Error {
  readonly status: number;
  /** Selalu array, walaupun backend mengirim satu string. */
  readonly messages: string[];

  constructor(status: number, messages: string[]) {
    super(messages[0] ?? `Permintaan gagal dengan status ${status}`);
    this.name = "ApiRequestError";
    this.status = status;
    this.messages = messages;
  }

  /** 404 ditangani berbeda: halaman detail memanggil notFound(), bukan menampilkan galat. */
  get isNotFound() {
    return this.status === 404;
  }

  /** 401 berarti token kedaluwarsa — pemanggil mengarahkan pengguna ke login. */
  get isUnauthorized() {
    return this.status === 401;
  }
}

/** Dilempar saat backend tidak bisa dihubungi sama sekali (mis. belum dijalankan). */
export class ApiUnreachableError extends Error {
  constructor(cause?: unknown) {
    super("Tidak dapat terhubung ke server. Pastikan backend sedang berjalan.");
    this.name = "ApiUnreachableError";
    this.cause = cause;
  }
}

/**
 * Query diterima sebagai `object` biasa, bukan `Record<string, QueryValue>`.
 * TypeScript menolak menugaskan sebuah interface (seperti `PaginationQuery`) ke
 * tipe ber-index-signature, sehingga setiap service akan gagal dikompilasi.
 * Keamanan tipe tetap terjaga karena tiap service mendeklarasikan bentuk
 * query-nya sendiri di tanda tangan fungsinya.
 */
export interface RequestOptions extends Omit<RequestInit, "body"> {
  query?: object;
  body?: unknown;
  /**
   * Detik sebelum Next.js mengambil ulang data. Sengaja wajib diisi eksplisit
   * di setiap service supaya tidak ada halaman yang diam-diam menyajikan data basi.
   */
  revalidate?: number | false;
  token?: string;
}

function buildUrl(path: string, query?: object) {
  const url = new URL(`${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`);

  for (const [key, value] of Object.entries(query ?? {})) {
    // String kosong dibuang supaya `?search=` tidak ikut terkirim saat kolom pencarian dikosongkan.
    if (value === undefined || value === null || value === "") continue;
    url.searchParams.set(key, String(value));
  }

  return url.toString();
}

/** Backend mengirim `message` sebagai string tunggal ATAU array string. Samakan jadi array. */
function normalizeMessages(payload: unknown, status: number): string[] {
  if (payload && typeof payload === "object" && "message" in payload) {
    const { message } = payload as { message: unknown };

    if (Array.isArray(message)) {
      const messages = message.filter((item): item is string => typeof item === "string");
      if (messages.length > 0) return messages;
    }

    if (typeof message === "string" && message.length > 0) {
      return [message];
    }
  }

  return [`Permintaan gagal dengan status ${status}.`];
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { query, body, revalidate, token, headers, ...init } = options;

  const requestHeaders = new Headers(headers);
  if (token) requestHeaders.set("Authorization", `Bearer ${token}`);

  let requestBody: BodyInit | undefined;
  if (body instanceof FormData) {
    // Content-Type sengaja TIDAK diset: browser harus menuliskannya sendiri
    // lengkap dengan boundary, kalau ditimpa manual request akan gagal.
    requestBody = body;
  } else if (body !== undefined) {
    requestHeaders.set("Content-Type", "application/json");
    requestBody = JSON.stringify(body);
  }

  let response: Response;
  try {
    response = await fetch(buildUrl(path, query), {
      ...init,
      headers: requestHeaders,
      body: requestBody,
      next: revalidate === undefined ? undefined : { revalidate },
    });
  } catch (error) {
    throw new ApiUnreachableError(error);
  }

  if (!response.ok) {
    let payload: unknown = null;
    try {
      payload = await response.json();
    } catch {
      // Sebagian galat (mis. 413 dari proxy) tidak mengembalikan JSON.
    }
    throw new ApiRequestError(response.status, normalizeMessages(payload, response.status));
  }

  if (response.status === 204) return undefined as T;

  return (await response.json()) as T;
}

/** Endpoint bentuk A — `{ data, meta }`. */
export function getPaginated<T>(
  path: string,
  query: PaginationQuery & object = {},
  options: Omit<RequestOptions, "query"> = {},
): Promise<Paginated<T>> {
  // Backend menolak `limit` di atas 100 dengan 400; dipangkas di sini supaya
  // tidak ada halaman yang gagal hanya karena salah ketik angka.
  const limit = query.limit === undefined ? undefined : Math.min(query.limit, MAX_PAGE_LIMIT);
  return request<Paginated<T>>(path, { ...options, query: { ...query, limit } });
}

/** Endpoint bentuk B — objek tunggal. */
export function getOne<T>(path: string, options: RequestOptions = {}): Promise<T> {
  return request<T>(path, options);
}

/**
 * Endpoint bentuk C — array polos.
 * Membaca `.data` pada endpoint ini menghasilkan `undefined`, jadi dipisahkan
 * sebagai fungsi tersendiri agar kesalahannya tertangkap saat menulis kode.
 */
export function getList<T>(
  path: string,
  query: object = {},
  options: Omit<RequestOptions, "query"> = {},
): Promise<T[]> {
  return request<T[]>(path, { ...options, query });
}

/**
 * Pengubah data — hanya dipakai dashboard admin, selalu dengan `token`.
 *
 * Tidak ada `revalidate` di sini: permintaan bertoken tidak boleh masuk cache
 * Next.js, dan tanpa opsi itu `fetch` memang tidak menyimpannya.
 */
export function post<T>(path: string, body: unknown, options: RequestOptions = {}) {
  return request<T>(path, { ...options, method: "POST", body });
}

export function patch<T>(path: string, body: unknown, options: RequestOptions = {}) {
  return request<T>(path, { ...options, method: "PATCH", body });
}

export function del<T>(path: string, options: RequestOptions = {}) {
  return request<T>(path, { ...options, method: "DELETE" });
}

export { request };

/**
 * Membungkus pemanggilan agar kegagalan satu bagian halaman tidak menjatuhkan
 * seluruh halaman. Dipakai untuk bagian-bagian beranda: kalau satu blok gagal,
 * blok lain tetap tampil dan yang gagal menampilkan pesan galat sendiri.
 */
export async function safeFetch<T>(
  promise: Promise<T>,
): Promise<{ data: T; error: null } | { data: null; error: string }> {
  try {
    return { data: await promise, error: null };
  } catch (error) {
    if (error instanceof ApiRequestError || error instanceof ApiUnreachableError) {
      return { data: null, error: error.message };
    }
    return { data: null, error: "Terjadi kesalahan yang tidak terduga." };
  }
}
