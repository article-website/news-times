export interface Article {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  date: string;
  author: string;
  image: string;
}

export const articles: Article[] = [
  {
    slug: "perekonomian-global-tumbuh-stabil",
    title: "Perekonomian Global Tumbuh Stabil di Tengah Ketidakpastian",
    excerpt:
      "Laporan terbaru menunjukkan pertumbuhan ekonomi global mengalami peningkatan meski masih dihadapkan pada berbagai tantangan geopolitik dan inflasi.",
    content:
      "Pertumbuhan ekonomi global pada kuartal ini menunjukkan tren positif meski dibayangi ketidakpastian geopolitik. Sejumlah lembaga keuangan internasional mencatat perbaikan pada sektor manufaktur dan investasi asing langsung. Meski demikian, tantangan inflasi di beberapa negara berkembang masih perlu diwaspadai dalam beberapa bulan ke depan.",
    category: "Ekonomi",
    date: "28 Juni 2025",
    author: "Rizky Pratama",
    image: "/images/ekonomi/ekonomi1.jpg",
  },
  {
    slug: "pemerintah-insentif-investasi-hijau",
    title:
      "Pemerintah Siapkan Insentif Baru untuk Dorong Investasi di Sektor Hijau",
    excerpt:
      "Langkah ini diharapkan dapat mempercepat transisi energi bersih dan menciptakan lapangan kerja baru.",
    content:
      "Kebijakan insentif pajak untuk sektor energi terbarukan resmi disiapkan pemerintah sebagai bagian dari strategi transisi energi nasional. Insentif ini mencakup keringanan pajak untuk investor dan kemudahan perizinan bagi proyek energi bersih berskala kecil hingga menengah.",
    category: "Nasional",
    date: "28 Mei 2025",
    author: "Dian Anggraini",
    image: "/images/nasional/nasional1.jpg",
  },
  {
    slug: "perkembangan-terbaru-ai",
    title: "Perkembangan Terbaru dalam Dunia Kecerdasan Buatan",
    excerpt:
      "Berbagai inovasi AI terbaru dirilis dalam konferensi teknologi tahunan yang digelar di San Francisco.",
    content:
      "Konferensi teknologi tahunan tahun ini menyoroti berbagai terobosan di bidang kecerdasan buatan generatif. Sejumlah perusahaan teknologi memperkenalkan model AI dengan kemampuan pemrosesan multimodal yang lebih efisien, membuka peluang penerapan baru di sektor kreatif dan industri.",
    category: "Teknologi",
    date: "28 Mei 2025",
    author: "Bayu Saputra",
    image: "/images/teknologi/teknologi1.jpg",
  },
  {
    slug: "destinasi-wisata-alam-wajib-dikunjungi",
    title: "Destinasi Wisata Alam yang Wajib Dikunjungi Tahun Ini",
    excerpt:
      "Rekomendasi tempat wisata alam terbaik untuk liburan bersama keluarga atau teman.",
    content:
      "Dari pegunungan hingga pesisir, sejumlah destinasi wisata alam menawarkan pengalaman berbeda bagi wisatawan tahun ini. Beberapa lokasi bahkan telah dilengkapi fasilitas ramah lingkungan untuk mendukung pariwisata berkelanjutan.",
    category: "Lifestyle",
    date: "27 Mei 2025",
    author: "Citra Lestari",
    image: "/images/lifestyle/lifestyle1.jpg",
  },
  {
    slug: "ihsg-menguat-investor-asing-net-buy",
    title: "IHSG Menguat, Investor Asing Catatkan Net Buy",
    excerpt:
      "Pasar saham Indonesia ditutup menguat seiring dengan sentimen positif dari global.",
    content:
      "Indeks Harga Saham Gabungan (IHSG) ditutup menguat pada perdagangan hari ini, didorong oleh aksi beli bersih investor asing di tengah sentimen positif pasar global. Sektor perbankan dan energi menjadi penopang utama penguatan indeks.",
    category: "Ekonomi",
    date: "27 Mei 2025",
    author: "Fajar Nugroho",
    image: "/images/ekonomi/ekonomi2.jpg",
  },
];
