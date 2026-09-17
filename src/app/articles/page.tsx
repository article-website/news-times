import { articleRepo } from "@/server/repositories";

import ArticleCard from "../../components/ArticleCard";

export default async function ArticlesPage() {
  const { items } = await articleRepo.listPublished({
    page: 1,
    perPage: 10,
  });

  return (
    <main className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold mb-6">Berita Terbaru</h1>
      <div className="flex flex-col gap-6">
        {items.map((article) => (
          <ArticleCard key={article.slug} article={article} />
        ))}
      </div>
    </main>
  );
}
