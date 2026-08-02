# Kembangsari Digital — Frontend

Portal informasi publik Padukuhan Kembangsari, Kalurahan Banjararum, Kapanewon Kalibawang,
Kulon Progo, Daerah Istimewa Yogyakarta.

Repo ini **hanya frontend**. Backend (NestJS + Prisma + Supabase) berada di repository
terpisah dan berkomunikasi hanya lewat HTTP.

## Menjalankan

Butuh dua terminal, karena backend dan frontend adalah dua proses terpisah.

```bash
# Terminal 1 — dari folder backend
npm run start:dev        # http://localhost:3000

# Terminal 2 — dari folder ini
npm install
cp .env.example .env.local
npm run dev              # http://localhost:3001
```

Port frontend digeser ke 3001 karena backend sudah memakai 3000.

Kalau backend mati, halaman tetap terbuka tetapi setiap blok data menampilkan pesan
"Tidak dapat terhubung ke server" — itu perilaku yang disengaja, bukan kerusakan frontend.

## Perintah

| Perintah | Kegunaan |
|----------|----------|
| `npm run dev` | Server pengembangan di port 3001 |
| `npm run build` | Build produksi |
| `npm start` | Menjalankan hasil build di port 3001 |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript tanpa menghasilkan berkas |

## Konfigurasi

```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1   # base URL backend
NEXT_PUBLIC_SITE_URL=http://localhost:3001         # untuk Open Graph & sitemap
```

Base URL tidak pernah ditulis langsung di kode. Saat backend pindah ke Render/Railway,
hanya baris pertama yang berubah.

Frontend tidak menyimpan kredensial Supabase apa pun; semua akses data lewat backend.

## Halaman

| Rute | Isi |
|------|-----|
| `/` | Hero, pintasan, statistik, pengumuman, berita, agenda, program KKN, galeri, pratinjau peta |
| `/profil`, `/profil/[slug]` | Sejarah, visi misi, struktur organisasi |
| `/berita`, `/berita/[slug]` | Daftar berita dengan pencarian & filter kategori |
| `/agenda` | Agenda dikelompokkan per bulan |
| `/pengumuman` | Pengumuman yang sedang berlaku |
| `/monografi` | Statistik kependudukan per tahun |
| `/galeri`, `/galeri/[slug]` | Album dokumentasi dengan pratinjau layar penuh |
| `/peta` | Peta digital Leaflet + daftar lokasi + petunjuk arah |
| `/umkm`, `/umkm/[slug]` | Direktori usaha warga dengan tombol WhatsApp |
| `/potensi`, `/potensi/[slug]` | Potensi pertanian, peternakan, kerajinan, wisata |
| `/program-kkn`, `/program-kkn/[slug]` | Empat program KKN beserta dokumentasi kegiatan |
| `/kontak` | Kontak resmi padukuhan |

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Leaflet · Lucide

Halaman publik dirender sebagai Server Component dan mengambil data dengan `fetch` bawaan —
tanpa pustaka pengambilan data di sisi klien. Alasannya SEO dan waktu muat awal: warga
mengakses portal ini hampir seluruhnya dari ponsel, sering dengan sinyal seadanya.

## Dokumentasi lain

| Berkas | Isi |
|--------|-----|
| `CLAUDE.md` | Konteks project, token desain, keputusan arsitektur beserta alasannya |
| `FRONTEND_GUIDE.md` | Kontrak API lengkap dan pedoman mobile-first |
| `types/api.ts` | Tipe TypeScript seluruh model backend |
| `openapi.json` | Kontrak API, bisa dibaca tanpa menjalankan backend |
