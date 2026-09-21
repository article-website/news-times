import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getSession } from "@/server/auth";
import { articleAdminRepo, articleRepo } from "@/server/repositories";
import AdminArticlesClient from "./AdminArticlesClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Kelola Berita - Admin NewsTimes",
  description: "Panel administrasi redaksi NewsTimes.",
};

const DEFAULT_AUTHORS = [
  { slug: "bayu-saputra", name: "Bayu Saputra" },
  { slug: "rizky-pratama", name: "Rizky Pratama" },
  { slug: "dian-anggraini", name: "Dian Anggraini" },
  { slug: "citra-lestari", name: "Citra Lestari" },
  { slug: "fajar-nugroho", name: "Fajar Nugroho" },
];

export default async function AdminArticlesPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const [{ items: articles }, categories] = await Promise.all([
    articleAdminRepo.list({ perPage: 100 }),
    articleRepo.listCategories(),
  ]);

  return (
    <AdminArticlesClient
      initialArticles={articles}
      categories={categories.map((c) => ({ slug: c.slug, name: c.name }))}
      authors={DEFAULT_AUTHORS}
      currentUser={session}
    />
  );
}