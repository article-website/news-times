/**
 * Membandingkan output repository in-memory vs Prisma.
 *
 * Ini pembuktian inti desain: kalau kedua implementasi mengembalikan hasil yang
 * sama persis, berarti halaman tidak perlu diubah sama sekali waktu pindah dari
 * data contoh ke database asli.
 *
 * Jalankan: npx tsx --conditions=react-server scripts/... (lihat npm script)
 */
// Wajib paling atas: memuat .env sebelum modul lain dimuat.
// Lihat penjelasannya di prisma/load-env-auto.ts
import "../prisma/load-env-auto";

import { inMemoryArticleRepository as mem } from "@/server/repositories/in-memory-article-repository";
import { prismaArticleRepository as db } from "@/server/repositories/prisma-article-repository";

let lulus = 0;
let gagal = 0;

function cek(nama: string, a: unknown, b: unknown) {
  const sa = JSON.stringify(a);
  const sb = JSON.stringify(b);
  if (sa === sb) {
    lulus++;
    console.log(`  SAMA   ${nama}`);
  } else {
    gagal++;
    console.log(`  BEDA   ${nama}`);
    console.log(`         memory : ${sa?.slice(0, 220)}`);
    console.log(`         prisma : ${sb?.slice(0, 220)}`);
  }
}

/**
 * Field yang memang WAJAR berbeda antara dua implementasi, jadi tidak
 * dibandingkan. Keduanya perbedaan yang sudah dipahami, bukan bug:
 *
 *   viewCount  - berubah tiap artikel dibaca, jadi angkanya bergerak sendiri.
 *
 *   updatedAt  - database mencatat kapan baris terakhir benar-benar diedit.
 *                Data contoh tidak punya informasi itu sama sekali, jadi dia
 *                memakai tanggal terbit sebagai pengganti. Sampai sekarang
 *                belum ada halaman yang memakai field ini; kalau nanti dipakai
 *                (misal label "diperbarui pada"), ambil datanya dari database,
 *                jangan dari data contoh.
 */
const FIELD_DIKECUALIKAN = new Set(["viewCount", "updatedAt"]);

function rapikan(x: unknown): unknown {
  return JSON.parse(
    JSON.stringify(x, (key, val) =>
      FIELD_DIKECUALIKAN.has(key) ? undefined : val,
    ),
  );
}

async function main() {
  console.log("\n=== Membandingkan in-memory vs Prisma ===\n");

  console.log("-- listPublished --");
  const m1 = await mem.listPublished({ page: 1, perPage: 10 });
  const d1 = await db.listPublished({ page: 1, perPage: 10 });
  cek("total artikel", m1.total, d1.total);
  cek("jumlah item", m1.items.length, d1.items.length);
  cek("hasMore", m1.hasMore, d1.hasMore);
  cek("urutan slug", m1.items.map((a) => a.slug), d1.items.map((a) => a.slug));
  cek("isi item lengkap", rapikan(m1.items), rapikan(d1.items));

  console.log("\n-- paginasi --");
  const m2 = await mem.listPublished({ page: 2, perPage: 2 });
  const d2 = await db.listPublished({ page: 2, perPage: 2 });
  cek("halaman 2 slug", m2.items.map((a) => a.slug), d2.items.map((a) => a.slug));
  cek("halaman 2 hasMore", m2.hasMore, d2.hasMore);

  console.log("\n-- findBySlug --");
  const slug = "perkembangan-terbaru-ai";
  cek(`detail "${slug}"`, rapikan(await mem.findBySlug(slug)), rapikan(await db.findBySlug(slug)));
  cek("slug tidak ada", await mem.findBySlug("hantu-xyz"), await db.findBySlug("hantu-xyz"));

  console.log("\n-- listByCategory --");
  const mc = await mem.listByCategory("ekonomi");
  const dc = await db.listByCategory("ekonomi");
  cek("kategori ekonomi total", mc.total, dc.total);
  cek("kategori ekonomi slug", mc.items.map((a) => a.slug), dc.items.map((a) => a.slug));
  cek("kategori kosong (olahraga)", (await mem.listByCategory("olahraga")).total, (await db.listByCategory("olahraga")).total);

  console.log("\n-- search --");
  cek("cari 'ekonomi'", (await mem.search("ekonomi")).items.map((a) => a.slug), (await db.search("ekonomi")).items.map((a) => a.slug));
  cek("cari huruf besar", (await mem.search("EKONOMI")).total, (await db.search("EKONOMI")).total);
  cek("cari kosong", (await mem.search("  ")).total, (await db.search("  ")).total);
  cek("cari ngawur", (await mem.search("zxqwv")).total, (await db.search("zxqwv")).total);

  console.log("\n-- listCategories --");
  const mk = await mem.listCategories();
  const dk = await db.listCategories();
  cek("jumlah kategori", mk.length, dk.length);
  cek("isi kategori lengkap", mk, dk);

  console.log("\n-- listFeatured --");
  cek("featured 3", (await mem.listFeatured(3)).map((a) => a.slug), (await db.listFeatured(3)).map((a) => a.slug));

  console.log("\n-- listPopular --");
  cek("popular 5", (await mem.listPopular(5)).map((a) => a.slug), (await db.listPopular(5)).map((a) => a.slug));

  console.log("\n========================================");
  console.log(`  SAMA : ${lulus}`);
  console.log(`  BEDA : ${gagal}`);
  console.log("========================================\n");

  process.exit(gagal > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
