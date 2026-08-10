# Menerbitkan Portal ke Internet

Panduan ini dipakai sekali saat pertama menerbitkan, lalu sesekali kalau ada
yang berubah. Setelah selesai, menerbitkan perubahan cukup `git push`.

## Kenapa Vercel, dan kenapa hosting cPanel tidak dipakai

Portal ini **bukan** kumpulan berkas HTML yang tinggal diunggah ke
`public_html`. Ia butuh server Node.js yang hidup dan mengerjakan sesuatu di
setiap permintaan:

- **39 dari sekitar 50 rute dirender saat diminta**, bukan disiapkan sebagai
  berkas. Berita yang baru ditulis harus langsung terbaca, dan halaman
  dashboard berbeda isinya untuk tiap pengelola.
- **`middleware.ts`** memeriksa cookie sesi sebelum `/admin` dibuka.
- **Seluruh penyimpanan lewat Server Action** — form dikirim ke server, bukan
  diproses di browser.
- **`next/image`** memotong dan mengompres gambar Supabase saat diminta.

Shared hosting cPanel melayani berkas statis dan PHP. Ia tidak menjalankan
Next.js. Jadi **hosting Anda tidak dipakai untuk portal ini** — yang dipakai
hanya **nama domainnya**, yang diarahkan ke Vercel lewat pengaturan DNS.
Hostingnya tetap boleh dipakai untuk hal lain (email, subdomain lain), dan
tidak ada yang perlu dihapus dari sana.

Vercel dipilih karena ia yang membuat Next.js — tidak ada yang perlu disetel
agar Server Action, middleware, dan optimasi gambar bekerja. Paket gratisnya
cukup untuk portal padukuhan.

---

## Bagian 1 — Menerbitkan ke Vercel

Backend harus sudah punya URL publik sebelum mulai. Frontend di Vercel tidak
bisa memanggil `localhost` di komputer Anda.

1. Buka [vercel.com](https://vercel.com), **Sign up** dengan akun **GitHub**
   yang sama dengan pemilik repo ini.
2. **Add New… → Project**, lalu **Import** repository
   `kembangsari-digital-frontend`.
3. Vercel mengenali Next.js sendiri. **Jangan ubah** Framework Preset, Build
   Command, maupun Output Directory.
4. Buka **Environment Variables**, isi dua baris berikut, dan centang ketiga
   lingkungannya (Production, Preview, Development):

   | Name | Value |
   |------|-------|
   | `NEXT_PUBLIC_API_URL` | URL backend + `/api/v1`, misalnya `https://kembangsari-api.onrender.com/api/v1` |
   | `NEXT_PUBLIC_SITE_URL` | Kosongkan dulu — diisi setelah domain aktif di Bagian 2 |

   ⚠️ `NEXT_PUBLIC_API_URL` **wajib berakhiran `/api/v1`** dan **tanpa garis
   miring di ujung**. Salah satu saja meleset, setiap permintaan dijawab `404`
   dan seluruh halaman tampil sebagai galat.

5. **Deploy**. Selesai dalam beberapa menit, dan Anda mendapat alamat sementara
   seperti `kembangsari-digital-frontend.vercel.app`.
6. Buka alamat itu dan periksa: beranda tampil, daftar berita terisi, peta
   menggambar pin. Kalau halaman kosong atau galat, lihat **Kalau ada yang
   salah** di bawah.

Sejak titik ini **`git push` ke `main` otomatis menerbitkan ulang.** Setiap
pull request juga mendapat URL pratinjaunya sendiri untuk diperiksa sebelum
digabungkan.

---

## Bagian 2 — Memakai domain sendiri

Yang dilakukan di sini hanya **menunjuk**: memberi tahu internet bahwa nama
domain Anda dilayani Vercel. Tidak ada berkas yang diunggah ke hosting.

### 2a. Daftarkan domain di Vercel

1. Di project Vercel: **Settings → Domains**.
2. Ketik domain Anda, misalnya `kembangsari.id`, lalu **Add**.
3. Vercel menampilkan nilai DNS yang harus dipasang. Biasanya:

   | Type | Name | Value |
   |------|------|-------|
   | `A` | `@` | `76.76.21.21` |
   | `CNAME` | `www` | `cname.vercel-dns.com` |

   **Pakai nilai yang ditampilkan layar Anda**, bukan yang tertulis di sini —
   Vercel sesekali mengubahnya.

### 2b. Pasang nilainya di panel domain

Pengaturan ini ada di tempat domain Anda **didaftarkan**. Kalau domain dan
hosting dibeli sepaket, biasanya di cPanel atau di panel klien penyedia
(Niagahoster, Domainesia, Rumahweb, dan sejenisnya).

1. Cari menu bernama **Zone Editor**, **DNS Management**, atau **Kelola DNS**.
2. **Hapus atau ubah** record `A` untuk `@` yang sekarang menunjuk ke IP
   hosting. Inilah langkah yang memindahkan domain dari hosting ke Vercel.
3. Tambahkan record sesuai tabel dari Vercel.
4. **Jangan sentuh record `MX`** kalau email di domain itu Anda pakai. Record
   `MX` mengurus email dan tidak ada hubungannya dengan tampilan situs —
   menghapusnya membuat email berhenti masuk.

Perubahan DNS menyebar antara beberapa menit sampai beberapa jam. Vercel
menampilkan **Valid Configuration** kalau sudah terbaca, dan menerbitkan
sertifikat HTTPS sendiri — tidak perlu membeli SSL.

### 2c. Setelah domain aktif

1. **Vercel → Settings → Environment Variables**: isi `NEXT_PUBLIC_SITE_URL`
   dengan alamat lengkapnya, misalnya `https://kembangsari.id` — **dengan
   `https://`, tanpa garis miring di ujung.**
2. **Deployments → deployment teratas → ⋯ → Redeploy.** Variabel lingkungan
   dibaca saat build, jadi tanpa langkah ini nilainya belum berlaku.
3. Buka `/admin/qr-code` dan pastikan QR-nya sudah menunjuk domain sungguhan,
   bukan `localhost`. QR dibangkitkan ulang setiap kali diminta, jadi tidak ada
   berkas usang yang perlu diganti.

### 2d. Minta backend menambahkan domainnya

Kirim domain finalnya ke tim backend untuk dimasukkan ke `CORS_ORIGINS`.

Ini **tidak mendesak**: seluruh pemanggilan API di portal ini terjadi di
server, bukan di browser, sehingga CORS tidak pernah ikut bermain. Anggap ini
jaring pengaman untuk nanti, bukan syarat agar portal berjalan.

---

## Bagian 3 — CI: penjaga sebelum terbit

`.github/workflows/ci.yml` menjalankan **typecheck, lint, dan build** di setiap
push dan pull request. Tidak ada yang perlu disetel dan tidak ada rahasia yang
perlu disimpan — ia aktif sendiri begitu berkasnya ada di GitHub.

Gunanya: kalau ada yang rusak, tanda silang merah muncul di GitHub sebelum
Vercel mencoba menerbitkannya.

CI **tidak** ikut men-deploy. Vercel mengerjakan itu lewat integrasi Git-nya
sendiri, dan dua jalur yang mengerjakan hal sama hanya menambah yang bisa
rusak.

---

## Kalau ada yang salah

| Gejala | Sebabnya hampir selalu |
|--------|------------------------|
| Semua halaman galat, dashboard tidak bisa masuk | `NEXT_PUBLIC_API_URL` salah. Periksa akhiran `/api/v1` dan pastikan tidak ada garis miring di ujung. Buka URL itu langsung di browser — harus menjawab sesuatu, bukan galat koneksi. |
| Halaman tampil tapi gambar rusak semua | Domain Supabase produksi berbeda dari yang terdaftar di `next.config.ts` → `images.remotePatterns`. Tambahkan hostname-nya di sana, commit, push. |
| QR Code masih menunjuk `localhost` | `NEXT_PUBLIC_SITE_URL` belum diisi, atau sudah diisi tetapi belum **Redeploy**. |
| Tautan di sitemap memakai `localhost` | Sama seperti di atas — `NEXT_PUBLIC_SITE_URL` dibaca saat build. |
| Domain masih membuka halaman lama hosting | Record `A` untuk `@` masih menunjuk IP hosting, atau DNS belum menyebar. Tunggu, lalu periksa ulang di **Vercel → Settings → Domains**. |
| Build gagal di Vercel tapi lolos di komputer | Hampir selalu `package-lock.json` tidak ikut ter-commit setelah menambah dependensi. |

## Yang berubah kalau backend pindah alamat

Satu baris: `NEXT_PUBLIC_API_URL` di Vercel, lalu **Redeploy**. Tidak ada base
URL lain yang ditulis di dalam kode — itu sebabnya aturan tersebut ada di
`CLAUDE.md`.
