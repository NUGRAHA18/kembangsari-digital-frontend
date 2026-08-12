/**
 * Service worker Kembangsari Digital.
 *
 * Sengaja sesederhana ini. Ada dua alasan berkas ini ada:
 *
 *  1. Chrome baru menawarkan "pasang aplikasi" kalau situsnya punya service
 *     worker dengan penangan `fetch`. Tanpa berkas ini, ajakan pasang tidak
 *     pernah muncul di Android.
 *  2. Sinyal di padukuhan sering putus di tengah jalan, dan halaman galat
 *     bawaan peramban tidak menjelaskan apa pun.
 *
 * Yang TIDAK dilakukan berkas ini: menyimpan halaman ke cache. Portal ini
 * berisi berita, agenda, dan pengumuman yang harus terbaca terkini, dan
 * dashboard admin berisi data yang tidak boleh tertinggal di ponsel siapa pun.
 * Menyimpan halaman butuh aturan kedaluwarsa per modul — pekerjaan tersendiri
 * yang belum tentu sepadan. Berkas statis `/_next/static/*` sudah disimpan
 * peramban sendiri karena namanya mengandung hash dan tidak pernah berubah isi.
 */

const CACHE = "kembangsari-luring-v1";
const OFFLINE_URL = "/luring";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.add(OFFLINE_URL))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Hanya perpindahan halaman yang ditangani. Permintaan RSC saat berpindah
  // halaman bermode "cors", bukan "navigate", jadi tidak ikut tersentuh.
  if (request.method !== "GET" || request.mode !== "navigate") return;

  // Dashboard tidak pernah disentuh sama sekali: halaman luring yang tersimpan
  // di cache bisa tersaji menggantikan halaman kerja pengelola, dan itu
  // membingungkan pada saat yang paling tidak tepat.
  if (new URL(request.url).pathname.startsWith("/admin")) return;

  event.respondWith(fetch(request).catch(() => caches.match(OFFLINE_URL)));
});
