/**
 * ============================================================================
 * RUANG PERCOBAAN — panggil fungsi database sendiri, tanpa perlu tampilan
 * ============================================================================
 *
 * Cara pakai:
 *
 *   npm run coba              <- lihat daftar percobaan
 *   npm run coba lihat        <- lihat daftar artikel
 *   npm run coba tambah       <- tambah artikel baru (jadi draft)
 *   npm run coba terbit       <- terbitkan artikel percobaan tadi
 *   npm run coba hapus        <- hapus artikel percobaan
 *   npm run coba cari ekonomi <- cari artikel
 *
 * Script ini memakai pintu yang SAMA PERSIS dengan yang nanti dipakai
 * halaman admin. Bedanya cuma: di sini dipanggil dari terminal, bukan dari
 * tombol yang diklik.
 *
 * Sumber datanya mengikuti DATA_SOURCE di .env.local:
 *   DATA_SOURCE=memory  -> data contoh, tidak menyentuh database
 *   DATA_SOURCE=prisma  -> database Neon sungguhan
 *
 * Coba jalankan dengan dua-duanya. Hasilnya harus sama.
 */
// Wajib paling atas: memuat .env sebelum modul lain dimuat.
// Lihat penjelasannya di prisma/load-env-auto.ts
import "../prisma/load-env-auto";

import {
  articleRepo,
  articleAdminRepo,
  sumberDataAktif,
} from "@/server/repositories";

const SLUG_COBA = "artikel-percobaan-kevin";

function garis(judul: string) {
  console.log("\n" + "=".repeat(60));
  console.log("  " + judul);
  console.log("=".repeat(60));
}

function tanggal(d: Date | null): string {
  return d ? d.toISOString().slice(0, 16).replace("T", " ") : "(belum terbit)";
}

// ---------------------------------------------------------------------------

async function lihat() {
  garis("DAFTAR ARTIKEL — versi halaman pengunjung");
  console.log("  (cuma yang sudah terbit)\n");

  const { items, total, hasMore } = await articleRepo.listPublished({
    perPage: 10,
  });

  items.forEach((a, i) => {
    console.log(`  ${String(i + 1).padStart(2)}. ${a.title}`);
    console.log(`      ${tanggal(a.publishedAt)}  |  ${a.category.name}  |  ${a.author.name}`);
  });

  console.log(`\n  Total ${total} artikel. Masih ada halaman lagi? ${hasMore ? "ya" : "tidak"}`);

  garis("DAFTAR ARTIKEL — versi halaman admin");
  console.log("  (semua, termasuk draft)\n");

  const admin = await articleAdminRepo.list({ perPage: 20 });
  admin.items.forEach((a, i) => {
    const label = a.status === "PUBLISHED" ? "TERBIT" : a.status === "DRAFT" ? "DRAFT " : "ARSIP ";
    console.log(`  ${String(i + 1).padStart(2)}. [${label}] ${a.title}`);
  });

  const jumlah = await articleAdminRepo.countByStatus();
  console.log(`\n  Draft: ${jumlah.DRAFT}   Terbit: ${jumlah.PUBLISHED}   Arsip: ${jumlah.ARCHIVED}`);
  console.log("\n  PERHATIKAN: kalau ada artikel DRAFT, dia TIDAK muncul di daftar");
  console.log("  pengunjung di atas. Itu penyaringan draft bekerja.");
}

async function detail() {
  garis("ISI SATU ARTIKEL");

  const a = await articleRepo.findBySlug("perkembangan-terbaru-ai");
  if (!a) {
    console.log("  Artikelnya tidak ketemu.");
    return;
  }

  console.log(`  Judul    : ${a.title}`);
  console.log(`  Kategori : ${a.category.name}`);
  console.log(`  Penulis  : ${a.author.name}`);
  console.log(`  Terbit   : ${tanggal(a.publishedAt)}`);
  console.log(`  Dibaca   : ${a.viewCount} kali`);
  console.log(`\n  Isi:\n  ${a.content.slice(0, 200)}...`);

  garis("COBA CARI ARTIKEL YANG TIDAK ADA");
  const hantu = await articleRepo.findBySlug("artikel-yang-tidak-pernah-ada");
  console.log(`  Hasilnya: ${hantu}`);
  console.log("\n  Dapat 'null', bukan error. Itu memang sengaja — nanti halaman");
  console.log("  tinggal menampilkan 'artikel tidak ditemukan'.");
}

async function tambah() {
  garis("TAMBAH ARTIKEL BARU");

  if (await articleAdminRepo.slugDipakai(SLUG_COBA)) {
    console.log("  Artikel percobaan sudah ada. Hapus dulu: npm run coba hapus");
    return;
  }

  const baru = await articleAdminRepo.create({
    slug: SLUG_COBA,
    title: "Artikel Percobaan Kevin",
    excerpt: "Ini artikel percobaan, dibuat dari terminal.",
    content: "Isi artikel percobaan. Nanti dihapus lagi.",
    categorySlug: "teknologi",
    authorSlug: "bayu-saputra",
  });

  console.log("  Berhasil dibuat!\n");
  console.log(`  id       : ${baru.id}`);
  console.log(`  judul    : ${baru.title}`);
  console.log(`  status   : ${baru.status}`);
  console.log(`  terbit   : ${tanggal(baru.publishedAt)}`);

  console.log("\n  PERHATIKAN DUA HAL:");
  console.log("  1. Statusnya DRAFT, padahal tidak kita minta. Itu memang");
  console.log("     bawaannya — artikel baru tidak langsung tayang.");
  console.log("  2. Tanggal terbitnya masih kosong. Wajar, namanya juga draft.");

  console.log("\n  Sekarang coba: npm run coba lihat");
  console.log("  Artikel ini muncul di daftar admin, TAPI TIDAK di daftar pengunjung.");
}

async function terbit() {
  garis("TERBITKAN ARTIKEL PERCOBAAN");

  const daftar = await articleAdminRepo.list({ query: "Percobaan", perPage: 10 });
  const target = daftar.items.find((a) => a.slug === SLUG_COBA);

  if (!target) {
    console.log("  Belum ada artikel percobaan. Buat dulu: npm run coba tambah");
    return;
  }

  const hasil = await articleAdminRepo.publish(target.id);
  console.log(`  Status sekarang : ${hasil.status}`);
  console.log(`  Tanggal terbit  : ${tanggal(hasil.publishedAt)}`);

  console.log("\n  Tanggal terbitnya terisi OTOMATIS waktu diterbitkan.");
  console.log("\n  Sekarang coba: npm run coba lihat");
  console.log("  Artikelnya sudah muncul di daftar pengunjung.");
  console.log("\n  Atau buka websitenya: npm run dev");
}

async function hapus() {
  garis("HAPUS ARTIKEL PERCOBAAN");

  const daftar = await articleAdminRepo.list({ query: "Percobaan", perPage: 10 });
  const target = daftar.items.find((a) => a.slug === SLUG_COBA);

  if (!target) {
    console.log("  Tidak ada artikel percobaan yang perlu dihapus.");
  } else {
    const berhasil = await articleAdminRepo.remove(target.id);
    console.log(`  remove() menjawab : ${berhasil}`);
    console.log(`  Dicari lagi       : ${await articleAdminRepo.findById(target.id)}`);
    console.log("\n  Dapat 'null', artinya benar-benar hilang.");
  }

  garis("COBA HAPUS SESUATU YANG TIDAK ADA");
  console.log(`  remove("id-ngawur") menjawab : ${await articleAdminRepo.remove("id-ngawur")}`);
  console.log("\n  Dapat 'false', bukan error. Ini sengaja — buat yang memanggil,");
  console.log("  'artikelnya nggak ada' cukup dijawab false.");
}

async function cari(kata: string) {
  garis(`CARI ARTIKEL: "${kata}"`);

  const hasil = await articleRepo.search(kata, { perPage: 10 });

  if (hasil.total === 0) {
    console.log("  Tidak ada yang cocok.");
  } else {
    hasil.items.forEach((a, i) => console.log(`  ${i + 1}. ${a.title}`));
  }

  console.log(`\n  Ketemu ${hasil.total} artikel.`);
  console.log("\n  Coba juga dengan HURUF BESAR SEMUA — hasilnya harus sama,");
  console.log("  karena pencariannya tidak peduli besar-kecil huruf.");
}

async function kategori() {
  garis("DAFTAR KATEGORI");

  const list = await articleRepo.listCategories();
  list.forEach((k) => {
    console.log(`  ${k.name.padEnd(16)} ${k.articleCount} artikel`);
  });

  console.log("\n  PERHATIKAN: Internasional dan Olahraga isinya 0 artikel,");
  console.log("  tapi tetap muncul. Itu sengaja, biar menu navbar tidak hilang.");
}

// ---------------------------------------------------------------------------

const daftarPercobaan: Record<string, () => Promise<void>> = {
  lihat,
  detail,
  tambah,
  terbit,
  hapus,
  kategori,
};

async function main() {
  const perintah = process.argv[2];
  const argumen = process.argv[3];

  console.log(`\n  Sumber data yang dipakai sekarang: ${sumberDataAktif.toUpperCase()}`);
  if (sumberDataAktif === "memory") {
    console.log("  (data contoh — perubahan hilang tiap program selesai)");
  } else {
    console.log("  (database Neon sungguhan — perubahan tersimpan permanen)");
  }

  if (!perintah) {
    garis("DAFTAR PERCOBAAN YANG BISA DIJALANKAN");
    console.log("  npm run coba lihat            daftar artikel (pengunjung + admin)");
    console.log("  npm run coba detail           isi lengkap satu artikel");
    console.log("  npm run coba kategori         daftar kategori");
    console.log("  npm run coba cari <kata>      cari artikel");
    console.log("");
    console.log("  npm run coba tambah           bikin artikel baru (jadi draft)");
    console.log("  npm run coba terbit           terbitkan artikel percobaan");
    console.log("  npm run coba hapus            hapus artikel percobaan");
    console.log("");
    console.log("  Urutan yang disarankan untuk pertama kali:");
    console.log("    1. npm run coba lihat");
    console.log("    2. npm run coba tambah");
    console.log("    3. npm run coba lihat      <- draft-nya cuma muncul di admin");
    console.log("    4. npm run coba terbit");
    console.log("    5. npm run coba lihat      <- sekarang muncul di dua-duanya");
    console.log("    6. npm run coba hapus");
    console.log("");
    process.exit(0);
  }

  if (perintah === "cari") {
    await cari(argumen ?? "ekonomi");
  } else if (daftarPercobaan[perintah]) {
    await daftarPercobaan[perintah]!();
  } else {
    console.log(`\n  Percobaan "${perintah}" tidak ada.`);
    console.log("  Jalankan 'npm run coba' tanpa apa-apa untuk lihat daftarnya.\n");
    process.exit(1);
  }

  console.log("");
  process.exit(0);
}

main().catch((e) => {
  console.error("\n  ADA ERROR:\n");
  console.error(e);
  process.exit(1);
});
