import HeroFeatured from "@/components/HeroFeatured";
import { articleRepo } from "@/server/repositories";
import ArticleFeed from "@/components/ArticleFeed";
import Sidebar from "@/components/Sidebar";
import Link from "next/link";


export default async function HomePage() {
  const featured = await articleRepo.listFeatured(3);
  const { items, hasMore } = await articleRepo.listPublished({
    page: 1,
    perPage: 3,
  });
  const popular = await articleRepo.listPopular(5);

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

          <ArticleFeed
            initialArticles={items}
            initialHasMore={hasMore}
          />
        </div>

        <Sidebar popularArticles={popular} />
      </div>
    </main>
  );
}
