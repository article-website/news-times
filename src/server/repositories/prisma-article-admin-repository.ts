import "server-only";

import {
  normalizeListParams,
  paginate,
  type ArticleAdminDetail,
  type ArticleAdminSummary,
  type ArticleStatus,
  type Paginated,
} from "@/server/domain/article";
import { getPrisma } from "@/server/db/client";
import type {
  AdminListParams,
  ArticleAdminRepository,
  CreateArticleInput,
  UpdateArticleInput,
} from "./article-admin-repository";

/**
 * Implementasi ArticleAdminRepository dengan Prisma.
 * Pemilik: Orang 1 (Database)
 */

const adminSummarySelect = {
  id: true,
  slug: true,
  title: true,
  status: true,
  publishedAt: true,
  updatedAt: true,
  viewCount: true,
  category: { select: { slug: true, name: true } },
  author: { select: { slug: true, name: true } },
} as const;

const adminDetailSelect = {
  ...adminSummarySelect,
  excerpt: true,
  content: true,
  imageUrl: true,
  createdAt: true,
} as const;

/**
 * Menerjemahkan slug kategori/penulis jadi id-nya.
 *
 * Kenapa form mengirim slug, bukan id? Supaya Orang 3 tidak perlu tahu id
 * internal database sama sekali - dropdown kategori cukup memakai slug yang
 * sudah dia punya dari `articleRepo.listCategories()`.
 */
async function cariRelasi(categorySlug?: string, authorSlug?: string) {
  const prisma = getPrisma();

  const [kategori, penulis] = await Promise.all([
    categorySlug
      ? prisma.category.findUnique({
          where: { slug: categorySlug },
          select: { id: true },
        })
      : null,
    authorSlug
      ? prisma.author.findUnique({
          where: { slug: authorSlug },
          select: { id: true },
        })
      : null,
  ]);

  if (categorySlug && !kategori) {
    throw new Error(`Kategori "${categorySlug}" tidak ditemukan.`);
  }
  if (authorSlug && !penulis) {
    throw new Error(`Penulis "${authorSlug}" tidak ditemukan.`);
  }

  return { categoryId: kategori?.id, authorId: penulis?.id };
}

export const prismaArticleAdminRepository: ArticleAdminRepository = {
  async list(params?: AdminListParams): Promise<Paginated<ArticleAdminSummary>> {
    const { page, perPage, skip } = normalizeListParams(params);
    const kunci = params?.query?.trim();

    const where = {
      ...(params?.status ? { status: params.status } : {}),
      ...(kunci
        ? { title: { contains: kunci, mode: "insensitive" as const } }
        : {}),
    };

    const [items, total] = await Promise.all([
      getPrisma().article.findMany({
        where,
        select: adminSummarySelect,
        // Di CMS yang paling berguna adalah "terakhir disunting", bukan
        // "terakhir terbit" - draft yang baru diketik harus muncul di atas.
        orderBy: [{ updatedAt: "desc" }, { id: "asc" }],
        skip,
        take: perPage,
      }),
      getPrisma().article.count({ where }),
    ]);

    return paginate(items, total, page, perPage);
  },

  async findById(id: string): Promise<ArticleAdminDetail | null> {
    return getPrisma().article.findUnique({
      where: { id },
      select: adminDetailSelect,
    });
  },

  async slugDipakai(slug: string, kecualiId?: string): Promise<boolean> {
    const ada = await getPrisma().article.findFirst({
      where: { slug, ...(kecualiId ? { id: { not: kecualiId } } : {}) },
      select: { id: true },
    });
    return ada !== null;
  },

  async create(input: CreateArticleInput): Promise<ArticleAdminDetail> {
    const { categoryId, authorId } = await cariRelasi(
      input.categorySlug,
      input.authorSlug,
    );

    return getPrisma().article.create({
      data: {
        slug: input.slug,
        title: input.title,
        excerpt: input.excerpt,
        content: input.content,
        imageUrl: input.imageUrl ?? null,
        status: input.status ?? "DRAFT",
        publishedAt: input.publishedAt ?? null,
        categoryId: categoryId!,
        authorId: authorId!,
      },
      select: adminDetailSelect,
    });
  },

  async update(
    id: string,
    input: UpdateArticleInput,
  ): Promise<ArticleAdminDetail> {
    const { categoryId, authorId } = await cariRelasi(
      input.categorySlug,
      input.authorSlug,
    );

    return getPrisma().article.update({
      where: { id },
      data: {
        // Hanya field yang benar-benar dikirim yang diubah.
        // `undefined` diabaikan Prisma, jadi field lain tidak ikut tertimpa.
        ...(input.slug !== undefined ? { slug: input.slug } : {}),
        ...(input.title !== undefined ? { title: input.title } : {}),
        ...(input.excerpt !== undefined ? { excerpt: input.excerpt } : {}),
        ...(input.content !== undefined ? { content: input.content } : {}),
        ...(input.imageUrl !== undefined ? { imageUrl: input.imageUrl } : {}),
        ...(input.status !== undefined ? { status: input.status } : {}),
        ...(input.publishedAt !== undefined
          ? { publishedAt: input.publishedAt }
          : {}),
        ...(categoryId ? { categoryId } : {}),
        ...(authorId ? { authorId } : {}),
      },
      select: adminDetailSelect,
    });
  },

  async remove(id: string): Promise<boolean> {
    try {
      await getPrisma().article.delete({ where: { id } });
      return true;
    } catch {
      // Prisma melempar error kalau barisnya tidak ada.
      // Buat pemanggil, "tidak ada" cukup dijawab false.
      return false;
    }
  },

  async publish(id: string): Promise<ArticleAdminDetail> {
    const sekarang = await getPrisma().article.findUnique({
      where: { id },
      select: { publishedAt: true },
    });

    if (!sekarang) {
      throw new Error(`Artikel dengan id "${id}" tidak ditemukan.`);
    }

    return getPrisma().article.update({
      where: { id },
      data: {
        status: "PUBLISHED",
        // Tanggal terbit asli dipertahankan kalau sudah pernah ada.
        publishedAt: sekarang.publishedAt ?? new Date(),
      },
      select: adminDetailSelect,
    });
  },

  async unpublish(id: string): Promise<ArticleAdminDetail> {
    return getPrisma().article.update({
      where: { id },
      // publishedAt sengaja TIDAK dihapus, supaya kalau diterbitkan lagi
      // urutannya di halaman depan tidak berubah.
      data: { status: "DRAFT" },
      select: adminDetailSelect,
    });
  },

  async countByStatus(): Promise<Record<ArticleStatus, number>> {
    const hasil = await getPrisma().article.groupBy({
      by: ["status"],
      _count: { _all: true },
    });

    // groupBy hanya mengembalikan status yang ADA isinya.
    // Nol-kan dulu semuanya supaya dasbor tidak menampilkan "undefined".
    const jumlah: Record<ArticleStatus, number> = {
      DRAFT: 0,
      PUBLISHED: 0,
      ARCHIVED: 0,
    };

    for (const baris of hasil) {
      jumlah[baris.status as ArticleStatus] = baris._count._all;
    }

    return jumlah;
  },
};
