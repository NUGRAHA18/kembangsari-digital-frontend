import QRCode from "qrcode";

/**
 * Pembangkit QR Code.
 *
 * **Hanya berjalan di server.** Pustaka `qrcode` adalah satu-satunya dependensi
 * tambahan di repo ini, dan alasannya berbeda dari pustaka yang ditolak di
 * CLAUDE.md: yang ditolak adalah pustaka yang harus diunduh browser warga.
 * Berkas ini dipanggil dari Server Component dan Route Handler, jadi hasilnya
 * berupa SVG atau PNG jadi — tidak satu byte pun ikut ke ponsel pemindai.
 *
 * Jangan mengimpornya dari Client Component: `qrcode` memakai API Node, dan
 * yang dibutuhkan komponen klien selalu berupa hasilnya, bukan pembangkitnya.
 */

/**
 * Tingkat koreksi galat **Q** (pulih hingga 25%), bukan `M` yang bawaan.
 *
 * QR ini dicetak lalu ditempel di balai padukuhan: kertasnya kotor, terlipat,
 * dan tersenggol. Selisih ukurannya beberapa modul saja, sedangkan bedanya
 * adalah QR yang tetap terbaca setelah sudutnya sobek.
 */
const ERROR_CORRECTION = "Q";

/**
 * Zona sunyi selebar 4 modul — ukuran minimum yang diminta spesifikasi QR.
 * Tanpa itu banyak kamera ponsel gagal menemukan batas kodenya.
 */
const MARGIN = 4;

/**
 * Hitam di atas putih, tidak mengikuti tema.
 *
 * Ini bukan pilihan gaya: pemindai mencari modul gelap di atas latar terang,
 * dan QR yang ikut membalik di mode gelap tidak terbaca sebagian ponsel.
 * Kertas cetaknya pun selalu putih.
 */
const COLOR = { dark: "#000000", light: "#ffffff" };

/** SVG tanpa `width`/`height`, hanya `viewBox` — ukurannya ditentukan CSS pemanggil. */
export function renderQrSvg(text: string): Promise<string> {
  return QRCode.toString(text, {
    type: "svg",
    errorCorrectionLevel: ERROR_CORRECTION,
    margin: MARGIN,
    color: COLOR,
  });
}

/**
 * PNG untuk diunduh — dipakai pengelola yang menempelkan QR ke Word, poster
 * cetak, atau mengirimkannya lewat WhatsApp, tempat SVG tidak tampil.
 *
 * `width` di sini piksel sisi gambar; 1024 cukup tajam untuk dicetak seukuran
 * setengah halaman A4.
 */
export function renderQrPng(text: string): Promise<Buffer> {
  return QRCode.toBuffer(text, {
    errorCorrectionLevel: ERROR_CORRECTION,
    margin: MARGIN,
    color: COLOR,
    width: 1024,
  });
}
