import Link from "next/link";
import { Article } from "../data/articles";

interface ArticleCardProps {
  article: Article;
}

export default function ArticleCard({ article }: ArticleCardProps) {
  return (
    <Link href={`/articles/${article.slug}`} className="flex gap-4 group">
      <img
        src={article.image}
        alt={article.title}
        className="w-40 h-28 object-cover rounded-lg shrink-0"
      />
      <div>
        <h3 className="font-semibold text-lg group-hover:text-blue-600 transition-colors">
          {article.title}
        </h3>
        <p className="text-gray-400 text-xs mt-2">
          {article.date} . {article.category}
        </p>
      </div>
    </Link>
  );
}
