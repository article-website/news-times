/**
 * Bentuk data artikel yang dipakai SELURUH aplikasi.
 *
 * PENTING: file ini sengaja tidak meng-import apa pun dari Prisma.
 * Isinya murni tipe TypeScript, jadi aman di-import dari komponen React
 * maupun dari kode server. Kalau file ini sampai menarik Prisma, komponen
 * client yang meng-import-nya akan ikut menyeret Prisma ke bundle browser.
 *
 * Pemilik: Orang 1 (Database)
 */

export type ArticleStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

/**
 * Versi RINGKAS - dipakai di daftar artikel, kartu, sidebar.
 *
 * Sengaja TIDAK punya field `content`. Halaman depan menampilkan 5-20 artikel;
 * kalau isi lengkap tiap artikel ikut dikirim, datanya jadi puluhan kali lebih
 * besar padahal tidak ada satu pun yang ditampilkan.
 */
export interface ArticleSummary {
  slug: string;
  title: string;
  excerpt: string;
  imageUrl: string | null;
  publishedAt: Date | null;
  viewCount: number;
  category: CategoryRef;
  author: AuthorRef;
}

/**
 * Versi LENGKAP - hanya dipakai di halaman detail artikel,
 * karena cuma di sana `content` benar-benar ditampilkan.
 */
export interface ArticleDetail extends ArticleSummary {
  content: string;
  status: ArticleStatus;
  updatedAt: Date;
}

/**
 * Versi ADMIN - dipakai di tabel daftar artikel pada CMS.
 *
 * Bedanya dengan ArticleSummary: versi ini ikut menampilkan draft dan artikel
 * terarsip, dan membawa `status` supaya bisa diberi label di tabel.
 * Halaman publik tidak boleh memakai tipe ini.
 */
export interface ArticleAdminSummary {
  id: string;
  slug: string;
  title: string;
  status: ArticleStatus;
  publishedAt: Date | null;
  updatedAt: Date;
  viewCount: number;
  category: CategoryRef;
  author: AuthorRef;
}

/** Data lengkap untuk form sunting artikel. */
export interface ArticleAdminDetail extends ArticleAdminSummary {
  excerpt: string;
  content: string;
  imageUrl: string | null;
  createdAt: Date;
}

export interface CategoryRef {
  slug: string;
  name: string;
}

export interface AuthorRef {
  slug: string;
  name: string;
}

export interface Category extends CategoryRef {
  order: number;
  articleCount: number;
}

// ---------------------------------------------------------------------------
// Paginasi
// ---------------------------------------------------------------------------

export interface ListParams {
  /** Halaman ke berapa, dimulai dari 1. */
  page?: number;
  /** Berapa artikel per halaman. */
  perPage?: number;
}

export interface Paginated<T> {
  items: T[];
  page: number;
  perPage: number;
  total: number;
  /** Dipakai tombol "Muat Lebih Banyak" buat tahu masih ada sisa atau tidak. */
  hasMore: boolean;
}

/** Batas aman biar tidak ada yang minta 10.000 artikel sekaligus lewat URL. */
export const MAX_PER_PAGE = 50;
export const DEFAULT_PER_PAGE = 10;

/**
 * Membersihkan input paginasi dari luar (query string bisa berisi apa saja).
 * Dipakai semua implementasi repository supaya perilakunya seragam.
 */
export function normalizeListParams(params: ListParams = {}): {
  page: number;
  perPage: number;
  skip: number;
} {
  const rawPage = Number(params.page ?? 1);
  const rawPerPage = Number(params.perPage ?? DEFAULT_PER_PAGE);

  const page = Number.isFinite(rawPage) && rawPage >= 1 ? Math.floor(rawPage) : 1;
  const perPage =
    Number.isFinite(rawPerPage) && rawPerPage >= 1
      ? Math.min(Math.floor(rawPerPage), MAX_PER_PAGE)
      : DEFAULT_PER_PAGE;

  return { page, perPage, skip: (page - 1) * perPage };
}

export function paginate<T>(
  items: T[],
  total: number,
  page: number,
  perPage: number,
): Paginated<T> {
  return {
    items,
    page,
    perPage,
    total,
    hasMore: page * perPage < total,
  };
}
