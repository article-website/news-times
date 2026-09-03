import {
  normalizeListParams,
  paginate,
  type ArticleDetail,
  type ArticleSummary,
  type Category,
  type ListParams,
  type Paginated,
} from "@/server/domain/article";
import {
  seedArticles,
  seedCategories,
  slugify,
  type SeedArticle,
} from "@/server/data/seed-source";
import type { ArticleRepository } from "./article-repository";

/**
 * Versi DATA CONTOH dari ArticleRepository, isinya cuma array di memori.
 *
 * Gunanya: Orang 2, 3, dan 4 bisa langsung ngoding di Sprint 1 tanpa nunggu
 * database Neon jadi. Begitu database siap, tinggal ganti satu baris di
 * index.ts dan semua kode halaman tetap sama persis.
 *
 * Juga dipakai buat testing nanti, karena tidak butuh database sama sekali.
 *
 * Batasannya (wajar, karena ini memang palsu):
 *   - Data hilang tiap server restart.
 *   - incrementViewCount cuma nambah angka di memori.
 *   - Pencarian pakai `includes` biasa, bukan full-text search.
 *
 * Pemilik: Orang 1 (Database)
 */

// --- susun data sekali di awal ---------------------------------------------

const categoryBySlug = new Map(seedCategories.map((c) => [c.slug, c]));

/** Artikel diurutkan dari yang paling baru, sekali saja waktu modul dimuat. */
const semuaArtikel: SeedArticle[] = [...seedArticles].sort(
  (a, b) => b.publishedAt.getTime() - a.publishedAt.getTime(),
);

/** Penghitung dibaca disimpan terpisah supaya data seed-nya tidak ikut berubah. */
const viewCounts = new Map(semuaArtikel.map((a) => [a.slug, a.viewCount]));

// --- pengubah bentuk --------------------------------------------------------

function toSummary(a: SeedArticle): ArticleSummary {
  const categorySlug = slugify(a.categoryName);
  const category = categoryBySlug.get(categorySlug);

  return {
    slug: a.slug,
    title: a.title,
    excerpt: a.excerpt,
    imageUrl: a.imageUrl,
    publishedAt: a.publishedAt,
    viewCount: viewCounts.get(a.slug) ?? a.viewCount,
    category: {
      slug: categorySlug,
      name: category?.name ?? a.categoryName,
    },
    author: {
      slug: slugify(a.authorName),
      name: a.authorName,
    },
  };
}

function toDetail(a: SeedArticle): ArticleDetail {
  return {
    ...toSummary(a),
    content: a.content,
    status: "PUBLISHED",
    // Data lama tidak punya kolom ini, jadi disamakan dengan tanggal terbit.
    updatedAt: a.publishedAt,
  };
}

function ambilHalaman(
  sumber: SeedArticle[],
  params?: ListParams,
): Paginated<ArticleSummary> {
  const { page, perPage, skip } = normalizeListParams(params);
  const potongan = sumber.slice(skip, skip + perPage).map(toSummary);
  return paginate(potongan, sumber.length, page, perPage);
}

// --- implementasi -----------------------------------------------------------

export const inMemoryArticleRepository: ArticleRepository = {
  async listPublished(params) {
    return ambilHalaman(semuaArtikel, params);
  },

  async findBySlug(slug) {
    const ketemu = semuaArtikel.find((a) => a.slug === slug);
    return ketemu ? toDetail(ketemu) : null;
  },

  async listByCategory(categorySlug, params) {
    const cocok = semuaArtikel.filter(
      (a) => slugify(a.categoryName) === categorySlug,
    );
    return ambilHalaman(cocok, params);
  },

  async search(query, params) {
    const kunci = query.trim().toLowerCase();
    if (!kunci) {
      const { page, perPage } = normalizeListParams(params);
      return paginate<ArticleSummary>([], 0, page, perPage);
    }

    const cocok = semuaArtikel.filter(
      (a) =>
        a.title.toLowerCase().includes(kunci) ||
        a.excerpt.toLowerCase().includes(kunci),
    );
    return ambilHalaman(cocok, params);
  },

  async listPopular(limit = 5) {
    return [...semuaArtikel]
      .sort(
        (a, b) =>
          (viewCounts.get(b.slug) ?? 0) - (viewCounts.get(a.slug) ?? 0),
      )
      .slice(0, limit)
      .map(toSummary);
  },

  async listFeatured(limit = 3) {
    return semuaArtikel.slice(0, limit).map(toSummary);
  },

  async listCategories(): Promise<Category[]> {
    return seedCategories.map((c) => ({
      slug: c.slug,
      name: c.name,
      order: c.order,
      articleCount: semuaArtikel.filter(
        (a) => slugify(a.categoryName) === c.slug,
      ).length,
    }));
  },

  async incrementViewCount(slug) {
    const sekarang = viewCounts.get(slug);
    if (sekarang !== undefined) {
      viewCounts.set(slug, sekarang + 1);
    }
  },
};
