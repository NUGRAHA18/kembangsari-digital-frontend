/**
 * Lanskap Kembangsari sebagai SVG: perbukitan Menoreh saat senja, sawah
 * berundak, dan beberapa rumah warga dengan lampu yang sudah menyala.
 *
 * Digambar, bukan difoto, karena `design-idea.md` §8 meminta "soft illustrated
 * rural landscape" dan repo belum punya asetnya. Dibuat inline dan bukan berkas
 * `.svg` di `public/` dengan dua alasan: tidak ada permintaan jaringan kedua
 * untuk gambar terpenting di atas lipatan layar, dan bentuknya bisa disusun
 * dari komponen — rumah dan pohon di bawah ini dipakai berulang.
 *
 * Seluruhnya dekoratif: `aria-hidden`, tanpa `<title>`. Judul dan keterangan
 * hero-lah yang membawa maknanya.
 *
 * **Setiap warna di sini gelap, dan itu syarat, bukan selera.** Hero memuat
 * teks putih di bagian bawah *dan* navbar berteks putih di bagian atas selama
 * halaman belum digulir — jadi tidak ada satu pun bidang yang boleh terang,
 * termasuk langitnya. Itu sebabnya senja dipilih daripada siang: langit siang
 * yang biru muda akan menjatuhkan navbar.
 *
 * Angkanya diukur, bukan dikira-kira. Bidang terluas yang paling terang adalah
 * punggungan terjauh #2F6B52 pada 6,28:1 terhadap teks putih. Setelah gradien
 * gelap hero ditimpakan, titik paling buruk di pita tempat teks berdiri adalah
 * jendela yang menyala, pada **6,11:1** — lulus ambang 4,5:1 untuk teks biasa,
 * bukan hanya 3:1 untuk teks besar. Rata-rata pita itu 15,6:1.
 *
 * Yang perlu diperiksa ulang kalau warna di bawah diubah: dinding rumah dan
 * jendelanya. Keduanya satu-satunya bidang terang di gambar ini, dan dinding
 * putih #E2E8F0 yang sempat dipakai jatuh ke 1,23:1.
 *
 * `preserveAspectRatio="xMidYMax slice"` menahan garis cakrawala tetap di bawah
 * saat kotaknya melebar — tanpa itu bukitnya melayang di tengah pada layar
 * lebar dan gradien langitnya terpotong.
 */
export function LandscapeBackdrop({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 1440 620"
      preserveAspectRatio="xMidYMax slice"
    >
      <defs>
        {/* Langit senja: biru-kehijauan di atas, menghangat mendekati cakrawala.
            Pergeseran rona inilah yang membedakannya dari bukit — versi
            sebelumnya hijau seluruhnya dan terbaca sebagai satu bidang rata. */}
        <linearGradient id="langit" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#07222e" />
          <stop offset="45%" stopColor="#0b3038" />
          <stop offset="78%" stopColor="#12483a" />
          <stop offset="100%" stopColor="#1a5238" />
        </linearGradient>

        {/* Cahaya matahari yang sudah turun di balik punggungan. Hanya pendar,
            tanpa piringan: piringan kuning cukup terang untuk menjatuhkan
            kontras teks putih kalau kebetulan tertimpa navbar. */}
        <radialGradient id="pendar" cx="0.78" cy="0.62" r="0.42">
          <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.34" />
          <stop offset="45%" stopColor="#b45309" stopOpacity="0.14" />
          <stop offset="100%" stopColor="#b45309" stopOpacity="0" />
        </radialGradient>

        <linearGradient id="kabut" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7dd3fc" stopOpacity="0" />
          <stop offset="100%" stopColor="#7dd3fc" stopOpacity="0.1" />
        </linearGradient>
      </defs>

      <rect width="1440" height="620" fill="url(#langit)" />
      <rect width="1440" height="480" fill="url(#pendar)" />

      {/* Tiga punggungan, nilainya sengaja dijauhkan satu sama lain: yang jauh
          paling pucat karena kabut, yang dekat paling pekat. Versi sebelumnya
          memakai satu warna dengan opacity berbeda, dan bedanya tidak terbaca. */}
      <path
        d="M0 330 L168 258 L306 312 L468 222 L640 302 L802 240 L986 316 L1152 248 L1312 308 L1440 264 L1440 620 L0 620 Z"
        fill="#2f6b52"
      />
      <path
        d="M0 388 L152 322 L330 384 L508 306 L684 376 L862 316 L1048 382 L1228 322 L1396 380 L1440 362 L1440 620 L0 620 Z"
        fill="#1e5238"
      />
      <path
        d="M0 436 L196 392 L392 430 L588 386 L784 428 L980 390 L1178 432 L1370 396 L1440 418 L1440 620 L0 620 Z"
        fill="#123f27"
      />

      <rect y="300" width="1440" height="150" fill="url(#kabut)" />

      {/* Sawah berundak. Tiap undakan diberi garis tipis di tepi atasnya —
          itulah yang membuatnya terbaca sebagai pematang, bukan sebagai pita. */}
      <Undakan d="M0 468 C 250 436, 520 452, 764 442 C 1020 431, 1244 449, 1440 438 L1440 500 L0 500 Z" />
      <Undakan
        d="M0 516 C 268 482, 566 500, 816 490 C 1062 480, 1252 498, 1440 486 L1440 552 L0 552 Z"
        gelap
      />
      <Undakan
        d="M0 566 C 306 532, 624 550, 902 540 C 1132 532, 1302 548, 1440 538 L1440 620 L0 620 Z"
      />

      {/* Dua kelompok rumah, sengaja tidak di tengah supaya tidak bertabrakan
          dengan judul yang rata kiri. Jendelanya menyala — itu yang membuat
          gambar ini terbaca sebagai padukuhan yang dihuni, bukan sebagai
          bentuk geometris di lereng. */}
      <Rumah x={236} y={424} />
      <Rumah x={292} y={436} kecil />
      <Rumah x={1044} y={418} />
      <Rumah x={1102} y={430} kecil />

      <Pohon x={168} y={452} r={20} />
      <Pohon x={196} y={462} r={13} />
      <Pohon x={604} y={456} r={17} />
      <Pohon x={1246} y={446} r={22} />
      <Pohon x={1278} y={458} r={14} />
    </svg>
  );
}

/** Satu undakan sawah: bidang gelap dengan garis terang di pematang atasnya. */
function Undakan({ d, gelap = false }: { d: string; gelap?: boolean }) {
  return (
    <>
      <path d={d} fill={gelap ? "#0e4526" : "#14572f"} />
      <path d={d} fill="none" stroke="#3f9c63" strokeOpacity="0.5" strokeWidth="1.5" />
    </>
  );
}

/** Rumah: badan, atap pelana, dan satu jendela yang menyala. */
function Rumah({ x, y, kecil = false }: { x: number; y: number; kecil?: boolean }) {
  const w = kecil ? 30 : 42;
  const h = kecil ? 22 : 30;
  const atap = kecil ? 15 : 20;

  return (
    <g transform={`translate(${x} ${y})`}>
      <rect y={atap} width={w} height={h} rx="1.5" fill="#5b6b72" />
      <path d={`M-6 ${atap} L${w / 2} 0 L${w + 6} ${atap} Z`} fill="#7c2d12" />
      <rect x={w / 2 - 4} y={atap + h - 11} width="8" height="11" fill="#44200a" />
      <rect x={kecil ? 4 : 5} y={atap + 6} width={kecil ? 6 : 8} height="6" fill="#fbbf24" />
    </g>
  );
}

/** Pohon: mahkota bulat dengan batang pendek. */
function Pohon({ x, y, r }: { x: number; y: number; r: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-2} y={r - 4} width="4" height={r * 0.7} fill="#0b2f1c" />
      <circle cy={0} r={r} fill="#0d3a22" />
    </g>
  );
}
