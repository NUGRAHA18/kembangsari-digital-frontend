/**
 * Tipe respons API Kembangsari Digital.
 *
 * Diturunkan dari prisma/schema.prisma milik backend. Kalau skema backend
 * berubah, berkas ini harus disesuaikan.
 *
 * CATATAN PENTING soal tanggal: semua field tanggal bertipe `string`, bukan
 * `Date`. JSON tidak punya tipe tanggal, jadi yang sampai ke frontend adalah
 * string ISO 8601 (contoh: "2026-08-01T09:30:58.790Z"). Bungkus dengan
 * `new Date(...)` sendiri kalau perlu diolah.
 *
 * Berkas ini disusun manual, sedangkan `openapi.json` dihasilkan langsung
 * dari kode backend (`npm run openapi`). Kalau keduanya berbeda, yang
 * benar adalah `openapi.json`.
 */

// ============================================================
// BENTUK RESPONS
// ============================================================

/** Metadata pagination yang menyertai semua endpoint list. */
export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  lastPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

/** Bentuk respons endpoint list: `{ data, meta }`. */
export interface Paginated<T> {
  data: T[];
  meta: PaginationMeta;
}

/**
 * Bentuk error dari backend.
 * `message` bisa berupa string tunggal ATAU array string (error validasi).
 */
export interface ApiError {
  statusCode: number;
  error: string;
  message: string | string[];
}

/** Query yang diterima semua endpoint list. */
export interface PaginationQuery {
  /** Mulai dari 1. Default 1. */
  page?: number;
  /** Maksimal 100. Default 10. */
  limit?: number;
  /** Pencarian bebas, tidak peka huruf besar/kecil. */
  search?: string;
}

/**
 * Query untuk GET /news/published (publik).
 * Catatan: sejak backend memakai forbidNonWhitelisted, parameter di luar
 * daftar ini dijawab 400, bukan diabaikan diam-diam.
 */
export interface NewsQuery extends PaginationQuery {
  /** Saring berdasarkan id kategori (ambil dari GET /news/category/all). */
  categoryId?: string;
}

/** Query untuk GET /potential/active (publik). */
export interface PotentialQuery extends PaginationQuery {
  category?: PotentialCategory;
}

/** Query untuk GET /gallery/album, /gallery/item/*, /agenda, /umkm/active, /announcement/active. */
export type SimpleListQuery = PaginationQuery;

// ------------------------------------------------------------
// Query khusus daftar bertoken (dashboard)
//
// Saringan status sengaja HANYA ada di daftar bertoken. Mengirimnya ke
// endpoint publik pasangannya dijawab 400 — di sana ia tidak punya arti.
//
// Di semua saringan status berlaku hal yang sama: tidak dikirim berarti
// "semua". Jadi untuk menghitung berapa yang draf/disembunyikan, kirim
// `false` lalu baca `meta.total` — tidak perlu mengunduh seluruh data.
// ------------------------------------------------------------

/** Query untuk GET /news (bertoken). */
export interface AdminNewsQuery extends NewsQuery {
  /** true = sudah terbit, false = masih draf, tidak dikirim = semua. */
  published?: boolean;
}

/**
 * Query untuk GET /monography (bertoken).
 * `search` ikut diterima tetapi tidak berpengaruh — monografi tidak punya
 * kolom teks untuk dicari.
 */
export interface AdminMonographyQuery extends PaginationQuery {
  /** true = sudah terbit, false = belum, tidak dikirim = semua. */
  published?: boolean;
}

/** Query untuk GET /announcement (bertoken). */
export interface AdminAnnouncementQuery extends PaginationQuery {
  /** true = tampil, false = disembunyikan, tidak dikirim = semua. */
  isActive?: boolean;
}

/** Query untuk GET /umkm (bertoken). */
export interface AdminUmkmQuery extends PaginationQuery {
  isActive?: boolean;
}

/** Query untuk GET /potential (bertoken). */
export interface AdminPotentialQuery extends PotentialQuery {
  isActive?: boolean;
}

/**
 * Query untuk GET /maps/marker (bertoken).
 * Menggantikan GET /maps/marker/category/:categoryId untuk kebutuhan
 * dashboard, dengan alasan yang sama seperti di atas.
 */
export interface AdminMarkerQuery extends PaginationQuery {
  /** Saring berdasarkan id kategori (ambil dari GET /maps/category). */
  categoryId?: string;
  isActive?: boolean;
}

// ============================================================
// ENUM
// ============================================================

export type Role = 'ADMIN' | 'EDITOR';

export type GalleryType = 'FOTO' | 'VIDEO';

/** Kategori pekerjaan pada `PopulationStat.employmentData`. */
export type EmploymentStatus =
  | 'PETANI'
  | 'NELAYAN'
  | 'PNS'
  | 'TNI_POLRI'
  | 'KARYAWAN_SWASTA'
  | 'WIRASWASTA'
  | 'BURUH'
  | 'PEDAGANG'
  | 'GURU_DOSEN'
  | 'TENAGA_KESEHATAN'
  | 'PENSIUNAN'
  | 'SERABUTAN'
  | 'IBU_RUMAH_TANGGA'
  | 'TIDAK_BEKERJA'
  | 'LAINNYA';

/**
 * Bentuk `employmentData`, mis. { PETANI: 180, BURUH: 95 }.
 * Cocok langsung untuk StatBars seperti bagian pendidikan dan agama.
 */
export type EmploymentData = Partial<Record<EmploymentStatus, number>>;

export type PotentialCategory =
  | 'PERTANIAN'
  | 'PETERNAKAN'
  | 'PERKEBUNAN'
  | 'PERIKANAN'
  | 'KERAJINAN'
  | 'WISATA'
  | 'KULINER'
  | 'LAINNYA';

/**
 * Skema backend juga mendeklarasikan enum EducationLevel,
 * EmploymentStatus, Religion, dan MarkerCategory — tapi tidak satu pun
 * dipakai oleh field model, jadi sengaja tidak dituliskan di sini.
 */

// ============================================================
// AUTH
// ============================================================

/** User tanpa field `password` — backend selalu membuangnya sebelum mengirim. */
export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  user: User;
}

/**
 * Badan permintaan `POST /auth/ticket`, langkah terakhir alur masuk dengan
 * akun Google. Tiket diambil dari query string pengalihan
 * (`<FRONTEND_URL>/admin/login/google?ticket=...`), berlaku 2 menit, dan
 * hangus setelah sekali tukar.
 */
export interface ExchangeTicketRequest {
  ticket: string;
}

/**
 * PERHATIAN — beda dari laporan: kuncinya `accessToken`, bukan `token`.
 * Respons `POST /auth/ticket` sengaja dibuat sama persis dengan
 * `POST /auth/login` supaya penyimpan cookie di frontend tidak perlu
 * membedakan dari alur mana tokennya datang.
 */
export type ExchangeTicketResponse = LoginResponse;

// ============================================================
// PENGELOLA PORTAL (khusus ADMIN)
// ============================================================
// Endpoint /user memakai bentuk `User` di atas sebagai respons — tanpa
// `password`, yang memang tidak pernah dibaca dari database.

/**
 * Badan `POST /user`.
 *
 * `role` wajib dipilih dan tidak punya nilai bawaan — supaya tidak ada
 * pengelola yang tanpa sengaja menjadi ADMIN karena satu field terlewat.
 *
 * `password` boleh dikosongkan. Akun tanpa kata sandi hanya bisa masuk
 * lewat "Masuk dengan Google" dengan alamat email yang sama, dan kata
 * sandi bisa ditambahkan kapan saja lewat PATCH.
 */
export interface CreateUserRequest {
  email: string;
  name: string;
  role: Role;
  password?: string;
}

/**
 * Badan `PATCH /user/:id`. Semua field opsional; yang tidak dikirim tidak
 * ikut berubah.
 *
 * `email` sengaja tidak ada di sini — email adalah satu-satunya penghubung
 * ke akun Google, jadi mengubahnya berarti memindahkan seluruh akses satu
 * akun ke alamat lain dalam satu permintaan. Kalau alamatnya salah, hapus
 * lalu buat baru.
 */
export interface UpdateUserRequest {
  name?: string;
  role?: Role;
  password?: string;
}

/** Query string `GET /user`. */
export interface UserListQuery {
  page?: number;
  limit?: number;
  /** Cocok dengan nama (tidak peka huruf besar) atau email. */
  search?: string;
  role?: Role;
}

// ============================================================
// BERITA
// ============================================================

export interface Category {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
  /** Hadir pada GET /news/category/all dan /news/category/:id */
  _count?: { news: number };
}

export interface News {
  id: string;
  title: string;
  slug: string;
  content: string;
  thumbnail: string | null;
  published: boolean;
  categoryId: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  /** Selalu disertakan pada endpoint list dan detail. */
  category?: Category;
  /** Hanya id & name pada list; ditambah email pada respons create. */
  createdBy?: Pick<User, 'id' | 'name'> & { email?: string };
}

// ============================================================
// AGENDA & PENGUMUMAN
// ============================================================

export interface Agenda {
  id: string;
  title: string;
  /** Dipakai pada URL halaman detail: GET /agenda/{slug}. */
  slug: string;
  description: string | null;
  location: string | null;
  startDate: string;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// PROFIL PADUKUHAN
// ============================================================

/**
 * Dibaca dengan slug (`GET /profile/:slug`). Sejak putaran perbaikan kedua,
 * `PATCH` dan `DELETE` menerima id **maupun** slug pada URL yang sama, jadi
 * form profil tidak perlu lagi membawa id sebagai input tersembunyi.
 */
export interface Profile {
  id: string;
  slug: string;
  title: string;
  /** Berisi Markdown. */
  content: string;
  thumbnail: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// MONOGRAFI (STATISTIK PENDUDUK)
// ============================================================

export interface PopulationStat {
  id: string;
  year: number;
  totalPopulation: number;
  maleCount: number;
  femaleCount: number;

  // Pendidikan
  educationSD: number | null;
  educationSLTP: number | null;
  educationSLTA: number | null;
  educationD1_D3: number | null;
  educationS1: number | null;
  educationS2: number | null;
  educationS3: number | null;
  educationNoSchool: number | null;

  /**
   * Data pekerjaan. Seluruh kunci opsional — kategori yang tidak ada
   * berarti tidak didata, bukan bernilai nol. Backend menolak kunci di
   * luar daftar ini dan nilai yang bukan bilangan bulat >= 0.
   */
  employmentData: EmploymentData | null;

  // Agama
  religionIslam: number | null;
  religionProtestant: number | null;
  religionCatholic: number | null;
  religionHindu: number | null;
  religionBuddha: number | null;
  religionKonghucu: number | null;
  religionOther: number | null;

  // Keluarga & wilayah
  familyHeadCount: number | null;
  familyCount: number | null;
  rtCount: number | null;
  rwCount: number | null;

  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// PETA DIGITAL
// ============================================================

/**
 * Satu kelompok pada katalog ikon, dari `GET /maps/icon` — ARRAY POLOS dan
 * bebas token.
 *
 * Bentuknya sudah siap dipakai sebagai `<optgroup>`: `group` adalah judul
 * kelompoknya, `label` teks Indonesia yang dibaca pengelola, dan `name` nama
 * ikon Material Symbols yang benar-benar dikirim ke backend.
 *
 * Katalognya statis dan **divalidasi backend**: nama di luar daftar ini
 * dijawab `400`, baik pada kategori maupun pada titik. Karena itu daftarnya
 * tidak boleh ditulis ulang di frontend — cukup diambil apa adanya.
 */
export interface MapIcon {
  /** Nama ikon Material Symbols, mis. "holiday_village". */
  name: string;
  /** Nama yang dibaca pengelola, mis. "Balai / rumah warga". */
  label: string;
}

export interface MapIconGroup {
  group: string;
  icons: MapIcon[];
}

export interface MapCategory {
  id: string;
  name: string;
  slug: string;
  /**
   * Nama ikon Material Symbols, bukan URL. Contoh: "holiday_village",
   * "water_drop". Divalidasi backend terhadap `GET /maps/icon`.
   */
  icon: string | null;
  createdAt: string;
  updatedAt: string;
  /**
   * Hadir pada GET /maps/category dan GET /maps/category/:id.
   *
   * Menghapus kategori peta ikut menghapus seluruh markernya — jadi angka
   * ini untuk memperingatkan pengelola, bukan untuk mematikan tombol hapus
   * seperti pada kategori berita.
   */
  _count?: { markers: number };
}

export interface MapMarker {
  id: string;
  name: string;
  description: string | null;
  latitude: number;
  longitude: number;
  address: string | null;
  phone: string | null;
  image: string | null;
  /**
   * Ikon khusus titik ini, menimpa ikon kategorinya. `null` berarti "ikut
   * ikon kategori" — urutan bacanya:
   *
   *   marker.icon ?? marker.category?.icon ?? 'place'
   *
   * Nilainya nama Material Symbols dan divalidasi backend, sama seperti
   * `MapCategory.icon`.
   */
  icon: string | null;
  isActive: boolean;
  categoryId: string;
  createdAt: string;
  updatedAt: string;
  /** Selalu disertakan pada semua endpoint marker. */
  category?: MapCategory;
}

// ============================================================
// GALERI
// ============================================================

export interface GalleryAlbum {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  thumbnail: string | null;
  createdAt: string;
  updatedAt: string;
  /** Hadir pada GET /gallery/album (list). */
  _count?: { items: number };
  /** Hadir pada GET /gallery/album/:slug (detail). */
  items?: GalleryItem[];
}

export interface GalleryItem {
  id: string;
  type: GalleryType;
  url: string;
  caption: string | null;
  isFeatured: boolean;
  albumId: string;
  createdAt: string;
  updatedAt: string;
  album?: GalleryAlbum;
}

// ============================================================
// UMKM
// ============================================================

export interface UMKMImage {
  id: string;
  url: string;
  caption: string | null;
  /**
   * Dijaga backend, tidak perlu ditambal dari frontend:
   * - gambar pertama sebuah UMKM otomatis menjadi utama
   * - mengirim `isPrimary: true` melepas penanda gambar lain dalam satu transaksi
   * - menghapus gambar utama mengangkat gambar teratas berikutnya
   * - mengirim `isPrimary: false` pada satu-satunya gambar dijawab 400
   *
   * Artinya: selama sebuah UMKM punya gambar, tepat satu di antaranya utama.
   */
  isPrimary: boolean;
  umkmId: string;
  createdAt: string;
  updatedAt: string;
}

export interface UMKM {
  id: string;
  name: string;
  slug: string;
  description: string;
  address: string | null;
  phone: string | null;
  /** Format internasional tanpa tanda plus, contoh: "6281234567890". */
  whatsapp: string | null;
  email: string | null;
  instagram: string | null;
  facebook: string | null;
  website: string | null;
  latitude: number | null;
  longitude: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  /**
   * Isi bergantung endpoint:
   * - GET /umkm          -> tidak ada, diganti `_count`
   * - GET /umkm/active   -> hanya gambar dengan isPrimary true
   * - GET /umkm/:slug    -> semua gambar
   */
  images?: UMKMImage[];
  _count?: { images: number };
}

// ============================================================
// POTENSI PADUKUHAN
// ============================================================

export interface PotentialImage {
  id: string;
  url: string;
  caption: string | null;
  /** Dijaga backend dengan aturan yang sama persis seperti `UMKMImage.isPrimary`. */
  isPrimary: boolean;
  potentialId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Potential {
  id: string;
  name: string;
  slug: string;
  category: PotentialCategory;
  description: string;
  thumbnail: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  contactPerson: string | null;
  contactPhone: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  /** Sama seperti UMKM: isinya bergantung endpoint. */
  images?: PotentialImage[];
  _count?: { images: number };
}

// ============================================================
// PENGATURAN SITUS
// ============================================================

export interface Setting {
  id: string;
  key: string;
  value: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Badan permintaan `PATCH /settings/:key`. Hanya `value` — `key` sudah ada
 * di URL, dan mengirimnya lagi di badan permintaan dijawab 400.
 */
export interface UpdateSettingBody {
  /**
   * Selalu teks. Angka dan koordinat pun dikirim sebagai teks,
   * misalnya "15" atau "-7.795580".
   */
  value: string;
}

/**
 * Key yang tersedia dari seed backend.
 *
 * Daftar ini tidak tertutup: `PATCH /settings/:key` bersifat **upsert**,
 * jadi key yang belum ada akan dibuatkan, bukan dijawab 404. Menambah key
 * baru (misalnya "tiktok") cukup lewat endpoint itu — tanpa seed baru dan
 * tanpa perlu meminta tambahan ke tim backend.
 */
export type SettingKey =
  | 'site_name'
  | 'site_description'
  | 'site_logo'
  | 'site_favicon'
  | 'site_banner'
  | 'address'
  | 'phone'
  | 'email'
  | 'instagram'
  | 'facebook'
  | 'youtube'
  | 'footer_text'
  | 'about_us'
  | 'map_latitude'
  | 'map_longitude'
  | 'map_zoom';

// ============================================================
// UPLOAD
// ============================================================

export type UploadFolder =
  | 'berita'
  | 'galeri'
  | 'umkm'
  | 'potensi'
  | 'peta'
  | 'profil'
  | 'pengaturan'
  | 'umum';

/**
 * Sejak putaran perbaikan kedua, frontend **tidak perlu** membersihkan
 * bucket sendiri. Backend menghapus berkasnya bersamaan dengan record-nya,
 * dan juga saat sebuah gambar diganti dengan yang lain.
 *
 * `DELETE /upload` kini hanya untuk satu keadaan: berkas yang terlanjur
 * terunggah tetapi batal dipakai karena pengelola menutup form.
 */
export interface UploadedFile {
  /** Path objek di dalam bucket, dipakai untuk menghapus. */
  path: string;
  /** URL publik — inilah yang disimpan ke field gambar model lain. */
  url: string;
  size: number;
  mimeType: string;
  originalName: string;
}

export const UPLOAD_MAX_SIZE_BYTES = 5 * 1024 * 1024;
export const UPLOAD_MAX_FILES = 10;
export const UPLOAD_ALLOWED_MIME = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
] as const;

// ============================================================
// PINTASAN TIPE RESPONS
// ============================================================

export type NewsListResponse = Paginated<News>;
export type AgendaListResponse = Paginated<Agenda>;
export type AnnouncementListResponse = Paginated<Announcement>;
export type GalleryAlbumListResponse = Paginated<GalleryAlbum>;
export type GalleryItemListResponse = Paginated<GalleryItem>;
export type UMKMListResponse = Paginated<UMKM>;
export type PotentialListResponse = Paginated<Potential>;
export type MapMarkerListResponse = Paginated<MapMarker>;
export type PopulationStatListResponse = Paginated<PopulationStat>;

/**
 * Endpoint yang mengembalikan ARRAY POLOS, bukan { data, meta }.
 * Jangan membaca `.data` pada respons berikut:
 *
 *   GET /maps/marker/active           -> MapMarker[]
 *   GET /maps/category                -> MapCategory[]
 *   GET /maps/icon                    -> MapIconGroup[]
 *   GET /news/category/all            -> Category[]
 *   GET /profile                      -> Profile[]
 *   GET /settings                     -> Setting[]
 *   GET /umkm/image/umkm/:id          -> UMKMImage[]
 *   GET /potential/image/potential/:id -> PotentialImage[]
 */
