import { articleRepo } from "@/server/repositories";
import Image from "next/image";
import Link from "next/link";

interface categoryRef {
  name: string;
}

interface articleRepo {
  slug: string;
  title: string;
  imageUrl: string | null;
  publishedAt: Date | null;
  category: categoryRef;
}

interface ArticleCardProps {
  article: articleRepo;
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
