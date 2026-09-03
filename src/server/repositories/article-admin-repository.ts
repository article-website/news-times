import type {
  ArticleAdminDetail,
  ArticleAdminSummary,
  ArticleStatus,
  ListParams,
  Paginated,
} from "@/server/domain/article";

/**
 * Kontrak TULIS artikel. Dipakai Orang 3 di src/app/admin/.
 *
 * Kenapa dipisah dari ArticleRepository?
 *
 * ArticleRepository itu untuk publik dan SELALU menyaring hanya artikel terbit.
 * Kalau fungsi tulis dan fungsi baca-draft dicampur di sana, cepat atau lambat
 * ada yang tidak sengaja memakainya di halaman publik dan draft ikut bocor.
 *
 * Dengan dipisah, aturannya jadi gampang diingat:
 *   - halaman publik  -> articleRepo       (cuma yang terbit)
 *   - halaman admin   -> articleAdminRepo  (semua, termasuk draft)
 *
 * BATAS TANGGUNG JAWAB - penting dibaca Orang 3 & 4:
 *
 * Lapisan ini murni simpan-ambil. Dia TIDAK mengurus:
 *   - membuat slug dari judul       -> service, punya Orang 4
 *   - validasi isi form             -> Zod, punya Orang 4
 *   - upload gambar ke Blob         -> punya Orang 3; simpan URL hasilnya saja
 *   - cek siapa yang boleh mengedit -> auth, punya Orang 3
 *
 * Pemilik: Orang 1 (Database)
 */

export interface CreateArticleInput {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  imageUrl?: string | null;
  status?: ArticleStatus;
  publishedAt?: Date | null;
  categorySlug: string;
  authorSlug: string;
}

/** Semua field opsional: kirim hanya yang mau diubah. */
export type UpdateArticleInput = Partial<CreateArticleInput>;

export interface AdminListParams extends ListParams {
  /** Saring per status. Kosongkan untuk menampilkan semua. */
  status?: ArticleStatus;
  /** Cari pada judul. */
  query?: string;
}

export interface ArticleAdminRepository {
  /** Daftar SEMUA artikel termasuk draft, terbaru diubah paling atas. */
  list(params?: AdminListParams): Promise<Paginated<ArticleAdminSummary>>;

  /** Ambil satu artikel untuk form sunting. Termasuk draft. */
  findById(id: string): Promise<ArticleAdminDetail | null>;

  /**
   * Cek apakah sebuah slug sudah dipakai.
   *
   * `kecualiId` dipakai waktu mengedit: artikel yang sedang diedit boleh tetap
   * memakai slug-nya sendiri. Tanpa parameter itu, menyimpan artikel tanpa
   * mengubah judul akan salah dianggap bentrok.
   */
  slugDipakai(slug: string, kecualiId?: string): Promise<boolean>;

  create(input: CreateArticleInput): Promise<ArticleAdminDetail>;

  update(id: string, input: UpdateArticleInput): Promise<ArticleAdminDetail>;

  /** Menghapus permanen. Mengembalikan false kalau artikelnya tidak ada. */
  remove(id: string): Promise<boolean>;

  /**
   * Menerbitkan artikel.
   *
   * Kalau `publishedAt` belum pernah diisi, otomatis diisi waktu sekarang.
   * Kalau sudah pernah terbit lalu dijadikan draft lagi dan diterbitkan ulang,
   * tanggal terbit ASLINYA dipertahankan - supaya urutan artikel di halaman
   * depan tidak tiba-tiba berubah cuma karena artikel lama disunting.
   */
  publish(id: string): Promise<ArticleAdminDetail>;

  /** Mengembalikan artikel ke status draft. Tanggal terbit tidak dihapus. */
  unpublish(id: string): Promise<ArticleAdminDetail>;

  /** Jumlah artikel per status. Untuk kartu ringkasan di dasbor admin. */
  countByStatus(): Promise<Record<ArticleStatus, number>>;
}
