import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import {
  seedArticles,
  seedAuthors,
  seedCategories,
  slugify,
} from "../src/server/data/seed-source";
import { loadEnvFiles } from "./load-env";

// Script ini dijalankan lewat tsx, bukan lewat Next.js, jadi file .env-nya
// harus dibaca sendiri. Wajib dipanggil sebelum process.env dipakai.
loadEnvFiles();

/**
 * Mengisi database dengan data awal.
 *
 * Jalankan: npm run db:seed
 *
 * Script ini AMAN dijalankan berkali-kali (idempoten). Dia pakai `upsert`,
 * artinya: kalau datanya belum ada, dibuat; kalau sudah ada, diperbarui.
 * Jadi tidak akan bikin artikel dobel.
 *
 * Pemilik: Orang 1 (Database)
 */

async function main() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      "DATABASE_URL belum di-set. Salin .env.example jadi .env, lalu isi connection string dari Neon.",
    );
  }

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });

  try {
    console.log("Mulai seed...\n");

    // --- 1. Kategori -------------------------------------------------------
    // Dibuat duluan karena artikel butuh categoryId.
    for (const kategori of seedCategories) {
      await prisma.category.upsert({
        where: { slug: kategori.slug },
        create: kategori,
        update: { name: kategori.name, order: kategori.order },
      });
    }
    console.log(`  Kategori : ${seedCategories.length}`);

    // --- 2. Penulis --------------------------------------------------------
    for (const penulis of seedAuthors) {
      await prisma.author.upsert({
        where: { slug: penulis.slug },
        create: penulis,
        update: { name: penulis.name },
      });
    }
    console.log(`  Penulis  : ${seedAuthors.length}`);

    // --- 3. Artikel --------------------------------------------------------
    // Ambil id kategori & penulis sekali, biar tidak query berulang di dalam loop.
    const kategoriById = new Map(
      (await prisma.category.findMany({ select: { id: true, slug: true } })).map(
        (k) => [k.slug, k.id],
      ),
    );
    const penulisById = new Map(
      (await prisma.author.findMany({ select: { id: true, slug: true } })).map(
        (p) => [p.slug, p.id],
      ),
    );

    let dibuat = 0;
    for (const artikel of seedArticles) {
      const categoryId = kategoriById.get(slugify(artikel.categoryName));
      const authorId = penulisById.get(slugify(artikel.authorName));

      if (!categoryId || !authorId) {
        console.warn(
          `  ! Artikel "${artikel.slug}" dilewati: kategori atau penulisnya tidak ketemu.`,
        );
        continue;
      }

      const isi = {
        title: artikel.title,
        excerpt: artikel.excerpt,
        content: artikel.content,
        imageUrl: artikel.imageUrl,
        status: "PUBLISHED" as const,
        publishedAt: artikel.publishedAt,
        viewCount: artikel.viewCount,
        categoryId,
        authorId,
      };

      await prisma.article.upsert({
        where: { slug: artikel.slug },
        create: { slug: artikel.slug, ...isi },
        update: isi,
      });
      dibuat++;
    }
    console.log(`  Artikel  : ${dibuat}`);

    // --- 4. Akun Administrator --------------------------------------------
    const adminEmail = "admin@newstimes.id";
    const adminHash =
      "scrypt:541d99c7ca06bc0f7f6eaa46efdd58cf:b940cdab4c44dd085f6e1496ac651dcadf5604bcb662d79e18f4ecdbddf3b02f61fbe8abc08dc924603d17b5da0e34da434fdb01cd4ea9da280a5f1b215f4543";

    await prisma.user.upsert({
      where: { email: adminEmail },
      create: {
        email: adminEmail,
        name: "Administrator",
        passwordHash: adminHash,
        role: "ADMIN",
      },
      update: {
        name: "Administrator",
        passwordHash: adminHash,
        role: "ADMIN",
      },
    });
    console.log(`  Admin    : 1 (${adminEmail})`);

    console.log("\nSeed selesai.");
  } finally {
    // Selalu tutup koneksi, walaupun di tengah jalan ada error.
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error("\nSeed GAGAL:");
  console.error(error);
  // Kode keluar bukan 0, supaya CI ikut merah kalau seed-nya gagal.
  process.exit(1);
});
