import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Sejak Next.js 16, dev server menolak permintaan ke /_next/* yang datang dari
  // origin selain localhost dengan 403. Halaman tetap tampil karena HTML-nya
  // dilayani seperti biasa, tapi seluruh bundel klien ditolak sehingga React
  // tidak pernah hydrate — semua tombol mati tanpa pesan galat apa pun.
  //
  // Portal ini wajib diuji langsung di ponsel (hampir semua warga membukanya
  // dari HP), jadi alamat LAN harus diizinkan. Pola ditulis per subnet supaya
  // tetap berlaku ketika router memberi IP baru lewat DHCP.
  //
  // Hanya berpengaruh pada `next dev`; build produksi mengabaikannya.
  allowedDevOrigins: ["192.168.0.*", "192.168.1.*", "10.0.0.*", "172.20.10.*"],

  experimental: {
    serverActions: {
      // Seluruh unggahan gambar dashboard menumpang Server Action, dan batas
      // bawaannya hanya 1 MB. Foto ponsel biasa 2–4 MB, jadi tanpa baris ini
      // unggahan gagal SEBELUM permintaannya sampai ke backend — dan galatnya
      // tidak menyebut ukuran sama sekali.
      //
      // 4 MB, bukan lebih: Vercel menolak body permintaan di atas 4,5 MB di
      // lapisan platformnya sendiri, jauh sebelum Next.js sempat membacanya.
      // Menaikkan angka di sini tidak menembus batas itu. Batas yang benar-benar
      // diberlakukan ke pengelola ada di `lib/image.ts`, sedikit di bawah angka
      // ini untuk memberi ruang bagi kolom form lain dan pembatas multipart.
      bodySizeLimit: "4mb",
    },
  },

  images: {
    // Backend menyimpan gambar sebagai URL, bukan berkas. Dua sumber yang mungkin:
    // Supabase Storage (unggahan asli) dan picsum.photos (data seed).
    remotePatterns: [
      { protocol: "https", hostname: "ayaxcswxrchhjheamzaz.supabase.co" },
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "fastly.picsum.photos" },
    ],
    // Rasio gambar dari dashboard admin tidak seragam; ukuran ini menutup
    // rentang lebar kartu di mobile sampai gambar hero di desktop.
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    deviceSizes: [320, 420, 640, 750, 828, 1080, 1200, 1920],
  },
};

export default nextConfig;
