import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Tentang Kami | NewsHub",
  description:
    "Mengenal lebih dekat NewsHub, sumber informasi terpercaya untuk berita terbaru dari dalam dan luar negeri.",
};

const values = [
  {
    title: "Akurat",
    description:
      "Setiap berita melalui proses verifikasi sebelum diterbitkan, sehingga informasi yang Anda baca dapat dipertanggungjawabkan.",
  },
  {
    title: "Berimbang",
    description:
      "Kami menyajikan berbagai sudut pandang secara proporsional tanpa memihak kepentingan kelompok tertentu.",
  },
  {
    title: "Cepat",
    description:
      "Peristiwa penting kami sajikan secara ringkas dan tepat waktu, agar Anda tidak tertinggal informasi terbaru.",
  },
];

const stats = [
  { value: "6", label: "Kategori Berita" },
  { value: "500+", label: "Artikel Terbit" },
  { value: "24/7", label: "Pembaruan Berita" },
];

export default function AboutPage() {
  return (
    <main className="max-w-4xl mx-auto px-6 py-16">
      {/* Header */}
      <section className="text-center">
        <span className="inline-block bg-blue-50 text-blue-600 text-xl font-semibold px-3 py-1 rounded-full mb-4">
          TENTANG KAMI
        </span>
        <h1 className="text-4xl font-bold text-gray-900 leading-tight">
          Sumber Informasi Terpercaya untuk Anda
        </h1>
        <p className="text-gray-600 mt-4 max-w-2xl mx-auto leading-relaxed">
          NewsTimes hadir untuk menyajikan berita terbaru dari dalam dan luar
          negeri secara akurat, berimbang, dan mudah dipahami oleh semua
          kalangan pembaca.
        </p>
      </section>

      {/* Statistik */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-14">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white border border-gray-200 rounded-xl p-6 text-center"
          >
            <p className="text-3xl font-bold text-blue-600">{stat.value}</p>
            <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </section>

      {/* Cerita kami */}
      <section className="mt-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Cerita Kami</h2>
        <div className="flex flex-col gap-4 text-gray-700 leading-relaxed">
          <p>
            NewsTimes dibangun dari satu keyakinan sederhana: setiap orang
            berhak mendapatkan informasi yang benar. Di tengah derasnya arus
            berita yang beredar setiap hari, membedakan fakta dari opini menjadi
            semakin sulit.
          </p>
          <p>
            Karena itu, kami menyusun ulang cara berita disajikan — ringkas
            tanpa kehilangan konteks, cepat tanpa mengorbankan akurasi, dan
            terbuka untuk semua pembaca tanpa terkecuali. Mulai dari isu
            nasional, perkembangan internasional, dinamika ekonomi, inovasi
            teknologi, hingga olahraga dan gaya hidup.
          </p>
        </div>
      </section>

      {/* Nilai */}
      <section className="mt-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Nilai yang Kami Pegang
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {values.map((value) => (
            <div
              key={value.title}
              className="bg-white border border-gray-200 rounded-xl p-6"
            >
              <h3 className="font-semibold text-gray-900 mb-2">
                {value.title}
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {value.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Ajakan */}
      <section className="mt-16 bg-slate-900 rounded-2xl px-8 py-12 text-center">
        <h2 className="text-2xl font-bold text-white mb-3">
          Mulai Membaca Berita Hari Ini
        </h2>
        <p className="text-gray-400 max-w-lg mx-auto mb-6">
          Jelajahi berbagai artikel pilihan kami dari beragam kategori yang
          tersedia.
        </p>
        <Link
          href="/articles"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-6 py-3 rounded-lg transition-colors"
        >
          Lihat Semua Artikel
        </Link>
      </section>
    </main>
  );
}
