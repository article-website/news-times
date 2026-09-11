import { articleRepo } from "@/server/repositories";
import { notFound } from "next/navigation";
import Image from "next/image";

interface ArticleDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ArticleDetailPage({
  params,
}: ArticleDetailPageProps) {
  const { slug } = await params;
  const article = await articleRepo.findBySlug(slug);

  if (!article) {
    notFound();
  }

  return (
    <main className="max-w-3xl mx-auto px-6 py-10">
      {article.imageUrl ? (
        <Image
          src={article.imageUrl}
          alt={article.title}
          width={1200}
          height={675}
          className="w-full h-72 object-cover rounded-xl mb-6"
        />
      ) : (
        <div className="w-full h-72 rounded-xl mb-6 bg-gray-200" />
      )}
      <span className="text-blue-600 text-sm font-medium">
        {article.category.name}
      </span>
      <h1 className="text-3xl font-bold mt-2 mb-3">{article.title}</h1>
      <p className="text-gray-500 text-sm mb-6">
        {article.publishedAt?.toLocaleDateString("id-ID")} •{" "}
        {article.author.name}
      </p>
      <p className="text-gray-700 leading-relaxed">{article.content}</p>
    </main>
  );
}
