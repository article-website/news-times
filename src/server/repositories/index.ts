import type { ArticleRepository } from "./article-repository";
import type { ArticleAdminRepository } from "./article-admin-repository";
import type { NewsletterRepository } from "./newsletter-repository";
import type { UserRepository } from "./user-repository";

import { inMemoryArticleRepository } from "./in-memory-article-repository";
import { inMemoryArticleAdminRepository } from "./in-memory-article-admin-repository";
import { inMemoryNewsletterRepository } from "./in-memory-newsletter-repository";
import { inMemoryUserRepository } from "./in-memory-user-repository";

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
 * SAKELAR SUMBER DATA
 * ============================================================================
 *
 * Ini "satu baris" yang disebut di rencana kerja Sprint 2.
 * Diatur lewat variabel DATA_SOURCE di file .env.local:
 *
 *   DATA_SOURCE=memory   -> pakai data contoh (default, buat Sprint 1)
 *   DATA_SOURCE=prisma   -> pakai database Neon beneran
 *
 * Default sengaja "memory" supaya orang baru yang clone repo ini bisa langsung
 * `npm run dev` dan lihat websitenya jalan, tanpa harus punya database dulu.
 *
 * Pemilik: Orang 1 (Database)
 */
type SumberData = "memory" | "prisma";

function bacaSumberData(): SumberData {
  const nilai = (process.env.DATA_SOURCE ?? "memory").toLowerCase();

  if (nilai === "memory" || nilai === "prisma") {
    return nilai;
  }

  // Salah ketik di .env lebih baik ketahuan langsung daripada diam-diam
  // jalan pakai data contoh di produksi.
  throw new Error(
    `DATA_SOURCE="${nilai}" tidak dikenali. Isi dengan "memory" atau "prisma".`,
  );
}

const sumber = bacaSumberData();

/**
 * Artikel untuk HALAMAN PUBLIK. Hanya mengembalikan artikel yang sudah terbit.
 *
 *   import { articleRepo } from "@/server/repositories";
 *
 *   export default async function HomePage() {
 *     const { items } = await articleRepo.listPublished({ perPage: 10 });
 *     return <ArticleList articles={items} />;
 *   }
 *
 * Dipakai: Orang 2
 */
export const articleRepo: ArticleRepository =
  sumber === "prisma" ? prismaArticleRepository : inMemoryArticleRepository;

/**
 * Artikel untuk HALAMAN ADMIN. Termasuk draft, dan bisa menulis.
 * JANGAN dipakai di halaman publik - draft akan bocor.
 *
 * Dipakai: Orang 3
 */
export const articleAdminRepo: ArticleAdminRepository =
  sumber === "prisma"
    ? prismaArticleAdminRepository
    : inMemoryArticleAdminRepository;

/**
 * Akun admin. Untuk proses login.
 *
 * Dipakai: Orang 3
 */
export const userRepo: UserRepository =
  sumber === "prisma" ? prismaUserRepository : inMemoryUserRepository;

/**
 * Pendaftar newsletter.
 *
 * Dipakai: Orang 4
 */
export const newsletterRepo: NewsletterRepository =
  sumber === "prisma"
    ? prismaNewsletterRepository
    : inMemoryNewsletterRepository;

/** Sumber data yang sedang aktif. Berguna buat ditampilkan di dasbor admin. */
export const sumberDataAktif: SumberData = sumber;
