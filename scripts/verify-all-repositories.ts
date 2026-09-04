/**
 * Menguji repository user, newsletter, dan admin-artikel.
 *
 * Rangkaian uji yang SAMA dijalankan dua kali: sekali pada implementasi palsu,
 * sekali pada Prisma. Kalau keduanya lulus, berarti perilakunya konsisten dan
 * Orang 3 & 4 bisa ngoding pakai data contoh tanpa takut hasilnya beda waktu
 * pindah ke database.
 *
 * Uji Prisma menulis ke database sungguhan, lalu MEMBERSIHKAN sendiri barisnya
 * di akhir. Semua data uji diawali "uji-" supaya gampang dikenali.
 *
 * Jalankan: npm run verify:all
 */
// Wajib paling atas: memuat .env sebelum modul lain dimuat.
// Lihat penjelasannya di prisma/load-env-auto.ts
import "../prisma/load-env-auto";

import type { ArticleAdminRepository } from "@/server/repositories/article-admin-repository";
import type { NewsletterRepository } from "@/server/repositories/newsletter-repository";
import type { UserRepository } from "@/server/repositories/user-repository";

import { inMemoryArticleAdminRepository } from "@/server/repositories/in-memory-article-admin-repository";
import { inMemoryNewsletterRepository } from "@/server/repositories/in-memory-newsletter-repository";
import { inMemoryUserRepository } from "@/server/repositories/in-memory-user-repository";

import { prismaArticleAdminRepository } from "@/server/repositories/prisma-article-admin-repository";
import { prismaNewsletterRepository } from "@/server/repositories/prisma-newsletter-repository";
import { prismaUserRepository } from "@/server/repositories/prisma-user-repository";

let lulus = 0;
let gagal = 0;

function cek(nama: string, syarat: boolean, detail = "") {
  if (syarat) {
    lulus++;
    console.log(`    PASS  ${nama}`);
  } else {
    gagal++;
    console.log(`    FAIL  ${nama} ${detail}`);
  }
}

const UJI_EMAIL = "uji-orang1@contoh.test";
const UJI_EMAIL_NEWS = "uji-newsletter@contoh.test";
const UJI_SLUG = "uji-artikel-orang1";

interface Trio {
  userRepo: UserRepository;
  newsletterRepo: NewsletterRepository;
  adminRepo: ArticleAdminRepository;
}

async function ujiUser({ userRepo }: Trio) {
  console.log("\n  -- UserRepository --");

  const awal = await userRepo.count();

  const dibuat = await userRepo.create({
    email: "  UJI-Orang1@Contoh.TEST  ",
    name: "Akun Uji",
    passwordHash: "hash-palsu-bukan-password-asli",
  });

  cek("email dinormalkan jadi huruf kecil", dibuat.email === UJI_EMAIL, `dapat "${dibuat.email}"`);
  cek("role default EDITOR", dibuat.role === "EDITOR", `dapat ${dibuat.role}`);
  cek("count bertambah 1", (await userRepo.count()) === awal + 1);

  const hasil = await userRepo.create({
    email: "uji-kedua@contoh.test",
    name: "Akun Kedua",
    passwordHash: "hash-lain",
    role: "ADMIN",
  }).then(() => "sukses").catch(() => "error");
  cek("bisa buat akun kedua", hasil === "sukses");

  const dobel = await userRepo
    .create({ email: UJI_EMAIL, name: "Dobel", passwordHash: "x" })
    .then(() => "tidak-error")
    .catch(() => "error");
  cek("email dobel ditolak", dobel === "error");

  const rahasia = await userRepo.findByEmailWithSecret("UJI-ORANG1@CONTOH.TEST");
  cek("cari email tidak peduli huruf besar", rahasia !== null);
  cek("passwordHash ikut terbawa (untuk login)", rahasia?.passwordHash === "hash-palsu-bukan-password-asli");

  const aman = await userRepo.findById(dibuat.id);
  cek("findById ketemu", aman !== null);
  cek("findById TIDAK bawa passwordHash", aman !== null && !("passwordHash" in aman));

  cek("email tidak ada -> null", (await userRepo.findByEmailWithSecret("hantu@contoh.test")) === null);

  await userRepo.updatePasswordHash(dibuat.id, "hash-baru");
  const setelah = await userRepo.findByEmailWithSecret(UJI_EMAIL);
  cek("password hash bisa diganti", setelah?.passwordHash === "hash-baru");

  cek("list mengembalikan akun", (await userRepo.list()).length >= 2);
  cek("list TIDAK bawa passwordHash", (await userRepo.list()).every((u) => !("passwordHash" in u)));
}

async function ujiNewsletter({ newsletterRepo }: Trio) {
  console.log("\n  -- NewsletterRepository --");

  cek("daftar pertama -> baru", (await newsletterRepo.subscribe(UJI_EMAIL_NEWS)) === "baru");
  cek("daftar lagi -> sudah-terdaftar", (await newsletterRepo.subscribe(UJI_EMAIL_NEWS)) === "sudah-terdaftar");
  cek("huruf besar dianggap sama", (await newsletterRepo.subscribe(UJI_EMAIL_NEWS.toUpperCase())) === "sudah-terdaftar");
  cek("spasi di ujung dianggap sama", (await newsletterRepo.subscribe(`  ${UJI_EMAIL_NEWS}  `)) === "sudah-terdaftar");

  const aktifSebelum = await newsletterRepo.countActive();
  cek("berhenti langganan berhasil", (await newsletterRepo.unsubscribe(UJI_EMAIL_NEWS)) === true);
  cek("jumlah aktif berkurang", (await newsletterRepo.countActive()) === aktifSebelum - 1);

  const rec = await newsletterRepo.findByEmail(UJI_EMAIL_NEWS);
  cek("baris TIDAK dihapus, hanya ditandai", rec !== null && rec.unsubscribedAt !== null);

  cek("daftar lagi -> diaktifkan-lagi", (await newsletterRepo.subscribe(UJI_EMAIL_NEWS)) === "diaktifkan-lagi");
  cek("unsubscribedAt kembali null", (await newsletterRepo.findByEmail(UJI_EMAIL_NEWS))?.unsubscribedAt === null);

  cek("berhenti untuk email asing -> false", (await newsletterRepo.unsubscribe("hantu@contoh.test")) === false);
  cek("email asing -> null", (await newsletterRepo.findByEmail("hantu@contoh.test")) === null);
}

async function ujiAdmin({ adminRepo }: Trio) {
  console.log("\n  -- ArticleAdminRepository --");

  const sebelum = await adminRepo.countByStatus();
  cek("countByStatus punya 3 kunci", Object.keys(sebelum).length === 3);
  cek("artikel terbit terhitung", sebelum.PUBLISHED >= 5, `dapat ${sebelum.PUBLISHED}`);

  const baru = await adminRepo.create({
    slug: UJI_SLUG,
    title: "Artikel Uji dari Orang 1",
    excerpt: "Ringkasan uji.",
    content: "Isi uji.",
    categorySlug: "teknologi",
    authorSlug: "bayu-saputra",
  });

  cek("artikel baru default DRAFT", baru.status === "DRAFT", `dapat ${baru.status}`);
  cek("draft belum punya tanggal terbit", baru.publishedAt === null);
  cek("kategori terpasang benar", baru.category.slug === "teknologi");

  cek("slug terpakai terdeteksi", (await adminRepo.slugDipakai(UJI_SLUG)) === true);
  cek("slug sendiri tidak dianggap bentrok", (await adminRepo.slugDipakai(UJI_SLUG, baru.id)) === false);
  cek("slug bebas -> false", (await adminRepo.slugDipakai("slug-yang-bebas-xyz")) === false);

  const draftSaja = await adminRepo.list({ status: "DRAFT", perPage: 50 });
  cek("filter status DRAFT jalan", draftSaja.items.every((a) => a.status === "DRAFT"));
  cek("artikel baru muncul di daftar draft", draftSaja.items.some((a) => a.id === baru.id));

  const cari = await adminRepo.list({ query: "Artikel Uji", perPage: 50 });
  cek("pencarian judul jalan", cari.items.some((a) => a.id === baru.id));

  const semua = await adminRepo.list({ perPage: 50 });
  cek("tanpa filter menampilkan draft DAN terbit", semua.total > draftSaja.total);

  const diubah = await adminRepo.update(baru.id, { title: "Judul Sudah Diubah" });
  cek("judul berubah", diubah.title === "Judul Sudah Diubah");
  cek("field lain tidak ikut hilang", diubah.excerpt === "Ringkasan uji." && diubah.content === "Isi uji.");
  cek("status tidak ikut berubah", diubah.status === "DRAFT");

  const terbit = await adminRepo.publish(baru.id);
  cek("status jadi PUBLISHED", terbit.status === "PUBLISHED");
  cek("tanggal terbit terisi otomatis", terbit.publishedAt !== null);
  const tanggalAsli = terbit.publishedAt!.getTime();

  const draftLagi = await adminRepo.unpublish(baru.id);
  cek("kembali jadi DRAFT", draftLagi.status === "DRAFT");
  cek("tanggal terbit TIDAK dihapus", draftLagi.publishedAt !== null);

  const terbitLagi = await adminRepo.publish(baru.id);
  cek("terbit ulang mempertahankan tanggal asli", terbitLagi.publishedAt?.getTime() === tanggalAsli);

  cek("hapus berhasil", (await adminRepo.remove(baru.id)) === true);
  cek("artikel benar-benar hilang", (await adminRepo.findById(baru.id)) === null);
  cek("hapus id tidak ada -> false", (await adminRepo.remove("id-hantu-xyz")) === false);
}

async function jalankan(nama: string, trio: Trio) {
  console.log(`\n${"=".repeat(46)}`);
  console.log(`  ${nama}`);
  console.log("=".repeat(46));

  await ujiUser(trio);
  await ujiNewsletter(trio);
  await ujiAdmin(trio);
}

async function bersihkanPrisma() {
  // Membersihkan baris uji dari database sungguhan.
  const { getPrisma } = await import("@/server/db/client");
  const prisma = getPrisma();

  await prisma.newsletterSubscriber.deleteMany({
    where: { email: { in: [UJI_EMAIL_NEWS] } },
  });
  await prisma.user.deleteMany({
    where: { email: { in: [UJI_EMAIL, "uji-kedua@contoh.test"] } },
  });
  await prisma.article.deleteMany({ where: { slug: UJI_SLUG } });

  console.log("\n  Data uji sudah dibersihkan dari database.");
}

async function main() {
  await jalankan("IN-MEMORY (data contoh)", {
    userRepo: inMemoryUserRepository,
    newsletterRepo: inMemoryNewsletterRepository,
    adminRepo: inMemoryArticleAdminRepository,
  });

  if (!process.env.DATABASE_URL) {
    console.log("\n  DATABASE_URL kosong - uji Prisma DILEWATI.\n");
  } else {
    try {
      await jalankan("PRISMA (database Neon)", {
        userRepo: prismaUserRepository,
        newsletterRepo: prismaNewsletterRepository,
        adminRepo: prismaArticleAdminRepository,
      });
    } finally {
      await bersihkanPrisma();
    }
  }

  console.log(`\n${"=".repeat(46)}`);
  console.log(`  LULUS : ${lulus}`);
  console.log(`  GAGAL : ${gagal}`);
  console.log("=".repeat(46) + "\n");

  process.exit(gagal > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
