import type { ArticleRepository } from "./article-repository";
import type { ArticleAdminRepository } from "./article-admin-repository";
import type { NewsletterRepository } from "./newsletter-repository";
import type { UserRepository } from "./user-repository";

import { prismaArticleRepository } from "./prisma-article-repository";
import { prismaArticleAdminRepository } from "./prisma-article-admin-repository";
import { prismaNewsletterRepository } from "./prisma-newsletter-repository";
import { prismaUserRepository } from "./prisma-user-repository";

export type { ArticleRepository } from "./article-repository";
export type {
  ArticleAdminRepository,
  AdminListParams,
  CreateArticleInput,
  UpdateArticleInput,
} from "./article-admin-repository";
export type { NewsletterRepository } from "./newsletter-repository";
export type { UserRepository } from "./user-repository";

/**
 * ============================================================================
 * SUMBER DATA: DATABASE NEON (PRISMA POSTGRESQL)
 * ============================================================================
 *
 * Seluruh akses data aplikasi menggunakan database PostgreSQL di Neon via Prisma.
 */

/**
 * Artikel untuk HALAMAN PUBLIK. Hanya mengembalikan artikel yang sudah terbit.
 */
export const articleRepo: ArticleRepository = prismaArticleRepository;

/**
 * Artikel untuk HALAMAN ADMIN. Termasuk draft, dan operasi tulis/mutasi.
 */
export const articleAdminRepo: ArticleAdminRepository = prismaArticleAdminRepository;

/**
 * Akun admin. Untuk proses autentikasi dan otorisasi.
 */
export const userRepo: UserRepository = prismaUserRepository;

/**
 * Pendaftar newsletter.
 */
export const newsletterRepo: NewsletterRepository = prismaNewsletterRepository;

export type SumberData = "memory" | "prisma";

/** Sumber data aktif: selalu prisma (PostgreSQL Neon). */
export const sumberDataAktif: SumberData = "prisma";
