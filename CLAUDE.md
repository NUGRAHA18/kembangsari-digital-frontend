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

Jangan pernah menulis base URL langsung di kode. Saat backend pindah alamat, hanya baris ini yang berubah.

Frontend **tidak boleh** menyimpan kredensial Supabase apa pun. Semua akses data lewat backend.

`NEXT_PUBLIC_API_URL` satu-satunya yang wajib ada — `lib/api.ts` melempar galat saat dimuat kalau kosong, dan build ikut gagal di `/sitemap.xml` yang di-prerender. `NEXT_PUBLIC_SITE_URL` punya nilai cadangan `http://localhost:3001` di semua pemakaiannya.

## Deploy

**Vercel**, dan bukan sekadar preferensi: 39 dari ~50 rute dirender saat diminta, ada `proxy.ts`, seluruh penulisan lewat Server Action, dan `next/image` mengoptimalkan gambar Supabase. Portal ini butuh server Node.js yang hidup — shared hosting cPanel tidak bisa menjalankannya, jadi yang dipakai dari hosting hanya nama domainnya lewat DNS.

`git push` ke `main` menerbitkan sendiri lewat integrasi Git milik Vercel; setiap pull request dapat URL pratinjau. `.github/workflows/ci.yml` menjalankan typecheck, lint, dan build sebagai penjaga — **CI sengaja tidak ikut men-deploy**, supaya tidak ada dua jalur yang mengerjakan hal sama.

Langkah lengkapnya, termasuk mengarahkan domain dan daftar gejala-penyebab, ada di `DEPLOY.md`.

Satu hal yang mudah terlewat: **seluruh pemanggilan API terjadi di server**, tidak ada satu pun Client Component yang memanggil `lib/api.ts` atau `services/`. Jadi frontend→backend adalah server-ke-server dan **CORS tidak pernah ikut bermain**. `CORS_ORIGINS` di backend adalah jaring pengaman untuk nanti, bukan syarat portal berjalan.

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

Penghapusan berkas **bukan tugas frontend**. Backend membuang objek di bucket bersamaan dengan record-nya, dan juga saat sebuah gambar diganti lewat `PATCH`. `DELETE /upload` hanya untuk berkas yang terlanjur terunggah lalu batal dipakai.

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

### 6. Saringan status hanya ada di daftar bertoken

`GET /news` dan `/monography` menerima `?published=`; `/announcement`, `/umkm`, `/potential`,
`/kkn/program`, dan `/maps/marker` menerima `?isActive=`. Tidak dikirim berarti "semua", dan
`meta.total` ikut menyesuaikan — jadi `?published=false&limit=1` cukup untuk sekadar
menghitung draf tanpa mengunduh isinya.

Mengirimnya ke versi tersaring (`/news/published`, `/umkm/active`, …) dijawab **`400`**: di
sana parameternya memang tidak punya arti. Itu sebabnya tipe query publik dan admin dipisah
di `types/api.ts` (`NewsQuery` vs `AdminNewsQuery`), bukan disatukan dengan field opsional.

`/maps/marker` juga menerima `?categoryId=` dan `/kkn/program` menerima `?subProgram=`, dan
keduanya bisa digabung dengan saringan status — itulah yang tidak bisa dilakukan
`/maps/marker/category/:id` maupun `/kkn/program/sub/:sub`, sehingga kedua endpoint terpisah
itu tidak dipakai dashboard.

### 7. Gambar utama dijaga backend

`isPrimary` pada gambar UMKM dan potensi dijaga dalam satu transaksi: gambar pertama sebuah
record otomatis menjadi utama, mengirim `isPrimary: true` melepas penanda gambar lain, dan
menghapus gambar utama mengangkat gambar teratas berikutnya. **Jangan memasang penjagaan
apa pun di frontend** — cukup satu `PATCH`. Melepas penanda pada satu-satunya gambar dijawab
`400`; dashboard tidak menyediakan tombolnya.

## Referensi

| Berkas | Isi | |
|--------|-----|---|
| `types/api.ts` | Tipe TypeScript semua model — **pakai ini, jangan tulis ulang atau menebak nama field** | di repo |
| `openapi.json` | Kontrak API lengkap, bisa dibaca tanpa menjalankan backend | di repo |
| `FRONTEND_GUIDE.md` | Panduan lengkap: kontrak API, resep komponen per halaman, detail pedoman mobile-first | internal |
| `LAPORAN-BACKEND.md` | Keterbatasan backend yang ditemukan saat implementasi, beserta usulan perbaikannya | internal |
| `JAWABAN-LAPORAN-BACKEND.md` | Jawaban tim backend: seluruh butir laporan sudah dikerjakan, beserta kontrak barunya | internal |
| `LAPORAN-BACKEND-2.md` | Laporan putaran kedua, disusun setelah dashboard selesai — temuan yang terbukti dari `openapi.json` dipisahkan dari asumsi yang masih perlu dikonfirmasi | internal |
| `JAWABAN-LAPORAN-BACKEND-2.md` | Jawaban putaran kedua: A-1 sampai C-6 selesai dan diverifikasi terhadap backend yang berjalan | internal |
| `LAPORAN-BACKEND-3.md` | Laporan putaran ketiga: `500` pada unggahan folder `peta`, model rumah warga, dan login Google — beserta daftar hal yang **tidak** perlu backend kerjakan | internal |
| `EVALUASI-MONOGRAFI.md` | Pencocokan portal dengan `monografi-idea.md` per bagian, memisahkan yang layak dikerjakan dari yang sengaja tidak dilanjutkan | internal |
| `JAWABAN-LAPORAN-BACKEND-3.md` | Jawaban putaran ketiga: A-1, B, dan C selesai. **Baca C-4** — `POST /auth/ticket` menjawab `accessToken`, bukan `token` | internal |
| `LAPORAN-BACKEND-4.md` | Laporan putaran keempat: unggahan gambar gagal karena Node.js di Render di bawah 22, **bukan** karena `SUPABASE_URL` seperti yang disebut pesan galatnya | internal |

Berkas selain dua yang teratas **sengaja tidak ikut di repo publik ini** (lihat `.gitignore`)
dan dibagikan lewat jalur internal. Semuanya tetap ada di komputer masing-masing anggota tim.

`openapi.json` kini memuat kontrak penuh: **103 respons berskema, 0 DTO kosong**, lengkap
dengan keterangan dan contoh per properti. Ia dihasilkan langsung dari kode backend, jadi
**kalau isinya berbeda dari `types/api.ts` yang disusun manual, yang benar `openapi.json`.**

Cara memperbaruinya kalau skema backend berubah: jalankan `npm run openapi` di repo backend
— tanpa database, Supabase, maupun server yang menyala — lalu salin `openapi.json`,
`types/api.ts`, dan `FRONTEND_GUIDE.md` dari `frontend-handoff/` ke sini. **Jangan menyalin
`CLAUDE.md` dari paket itu**: yang di sana adalah versi awal yang masih menyebut identitas
visual belum ditentukan dan dashboard belum dirancang, dan akan memundurkan berkas ini jauh.
Perubahan aturannya disalin manual.

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

**Dashboard admin sudah dimulai** (3 Agustus 2026): login, kerangka dashboard, modul berita
lengkap (tulis, ubah, hapus, unggah gambar), dan pengelolaan kategori berita. Menyusul
agenda, pengumuman, galeri, UMKM, potensi, dan program KKN (4 Agustus 2026), lalu peta
beserta kategori lokasinya, monografi, profil, dan pengaturan situs (7 Agustus 2026), lalu
halaman QR Code monografi (8 Agustus 2026). **Seluruh modul dashboard sudah ada.**

**Disesuaikan dengan kontrak putaran kedua** (8 Agustus 2026, `JAWABAN-LAPORAN-BACKEND-2.md`):
penjagaan `isPrimary` dibuang dari frontend, `getEveryMarker` dibuang, saringan status dipasang
di tujuh daftar dashboard, saringan kategori dipasang di daftar peta dan program KKN, blokir
hapus program KKN dilonggarkan menjadi peringatan, profil disatukan ke slug, dan pesan
"mintakan ke tim backend" pada pengaturan dicabut karena `PATCH` sudah upsert.

**Sesi dashboard diperbaiki** (10 Agustus 2026): dashboard memantulkan pengelola ke form
masuk di setiap menu karena prefetch `<Link>` memanggil rute keluar. Tombol keluarnya kini
Server Action, rute `/admin/keluar` dihapus seluruhnya, dan pembuangan cookie basi pindah ke
`proxy.ts`. Diuji terhadap build produksi dengan backend tiruan yang menjawab `401`.

**Laporan bug dari produksi dikerjakan** (11 Agustus 2026), setelah portal dipakai sungguhan:

- **Peta beranda tidak pernah muncul.** `LazyMount` memasang `IntersectionObserver` pada
  elemen ber-`display: contents`, yang tidak menghasilkan kotak layout — targetnya karena itu
  tidak pernah dilaporkan terlihat dan petanya berhenti di rangka pemuat selamanya.
- **Pin di luar layar.** Titik tengah di Pengaturan diketik tangan dan bisa berjarak
  kilometer dari pin yang terdata. `AutoFit` di `map-view.tsx` sekarang memaskan peta ke
  seluruh pin kalau titik tengahnya jatuh di luar sebarannya.
- **Kolom keterangan `/peta` colaps.** Kartu detail ikut berada di dalam area gulir, jadi
  memilih lokasi dari bagian bawah daftar menyisipkannya di atas posisi gulir yang terlihat.
- **Unggahan gambar gagal diam-diam** di atas 1 MB — lihat aturan Server Action di bawah.
- **Alamat di footer** kini tautan ke Google Maps, memakai koordinat yang sama dengan peta.

**Ditambahkan pada sesi yang sama:** batas wilayah/jalan/gang lewat GeoJSON statis, dan
portal bisa dipasang sebagai aplikasi di layar utama (PWA).

**Kontrak putaran ketiga dikerjakan** (12 Agustus 2026, `JAWABAN-LAPORAN-BACKEND-3.md`):

- **Rumah warga** — `services/house.ts`, `features/house/`, modul dashboard di `/admin/rumah`
  beserta pengelolaan KK dan penghuninya, ikon rumah berwarna per RT di peta, dan halaman
  `/peta/rumah/[slug]` yang bisa dibagikan.
- **Login dengan akun Google** — tombol di `/admin/login` dan Route Handler
  `/admin/login/google` yang menukar tiket sekali pakai menjadi cookie sesi.
- **Unggahan gambar** tidak perlu diubah: `500` yang kemarin ternyata `SUPABASE_URL`
  bertanda kutip di Render, bukan folder `peta`. Folder `rumah` sudah ditambahkan backend.

**Logo dan favicon akhirnya terpakai** (13 Agustus 2026). `site_logo` dan `site_favicon` sudah
bisa diunggah pengelola sejak modul Pengaturan dibuat, tetapi tidak ada satu pun tempat yang
membacanya: navbar dan footer memasang monogram "KD" apa adanya, dan ikon tab peramban datang
dari `app/icon.tsx` yang dibangkitkan saat build. Sekarang navbar dan footer memakai
`components/layout/site-logo.tsx` — monogramnya tinggal cadangan saat logo belum diunggah — dan
ikon tab mengikuti `site_favicon`. Diuji terhadap backend tiruan yang menjawab `GET /settings`
berisi kedua URL itu.

**Laporan pengelola dikerjakan** (13 Agustus 2026), pada sesi yang sama:

- **Titik tengah cadangan peta meleset 13,6 km.** `getMapView` memakai
  `-7.79558, 110.16349` — titik data seed, bukan Kembangsari — dan menyebutnya
  "koordinat Padukuhan Kembangsari" di komentarnya. Setiap kali kolomnya kosong di
  Pengaturan, peta terbuka di kapanewon lain dan tautan alamat di footer ikut ke sana.
  Sekarang `-7.690025, 110.228583`, sama dengan `public/data/README.md` dan form rumah.
  Contoh isian di form Pengaturan ikut dibetulkan — angka contoh yang salah adalah angka
  yang paling mungkin diketik ulang pengelola.
- **Batas luar padukuhan sudah tergambar.** `batas-wilayah.geojson` berisi satu polygon
  `PADUKUHAN` (±7,5 ha). RW dan RT-nya belum.
- **Catatan rumah ikut tampil di kartu peta**, bukan hanya setelah "Lihat Penghuni",
  dan kartu rumah akhirnya punya tombol bagikan seperti kartu lokasi.
- **Tautan media sosial dibetulkan lewat `socialLink`.** Isian tanpa `https://` dibaca
  peramban sebagai alamat relatif — ikon Instagram membuka `/instagram.com/nama` di
  portal sendiri lalu 404.
- **Spinner pada setiap tombol kirim.** `Button` punya `loading`, dan
  `components/ui/submit-button.tsx` menyatukan pola `useFormStatus` untuk halaman yang
  seluruhnya Server Component — sembilan belas halaman konfirmasi hapus sebelumnya tidak
  punya keadaan menunggu sama sekali.

**Belum ada satu pun modul dashboard yang diuji dengan backend hidup** — penyesuaian di atas
mengikuti kontrak yang sudah backend verifikasi sendiri, tetapi alur tulisnya belum ditekan
tombolnya dari sisi ini.

## Struktur berkas

```
app/(publik)/           Portal warga. Layout-nya yang memasang Navbar & Footer.
                        Halaman daftar berada di route group (daftar)/
app/admin/              Dashboard. (dasbor)/ memakai kerangka bersidebar;
                        login/ sengaja di luarnya
app/layout.tsx          Hanya dokumen: bahasa, font, tema, metadata
app/manifest.ts         Keterangan pemasangan sebagai aplikasi (PWA)
app/ikon/[ukuran]/      Seluruh ikon monogram cadangan (32, 180, 192, 512),
                        dibangkitkan saat build. Yang dipakai ditentukan
                        `icons` di app/layout.tsx, bukan konvensi berkas
app/luring/             Halaman saat sambungan putus — DI LUAR (publik)/,
                        karena layout itu memanggil GET /settings
public/sw.js            Service worker: hanya cadangan luring, tanpa cache halaman
public/data/            Batas wilayah, jalan, dan gang sebagai GeoJSON statis
proxy.ts                Penjaga /admin — memeriksa ada tidaknya cookie sesi,
                        sekaligus satu-satunya tempat cookie basi dibuang
components/ui/          Komponen dasar lintas modul
components/layout/      Navbar, Footer, penyedia tema
features/<modul>/       Komponen khusus satu modul, termasuk features/admin/
services/<modul>.ts     Satu berkas per modul backend — semua pemanggilan API lewat sini
lib/api.ts              Klien HTTP tunggal
lib/session.ts          Cookie sesi admin (server saja). `sessionCookie` dipakai
                        dua pemasang: Server Action login, dan Route Handler
                        balikan Google yang menempelkannya ke NextResponse
lib/coordinates.ts      Pembacaan lintang/bujur, dipakai peta dan rumah warga
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
- **Batas wilayah, jalan, dan gang adalah berkas statis**, bukan data backend:
  `public/data/batas-wilayah.geojson`, petunjuk pengisiannya di `public/data/README.md`.
  Ketiganya berubah sekali dalam sepuluh tahun, sedangkan penyunting polygon di dashboard
  adalah pekerjaan tersendiri yang besar. Berkasnya diambil di browser lewat
  `hooks/use-boundaries.ts`, bukan diimpor sebagai JSON di Server Component — polygon bisa
  berisi ribuan koordinat, dan mengimpornya menyalin seluruh angka itu ke muatan halaman yang
  diunduh setiap pengunjung, termasuk yang tidak pernah membuka petanya. Berkas yang kosong
  atau gagal dibaca diperlakukan sebagai "belum ada batas wilayah"; peta tidak boleh runtuh.
- **`LazyMount` tidak boleh memakai `display: contents`.** Elemen ber-`display: contents`
  tidak menghasilkan kotak layout, dan IntersectionObserver menghitung perpotongan dari kotak
  itu — targetnya tidak pernah dilaporkan terlihat dan isinya tidak pernah dipasang. Ini
  pernah benar-benar terjadi: peta beranda berhenti di rangka pemuat selamanya.
- **Peta memaskan diri ke pin kalau titik tengahnya jatuh jauh** (`AutoFit` di
  `map-view.tsx`). Titik tengah di Pengaturan diketik tangan; ketika ia berjarak kilometer
  dari pin yang terdata, peta terbuka dengan benar tetapi layarnya kosong — dan itu terbaca
  sebagai "petanya tidak muncul". Titik tengah pilihan admin tetap dihormati selama berada di
  sekitar sebaran pin. Marker berkoordinat bukan-angka dibuang sebelum digambar, karena satu
  saja cukup membuat Leaflet melempar dan menjatuhkan seluruh peta.
- **Lokasi yang sedang dibuka ikut ditulis ke alamat** sebagai `/peta?lokasi=<id>`, dan itu
  satu-satunya pengecualian dari "filter peta memakai state klien, bukan URL". Penulisannya
  memakai `history.replaceState`, bukan router Next.js, jadi tidak ada permintaan yang
  berangkat dan `/peta` tetap dipranyatakan statis. Alamatnya juga **dibaca lewat
  `window.location`, bukan `useSearchParams`** — hook itu memaksa halamannya dirender per
  permintaan. Bacaannya dijaga `useHydrated` supaya HTML dari server dan render pertama di
  browser tetap sama, dan effect penulisnya berhenti lebih dulu sebelum hydration selesai —
  tanpa itu ia justru menghapus `?lokasi=` dari tautan yang baru saja dibuka.
- **`components/ui/share-button.tsx` punya dua jalur, dan keduanya perlu ada.** Di ponsel
  `navigator.share` membuka lembar berbagi bawaan sistem; di komputer API itu hampir selalu
  tidak ada dan yang tersisa menyalin tautan ke papan klip. Menutup lembar berbagi
  (`AbortError`) bukan kegagalan dan tidak boleh berakhir dengan tautan yang diam-diam
  tersalin. Komponen ini dibuat umum karena rumah warga nanti memerlukannya juga.
- **Portal bisa dipasang sebagai aplikasi**, tetapi service worker-nya sengaja **tidak
  menyimpan halaman ke cache** (`public/sw.js`). Ia hanya menyediakan cadangan luring dan
  memenuhi syarat Chrome memunculkan ajakan pasang. Berita, agenda, dan pengumuman harus
  terbaca terkini, dan `/admin` tidak disentuh sama sekali. Halaman luringnya di `app/luring/`
  berada **di luar route group `(publik)`** karena layout itu memanggil `GET /settings` —
  permintaan yang justru mustahil berhasil saat halaman itu dibutuhkan.
- **Tanpa TanStack Query, Axios, Zustand, Framer Motion** meski disebut di dokumen arsitektur.
  Halaman publik memakai Server Component + `fetch`, jadi pustaka itu hanya menambah berkas
  yang harus diunduh tanpa memberi manfaat. Pertimbangkan lagi saat membangun dashboard admin.
- **Satu-satunya dependensi tambahan: `qrcode`** (di luar Leaflet dan react-markdown yang
  memang dipakai halaman publik). Penolakan di butir sebelumnya menyasar pustaka yang harus
  diunduh browser warga; `qrcode` hanya dipanggil `lib/qr.ts` dari Server Component dan Route
  Handler, sehingga yang sampai ke ponsel cuma SVG atau PNG jadi. Menulis encoder QR sendiri
  berarti memelihara Reed-Solomon dan masking sendiri — satu bit meleset, QR-nya tidak terbaca.
- **Ikon peramban dideklarasikan lewat `icons` di `app/layout.tsx`, bukan `app/icon.tsx`.** Logo
  dan favicon adalah isi Pengaturan, jadi keduanya hanya bisa masuk lewat `generateMetadata`.
  Konvensi berkas Next.js tidak bisa hidup berdampingan dengannya: resolver metadata menaruh
  ikon konvensi-berkas **di depan** daftar `icons`, sehingga favicon pengelola dan monogram
  bawaan sama-sama tercetak sebagai `<link rel="icon">` dan peramban bebas memilih yang mana —
  itulah sebabnya favicon yang sudah diunggah tetap tidak tampak. Lebih halus lagi: begitu
  `icons` disetel, seluruh ikon konvensi-berkas justru **dibuang**, termasuk `apple-icon.tsx`
  yang tidak ada hubungannya. Karena itu `app/icon.tsx` dan `app/apple-icon.tsx` dihapus,
  monogramnya pindah ke `app/ikon/[ukuran]`, dan `apple` ikut ditulis di `icons` meski isinya
  tidak berubah-ubah. Jangan menambahkan kembali berkas `icon.tsx`/`apple-icon.tsx`.
- **Ikon layar utama tetap monogram, tidak mengikuti `site_logo`.** iOS dan peluncur Android
  memotong sudutnya dan menaruh logo berlatar tembus pandang di atas hitam; lambang yang bagus
  di navbar belum tentu selamat di sana. Yang mengikuti Pengaturan hanya ikon tab peramban.
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
- **Tidak ada satu pun `GET` yang mengakhiri sesi.** Keluar atas kemauan sendiri memakai
  Server Action `logoutAction` di `(dasbor)/actions.ts`; `401` saat merender diarahkan ke
  `SESSION_EXPIRED_PATH` (`/admin/login?sesi=habis`) dan **`proxy.ts` yang membuang
  cookie basinya di sana** — dari permintaan yang diteruskan sekaligus dari browser.

  Rute `/admin/keluar` yang dulu memegang tugas itu sudah dihapus, dan alasannya bukan
  selera. Sebuah `GET` yang mengakhiri sesi bisa terpanggil tanpa seorang pun mengkliknya:
  prefetch `<Link>` di production pernah benar-benar melakukannya lewat tombol "Keluar" di
  bilah atas setiap halaman, sehingga **setiap menu yang diketuk meminta login lagi**.
  Menyaringnya lewat header tidak menutup lubangnya — dari tiga strategi prefetch Next.js
  16 hanya satu yang mengirim `Next-Router-Prefetch: 1`, dan yang menentukan, `redirect()`
  dari Server Component pada navigasi lunak dikirim sebagai `NEXT_REDIRECT` di dalam muatan
  RSC lalu **router klien yang meminta alamat tujuannya**, dengan `RSC: 1` dan tanpa header
  prefetch. Jalur `401` yang sah dan prefetch tiba dalam bentuk yang identik.

  Karena itu jangan menambahkan rute keluar dalam bentuk apa pun, dan **jangan memasang
  `<Link>` ke alamat yang punya efek samping.** Halaman masuk aman memegang tugas ini: ia
  memang halaman yang sedang dituju pengguna, dan tidak punya apa pun untuk dirusak.
- **Field opsional yang dikosongkan wajib dikirim `null`, bukan dihilangkan.** `PATCH` hanya
  menyentuh field yang dikirim, jadi menghilangkannya membuat nilai lama bertahan — gambar
  atau waktu selesai yang baru saja dihapus pengelola akan diam-diam kembali. `null` diterima
  backend karena `@IsOptional()` melewatkan null tanpa menjalankan `@IsString()`/`@IsDateString()`.
- **Waktu diisi lewat `datetime-local` dan dikunci ke WIB** di kedua arah
  (`toDateTimeLocal` / `fromDateTimeLocal` di `lib/format.ts`). Input itu tidak mengenal zona
  waktu; tanpa penguncian, jadwal akan bergeser tujuh jam begitu backend berjalan di UTC.
- **Slug agenda dibiarkan kosong saat menambah.** Backend membuatnya dari judul beserta
  penomoran untuk judul yang berulang — "posyandu-balita", lalu "posyandu-balita-2". Mengisinya
  otomatis dari sisi frontend justru membuat Posyandu bulanan bertabrakan `409`.
- **Unggah banyak gambar** memakai `POST /upload/multiple` dengan nama field `files` (jamak,
  beda dari `file` pada unggahan tunggal) dan maksimal `UPLOAD_MAX_FILES` berkas. Berkas
  diperiksa di browser **dan** di server: unggahan galeri paling berat di seluruh dashboard,
  dan menunggu sepuluh foto ponsel terkirim hanya untuk ditolak backend menyakitkan di
  jaringan padukuhan.
- **`isPrimary` dijaga backend, jangan ikut menjaganya.** Lihat aturan 7 di atas. Server Action
  gambar UMKM dan potensi tidak mengirim `isPrimary` saat menambah, mengirim satu `PATCH`
  saat mengganti gambar utama, dan tidak melakukan apa pun setelah menghapus. Penjagaan lama
  di frontend sudah dibuang seluruhnya — jangan dipasang kembali.
- **Potensi punya dua jalur gambar.** `thumbnail` adalah satu URL di record itu sendiri
  (unggahan tunggal lewat form, sama seperti berita), sedangkan `/potential/image` adalah
  galeri dokumentasinya. Kartu daftar memakai `thumbnail` dan jatuh ke gambar `isPrimary`
  bila kosong — itu sebabnya penanda utama tetap penting meski sampulnya terpisah.
- **Kategori potensi divalidasi di Server Action**, bukan hanya di `<select>`. Nilainya enum
  huruf besar, dan yang di luar daftar dijawab backend `400` dengan pesan yang tidak
  menjelaskan apa pun. Daftar sahnya satu-satunya ada di `features/potential/categories.ts`.
  Hal yang sama berlaku untuk sub-program KKN di `features/kkn/sub-programs.ts` — label dan
  daftarnya sengaja dipisah dari `kkn-card.tsx` supaya Server Action tidak ikut menarik React.
- **Menghapus program KKN ikut menghapus kegiatannya**, berantai dalam satu transaksi seperti
  gambar UMKM. Halaman konfirmasinya memperingatkan berapa kegiatan yang ikut hilang, bukan
  memblokir; Server Action-nya tidak memeriksa apa pun lebih dulu.
- **Tanggal tanpa jam** (`KKNActivity.date`) memakai `toDateInput`/`fromDateInput` di
  `lib/format.ts`, sepasang dengan `toDateTimeLocal`/`fromDateTimeLocal`. Penguncian ke WIB
  tetap perlu meski jamnya dibuang: yang tersimpan tetap sebuah momen, dan tanpa itu tanggal
  yang diketik bisa terbaca mundur sehari saat formulirnya dibuka kembali.
- **Pembersihan berkas di bucket bukan urusan frontend.** Menghapus record — dan mengganti
  gambarnya lewat `PATCH` — membuat backend ikut membuang berkasnya. `DELETE /upload` tinggal
  untuk satu keadaan: berkas yang terlanjur terunggah lalu batal dipakai. Jangan memanggilnya
  setelah menghapus record.
- **Kartu berulang memakai form server biasa**, bukan Client Component: kisi foto bisa berisi
  puluhan kartu, dan menjadikannya komponen klien mengirim semuanya ke browser demi dua isian.
- **Hanya kategori berita yang benar-benar menolak dihapus.** `News.categoryId` tidak boleh
  kosong, jadi kategori yang masih dipakai ditolak database dengan "Referensi data tidak
  valid" — kalimat yang tidak menjelaskan apa pun kepada pengelola. Karena itu tombol hapusnya
  dimatikan lebih dulu berdasarkan `_count.news`, dan halaman konfirmasinya memeriksa ulang.
  **Sisanya berantai**, dan yang berantai diperingatkan, bukan diblokir:

  | Model | `_count` | Perilaku hapus |
  |-------|----------|----------------|
  | `Category` (berita) | `news` | ditolak `400` — matikan tombolnya |
  | `MapCategory` | `markers` | marker ikut terhapus — peringatkan |
  | `GalleryAlbum` | `items` | item ikut terhapus — peringatkan |
  | `UMKM`, `Potential` | `images` | gambar ikut terhapus — peringatkan |
  | `KKNProgram` | `activities` | kegiatan ikut terhapus — peringatkan |
- **`_count.markers` pada kategori peta dipakai untuk memperingatkan, bukan mematikan tombol.**
  Ia datang langsung dari `GET /maps/category` dan sudah menghitung marker yang disembunyikan.
  Jangan menghitungnya sendiri dari daftar marker — `getEveryMarker` yang dulu melakukan itu
  sudah dibuang.
- **`categoryId` marker divalidasi di Server Action**, seperti kategori potensi — id yang tidak
  ada dijawab backend dengan galat referensi yang tidak menjelaskan apa pun. Pemeriksaannya
  memakai `getMapCategoriesUncached`, bukan `getMapCategories` yang di-cache sepuluh menit:
  kategori yang baru dibuat pada menit yang sama akan terbaca sebagai tidak ada, dan marker
  yang sah pun ditolak.
- **Koordinat marker wajib, tidak seperti pada potensi dan UMKM.** Di sana koordinat hanya
  mengisi tombol "Petunjuk Arah" dan boleh kosong; marker peta tanpa lintang-bujur justru
  tersimpan tanpa pernah tampil di peta, dan pengelola tidak punya cara mengetahuinya.
- **Saringan daftar dashboard memakai chip ber-URL**, bukan `<select>` berstate: setiap
  kombinasi saringan punya alamat sendiri yang bisa dibagikan antar pengelola, dan formnya
  tetap bekerja tanpa JavaScript. Kosakata `?status=` ada di `features/admin/status-filter.ts`
  (`terbit`/`draf` dan `tampil`/`tersembunyi`); nilai di luar kosakata diperlakukan sebagai
  "semua", tidak diteruskan ke backend — `published` yang bukan true/false dijawab `400`, dan
  halaman daftar tidak boleh runtuh karena salah ketik di alamat. Berkas itu sengaja bebas
  React karena diimpor Server Component.
- **Sub-program KKN memakai nilai enum apa adanya di URL** (`?sub=RUMAH_BELAJAR`), tidak
  di-slug seperti kategori berita dan potensi: enum itu tidak punya slug di backend, dan
  menambah satu lapis penerjemahan hanya menambah tempat yang bisa meleset.
- **Warna pin peta berasal dari urutan kategori** (`colorForCategory` di
  `features/maps/map-view.tsx`), bukan dari kolom `icon`. Menghapus atau menambah kategori
  menggeser warna kategori sesudahnya — halaman kategori dan halaman hapusnya menyebutkan itu.
  Kolom `icon` tetap disunting di form meski belum dipakai portal, supaya nama ikon yang sudah
  tersimpan tidak terhapus diam-diam oleh `PATCH`.
- **Kolom monografi yang dikosongkan dikirim `null`, dan itu bukan nol.** `null` berarti tidak
  didata: halaman publik menyembunyikan kategorinya, sedangkan 0 tampil sebagai batang kosong
  yang menyatakan angkanya memang nihil. Formnya mengulang keterangan itu di setiap kelompok
  isian, dan `placeholder`-nya "Belum didata".
- **`employmentData` dikirim sebagai objek utuh**, bukan tambalan — `PATCH` menimpanya
  sekaligus. Kunci yang dikosongkan dibuang dari objek, dan objek yang seluruhnya kosong
  dikirim `null`. Daftar kuncinya hanya ada di `features/monography/employment.ts`
  (`EMPLOYMENT_KEYS`/`EMPLOYMENT_LABELS`); kunci di luar itu ditolak backend.
- **Laki-laki + perempuan wajib sama dengan total penduduk.** Diperiksa di Server Action, bukan
  hanya di browser: halaman publik menghitung persentase jenis kelamin dari penjumlahan kedua
  angka lalu menampilkan totalnya sebagai baris tersendiri, jadi selisihnya terbaca warga
  sebagai dua angka yang saling membantah.
- **Monografi ditelusuri lewat `id` di dashboard**, bukan tahun seperti `/monografi?tahun=`.
  Tahun adalah kolom yang bisa disunting, dan alamat halaman tidak boleh ikut berubah saat
  pengelola membetulkan salah ketik pada tahunnya.
- **Daftar kolom angka monografi ada di `features/monography/fields.ts`**, dipakai bersama oleh
  form dan Server Action-nya. Ada 19 kolom opsional; menuliskannya dua kali berarti cepat atau
  lambat ada kolom yang tampil di form tetapi tidak pernah ikut terkirim. Berkas itu sengaja
  bebas React karena Server Action mengimpornya.

- **Profil seluruhnya ditelusuri lewat slug.** `GET`, `PATCH`, dan `DELETE /profile/:idOrSlug`
  sama-sama menerima slug, jadi form profil tidak lagi membawa `id`. Yang dibawanya
  `currentSlug` — slug yang berlaku saat halaman dibuka, bukan slug yang sedang diketik di
  kolomnya; kolom itu boleh berubah dan tidak bisa dipakai menemukan record-nya. `404` saat
  menyimpan berarti slug-nya berubah dari tab lain, dan pesannya menyebut itu.
- **Profil tidak punya status draf.** Model `Profile` memang tidak punya kolomnya, jadi tidak
  ada badge terbit/draf di daftarnya dan setiap simpanan langsung terbaca warga. Jangan
  menambahkan penyaring seolah-olah statusnya ada.
- **Dashboard memakai `getProfilesAsAdmin`/`getProfileBySlugAsAdmin`**, bukan fungsi publik yang
  sama isinya. Bedanya hanya cache: versi publik menyimpan jawabannya satu jam, dan pengelola
  tidak boleh menunggu sejam untuk melihat tulisannya sendiri.
- **`PATCH /settings/:key` bersifat upsert.** Key yang belum ada dibuatkan, jadi menambah
  pengaturan baru tidak perlu seed backend. `SettingKey` (`types/api.ts`) adalah daftar yang
  datang dari seed, bukan daftar tertutup. Tidak ada `DELETE`, dan itu disengaja —
  mengosongkan `value` lebih aman. `value` selalu teks, termasuk `map_zoom` dan koordinat.
- **Yang dikirim hanya pengaturan yang berubah.** Satu permintaan per key, jadi menyimpan
  ketujuh belasnya setiap kali tombol simpan ditekan berarti tujuh belas permintaan untuk satu
  perubahan kecil. Nilai tersimpan dibaca ulang di Server Action untuk membandingkannya.
- **`SETTINGS_FALLBACK` tidak boleh masuk ke form pengaturan.** `getSettingsMap` mencampurkan
  nilai cadangan frontend agar navbar dan footer tidak pernah kosong; kalau nilai itu ikut
  tampil di form, pengelola mengira sudah tersimpan — dan menekan simpan akan benar-benar
  menuliskannya ke backend. Karena itu formnya memakai `getSettingsAsAdmin` yang polos.
- **Menyimpan pengaturan menyegarkan seluruh portal** dengan `revalidatePath("/", "layout")`,
  bukan satu halaman: nama situs, logo, dan kontak dipakai navbar serta footer yang menempel di
  setiap halaman.
- **Susunan form pengaturan ada di `features/settings/fields.ts`** — dipakai bersama form dan
  Server Action-nya, dan sengaja bebas React karena aksi itu mengimpornya. `hint` di sana teks
  biasa, bukan JSX, dengan alasan yang sama.
- **QR Code (FR-052) dibangkitkan saat diminta, bukan disimpan sebagai berkas.** `/admin/qr-code`
  merender SVG-nya di server dan `/admin/qr-code/unduh?format=png|svg` mengirimkannya sebagai
  berkas lewat Route Handler — tanpa JavaScript sama sekali, kecuali tombol cetak yang
  menyembunyikan diri sampai halaman ter-hydrate. Karena selalu dibangkitkan ulang, QR-nya
  mengikuti `NEXT_PUBLIC_SITE_URL` yang sedang berlaku; tidak ada berkas usang di `public/`
  yang mengarah ke `localhost` setelah portal naik ke domain sungguhan.
- **Lembar QR dipatok hitam-putih**, tidak mengikuti token tema. Pemindai mencari modul gelap
  di atas latar terang, dan QR yang ikut membalik di mode gelap tidak terbaca sebagian ponsel —
  kertas cetaknya pun selalu putih. Ini satu-satunya tempat warna ditulis langsung, dan
  alasannya fisik, bukan estetis.
- **`print:hidden` di bilah atas dan sidebar** (`app/admin/(dasbor)/layout.tsx`) supaya yang
  tercetak hanya lembar QR-nya. Koreksi galatnya **Q** (pulih 25%), bukan `M` bawaan: kertas
  yang ditempel di balai padukuhan akan kotor dan tersenggol.
- **Rumah warga: `birthYear`, bukan umur; `dataVerifiedAt`, bukan `updatedAt`.** Yang
  tersimpan tahun lahir dan umurnya dihitung `ageFromBirthYear` saat menggambar — menyimpan
  umur membuat seluruh data salah setahun kemudian. `dataVerifiedAt` menyatakan kapan pendata
  terakhir memeriksanya, sedangkan `updatedAt` ikut berubah setiap salah ketik dibetulkan;
  yang ditampilkan sebagai "Data diverifikasi …" adalah yang pertama.
- **Kepala keluarga dijaga backend, jangan ikut menjaganya** — persis seperti `isPrimary` pada
  gambar UMKM. Warga pertama sebuah KK otomatis menjadi kepala keluarga, menyetel yang baru
  melepas penanda yang lama, dan menghapusnya mengangkat penghuni teratas menurut `order`.
  **`LAINNYA` bukan sekadar salah satu pilihan**: itu yang disetel backend pada kepala
  keluarga lama, dan artinya "hubungan aslinya menunggu dibetulkan pendata". Karena itu
  `needsRelationReview` menampilkannya sebagai peringatan, bukan keterangan biasa yang mudah
  terlewat.
- **KK dan penghuni memakai form server biasa**, sama alasannya dengan kartu gambar UMKM: satu
  rumah bisa berisi beberapa KK dan belasan warga, masing-masing dengan formnya sendiri.
  Akibatnya galat dibawa lewat `?galat=` pada alamat halaman rumahnya, bukan dikembalikan
  sebagai state — dan `redirect()` di dalamnya **wajib berada di luar blok `try`**, karena ia
  bekerja dengan melempar dan akan tertangkap `catch`-nya sendiri.
- **`DELETE` rumah, KK, dan warga menuntut peran `ADMIN`**, bukan sekadar token yang sah.
  `403` diterjemahkan menjadi kalimat yang menyebut apa yang harus dilakukan pengelola, bukan
  diteruskan apa adanya.
- **`GET /house/active` dan `GET /house/summary` ARRAY POLOS.** Ringkasan per RT selalu
  diambil dari `/house/summary`, tidak pernah dijumlahkan sendiri dari daftar rumah: yang
  pertama hanya menghitung rumah aktif dan urutannya numerik, dan angkanya harus sama dengan
  yang dipakai halaman monografi.
- **Warna ikon rumah berasal dari urutan RT yang benar-benar ada** (`colorForRt`), bukan dari
  angkanya. RT Kembangsari bernomor 05–08; memetakan "05" ke indeks 5 akan menyisakan lima
  warna pertama tidak terpakai sementara RT-nya berdesakan di ujung palet.
- **Masuk dengan Google berakhir di Route Handler, bukan halaman.** `/admin/login/google`
  menukar tiket sekali pakai lalu menyetel cookie — dan Server Component memang tidak boleh
  menyetel cookie. Ini **tidak** melanggar aturan "tidak ada `GET` yang menyentuh sesi": rute
  keluar yang dulu dihapus *mengakhiri* sesi sehingga satu prefetch cukup melempar pengelola
  keluar, sedangkan yang ini *membuat* sesi dan hanya berhasil dengan tiket sah yang baru
  diterbitkan untuk peramban itu. Tetap: **jangan pernah memasang `<Link>` ke alamat itu.**
  `proxy.ts` membuka jalannya lewat `pathname.startsWith("/admin/login/")` — tanpa itu
  balikan Google dipantulkan ke form masuk dan tiketnya hangus tanpa pernah ditukar.
- **`POST /auth/ticket` menjawab `accessToken`, bukan `token`** — sengaja sama persis dengan
  `POST /auth/login`, sehingga `sessionCookie` yang sama dipakai kedua alur.
- **Batas ukuran unggahan datang dari Server Action, bukan dari backend.** Seluruh unggahan
  gambar dashboard menumpang Server Action, dan Vercel menolak badan permintaan di atas
  **4,5 MB** di lapisan platformnya — jauh sebelum Next.js sempat membacanya. `bodySizeLimit`
  di `next.config.ts` karena itu dipatok 4 MB (bawaannya hanya **1 MB**, dan tanpa baris itu
  foto ponsel biasa gagal tanpa pesan yang menyebut ukuran). Batas yang benar-benar
  diberlakukan ke pengelola ada di `lib/image.ts`: `IMAGE_MAX_BYTES` per berkas dan
  `validateImageBatch` untuk **jumlah** seluruh berkas pada unggahan banyak gambar — sepuluh
  foto yang masing-masing lolos tetap bisa menembus batas kalau ditotal. Angkanya jangan
  ditulis ulang di komponen; pakai `IMAGE_MAX_LABEL`.

## Yang belum dikerjakan

- Seluruh daftar kebutuhan sudah tergarap, termasuk QR Code monografi (FR-052).
- **Menunggu deploy backend.** Kode putaran ketiga sudah ada di `feat/phase2-modules-and-deploy`
  dan sudah di-push, tetapi produksi masih menjawab `404` untuk `/house/*` dan `/auth/google` —
  Render belum menerbitkan versi itu. Seluruh modul rumah warga dan login Google di frontend
  dibangun terhadap `openapi.json`, bukan terhadap backend yang berjalan.
- **Menunggu pengelola:** `public/data/batas-wilayah.geojson` masih kosong, sepuluh marker di
  produksi masih data seed yang berjarak ±13,8 km dari padukuhan yang sebenarnya, dan
  `SUPABASE_URL` di Render masih bertanda kutip (kodenya sudah menambal, nilainya belum).
- Prioritas selanjutnya dan yang sengaja **tidak** dilanjutkan: `EVALUASI-MONOGRAFI.md`.
- **Belum ada satu pun modul dashboard yang diuji dengan backend hidup.** Yang paling layak
  ditekan tombolnya lebih dulu — bukan lagi karena kontraknya meragukan, melainkan karena
  butir yang bergantung pada transaksi memang perlu dijalankan:
  - alur gambar UMKM/potensi setelah penjagaan `isPrimary` dilepas ke backend;
  - hapus kategori peta dan hapus program KKN, yang kini berantai;
  - saringan status di ketujuh daftar (nilai boolean dikirim sebagai `"true"`/`"false"`
    lewat query string oleh `buildUrl`);
  - simpan profil setelah penandanya berpindah dari `id` ke slug.
- **Untuk tim backend:** frontend **tidak pernah** mengirim `?search=` ke `/monography`.
  `AdminMonographyQuery` di paket handoff masih memuatnya, tetapi `services/monography.ts`
  menyempitkannya dengan `Omit<…, "search">` di kedua fungsinya. Jadi parameter itu aman
  ditolak `400` seperti yang ditawarkan di B-2.
