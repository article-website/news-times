import { articleRepo } from "@/server/repositories";

import PopularArticles from "./PopularArticles";
import NewsletterForm from "./NewsletterForm";
import CategoryList from "./CategoryList";

interface categoryRef {
  name: string;
}

interface authorRef {
  name: string;
}

interface articleRepo {
  slug: string;
  title: string;
  excerpt: string;
  imageUrl: string | null;
  publishedAt: Date | null;
  viewCount: number;
  category: categoryRef;
  author: authorRef;
}

interface SidebarProps {
  popularArticles: articleRepo[];
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
