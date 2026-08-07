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

**Dashboard admin sudah dimulai** (3 Agustus 2026): login, kerangka dashboard, modul berita
lengkap (tulis, ubah, hapus, unggah gambar), dan pengelolaan kategori berita. Menyusul
agenda, pengumuman, galeri, UMKM, potensi, dan program KKN (4 Agustus 2026), lalu peta
beserta kategori lokasinya, monografi, profil, dan pengaturan situs (7 Agustus 2026).
**Seluruh modul dashboard sudah ada**, tetapi belum satu pun diuji dengan backend hidup.

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
- **`isPrimary` tidak dijaga backend.** Kolom itu sekadar disimpan, sehingga dua gambar bisa
  sama-sama bertanda utama dan kartu daftar akan menampilkan salah satunya secara acak. Yang
  menjaganya frontend: gambar pertama otomatis jadi utama, menandai yang baru melepas yang
  lama satu per satu, dan menghapus gambar utama mengangkat sisa yang pertama sebagai gantinya.
  Berlaku sama untuk potensi.
- **Potensi punya dua jalur gambar.** `thumbnail` adalah satu URL di record itu sendiri
  (unggahan tunggal lewat form, sama seperti berita), sedangkan `/potential/image` adalah
  galeri dokumentasinya. Kartu daftar memakai `thumbnail` dan jatuh ke gambar `isPrimary`
  bila kosong — itu sebabnya `isPrimary` tetap dijaga meski sampulnya terpisah.
- **Kategori potensi divalidasi di Server Action**, bukan hanya di `<select>`. Nilainya enum
  huruf besar, dan yang di luar daftar dijawab backend `400` dengan pesan yang tidak
  menjelaskan apa pun. Daftar sahnya satu-satunya ada di `features/potential/categories.ts`.
  Hal yang sama berlaku untuk sub-program KKN di `features/kkn/sub-programs.ts` — label dan
  daftarnya sengaja dipisah dari `kkn-card.tsx` supaya Server Action tidak ikut menarik React.
- **Menghapus program KKN diblokir selama masih punya kegiatan.** `KKNActivity.programId`
  relasi wajib dan tidak ada catatan bahwa backend menghapusnya berantai seperti gambar UMKM.
  Dua kemungkinannya sama-sama buruk: galat "Referensi data tidak valid" yang tidak
  menjelaskan apa pun, atau seluruh dokumentasi lenyap tanpa diminta. **Belum diuji dengan
  backend hidup** — kalau ternyata backend memang cascade, blokirnya boleh dilonggarkan
  menjadi peringatan berisi jumlah kegiatan, seperti halaman hapus UMKM.
- **Daftar program KKN di dashboard tidak punya saringan sub-program.** `GET /kkn/program`
  hanya menerima `page`, `limit`, `search`. `/kkn/program/sub/:subProgram` bukan penggantinya
  karena menyaring yang aktif saja — program tersembunyi justru lenyap saat dicari.
- **Tanggal tanpa jam** (`KKNActivity.date`) memakai `toDateInput`/`fromDateInput` di
  `lib/format.ts`, sepasang dengan `toDateTimeLocal`/`fromDateTimeLocal`. Penguncian ke WIB
  tetap perlu meski jamnya dibuang: yang tersimpan tetap sebuah momen, dan tanpa itu tanggal
  yang diketik bisa terbaca mundur sehari saat formulirnya dibuka kembali.
- **Menghapus record tidak menghapus berkasnya di bucket.** Backend hanya membuang barisnya;
  berkas yatim harus dibuang lewat `DELETE /upload` dengan `path`-nya. Belum ada yang
  melakukannya otomatis — layak diusulkan ke backend.
- **Kartu berulang memakai form server biasa**, bukan Client Component: kisi foto bisa berisi
  puluhan kartu, dan menjadikannya komponen klien mengirim semuanya ke browser demi dua isian.
- **Relasi wajib memblokir penghapusan.** `News.categoryId` tidak boleh kosong, jadi kategori
  yang masih dipakai ditolak database dengan pesan "Referensi data tidak valid" — kalimat yang
  tidak menjelaskan apa pun kepada pengelola. Karena itu tombol hapusnya dimatikan lebih dulu
  berdasarkan `_count.news`, dan halaman konfirmasinya memeriksa ulang. Pola yang sama berlaku
  untuk modul lain yang punya relasi wajib.
- **Kategori marker peta dihitung sendiri.** `GET /maps/category` tidak menyertakan `_count`
  seperti kategori berita, padahal `MapMarker.categoryId` juga relasi wajib. Jumlah
  pemakaiannya dihitung dari daftar marker (`getEveryMarker` di `services/maps.ts`, menyusuri
  semua halaman `GET /maps/marker`) supaya tombol hapusnya bisa dimatikan lebih dulu. Dipakai
  endpoint admin, bukan `/maps/marker/active`, agar marker yang disembunyikan ikut terhitung —
  kalau tidak, kategori yang "kosong" akan tetap ditolak database saat dihapus. **Layak
  diusulkan ke backend** supaya `_count` ikut dikirim.
- **`categoryId` marker divalidasi di Server Action**, seperti kategori potensi — id yang tidak
  ada dijawab backend dengan galat referensi yang tidak menjelaskan apa pun. Pemeriksaannya
  memakai `getMapCategoriesUncached`, bukan `getMapCategories` yang di-cache sepuluh menit:
  kategori yang baru dibuat pada menit yang sama akan terbaca sebagai tidak ada, dan marker
  yang sah pun ditolak.
- **Koordinat marker wajib, tidak seperti pada potensi dan UMKM.** Di sana koordinat hanya
  mengisi tombol "Petunjuk Arah" dan boleh kosong; marker peta tanpa lintang-bujur justru
  tersimpan tanpa pernah tampil di peta, dan pengelola tidak punya cara mengetahuinya.
- **Daftar marker di dashboard tidak punya saringan kategori.** `GET /maps/marker` hanya
  menerima `page`, `limit`, `search`. `/maps/marker/category/:categoryId` tidak dipakai sebagai
  penggantinya karena tidak terdokumentasi apakah ia ikut menyembunyikan marker nonaktif —
  masalah yang sama dengan `/kkn/program/sub/:subProgram`.
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

- **Profil ditelusuri lewat slug, tetapi disimpan lewat id.** `GET /profile/:slug`, sedangkan
  `PATCH` dan `DELETE /profile/:id` — satu-satunya modul dengan dua jenis penanda seperti ini,
  jadi form profil membawa `id` sebagai input tersembunyi meski alamat halamannya slug.
- **Profil tidak punya status draf.** Model `Profile` memang tidak punya kolomnya, jadi tidak
  ada badge terbit/draf di daftarnya dan setiap simpanan langsung terbaca warga. Jangan
  menambahkan penyaring seolah-olah statusnya ada.
- **Dashboard memakai `getProfilesAsAdmin`/`getProfileBySlugAsAdmin`**, bukan fungsi publik yang
  sama isinya. Bedanya hanya cache: versi publik menyimpan jawabannya satu jam, dan pengelola
  tidak boleh menunggu sejam untuk melihat tulisannya sendiri.
- **Pengaturan hanya bisa diubah, tidak ditambah.** Backend cuma menyediakan
  `PATCH /settings/:key`; daftar key-nya berasal dari seed dan ada di `SettingKey`
  (`types/api.ts`). Key yang belum di-seed dijawab `404` — Server Action menerjemahkannya
  menjadi permintaan agar tim backend menambahkannya, bukan galat mentah.
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

## Yang belum dikerjakan

- Seluruh modul dashboard sudah ada. Yang tersisa dari daftar kebutuhan: QR Code menuju
  halaman monografi (FR-052).
- **Belum ada satu pun modul dashboard yang diuji dengan backend hidup.** Yang paling layak
  diperiksa lebih dulu: bentuk body `PATCH /settings/:key` (diasumsikan `{ value }`),
  `employmentData: null` pada monografi, dan apakah menghapus program KKN benar-benar
  terhalang relasi kegiatannya.
