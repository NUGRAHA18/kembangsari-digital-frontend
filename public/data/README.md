# Cara mengisi batas wilayah, jalan, dan gang

`batas-wilayah.geojson` berisi garis batas Padukuhan Kembangsari beserta RW dan
RT-nya, **dan sekaligus ruas jalan utama serta gang**. Halaman `/peta`
menggambarnya di atas peta, lengkap dengan legenda dan sakelar untuk
menyembunyikannya.

Jalan dan gang menumpang berkas yang sama karena alasannya sama: keduanya
bentuk yang tidak bisa diwakili sebuah titik, dan keduanya hampir tidak pernah
berubah. Titik lokasi biasa — balai, posyandu, UMKM — tetap ditambahkan lewat
dashboard di `/admin/peta`, bukan di sini.

Selama `features` masih kosong, tidak ada yang berubah di halaman peta —
sakelar dan legendanya baru muncul setelah berkas ini diisi. Jadi berkas ini
aman ditinggal kosong sampai batasnya benar-benar sempat digambar.

## Kenapa berkas, bukan data backend

Batas wilayah berubah sekali dalam sepuluh tahun, sedangkan membangun
penyunting polygon di dashboard adalah pekerjaan tersendiri yang besar.
Sebagai berkas statis, ia dilayani CDN Vercel, tidak ikut membesarkan bundel
JavaScript, dan baru diambil ketika halaman peta benar-benar dibuka.

Konsekuensinya: mengubah batas wilayah berarti menyunting berkas ini lalu
`git push` — bukan lewat dashboard.

## Menggambarnya

1. Buka [geojson.io](https://geojson.io).
2. Geser peta ke Padukuhan Kembangsari. Titik tengahnya
   **-7.690025, 110.228583** — tempel di kotak pencarian kalau perlu.
3. Untuk **wilayah**, pilih alat **Draw a polygon** (ikon segi lima) di sisi
   kanan; untuk **jalan dan gang**, pilih **Draw a polyline** (ikon garis).
4. Klik mengikuti bentuknya. Polygon ditutup dengan mengklik titik pertama;
   polyline diakhiri dengan klik ganda.
5. Di panel kanan, buka tab **JSON** dan isi `properties` bentuk itu —
   lihat daftar kolomnya di bawah.
6. Ulangi untuk setiap RT, setiap RW, batas luar padukuhan, lalu jalan dan gang.
7. Salin seluruh isi panel JSON, tempel menimpa `batas-wilayah.geojson`.

Menggambarnya tidak perlu presisi meteran. Yang dibaca warga adalah "rumah saya
masuk RT mana" dan "gang ini yang mana", bukan patok batas resmi.

## Dua hal yang sering terjadi saat menggambar

**Batas yang digambar dalam dua kali duduk berakhir sebagai dua garis.** Itu
bukan dua batas — ujung yang satu menyambung ke ujung yang lain. Sebelum
dipakai, keduanya harus disambung menjadi satu `Polygon` dan cincinnya ditutup
dengan mengulang titik pertama di akhir. Batas padukuhan yang sekarang berasal
dari dua busur seperti itu; ujungnya bertemu dengan selisih di bawah 4 meter.

**Klik ganda meninggalkan ruas sepanjang nol.** Dua titik yang menumpuk di
tempat yang sama tergambar sebagai noktah menggantung di tengah peta. Dari
tujuh ruas jalan yang digambar, dua di antaranya ternyata seperti ini dan
dibuang. Periksa panjang tiap ruas sebelum memasukkannya.

## Kolom `properties`

| Kolom   | Wajib | Isi                                                                    |
| ------- | :---: | ---------------------------------------------------------------------- |
| `nama`  |  ya   | Nama di legenda dan saat garisnya disentuh: `"RT 05"`, `"Gang Melati"`  |
| `tipe`  |  ya   | Lihat tabel di bawah — menentukan tebal garis dan ada tidaknya isian    |
| `induk` | tidak | RW induk sebuah RT, mis. `"RW 03"`                                     |
| `warna` | tidak | Warna garis, mis. `"#0ea5e9"`. Kosong berarti dipilihkan otomatis       |

### Nilai `tipe`

| Nilai         | Bentuk       | Tampilan                                  |
| ------------- | ------------ | ----------------------------------------- |
| `PADUKUHAN`   | `Polygon`    | Garis tertebal, putus-putus, isian samar   |
| `RW`          | `Polygon`    | Garis sedang, isian samar                  |
| `RT`          | `Polygon`    | Garis tipis, isian sedikit lebih terlihat  |
| `JALAN`       | `LineString` | Garis lebar, tanpa isian                   |
| `GANG`        | `LineString` | Garis lebih ramping dari jalan             |

Jalan dan gang boleh digabung menjadi satu `MultiLineString` — beberapa ruas
dalam satu bentuk. Itu yang dipakai sekarang, dan gunanya legenda: tujuh ruas
terpisah menghasilkan tujuh baris legenda tanpa nama yang berarti, sedangkan
satu `MultiLineString` bernama "Jalan" cukup satu baris.

Wilayah tanpa `nama` diabaikan diam-diam — begitu pula seluruh berkas yang
gagal dibaca. Batas wilayah adalah lapisan pelengkap; peta harus tetap berguna
dengan pin-pinnya saja.

## Pembagian wilayah Kembangsari

Menurut `monografi-idea.md`, ada **4 RT dan 2 RW**:

```
Padukuhan Kembangsari
├── RW 03
│   ├── RT 05
│   └── RT 06
└── RW 04
    ├── RT 07
    └── RT 08
```

Jadi berkas yang lengkap berisi tujuh wilayah: satu padukuhan, dua RW, empat RT
— ditambah jalan dan gang sebanyak yang sempat digambar.

## Contoh satu wilayah

Koordinat GeoJSON ditulis **[bujur, lintang]** — kebalikan dari urutan yang
biasa disalin dari Google Maps. geojson.io sudah menuliskannya dengan benar;
yang perlu berhati-hati hanya kalau angkanya diketik sendiri.

```json
{
  "type": "Feature",
  "properties": { "nama": "RT 05", "tipe": "RT", "induk": "RW 03" },
  "geometry": {
    "type": "Polygon",
    "coordinates": [
      [
        [110.2275, -7.6892],
        [110.2295, -7.6892],
        [110.2295, -7.6908],
        [110.2275, -7.6908],
        [110.2275, -7.6892]
      ]
    ]
  }
}
```

Angka di atas hanya menggambarkan bentuk berkasnya — sebuah kotak, bukan batas
RT 05 yang sebenarnya. Jangan dipakai apa adanya.
