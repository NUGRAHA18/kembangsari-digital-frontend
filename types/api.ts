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

// ============================================================
// ENUM
// ============================================================

export type Role = 'ADMIN' | 'EDITOR';

export type GalleryType = 'FOTO' | 'VIDEO';

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

  /** JSON bebas untuk data pekerjaan — strukturnya belum dibakukan. */
  employmentData: unknown | null;

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

/** Key yang tersedia dari seed backend. */
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
