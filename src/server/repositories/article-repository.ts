import type {
  ArticleDetail,
  ArticleSummary,
  Category,
  ListParams,
  Paginated,
} from "@/server/domain/article";

/**
 * ============================================================================
 * KONTRAK UTAMA PROYEK INI
 * ============================================================================
 *
 * Ini satu-satunya cara halaman dan API boleh mengambil data artikel.
 * Tidak ada satu pun file di src/app/ yang boleh meng-import Prisma langsung.
 *
 * Kenapa dibikin interface, bukan langsung panggil Prisma?
 *
 *   1. Orang 2, 3, dan 4 bisa mulai ngoding di Sprint 1 pakai implementasi
 *      palsu (in-memory), tanpa nunggu database jadi.
 *   2. Waktu database siap, yang diganti cuma satu baris di index.ts.
 *      Kode halaman tidak berubah sama sekali.
 *   3. Nanti kalau mau ditest, gampang: pasang implementasi palsu.
 *
 * MENGUBAH INTERFACE INI = MENGUBAH KONTRAK.
 * Wajib dibahas bareng dulu, jangan diam-diam di tengah PR fitur.
 *
 * Pemilik: Orang 1 (Database)
 */
export interface ArticleRepository {
  /**
   * Daftar artikel terbit, urut dari yang paling baru.
   * Dipakai: halaman depan dan /articles.
   */
  listPublished(params?: ListParams): Promise<Paginated<ArticleSummary>>;

  /**
   * Satu artikel lengkap berdasarkan slug (bagian terakhir URL).
   * Balikannya `null` kalau tidak ketemu ATAU statusnya belum terbit,
   * supaya draft tidak bocor ke pengunjung lewat tebak-tebakan URL.
   */
  findBySlug(slug: string): Promise<ArticleDetail | null>;

  /** Daftar artikel dalam satu kategori. Dipakai halaman /kategori/[slug]. */
  listByCategory(
    categorySlug: string,
    params?: ListParams,
  ): Promise<Paginated<ArticleSummary>>;

  /** Pencarian pada judul dan ringkasan. Dipakai halaman /search. */
  search(query: string, params?: ListParams): Promise<Paginated<ArticleSummary>>;

  /** Artikel terpopuler berdasarkan jumlah dibaca. Dipakai sidebar. */
  listPopular(limit?: number): Promise<ArticleSummary[]>;

  /** Artikel sorotan untuk hero di halaman depan. */
  listFeatured(limit?: number): Promise<ArticleSummary[]>;

  /** Semua kategori beserta jumlah artikelnya. Dipakai navbar dan sidebar. */
  listCategories(): Promise<Category[]>;

  /**
   * Menaikkan penghitung dibaca. Sengaja "tembak dan lupakan":
   * kalau gagal, halaman tetap harus tampil normal.
   */
  incrementViewCount(slug: string): Promise<void>;
}
