import type { ArticleSummary } from "@/server/domain/article";

import PopularArticles from "./PopularArticles";
import NewsletterForm from "./NewsletterForm";
import CategoryList from "./CategoryList";

interface SidebarProps {
  popularArticles: ArticleSummary[];
}

export default function Sidebar({ popularArticles }: SidebarProps) {
  return (
    <aside className="flex flex-col gap-6">
      <PopularArticles articles={popularArticles} />
      <CategoryList />
      <NewsletterForm />
    </aside>
  );
}
