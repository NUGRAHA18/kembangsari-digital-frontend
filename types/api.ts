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
 * Query untuk GET /news/published dan GET /news.
 * Catatan: sejak backend memakai forbidNonWhitelisted, parameter di luar
 * daftar ini dijawab 400, bukan diabaikan diam-diam.
 */
export interface NewsQuery extends PaginationQuery {
  /** Saring berdasarkan id kategori (ambil dari GET /news/category/all). */
  categoryId?: string;
}

/** Query untuk GET /potential/active dan GET /potential. */
export interface PotentialQuery extends PaginationQuery {
  category?: PotentialCategory;
}

// ------------------------------------------------------------
// SARINGAN STATUS — hanya di daftar BERTOKEN
//
// Tidak dikirim berarti "semua". Nilai selain true/false dijawab 400 dengan
// pesan yang menyebut nama parameternya.
//
// Jangan mengirimnya ke versi tersaring (`/news/published`,
// `/umkm/active`, dan seterusnya): di sana parameternya tidak punya arti dan
// forbidNonWhitelisted menjawabnya 400 — itu sebabnya tipe query publik dan
// admin dipisah, bukan disatukan dengan field opsional.
// ------------------------------------------------------------

/** Untuk modul berstatus terbit/draf: berita dan monografi. */
export interface PublishedFilter {
  published?: boolean;
}

/** Untuk modul berstatus tampil/disembunyikan. */
export interface ActiveFilter {
  isActive?: boolean;
}

export interface AdminNewsQuery extends NewsQuery, PublishedFilter {}

export interface AdminAnnouncementQuery extends PaginationQuery, ActiveFilter {}

export interface AdminUmkmQuery extends PaginationQuery, ActiveFilter {}

export interface AdminPotentialQuery extends PotentialQuery, ActiveFilter {}

/** `/monography` tidak punya kolom teks untuk dicari; `search` sengaja tidak ada. */
export interface AdminMonographyQuery extends Omit<PaginationQuery, 'search'>, PublishedFilter {}

/** Saringan kategori marker kini ada di daftar utama, bukan endpoint terpisah. */
export interface AdminMarkerQuery extends PaginationQuery, ActiveFilter {
  categoryId?: string;
}

/** Sama untuk program KKN: sub-program bisa digabung dengan saringan status. */
export interface AdminKknProgramQuery extends PaginationQuery, ActiveFilter {
  subProgram?: KKNSubProgram;
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

export type KKNSubProgram =
  | 'RUMAH_BELAJAR'
  | 'PEKARANGAN_PRODUKTIF'
  | 'PENGELOLAAN_SAMPAH'
  | 'PENERANGAN_JALAN';

/**
 * Skema backend juga mendeklarasikan enum Gender, EducationLevel,
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

export interface MapCategory {
  id: string;
  name: string;
  slug: string;
  /** Nama ikon, bukan URL. Contoh: "home", "mosque". */
  icon: string | null;
  createdAt: string;
  updatedAt: string;
  /**
   * Hadir pada GET /maps/category dan /maps/category/:id — termasuk marker
   * yang disembunyikan.
   *
   * PERHATIAN, berbeda dari `Category._count.news`: menghapus kategori peta
   * TIDAK ditolak backend, ia menghapus seluruh marker di dalamnya. Angka ini
   * dipakai untuk memperingatkan, bukan untuk mematikan tombol hapus.
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

/**
 * Gambar UMKM.
 *
 * `isPrimary` dijaga backend dalam satu transaksi: gambar pertama sebuah
 * record otomatis menjadi utama, menandai yang baru melepas yang lama, dan
 * menghapus yang utama mengangkat gambar teratas berikutnya. Jaminannya —
 * selama sebuah record punya gambar, tepat satu di antaranya bertanda utama.
 * Frontend tidak perlu (dan tidak boleh) ikut menjaganya.
 *
 * Melepas penanda pada satu-satunya gambar dijawab 400.
 */
export interface UMKMImage {
  id: string;
  url: string;
  caption: string | null;
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

/** Sama seperti `UMKMImage`: `isPrimary` dijaga backend, bukan frontend. */
export interface PotentialImage {
  id: string;
  url: string;
  caption: string | null;
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
// PROGRAM KKN
// ============================================================

export interface KKNActivity {
  id: string;
  title: string;
  description: string | null;
  date: string | null;
  image: string | null;
  programId: string;
  createdAt: string;
  updatedAt: string;
  program?: KKNProgram;
}

export interface KKNProgram {
  id: string;
  subProgram: KKNSubProgram;
  title: string;
  slug: string;
  description: string;
  thumbnail: string | null;
  /** Berisi Markdown. */
  content: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: { activities: number };
  /** Hadir pada GET /kkn/program/:slug (detail). */
  activities?: KKNActivity[];
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
 * Badan `PATCH /settings/:key`. `key` sudah ada di URL — mengirimnya ikut di
 * badan dijawab 400 oleh forbidNonWhitelisted.
 *
 * `value` SELALU teks, termasuk `map_zoom` ("15") dan `map_latitude`
 * ("-7.795580"). Frontend yang mengubahnya menjadi angka bila perlu.
 */
export interface UpdateSettingBody {
  value: string;
}

/**
 * Key yang datang dari seed backend.
 *
 * Bukan daftar tertutup: `PATCH /settings/:key` bersifat upsert, jadi key baru
 * (`tiktok`, misalnya) tinggal dikirim dan akan dibuatkan. Yang tetap menjawab
 * 404 adalah `GET /settings/:key` untuk key yang belum ada, dan `DELETE`
 * memang tidak disediakan — mengosongkan `value` adalah caranya.
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
  | 'kkn'
  | 'peta'
  | 'profil'
  | 'pengaturan'
  | 'umum';

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
export type KKNProgramListResponse = Paginated<KKNProgram>;
export type KKNActivityListResponse = Paginated<KKNActivity>;
export type PopulationStatListResponse = Paginated<PopulationStat>;

/**
 * Endpoint yang mengembalikan ARRAY POLOS, bukan { data, meta }.
 * Jangan membaca `.data` pada respons berikut:
 *
 *   GET /maps/marker/active           -> MapMarker[]
 *   GET /maps/category                -> MapCategory[]
 *   GET /news/category/all            -> Category[]
 *   GET /profile                      -> Profile[]
 *   GET /settings                     -> Setting[]
 *   GET /umkm/image/umkm/:id          -> UMKMImage[]
 *   GET /potential/image/potential/:id -> PotentialImage[]
 */
