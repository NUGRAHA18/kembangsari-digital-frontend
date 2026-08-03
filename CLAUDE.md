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
const res = await fetch(`${API}/news/published?page=1&limit=9`);
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

### 5. Endpoint list versi lengkap sekarang milik admin

`GET /news`, `/announcement`, `/monography`, `/umkm`, `/potential`, `/kkn/program`, dan
`/maps/marker` menjawab **`401` tanpa token**. Halaman publik memakai versi tersaringnya:

```
/news/published        /potential/active      /maps/marker/active
/announcement/active   /umkm/active           /monography/published
/kkn/program/active
```

Endpoint detail tetap terbuka tanpa token, tetapi record tersembunyi (`published: false`,
`isActive: false`, `isPublished: false`) dijawab **`404`** — jadi halaman `[slug]` tidak
perlu lagi menyaring sendiri, cukup `fetchOrNotFound`.

Parameter di luar daftar yang diterima kini dijawab **`400`** (`forbidNonWhitelisted`),
bukan diabaikan diam-diam seperti dulu. Cek `openapi.json` sebelum menambah query baru.

## Referensi

| Berkas | Isi | |
|--------|-----|---|
| `types/api.ts` | Tipe TypeScript semua model — **pakai ini, jangan tulis ulang atau menebak nama field** | di repo |
| `openapi.json` | Kontrak API lengkap, bisa dibaca tanpa menjalankan backend | di repo |
| `FRONTEND_GUIDE.md` | Panduan lengkap: kontrak API, resep komponen per halaman, detail pedoman mobile-first | internal |
| `LAPORAN-BACKEND.md` | Keterbatasan backend yang ditemukan saat implementasi, beserta usulan perbaikannya | internal |
| `JAWABAN-LAPORAN-BACKEND.md` | Jawaban tim backend: seluruh butir laporan sudah dikerjakan, beserta kontrak barunya | internal |

Tiga berkas terakhir **sengaja tidak ikut di repo publik ini** (lihat `.gitignore`) dan
dibagikan lewat jalur internal. Ketiganya tetap ada di komputer masing-masing anggota tim.

Kalau butuh tahu bentuk data suatu endpoint, baca `types/api.ts` lebih dulu sebelum menebak. Kalau backend sedang jalan, Swagger tersedia di http://localhost:3000/docs.

## Konvensi

- Bahasa antarmuka: **Indonesia**. Nama variabel dan fungsi: Inggris.
- Setiap daftar wajib punya tiga keadaan: memuat, galat, dan kosong.
- Semua `<img>` wajib punya `alt` bermakna; gambar di bawah lipatan pakai `loading="lazy"`.
- Error `400` bisa mengirim `message` berupa **string atau array string** — tangani keduanya.
- `401` berarti token kedaluwarsa → arahkan ke login.

---

# Keadaan repo saat ini

Seluruh **halaman publik sudah dibangun** (1 Agustus 2026), lalu disesuaikan dengan kontrak
backend yang diperbaiki (3 Agustus 2026): filter kategori berita & potensi, halaman detail
agenda, dan data pekerjaan di monografi.

**Dashboard admin sudah dimulai** (3 Agustus 2026): login, kerangka dashboard, dan modul
berita lengkap (tulis, ubah, hapus, unggah gambar). Modul lainnya belum.

## Struktur berkas

```
app/(publik)/           Portal warga. Layout-nya yang memasang Navbar & Footer.
                        Halaman daftar berada di route group (daftar)/
app/admin/              Dashboard. (dasbor)/ memakai kerangka bersidebar;
                        login/ dan keluar/ sengaja di luarnya
app/layout.tsx          Hanya dokumen: bahasa, font, tema, metadata
middleware.ts           Penjaga /admin — memeriksa ada tidaknya cookie sesi
components/ui/          Komponen dasar lintas modul
components/layout/      Navbar, Footer, penyedia tema
features/<modul>/       Komponen khusus satu modul, termasuk features/admin/
services/<modul>.ts     Satu berkas per modul backend — semua pemanggilan API lewat sini
lib/api.ts              Klien HTTP tunggal
lib/session.ts          Cookie sesi admin (server saja)
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
- **`loading.tsx` hanya boleh di route group `(daftar)`, tidak pernah di folder `[slug]`
  maupun di segmen induk yang menaungi keduanya.** Berkas itu membuat batas streaming; begitu
  potongan pertama terkirim, status HTTP terkunci di 200 dan `notFound()` menghasilkan halaman
  "tidak ditemukan" berstatus 200 — terbaca mesin pencari sebagai halaman sah. Inilah sebabnya
  daftar agenda ikut dipindahkan ke `app/agenda/(daftar)/` saat `/agenda/[slug]` dibangun.
- **Isi Markdown diturunkan satu tingkat** (`h1`→`h2`) di `components/ui/markdown.tsx`, karena
  setiap halaman sudah punya `h1` dari `PageHeader`.

## Catatan Next.js 16

- `params` dan `searchParams` adalah **Promise**, harus di-`await`.
- `next lint` sudah dihapus; skripnya memakai `eslint` langsung.
- `images.qualities` bawaan hanya `[75]`.
- Aturan `react-hooks/set-state-in-effect` melarang `setState` langsung di dalam effect.
  Untuk penanda "sudah ter-hydrate", pakai `hooks/use-hydrated.ts`.

## Keterbatasan backend — sudah diperbaiki (3 Agustus 2026)

Seluruh butir `LAPORAN-BACKEND.md` sudah dikerjakan backend; jawabannya ada di
`JAWABAN-LAPORAN-BACKEND.md`. Yang berubah di frontend sebagai akibatnya:

- **Filter kategori sudah ada.** `GET /news/published?categoryId=` (id dari
  `/news/category/all`) dan `GET /potential/active?category=` (nilai enum `PotentialCategory`,
  huruf besar). Kategori tak dikenal dijawab `400`, jadi nilai dari query string divalidasi
  dulu di `features/potential/categories.ts`. URL publiknya memakai slug — `?kategori=budaya`,
  `?kategori=pertanian` — bukan id atau enum mentah.
- **Draf tidak lagi bocor.** Penyaring pengaman di `services/news.ts` dan
  `app/berita/[slug]/page.tsx` sudah dihapus; jangan dipasang kembali.
- Kalau sebuah modul menyediakan endpoint versi tersaring, **halaman publik wajib memakai
  yang itu** — sekarang bukan lagi soal kesopanan, endpoint list penuhnya menjawab `401`.
- **`employmentData` sudah dibakukan** mengikuti enum `EmploymentStatus` (15 kunci huruf
  besar, semuanya opsional). Kunci yang tidak dikirim berarti **tidak didata, bukan nol** —
  `features/monography/employment.ts` membuangnya, jangan menampilkannya sebagai 0.
- **Agenda punya `slug`** dan `GET /agenda/:idOrSlug` menerima keduanya, jadi
  `/agenda/[slug]` sudah dibangun. Daftarnya pindah ke route group `(daftar)` supaya
  `loading.tsx` tidak ikut membentuk batas streaming di halaman detail.
- **CORS**: `CORS_ORIGINS` di backend masih menunggu domain frontend produksi. Sampai diisi,
  backend production hanya melayani `http://localhost:3001`.
- **Rate limit**: 100 permintaan/menit per IP, dan **5/menit untuk `POST /auth/login`** —
  sudah ditangani sebagai pesan tersendiri di `app/admin/login/actions.ts`.

## Aturan dashboard admin

Modul berita adalah contoh yang diikuti modul berikutnya. Polanya:

- **Token disimpan di cookie `httpOnly`** (`lib/session.ts`), diset oleh Next.js — bukan
  `localStorage`, dan tanpa perubahan apa pun di backend. Akibatnya token tidak pernah
  tersentuh JavaScript browser dan halaman dashboard tetap bisa jadi Server Component.
- **Semua penulisan lewat Server Action**, bukan `fetch` dari browser. Formnya tetap
  terkirim ketika JavaScript gagal dimuat — seluruh alur berita sudah diuji tanpa JS.
- **`lib/api.ts` jangan diberi `revalidate` untuk permintaan bertoken.** Respons admin
  berisi draf; kalau masuk cache Next.js, ia bisa tersaji ke pengunjung biasa.
- **Setelah menyimpan, panggil `revalidatePath`** untuk halaman publik yang terpengaruh.
  Tanpa itu pengelola tidak melihat tulisannya di portal selama 60–300 detik dan mengira
  penyimpanannya gagal.
- **Konfirmasi hapus adalah halaman tersendiri**, bukan `confirm()` — dialog itu hilang
  tanpa JavaScript, dan tombol hapusnya akan langsung menghapus tanpa bertanya.
- **`401` saat merender** diarahkan ke `/admin/keluar`, yang menghapus cookie basi lalu
  membawa pengguna ke form masuk. Server Component tidak boleh menghapus cookie sendiri.
- Field gambar dikosongkan dengan **string kosong**, bukan `null`: DTO backend memakai
  `@IsString()` sehingga `null` ditolak `400`. Layak diusulkan ke backend suatu saat.

## Yang belum dikerjakan

- **Modul dashboard selain berita**: agenda, pengumuman, galeri, UMKM, potensi, program KKN,
  peta, monografi, profil, dan pengaturan.
- Pengelolaan **kategori berita** dari dashboard — berita baru masih membutuhkan kategori
  yang sudah ada di database.
- QR Code menuju halaman monografi (FR-052).
