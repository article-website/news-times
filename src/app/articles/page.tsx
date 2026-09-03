import ArticleCard from "../../components/ArticleCard";
import { articles } from "../../data/articles";

export default function ArticlesPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold mb-6">Berita Terbaru</h1>
      <div className="flex flex-col gap-6">
        {articles.map((article) => (
          <ArticleCard key={article.slug} article={article} />
        ))}
      </div>
    </main>
  );
}
