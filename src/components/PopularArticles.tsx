import type { ArticleSummary } from "@/server/domain/article";
import Image from "next/image";
import Link from "next/link";

interface PopularArticlesProps {
  articles: ArticleSummary[];
}

export default function PopularArticles({ articles }: PopularArticlesProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <h3 className="font-semibold text-gray-900 mb-4">Terpopuler</h3>
      <div className="flex flex-col gap-4">
        {articles.map((article, index) => (
          <Link
            key={article.slug}
            href={`/articles/${article.slug}`}
            className="flex gap-3 group"
          >
            <span className="text-blue-600 font-bold text-sm w-5 pt-1">
              {String(index + 1).padStart(2, "0")}
            </span>
            {article.imageUrl ? (
              <Image
                src={article.imageUrl}
                alt={article.title}
                width={56}
                height={56}
                className="w-14 h-14 object-cover rounded-md shrink-0"
              />
            ) : (
              <div className="w-14 h-14 rounded-md shrink-0 bg-gray-200" />
            )}
            <div>
              <p className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                {article.title}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {article.publishedAt?.toLocaleDateString("id-ID")}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
