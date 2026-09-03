import { articles } from "@/data/articles";
import { notFound } from "next/navigation";

interface ArticleDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ArticleDetailPage({
  params,
}: ArticleDetailPageProps) {
  const { slug } = await params;
  const article = articles.find((a) => a.slug === slug);

  if (!article) {
    notFound();
  }

  return (
    <main className="max-w-3xl mx-auto px-6 py-10">
      <img
        src={article.image}
        alt={article.title}
        className="w-full h-72 object-cover rounded-xl mb-6"
      />
      <span className="text-blue-600 text-sm font-medium">
        {article.category}
      </span>
      <h1 className="text-3xl font-bold mt-2 mb-3">{article.title}</h1>
      <p className="text-gray-500 text-sm mb-6">
        {article.date} • {article.author}
      </p>
      <p className="text-gray-700 leading-relaxed">{article.content}</p>
    </main>
  );
}
