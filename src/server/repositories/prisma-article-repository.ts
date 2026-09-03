import "server-only";

import {
  normalizeListParams,
  paginate,
  type ArticleDetail,
  type ArticleSummary,
  type Category,
  type ListParams,
  type Paginated,
} from "@/server/domain/article";
import { getPrisma } from "@/server/db/client";
import type { ArticleRepository } from "./article-repository";

/**
 * Implementasi ASLI dari ArticleRepository, pakai Prisma + PostgreSQL.
 *
 * Bentuk balikannya wajib sama persis dengan versi in-memory. Kalau ada beda
 * sedikit saja, halaman yang tadinya jalan pakai data palsu bakal rusak waktu
 * ditukar ke database asli.
 *
 * Pemilik: Orang 1 (Database)
 */

/**
 * Kolom apa saja yang diambil untuk tampilan ringkas.
 *
 * Sengaja TIDAK mengambil `content`. Isi artikel bisa ribuan karakter; kalau
 * ikut terambil untuk 10 artikel di halaman depan, datanya jadi jauh lebih
 * besar padahal tidak ada satu pun yang ditampilkan di kartu artikel.
 */
const summarySelect = {
  slug: true,
  title: true,
  excerpt: true,
  imageUrl: true,
  publishedAt: true,
  viewCount: true,
  category: { select: { slug: true, name: true } },
  author: { select: { slug: true, name: true } },
} as const;

const detailSelect = {
  ...summarySelect,
  content: true,
  status: true,
  updatedAt: true,
} as const;

/**
 * Syarat "artikel boleh dilihat publik".
 *
 * Dipakai di SEMUA query publik. Dua syaratnya:
 *   - status PUBLISHED (bukan draft, bukan diarsipkan)
 *   - publishedAt sudah lewat (artikel terjadwal belum boleh bocor)
 */
function syaratTerbit() {
  return {
    status: "PUBLISHED" as const,
    publishedAt: { not: null, lte: new Date() },
  };
}

const urutTerbaru = [
  { publishedAt: "desc" as const },
  // Pemecah seri: kalau dua artikel tanggal terbitnya sama persis, urutannya
  // harus tetap konsisten. Tanpa ini, paginasi bisa menampilkan artikel yang
  // sama dua kali di halaman berbeda.
  { slug: "asc" as const },
];

export const prismaArticleRepository: ArticleRepository = {
  async listPublished(params?: ListParams): Promise<Paginated<ArticleSummary>> {
    const { page, perPage, skip } = normalizeListParams(params);
    const where = syaratTerbit();

    const [items, total] = await Promise.all([
      getPrisma().article.findMany({
        where,
        select: summarySelect,
        orderBy: urutTerbaru,
        skip,
        take: perPage,
      }),
      getPrisma().article.count({ where }),
    ]);

    return paginate(items, total, page, perPage);
  },

  async findBySlug(slug: string): Promise<ArticleDetail | null> {
    const artikel = await getPrisma().article.findFirst({
      where: { slug, ...syaratTerbit() },
      select: detailSelect,
    });

    return artikel ?? null;
  },

  async listByCategory(
    categorySlug: string,
    params?: ListParams,
  ): Promise<Paginated<ArticleSummary>> {
    const { page, perPage, skip } = normalizeListParams(params);
    const where = { ...syaratTerbit(), category: { slug: categorySlug } };

    const [items, total] = await Promise.all([
      getPrisma().article.findMany({
        where,
        select: summarySelect,
        orderBy: urutTerbaru,
        skip,
        take: perPage,
      }),
      getPrisma().article.count({ where }),
    ]);

    return paginate(items, total, page, perPage);
  },

  async search(
    query: string,
    params?: ListParams,
  ): Promise<Paginated<ArticleSummary>> {
    const { page, perPage, skip } = normalizeListParams(params);
    const kunci = query.trim();

    if (!kunci) {
      return paginate<ArticleSummary>([], 0, page, perPage);
    }

    // `mode: "insensitive"` bikin pencarian tidak peduli huruf besar/kecil.
    // Catatan buat nanti: ini masih LIKE biasa, jadi lambat kalau artikelnya
    // sudah puluhan ribu. Kalau sudah sampai situ, ganti ke full-text search
    // PostgreSQL. Untuk skala proyek ini, ini sudah cukup.
    const where = {
      ...syaratTerbit(),
      OR: [
        { title: { contains: kunci, mode: "insensitive" as const } },
        { excerpt: { contains: kunci, mode: "insensitive" as const } },
      ],
    };

    const [items, total] = await Promise.all([
      getPrisma().article.findMany({
        where,
        select: summarySelect,
        orderBy: urutTerbaru,
        skip,
        take: perPage,
      }),
      getPrisma().article.count({ where }),
    ]);

    return paginate(items, total, page, perPage);
  },

  async listPopular(limit = 5): Promise<ArticleSummary[]> {
    return getPrisma().article.findMany({
      where: syaratTerbit(),
      select: summarySelect,
      orderBy: [{ viewCount: "desc" }, { slug: "asc" }],
      take: limit,
    });
  },

  async listFeatured(limit = 3): Promise<ArticleSummary[]> {
    return getPrisma().article.findMany({
      where: syaratTerbit(),
      select: summarySelect,
      orderBy: urutTerbaru,
      take: limit,
    });
  },

  async listCategories(): Promise<Category[]> {
    const kategori = await getPrisma().category.findMany({
      orderBy: { order: "asc" },
      select: {
        slug: true,
        name: true,
        order: true,
        _count: { select: { articles: { where: syaratTerbit() } } },
      },
    });

    return kategori.map((k) => ({
      slug: k.slug,
      name: k.name,
      order: k.order,
      articleCount: k._count.articles,
    }));
  },

  async incrementViewCount(slug: string): Promise<void> {
    // Sengaja ditelan errornya. Penghitung dibaca itu bonus, bukan hal penting.
    // Kalau update-nya gagal, halaman artikel harus tetap tampil normal.
    try {
      await getPrisma().article.update({
        where: { slug },
        data: { viewCount: { increment: 1 } },
      });
    } catch {
      // sengaja dibiarkan
    }
  },
};
