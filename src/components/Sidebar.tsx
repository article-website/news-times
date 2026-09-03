import { Article } from "../data/articles";
import PopularArticles from "./PopularArticles";
import CategoryList from "./CategoryList";
import NewsletterForm from "./NewsletterForm";

interface SidebarProps {
  popularArticles: Article[];
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
