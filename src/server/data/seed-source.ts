import { articles as legacyArticles } from "@/data/articles";

/**
 * Menjembatani data lama (src/data/articles.ts) ke bentuk data yang baru.
 *
 * Dipakai dua tempat:
 *   1. Versi data contoh (in-memory) selama database belum jadi.
 *   2. Script seed, buat ngisi database asli.
 *
 * CATATAN BUAT TIM: src/data/articles.ts sengaja TIDAK diubah sama sekali,
 * supaya halaman buatan Orang 2 yang masih meng-import file itu tetap jalan.
 * File itu sekarang statusnya "beku": jadi sumber seed, bukan lagi sumber data
 * aplikasi. Jangan ditambah artikel baru di situ.
 *
 * Pemilik: Orang 1 (Database)
 */

export interface SeedArticle {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  imageUrl: string | null;
  publishedAt: Date;
  viewCount: number;
  categoryName: string;
  authorName: string;
}

// ---------------------------------------------------------------------------
// Kategori
// ---------------------------------------------------------------------------

/**
 * Urutan resmi kategori, disamakan dengan menu di Navbar.tsx.
 *
 * Sengaja memuat SEMUA kategori termasuk yang belum punya artikel
 * (Internasional dan Olahraga). Kalau cuma diambil dari artikel yang ada,
 * dua menu itu bakal hilang dari navbar begitu navbar-nya dibikin dinamis.
 */
export const CATEGORY_ORDER = [
  "Nasional",
  "Internasional",
  "Ekonomi",
  "Teknologi",
  "Olahraga",
  "Lifestyle",
] as const;

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

/**
 * Mengubah "Rizky Pratama" jadi "rizky-pratama" biar aman dipakai di URL.
 *
 * normalize("NFD") memecah huruf beraksen jadi huruf dasar + tanda aksen
 * terpisah, lalu tanda aksennya (rentang ̀-ͯ) dibuang. Tanpa langkah
 * itu, "naif" yang ditulis dengan trema jadi "nai-ve", bukan "naive".
 */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const BULAN_INDONESIA = [
  "januari",
  "februari",
  "maret",
  "april",
  "mei",
  "juni",
  "juli",
  "agustus",
  "september",
  "oktober",
  "november",
  "desember",
];

/**
 * Mengubah tanggal berbentuk teks Indonesia ("28 Juni 2025") jadi objek Date.
 *
 * Inilah alasan kolom tanggal harus disimpan sebagai tanggal beneran di database.
 * Selama masih teks, "28 Juni 2025" dan "3 Mei 2025" tidak bisa diurutkan
 * (kalau diurutkan sebagai teks, "28" dianggap lebih kecil dari "3").
 *
 * Memakai Date.UTC supaya hasilnya sama di komputer siapa pun, tidak ikut
 * zona waktu masing-masing. Jam 7 UTC kira-kira awal hari di WIB.
 */
export function parseTanggalIndonesia(teks: string): Date | null {
  const cocok = teks.trim().match(/^(\d{1,2})\s+([\p{L}]+)\s+(\d{4})$/u);
  if (!cocok) return null;

  const tanggal = Number(cocok[1]);
  const bulan = BULAN_INDONESIA.indexOf(cocok[2].toLowerCase());
  const tahun = Number(cocok[3]);

  if (bulan === -1) return null;
  if (tanggal < 1 || tanggal > 31) return null;

  const hasil = new Date(Date.UTC(tahun, bulan, tanggal, 7, 0, 0));

  // Menangkal tanggal yang tidak ada, misal "31 Februari 2025".
  // JavaScript diam-diam menggesernya ke 3 Maret, jadi harus dicek balik.
  if (hasil.getUTCMonth() !== bulan || hasil.getUTCDate() !== tanggal) {
    return null;
  }

  return hasil;
}

/**
 * Jumlah dibaca bohongan yang nilainya selalu sama tiap dijalankan.
 *
 * Sengaja tidak pakai Math.random(): angka acak bikin urutan "artikel populer"
 * berubah-ubah tiap refresh, hasil render server dan browser jadi beda
 * (hydration mismatch), dan test jadi kadang lulus kadang gagal.
 */
function viewCountStabil(slug: string): number {
  let angka = 0;
  for (let i = 0; i < slug.length; i++) {
    angka = (angka * 31 + slug.charCodeAt(i)) % 9973;
  }
  return 120 + angka;
}

// ---------------------------------------------------------------------------
// Hasil konversi
// ---------------------------------------------------------------------------

/**
 * Data artikel lama yang sudah dinormalkan.
 *
 * Artikel dengan tanggal yang tidak bisa dibaca sengaja DIBUANG, bukan diberi
 * tanggal hari ini. Lebih baik ketahuan datanya kurang daripada diam-diam
 * menyimpan tanggal yang salah ke database.
 */
export const seedArticles: SeedArticle[] = legacyArticles.flatMap((lama) => {
  const publishedAt = parseTanggalIndonesia(lama.date);

  if (!publishedAt) {
    console.warn(
      `[seed-source] Tanggal "${lama.date}" pada artikel "${lama.slug}" tidak dikenali, artikel dilewati.`,
    );
    return [];
  }

  return [
    {
      slug: lama.slug,
      title: lama.title,
      excerpt: lama.excerpt,
      content: lama.content,
      imageUrl: lama.image || null,
      publishedAt,
      viewCount: viewCountStabil(lama.slug),
      categoryName: lama.category,
      authorName: lama.author,
    },
  ];
});

/** Daftar penulis unik yang tersusun dari data artikel. */
export const seedAuthors = Array.from(
  new Map(
    seedArticles.map((a) => [
      slugify(a.authorName),
      { slug: slugify(a.authorName), name: a.authorName },
    ]),
  ).values(),
);

/** Daftar kategori resmi beserta urutannya. */
export const seedCategories = CATEGORY_ORDER.map((name, index) => ({
  slug: slugify(name),
  name,
  order: index,
}));
