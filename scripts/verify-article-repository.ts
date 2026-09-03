/**
 * Smoke test repository in-memory.
 * Jalankan dari root repo: npx tsx <path file ini>
 */
import { inMemoryArticleRepository as repo } from "@/server/repositories/in-memory-article-repository";
import { parseTanggalIndonesia, slugify } from "@/server/data/seed-source";

let lulus = 0;
let gagal = 0;

function cek(nama: string, syarat: boolean, detail = "") {
  if (syarat) {
    lulus++;
    console.log(`  PASS  ${nama}`);
  } else {
    gagal++;
    console.log(`  FAIL  ${nama} ${detail}`);
  }
}

async function main() {
  console.log("\n--- parseTanggalIndonesia ---");
  const d = parseTanggalIndonesia("28 Juni 2025");
  cek("'28 Juni 2025' terbaca", d !== null);
  cek("bulannya Juni (index 5)", d?.getUTCMonth() === 5, `dapat ${d?.getUTCMonth()}`);
  cek("tanggalnya 28", d?.getUTCDate() === 28, `dapat ${d?.getUTCDate()}`);
  cek("tahunnya 2025", d?.getUTCFullYear() === 2025);
  cek("tanggal ngawur ditolak", parseTanggalIndonesia("31 Februari 2025") === null);
  cek("bulan asing ditolak", parseTanggalIndonesia("12 Smarch 2025") === null);
  cek("teks acak ditolak", parseTanggalIndonesia("kemarin sore") === null);

  console.log("\n--- slugify ---");
  cek("'Rizky Pratama' -> 'rizky-pratama'", slugify("Rizky Pratama") === "rizky-pratama");
  cek("huruf beraksen dinormalkan", slugify("Café Latté") === "cafe-latte", `dapat "${slugify("Café Latté")}"`);
  cek("tanda baca dibuang", slugify("Ekonomi & Bisnis!") === "ekonomi-bisnis", `dapat "${slugify("Ekonomi & Bisnis!")}"`);

  console.log("\n--- listPublished ---");
  const hal1 = await repo.listPublished({ page: 1, perPage: 2 });
  cek("perPage dipatuhi", hal1.items.length === 2, `dapat ${hal1.items.length}`);
  cek("total = 5 artikel", hal1.total === 5, `dapat ${hal1.total}`);
  cek("hasMore true di halaman 1", hal1.hasMore === true);

  const hal3 = await repo.listPublished({ page: 3, perPage: 2 });
  cek("halaman terakhir sisa 1", hal3.items.length === 1, `dapat ${hal3.items.length}`);
  cek("hasMore false di halaman terakhir", hal3.hasMore === false);

  const semua = await repo.listPublished({ perPage: 50 });
  const tanggal = semua.items.map((a) => a.publishedAt!.getTime());
  const urutBenar = tanggal.every((t, i) => i === 0 || tanggal[i - 1]! >= t);
  cek("urut dari terbaru ke terlama", urutBenar, JSON.stringify(semua.items.map((a) => a.publishedAt?.toISOString().slice(0, 10))));

  console.log("\n--- ArticleSummary tidak bawa content ---");
  cek("field 'content' tidak ada di summary", !("content" in semua.items[0]!));

  console.log("\n--- normalisasi input jahat ---");
  const jahat = await repo.listPublished({ page: -5, perPage: 99999 });
  cek("page negatif dipaksa jadi 1", jahat.page === 1, `dapat ${jahat.page}`);
  cek("perPage dibatasi maks 50", jahat.perPage === 50, `dapat ${jahat.perPage}`);

  console.log("\n--- findBySlug ---");
  const satu = await repo.findBySlug("perkembangan-terbaru-ai");
  cek("artikel ketemu", satu !== null);
  cek("detail punya content", typeof satu?.content === "string" && satu.content.length > 0);
  cek("slug tidak ada -> null", (await repo.findBySlug("tidak-ada-ini")) === null);

  console.log("\n--- listByCategory ---");
  const ekonomi = await repo.listByCategory("ekonomi");
  cek("kategori ekonomi ada 2 artikel", ekonomi.total === 2, `dapat ${ekonomi.total}`);
  cek("semua hasilnya benar kategorinya", ekonomi.items.every((a) => a.category.slug === "ekonomi"));
  cek("kategori kosong -> 0", (await repo.listByCategory("olahraga")).total === 0);

  console.log("\n--- search ---");
  const cari = await repo.search("ekonomi");
  cek("kata 'ekonomi' dapat hasil", cari.total > 0, `dapat ${cari.total}`);
  cek("pencarian tidak peduli huruf besar", (await repo.search("EKONOMI")).total === cari.total);
  cek("kata kosong -> 0 hasil", (await repo.search("   ")).total === 0);
  cek("kata ngawur -> 0 hasil", (await repo.search("zxqwv")).total === 0);

  console.log("\n--- listCategories ---");
  const kategori = await repo.listCategories();
  cek("ada 6 kategori (termasuk yang kosong)", kategori.length === 6, `dapat ${kategori.length}`);
  cek("urutan sesuai navbar", kategori[0]!.name === "Nasional" && kategori[1]!.name === "Internasional");
  cek("jumlah artikel per kategori dihitung", kategori.find((k) => k.slug === "ekonomi")?.articleCount === 2);

  console.log("\n--- listPopular & incrementViewCount ---");
  const populer = await repo.listPopular(3);
  cek("populer dibatasi 3", populer.length === 3);
  const turun = populer.every((a, i) => i === 0 || populer[i - 1]!.viewCount >= a.viewCount);
  cek("urut dari paling banyak dibaca", turun);

  const target = populer[0]!.slug;
  const sebelum = populer[0]!.viewCount;
  await repo.incrementViewCount(target);
  const sesudah = (await repo.findBySlug(target))!.viewCount;
  cek("view count naik 1", sesudah === sebelum + 1, `${sebelum} -> ${sesudah}`);
  cek("slug tidak ada tidak bikin error", await repo.incrementViewCount("hantu").then(() => true));

  console.log("\n--- listFeatured ---");
  cek("featured dibatasi 3", (await repo.listFeatured(3)).length === 3);

  console.log(`\n=================================`);
  console.log(`  LULUS : ${lulus}`);
  console.log(`  GAGAL : ${gagal}`);
  console.log(`=================================\n`);

  process.exit(gagal > 0 ? 1 : 0);
}

main();
