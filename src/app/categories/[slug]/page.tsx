import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { articleRepo } from "@/server/repositories";
import ArticleCard from "@/components/ArticleCard";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const categories = await articleRepo.listCategories();
  const category = categories.find((c) => c.slug === slug);

  if (!category) {
    return {
      title: "Kategori Tidak Ditemukan - NewsTimes",
    };
  }

  return {
    title: `Berita ${category.name} Terkini - NewsTimes`,
    description: `Kumpulan berita dan artikel terbaru seputar ${category.name} di NewsTimes.`,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;

  const categories = await articleRepo.listCategories();
  const category = categories.find((c) => c.slug === slug);

  if (!category) {
    notFound();
  }

  const { items, total } = await articleRepo.listByCategory(slug, {
    page: 1,
    perPage: 20,
  });

  return (
    <main className="max-w-4xl mx-auto px-6 py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-blue-600 transition-colors">
          Beranda
        </Link>
        <span>/</span>
        <span className="text-gray-400">Kategori</span>
        <span>/</span>
        <span className="font-semibold text-gray-900">{category.name}</span>
      </nav>

      <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between border-b border-gray-200 pb-4 mb-8 gap-2">
        <h1 className="text-3xl font-bold text-gray-900">
          Berita <span className="text-blue-600">{category.name}</span>
        </h1>
        <p className="text-sm text-gray-500">
          {total > 0 ? `${total} artikel diterbitkan` : "Belum ada artikel"}
        </p>
      </div>

      {items.length > 0 ? (
        <div className="flex flex-col gap-6">
          {items.map((article) => (
            <ArticleCard key={article.slug} article={article} />
          ))}
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl p-10 text-center text-gray-500">
          <p className="text-lg font-medium text-gray-800 mb-2">
            Belum Ada Artikel
          </p>
          <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
            Saat ini belum ada artikel yang diterbitkan untuk kategori {category.name}. Silakan kembali lagi nanti atau jelajahi kategori lainnya.
          </p>
          <Link
            href="/"
            className="inline-block px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition"
          >
            Kembali ke Beranda
          </Link>
        </div>
      )}
    </main>
  );
}
