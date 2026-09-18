import {
  normalizeListParams,
  paginate,
  type ArticleAdminSummary,
  type ArticleStatus,
  type Paginated,
} from "@/server/domain/article";
import type {
  AdminListParams,
  ArticleAdminRepository,
  CreateArticleInput,
  UpdateArticleInput,
} from "./article-admin-repository";
import {
  cariKategori,
  cariPenulis,
  idBaru,
  semuaBaris as baris,
  type Baris,
} from "./in-memory-article-store";

/**
 * Versi data contoh ArticleAdminRepository.
 *
 * Baris-barisnya disimpan di in-memory-article-store.ts, yang juga dibaca
 * repository publik. Jadi artikel yang diterbitkan di sini langsung muncul di
 * halaman depan dan "Lihat Semua", sama seperti mode Prisma.
 *
 * Pemilik: Orang 1 (Database)
 */

function toSummary(b: Baris): ArticleAdminSummary {
  return {
    id: b.id,
    slug: b.slug,
    title: b.title,
    status: b.status,
    publishedAt: b.publishedAt,
    updatedAt: b.updatedAt,
    viewCount: b.viewCount,
    category: b.category,
    author: b.author,
  };
}

export const inMemoryArticleAdminRepository: ArticleAdminRepository = {
  async list(params?: AdminListParams): Promise<Paginated<ArticleAdminSummary>> {
    const { page, perPage, skip } = normalizeListParams(params);
    const kunci = params?.query?.trim().toLowerCase();

    const cocok = baris
      .filter((b) => (params?.status ? b.status === params.status : true))
      .filter((b) => (kunci ? b.title.toLowerCase().includes(kunci) : true))
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

    return paginate(
      cocok.slice(skip, skip + perPage).map(toSummary),
      cocok.length,
      page,
      perPage,
    );
  },

  async findById(id) {
    return baris.find((b) => b.id === id) ?? null;
  },

  async slugDipakai(slug, kecualiId) {
    return baris.some((b) => b.slug === slug && b.id !== kecualiId);
  },

  async create(input: CreateArticleInput) {
    if (baris.some((b) => b.slug === input.slug)) {
      throw new Error(`Slug "${input.slug}" sudah dipakai.`);
    }

    const sekarang = new Date();
    const b: Baris = {
      id: idBaru(),
      slug: input.slug,
      title: input.title,
      excerpt: input.excerpt,
      content: input.content,
      imageUrl: input.imageUrl ?? null,
      status: input.status ?? "DRAFT",
      publishedAt: input.publishedAt ?? null,
      createdAt: sekarang,
      updatedAt: sekarang,
      viewCount: 0,
      category: cariKategori(input.categorySlug),
      author: cariPenulis(input.authorSlug),
    };

    baris.push(b);
    return b;
  },

  async update(id: string, input: UpdateArticleInput) {
    const b = baris.find((x) => x.id === id);
    if (!b) throw new Error(`Artikel dengan id "${id}" tidak ditemukan.`);

    if (input.slug !== undefined) b.slug = input.slug;
    if (input.title !== undefined) b.title = input.title;
    if (input.excerpt !== undefined) b.excerpt = input.excerpt;
    if (input.content !== undefined) b.content = input.content;
    if (input.imageUrl !== undefined) b.imageUrl = input.imageUrl;
    if (input.status !== undefined) b.status = input.status;
    if (input.publishedAt !== undefined) b.publishedAt = input.publishedAt;
    if (input.categorySlug !== undefined) {
      b.category = cariKategori(input.categorySlug);
    }
    if (input.authorSlug !== undefined) {
      b.author = cariPenulis(input.authorSlug);
    }

    b.updatedAt = new Date();
    return b;
  },

  async remove(id: string) {
    const i = baris.findIndex((b) => b.id === id);
    if (i === -1) return false;
    baris.splice(i, 1);
    return true;
  },

  async publish(id: string) {
    const b = baris.find((x) => x.id === id);
    if (!b) throw new Error(`Artikel dengan id "${id}" tidak ditemukan.`);

    b.status = "PUBLISHED";
    b.publishedAt = b.publishedAt ?? new Date();
    b.updatedAt = new Date();
    return b;
  },

  async unpublish(id: string) {
    const b = baris.find((x) => x.id === id);
    if (!b) throw new Error(`Artikel dengan id "${id}" tidak ditemukan.`);

    b.status = "DRAFT";
    b.updatedAt = new Date();
    return b;
  },

  async countByStatus() {
    const jumlah: Record<ArticleStatus, number> = {
      DRAFT: 0,
      PUBLISHED: 0,
      ARCHIVED: 0,
    };
    for (const b of baris) jumlah[b.status]++;
    return jumlah;
  },
};
