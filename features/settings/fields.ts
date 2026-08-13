import type { SettingKey } from "@/types/api";

/**
 * Susunan form pengaturan situs.
 *
 * Sumber tunggal untuk form dashboard **dan** Server Action-nya: keduanya
 * berjalan dari daftar yang sama, sehingga tidak ada kolom yang tampil di form
 * tetapi tidak pernah ikut tersimpan.
 *
 * Backend hanya punya `PATCH /settings/:key`; key-nya berasal dari seed dan
 * tidak bisa ditambah dari sini. Karena itu daftar di bawah ini mengikuti
 * `SettingKey` di `types/api.ts` — bukan sebaliknya.
 *
 * Sengaja tanpa React: Server Action mengimpornya.
 */

export type SettingFieldKind = "text" | "textarea" | "image";

export interface SettingField {
  key: SettingKey;
  label: string;
  kind: SettingFieldKind;
  /** Teks biasa, bukan JSX — berkas ini harus tetap bisa diimpor Server Action. */
  hint?: string;
  placeholder?: string;
}

export interface SettingGroup {
  title: string;
  description?: string;
  fields: SettingField[];
}

export const SETTING_GROUPS: SettingGroup[] = [
  {
    title: "Identitas Situs",
    description: "Tampil di navbar, footer, judul tab, dan hasil mesin pencari.",
    fields: [
      { key: "site_name", label: "Nama situs", kind: "text", placeholder: "Kembangsari Digital" },
      {
        key: "site_description",
        label: "Deskripsi singkat",
        kind: "textarea",
        hint: "Sekitar 160 huruf. Dipakai mesin pencari saat halaman dibagikan.",
      },
      {
        key: "about_us",
        label: "Tentang kami",
        kind: "textarea",
        hint: "Paragraf pengantar yang tampil di bagian bawah beranda.",
      },
      {
        key: "footer_text",
        label: "Teks footer",
        kind: "text",
        hint: "Nama yang tampil pada baris hak cipta di kaki halaman.",
      },
    ],
  },
  {
    title: "Gambar Situs",
    description:
      "Diunggah seperti gambar berita: berkas dikirim lebih dulu, alamatnya yang tersimpan.",
    fields: [
      { key: "site_logo", label: "Logo", kind: "image", hint: "Tampil di navbar dan footer." },
      {
        key: "site_favicon",
        label: "Favicon",
        kind: "image",
        hint: "Ikon kecil di tab peramban. Sebaiknya berbentuk persegi.",
      },
      {
        key: "site_banner",
        label: "Banner",
        kind: "image",
        hint: "Gambar besar yang dipakai saat tautan portal dibagikan ke media sosial.",
      },
    ],
  },
  {
    title: "Kontak",
    description: "Tampil di footer dan halaman kontak.",
    fields: [
      { key: "address", label: "Alamat", kind: "textarea" },
      { key: "phone", label: "Nomor telepon", kind: "text", placeholder: "081234567890" },
      { key: "email", label: "Email", kind: "text", placeholder: "padukuhan@contoh.desa.id" },
    ],
  },
  {
    title: "Media Sosial",
    description: "Kosongkan yang belum punya akun — tautannya tidak akan ditampilkan.",
    fields: [
      {
        key: "instagram",
        label: "Instagram",
        kind: "text",
        placeholder: "https://instagram.com/…",
      },
      { key: "facebook", label: "Facebook", kind: "text", placeholder: "https://facebook.com/…" },
      { key: "youtube", label: "YouTube", kind: "text", placeholder: "https://youtube.com/@…" },
    ],
  },
  {
    title: "Tampilan Awal Peta",
    description:
      "Titik tengah dan tingkat perbesaran saat halaman peta pertama dibuka. Kalau dikosongkan, dipakai koordinat Padukuhan Kembangsari.",
    fields: [
      // Contohnya koordinat Padukuhan Kembangsari yang sebenarnya. Sebelumnya
      // di sini tertulis titik data seed yang berjarak 13,6 km — angka contoh
      // yang salah adalah angka yang paling mungkin diketik ulang pengelola.
      { key: "map_latitude", label: "Lintang (latitude)", kind: "text", placeholder: "-7.690025" },
      {
        key: "map_longitude",
        label: "Bujur (longitude)",
        kind: "text",
        placeholder: "110.228583",
      },
      {
        key: "map_zoom",
        label: "Tingkat perbesaran",
        kind: "text",
        hint: "Antara 1 (seluruh dunia) dan 19 (satu rumah). Nilai lazimnya 15.",
        placeholder: "15",
      },
    ],
  },
];

export const SETTING_FIELDS: SettingField[] = SETTING_GROUPS.flatMap((group) => group.fields);
