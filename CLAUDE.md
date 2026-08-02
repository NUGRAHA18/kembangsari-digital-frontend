# Kembangsari Digital — Frontend

Portal informasi publik Padukuhan Kembangsari, Kalurahan Banjararum, Kapanewon Kalibawang, Kulon Progo, DIY.

Repo ini **hanya frontend**. Backend (NestJS + Prisma + Supabase) berada di repository terpisah dan sudah selesai — jangan mengubahnya dari sini, dan jangan berasumsi bisa menambah endpoint baru.

## Stack

- **Next.js (App Router)** + TypeScript
- **Tailwind CSS** untuk styling
- Konsumsi REST API, tanpa database sendiri

Next.js dipilih karena portal ini butuh SEO yang baik untuk halaman berita dan profil. Gunakan Server Component untuk halaman publik yang membaca data, dan Client Component hanya bila memang butuh interaksi (peta, form, menu mobile).

## Menjalankan

```bash
npm run dev      # WAJIB di port 3001, lihat di bawah
```

⚠️ **Backend memakai port 3000.** Next.js juga default 3000, jadi harus digeser:

```json
{ "scripts": { "dev": "next dev -p 3001" } }
```

Backend dijalankan terpisah dari foldernya sendiri (`npm run start:dev`). Kalau backend mati, semua request gagal — itu normal, bukan bug frontend.

## Konfigurasi

```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
```

Jangan pernah menulis base URL langsung di kode. Backend akan pindah ke Render/Railway nanti, dan saat itu hanya baris ini yang berubah.

Frontend **tidak boleh** menyimpan kredensial Supabase apa pun. Semua akses data lewat backend.

## Aturan yang tidak bisa ditawar

### 1. Mobile-first, selalu

Warga mengakses portal ini hampir seluruhnya dari ponsel.

- Gaya dasar (tanpa prefix breakpoint) **adalah** tampilan mobile
- Naikkan dengan `md:` / `lg:` yang bersifat `min-width`
- **Jangan** memakai `max-*:` sebagai mekanisme utama — kalau menulis itu, urutan berpikirnya terbalik
- Uji di lebar **320px**, tidak boleh ada scroll horizontal
- Target sentuh minimal **44×44px**
- Teks isi dan input minimal **16px** (di bawah itu iOS zoom otomatis saat input difokuskan)

```tsx
// Benar: 1 kolom di ponsel, naik bertahap
<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
```

### 2. Tiga bentuk respons API — jangan disamaratakan

**Endpoint list** mengembalikan `{ data, meta }`:

```ts
const res = await fetch(`${API}/news?page=1&limit=9`);
const { data, meta } = await res.json();   // data adalah array
```

**Endpoint detail** mengembalikan objek tunggal.

**Sebagian endpoint mengembalikan array polos** — membaca `.data` di sini menghasilkan `undefined`:

```
GET /maps/marker/active            GET /profile
GET /maps/category                 GET /settings
GET /news/category/all             GET /umkm/image/umkm/:id
                                   GET /potential/image/potential/:id
```

`/maps/marker/active` sengaja tidak dipaginasi karena peta harus menggambar semua pin sekaligus.

### 3. Gambar adalah URL, bukan berkas

Field `thumbnail`, `image`, dan `url` berisi string URL. Untuk mengunggah, prosesnya dua langkah: `POST /upload` → dapat `url` → simpan `url` itu ke record.

Saat mengirim `FormData`, **jangan** menyetel header `Content-Type` — browser perlu menuliskannya sendiri lengkap dengan boundary.

### 4. Semua tanggal adalah string ISO

`createdAt`, `startDate`, `date`, dan sejenisnya bertipe `string`, bukan `Date`. Bungkus sendiri kalau perlu diolah.

## Referensi di repo ini

| Berkas | Isi |
|--------|-----|
| `FRONTEND_GUIDE.md` | Panduan lengkap: kontrak API, resep komponen per halaman, detail pedoman mobile-first |
| `types/api.ts` | Tipe TypeScript semua model — **pakai ini, jangan tulis ulang atau menebak nama field** |
| `openapi.json` | Kontrak API lengkap, bisa dibaca tanpa menjalankan backend |

Kalau butuh tahu bentuk data suatu endpoint, baca `types/api.ts` lebih dulu sebelum menebak. Kalau backend sedang jalan, Swagger tersedia di http://localhost:3000/docs.

## Konvensi

- Bahasa antarmuka: **Indonesia**. Nama variabel dan fungsi: Inggris.
- Setiap daftar wajib punya tiga keadaan: memuat, galat, dan kosong.
- Semua `<img>` wajib punya `alt` bermakna; gambar di bawah lipatan pakai `loading="lazy"`.
- Error `400` bisa mengirim `message` berupa **string atau array string** — tangani keduanya.
- `401` berarti token kedaluwarsa → arahkan ke login.

---

# Keadaan repo saat ini

Seluruh **halaman publik sudah dibangun** (1 Agustus 2026). Dashboard admin belum ada.

## Struktur berkas

```
app/                    Routing. Halaman daftar berada di route group (daftar)/
components/ui/          Komponen dasar lintas modul
components/layout/      Navbar, Footer, penyedia tema
features/<modul>/       Komponen khusus satu modul
services/<modul>.ts     Satu berkas per modul backend — semua pemanggilan API lewat sini
lib/api.ts              Klien HTTP tunggal
lib/format.ts           Tanggal, angka, tautan WhatsApp/Maps — semuanya locale id-ID
types/api.ts            Kontrak tipe dari backend
```

## Identitas visual — sudah ditetapkan

Diambil dari `ui_ux design.docx` di repo dokumentasi, sudah diterapkan sebagai token di
`app/globals.css`. **Jangan menulis nilai warna langsung di komponen**, pakai tokennya:

| Token | Terang | Gelap | Kegunaan |
|-------|--------|-------|----------|
| `primary` | `#15803D` | `#15803D` | Latar tombol, teksnya putih |
| `accent` | `#15803D` | `#4ADE80` | Teks & ikon hijau di atas latar halaman |
| `secondary` | `#F59E0B` | `#F59E0B` | Aksen hangat, pengumuman |
| `background` / `surface` | `#F8FAFC` / `#FFF` | `#020617` / `#0F172A` | Latar halaman & kartu |
| `muted` | `#64748B` | `#94A3B8` | Teks sekunder |

Hijau sengaja tetap `#15803D` di kedua mode: dipakai sebagai latar tombol dengan teks putih,
dan rasio kontrasnya 4.6:1. Warna yang lebih terang akan turun di bawah ambang WCAG AA.

Font **Geist**, sudut membulat `rounded-xl` (16px), ikon **Lucide**. Glassmorphism hanya di
navbar. Mode gelap wajib didukung di setiap komponen baru.

## Keputusan yang menyimpang dari dokumen — beserta alasannya

Jangan "memperbaiki" hal-hal berikut tanpa membaca alasannya dulu:

- **Peta memakai Leaflet + OpenStreetMap**, bukan Google Maps: tanpa API key dan tanpa billing.
  Tombol "Petunjuk Arah" tetap mengarah ke Google Maps karena aplikasi itu yang ada di ponsel warga.
- **Tanpa TanStack Query, Axios, Zustand, Framer Motion** meski disebut di dokumen arsitektur.
  Halaman publik memakai Server Component + `fetch`, jadi pustaka itu hanya menambah berkas
  yang harus diunduh tanpa memberi manfaat. Pertimbangkan lagi saat membangun dashboard admin.
- **Grafik monografi dibuat dari CSS**, bukan pustaka grafik: angkanya tetap terbaca mesin
  pencari dan halaman tidak perlu jadi Client Component.
- **Agenda dikelompokkan per bulan**, bukan kisi kalender 7 kolom yang tidak terbaca di 320px.
- **Pagination ponsel memakai tombol Sebelumnya/Selanjutnya**, bukan "Muat lebih banyak":
  setiap halaman tetap punya URL yang bisa dibagikan dan ditelusuri mesin pencari.
- **`loading.tsx` hanya boleh di route group `(daftar)`, tidak pernah di folder `[slug]`.**
  Berkas itu membuat batas streaming; begitu potongan pertama terkirim, status HTTP terkunci
  di 200 dan `notFound()` menghasilkan halaman "tidak ditemukan" berstatus 200 — terbaca
  mesin pencari sebagai halaman sah.
- **Isi Markdown diturunkan satu tingkat** (`h1`→`h2`) di `components/ui/markdown.tsx`, karena
  setiap halaman sudah punya `h1` dari `PageHeader`.

## Catatan Next.js 16

- `params` dan `searchParams` adalah **Promise**, harus di-`await`.
- `next lint` sudah dihapus; skripnya memakai `eslint` langsung.
- `images.qualities` bawaan hanya `[75]`.
- Aturan `react-hooks/set-state-in-effect` melarang `setState` langsung di dalam effect.
  Untuk penanda "sudah ter-hydrate", pakai `hooks/use-hydrated.ts`.

## Keterbatasan backend yang ditemukan saat implementasi

Rinciannya beserta usulan perbaikan ada di **`LAPORAN-BACKEND.md`**. Ringkasnya:

- `GET /news` dan `GET /potential/active` **tidak menerima filter kategori** — parameternya
  dibuang backend tanpa galat (`whitelist: true`). Kedua halaman itu karena itu tidak punya
  filter kategori; kategorinya tampil sebagai label di kartu. (Butir B-1, B-3)
- `GET /news` **mencampur draf dengan berita terbit**. Frontend menyaring sendiri sebagai
  pengaman sementara di `services/news.ts` dan `app/berita/[slug]/page.tsx`.
  **Hapus penyaring itu setelah backend diperbaiki.** (Butir B-2)
- Endpoint list versi lengkap (`/news`, `/announcement`, `/monography`, `/umkm`, …)
  **terbuka tanpa login** dan memuat record yang belum dipublikasikan. Frontend tidak
  memakainya, tapi ini perlu diperbaiki di backend. (Butir A-1)
- `employmentData` pada monografi bertipe JSON bebas yang strukturnya belum dibakukan,
  jadi belum ditampilkan. (Butir B-4)
- Agenda tidak punya endpoint berbasis slug, hanya `GET /agenda/:id`, sehingga agenda tidak
  punya halaman detail sendiri — seluruh keterangan ditampilkan di kartu. (Butir B-5)

## Yang belum dikerjakan

- **Dashboard admin** (login, CRUD tiap modul, unggah gambar). `lib/api.ts` sudah menyediakan
  `token` dan penanganan `FormData` yang benar, tapi belum ada halamannya.
- QR Code menuju halaman monografi (FR-052).
- Keputusan penyimpanan token: `localStorage` vs cookie `httpOnly` — yang kedua memerlukan
  penyesuaian di backend, diskusikan dulu.
