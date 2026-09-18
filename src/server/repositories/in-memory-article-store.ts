import type { ArticleAdminDetail, ArticleStatus } from "@/server/domain/article";
import {
  seedArticles,
  seedAuthors,
  seedCategories,
  slugify,
} from "@/server/data/seed-source";

/**
 * "Tabel Article" palsu untuk mode DATA_SOURCE=memory.
 *
 * Dipakai BERSAMA oleh repository admin dan repository publik, persis seperti
 * keduanya berbagi satu tabel di database. Dulu masing-masing punya array
 * sendiri, akibatnya artikel yang diterbitkan dari /admin tidak pernah muncul
 * di halaman depan maupun "Lihat Semua".
 *
 * Disimpan di globalThis, bukan cukup di variabel modul, karena Next.js dalam
 * mode dev bisa memuat ulang modul (hot reload) atau memuatnya lebih dari
 * sekali. Tanpa ini, isinya bisa diam-diam kembali ke 5 artikel contoh.
 *
 * Batasannya tetap: isinya hilang saat server dimatikan.
 *
 * Pemilik: Orang 1 (Database)
 */

export type Baris = ArticleAdminDetail;

interface Gudang {
  baris: Baris[];
  urutan: number;
}

const kategoriBySlug = new Map(seedCategories.map((c) => [c.slug, c]));
const penulisBySlug = new Map(seedAuthors.map((a) => [a.slug, a]));

function isiAwal(): Gudang {
  const gudang: Gudang = { baris: [], urutan: 0 };

  gudang.baris = seedArticles.map((a) => {
    const categorySlug = slugify(a.categoryName);
    return {
      id: `mem-art-${++gudang.urutan}`,
      slug: a.slug,
      title: a.title,
      excerpt: a.excerpt,
      content: a.content,
      imageUrl: a.imageUrl,
      status: "PUBLISHED" as ArticleStatus,
      publishedAt: a.publishedAt,
      createdAt: a.publishedAt,
      updatedAt: a.publishedAt,
      viewCount: a.viewCount,
      category: {
        slug: categorySlug,
        name: kategoriBySlug.get(categorySlug)?.name ?? a.categoryName,
      },
      author: { slug: slugify(a.authorName), name: a.authorName },
    };
  });

  return gudang;
}

const g = globalThis as typeof globalThis & { __newsTimesArtikel?: Gudang };
const gudang = (g.__newsTimesArtikel ??= isiAwal());

/** Semua baris, termasuk draft. Diubah langsung oleh repository admin. */
export const semuaBaris: Baris[] = gudang.baris;

export function idBaru(): string {
  return `mem-art-${++gudang.urutan}`;
}

export function cariKategori(slug: string) {
  const k = kategoriBySlug.get(slug);
  if (!k) throw new Error(`Kategori "${slug}" tidak ditemukan.`);
  return { slug: k.slug, name: k.name };
}

/** Nama penulis dari data contoh; slug dipakai apa adanya kalau tidak dikenal. */
export function cariPenulis(slug: string) {
  return { slug, name: penulisBySlug.get(slug)?.name ?? slug };
}

/**
 * Aturan tampil publik, sama dengan syaratTerbit() di versi Prisma:
 * sudah PUBLISHED dan tanggal terbitnya tidak di masa depan.
 */
export function terlihatPublik(b: Baris, sekarang = new Date()): boolean {
  return (
    b.status === "PUBLISHED" &&
    b.publishedAt !== null &&
    b.publishedAt.getTime() <= sekarang.getTime()
  );
}
