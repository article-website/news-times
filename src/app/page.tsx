import HeroFeatured from "@/components/HeroFeatured";
import ArticleCard from "@/components/ArticleCard";
import Sidebar from "@/components/Sidebar";
import { articles } from "@/data/articles";
import Link from "next/link";

export default function HomePage() {
  const featured = articles.slice(0, 3);
  const popular = articles.slice(0, 5);

  return (
    <main className="max-w-6xl mx-auto px-6 py-10">
      <HeroFeatured articles={featured} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mt-10">
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Berita Terbaru</h2>
            <Link
              href="/articles"
              className="text-blue-600 text-sm font-medium
              hover:underline"
            >
              {" "}
              Lihat Semua
            </Link>
          </div>

          <div className="flex flex-col gap-6">
            {articles.map((article) => (
              <ArticleCard key={article.slug} article={article} />
            ))}
          </div>

          <button className="mt-8 w-full border border-gray-300 rounded-lg py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            Muat Lebih Banyak
          </button>
        </div>

        <Sidebar popularArticles={popular} />
      </div>
    </main>
  );
}
