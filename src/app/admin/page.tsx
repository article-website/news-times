import {
  articleAdminRepo,
  articleRepo,
  sumberDataAktif,
} from "@/server/repositories";
import AdminArticlesClient from "./AdminArticlesClient";

export const dynamic = "force-dynamic";

const DEFAULT_AUTHORS = [
  { slug: "bayu-saputra", name: "Bayu Saputra" },
  { slug: "rizky-pratama", name: "Rizky Pratama" },
  { slug: "dian-anggraini", name: "Dian Anggraini" },
  { slug: "citra-lestari", name: "Citra Lestari" },
  { slug: "fajar-nugroho", name: "Fajar Nugroho" },
];

export default async function AdminArticlesPage() {
  const [{ items: articles }, categories] = await Promise.all([
    articleAdminRepo.list({ perPage: 100 }),
    articleRepo.listCategories(),
  ]);

  return (
    <AdminArticlesClient
      initialArticles={articles}
      categories={categories.map((c) => ({ slug: c.slug, name: c.name }))}
      authors={DEFAULT_AUTHORS}
      sumberData={sumberDataAktif}
    />
  );
}