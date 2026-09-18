import {
  normalizeListParams,
  paginate,
  type ArticleDetail,
  type ArticleSummary,
  type Category,
  type ListParams,
  type Paginated,
} from "@/server/domain/article";
import { seedCategories } from "@/server/data/seed-source";
import type { ArticleRepository } from "./article-repository";
import {
  semuaBaris,
  terlihatPublik,
  type Baris,
} from "./in-memory-article-store";

/**
 * Versi DATA CONTOH dari ArticleRepository, isinya cuma array di memori.
 *
 * Gunanya: Orang 2, 3, dan 4 bisa langsung ngoding di Sprint 1 tanpa nunggu
 * database Neon jadi. Begitu database siap, tinggal ganti satu baris di
 * index.ts dan semua kode halaman tetap sama persis.
 *
 * Membaca dari in-memory-article-store.ts, "tabel" yang sama dengan yang
 * ditulis repository admin. Jadi artikel yang diterbitkan dari /admin ikut
 * muncul di sini, dan draft tetap tersembunyi.
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

// --- ambil yang boleh tampil ------------------------------------------------

/**
 * Artikel yang boleh dilihat publik, terbaru di atas. Dihitung ulang tiap
 * dipanggil, karena admin bisa menambah atau menarik artikel kapan saja.
 *
 * Urutannya sama dengan urutTerbaru di versi Prisma: tanggal terbit, lalu slug
 * sebagai pemecah seri.
 */
function artikelTerbit(): Baris[] {
  const sekarang = new Date();
  return semuaBaris
    .filter((b) => terlihatPublik(b, sekarang))
    .sort(
      (a, b) =>
        b.publishedAt!.getTime() - a.publishedAt!.getTime() ||
        a.slug.localeCompare(b.slug),
    );
}

// --- pengubah bentuk --------------------------------------------------------

function toSummary(b: Baris): ArticleSummary {
  return {
    slug: b.slug,
    title: b.title,
    excerpt: b.excerpt,
    imageUrl: b.imageUrl,
    publishedAt: b.publishedAt,
    viewCount: b.viewCount,
    category: { slug: b.category.slug, name: b.category.name },
    author: { slug: b.author.slug, name: b.author.name },
  };
}

function toDetail(b: Baris): ArticleDetail {
  return {
    ...toSummary(b),
    content: b.content,
    status: b.status,
    updatedAt: b.updatedAt,
  };
}

function ambilHalaman(
  sumber: Baris[],
  params?: ListParams,
): Paginated<ArticleSummary> {
  const { page, perPage, skip } = normalizeListParams(params);
  const potongan = sumber.slice(skip, skip + perPage).map(toSummary);
  return paginate(potongan, sumber.length, page, perPage);
}

// --- implementasi -----------------------------------------------------------

export const inMemoryArticleRepository: ArticleRepository = {
  async listPublished(params) {
    return ambilHalaman(artikelTerbit(), params);
  },

  async findBySlug(slug) {
    const ketemu = artikelTerbit().find((b) => b.slug === slug);
    return ketemu ? toDetail(ketemu) : null;
  },

  async listByCategory(categorySlug, params) {
    const cocok = artikelTerbit().filter(
      (b) => b.category.slug === categorySlug,
    );
    return ambilHalaman(cocok, params);
  },

  async search(query, params) {
    const kunci = query.trim().toLowerCase();
    if (!kunci) {
      const { page, perPage } = normalizeListParams(params);
      return paginate<ArticleSummary>([], 0, page, perPage);
    }

    const cocok = artikelTerbit().filter(
      (b) =>
        b.title.toLowerCase().includes(kunci) ||
        b.excerpt.toLowerCase().includes(kunci),
    );
    return ambilHalaman(cocok, params);
  },

  async listPopular(limit = 5) {
    return artikelTerbit()
      .sort((a, b) => b.viewCount - a.viewCount || a.slug.localeCompare(b.slug))
      .slice(0, limit)
      .map(toSummary);
  },

  async listFeatured(limit = 3) {
    return artikelTerbit().slice(0, limit).map(toSummary);
  },

  async listCategories(): Promise<Category[]> {
    const terbit = artikelTerbit();
    return seedCategories.map((c) => ({
      slug: c.slug,
      name: c.name,
      order: c.order,
      articleCount: terbit.filter((b) => b.category.slug === c.slug).length,
    }));
  },

  async incrementViewCount(slug) {
    const b = semuaBaris.find((x) => x.slug === slug);
    if (b) b.viewCount++;
  },
};
