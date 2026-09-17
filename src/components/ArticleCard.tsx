import type { ArticleSummary } from "@/server/domain/article";
import Image from "next/image";
import Link from "next/link";

interface ArticleCardProps {
  article: ArticleSummary;
}

export default function ArticleCard({ article }: ArticleCardProps) {
  return (
    <Link href={`/articles/${article.slug}`} className="flex gap-4 group">
      {article.imageUrl ? (
        <Image
          src={article.imageUrl}
          alt={article.title}
          width={160}
          height={112}
          className="w-40 h-28 object-cover rounded-lg shrink-0"
        />
      ) : (
        <div className="w-40 h-28 rounded-lg shrink-0 bg-gray-200" />
      )}
      <div>
        <h3 className="font-semibold text-lg group-hover:text-blue-600 transition-colors">
          {article.title}
        </h3>
        <p className="text-gray-400 text-xs mt-2">
          {article.publishedAt?.toLocaleDateString("id-ID")} ·{" "}
          {article.category.name}
        </p>
      </div>
    </Link>
  );
}
