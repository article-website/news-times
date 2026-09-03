"use client";

import { useState } from "react";
import Link from "next/link";
import { Article } from "@/data/articles";

interface HeroFeaturedProps {
  articles: Article[];
}

export default function HeroFeatured({ articles }: HeroFeaturedProps) {
  const [current, setCurrent] = useState(0);
  const article = articles[current];

  const goPrev = () =>
    setCurrent((prev) => (prev === 0 ? articles.length - 1 : prev - 1));
  const goNext = () =>
    setCurrent((prev) => (prev === articles.length - 1 ? 0 : prev + 1));

  return (
    <div className="relative h-96 rounded-2xl overflow-hidden">
      <Link
        href={`/articles/${article.slug}`}
        className="absolute inset-0 block group"
      >
        <img
          src={article.image}
          alt={article.title}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 p-8 text-white max-w-2xl">
          <span className="inline-block bg-blue-600 text-xs font-semibold px-3 py-1 rounded mb-3">
            FEATURED
          </span>
          <p className="text-sm text-gray-200 mb-2">{article.date}</p>
          <h2 className="text-3xl font-bold mb-3 leading-tight">
            {article.title}
          </h2>
          <p className="text-gray-200 text-sm mb-4 line-clamp-2">
            {article.excerpt}
          </p>
          <p className="text-sm font-medium">{article.author}</p>
        </div>
      </Link>

      <button
        onClick={goPrev}
        aria-label="Sebelumnya"
        className="cursor-pointer absolute left-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full w-9 h-9 flex items-center justify-center"
      >
        ‹
      </button>
      <button
        onClick={goNext}
        aria-label="Selanjutnya"
        className="cursor-pointer absolute right-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full w-9 h-9 flex items-center justify-center"
      >
        ›
      </button>

      <div className="absolute bottom-4 right-8 flex gap-2">
        {articles.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            aria-label={`Slide ${index + 1}`}
            className={`w-2 h-2 rounded-full ${index === current ? "bg-white" : "bg-white/40"}`}
          />
        ))}
      </div>
    </div>
  );
}
