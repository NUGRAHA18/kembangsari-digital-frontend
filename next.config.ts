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
