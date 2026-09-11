"use client";

import { useState, useTransition } from "react";
import type { ArticleSummary } from "@/server/domain/article";
import { loadMoreArticles } from "@/app/actions/articles";
import ArticleCard from "./ArticleCard";

interface ArticleFeedProps {
  initialArticles: ArticleSummary[];
  initialHasMore: boolean;
}

export default function ArticleFeed({
  initialArticles,
  initialHasMore,
}: ArticleFeedProps) {
  const [articles, setArticles] = useState(initialArticles);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [nextPage, setNextPage] = useState(2);
  const [isPending, startTransition] = useTransition();

  function handleLoadMore() {
    startTransition(async () => {
      const result = await loadMoreArticles(nextPage);

      setArticles((current) => [...current, ...result.items]);
      setHasMore(result.hasMore);
      setNextPage((page) => page + 1);
    });
  }

  return (
    <>
      <div className="flex flex-col gap-6">
        {articles.map((article) => (
          <ArticleCard key={article.slug} article={article} />
        ))}
      </div>

      {hasMore && (
        <button
          type="button"
          onClick={handleLoadMore}
          disabled={isPending}
          className="mt-8 w-full border border-gray-300 rounded-lg py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer disabled:cursor-wait disabled:opacity-60"
        >
          {isPending ? "Memuat..." : "Muat Lebih Banyak"}
        </button>
      )}
    </>
  );
}
