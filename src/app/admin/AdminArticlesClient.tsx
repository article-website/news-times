"use client";

import { useState, useTransition } from "react";
import type { ArticleAdminSummary, ArticleStatus } from "@/server/domain/article";
import {
  createArticleAction,
  updateArticleAction,
  deleteArticleAction,
  togglePublishAction,
  getArticleDetailAction,
} from "./actions";
import { logoutAction } from "../login/actions";

interface OptionItem {
  slug: string;
  name: string;
}

interface AdminArticlesClientProps {
  initialArticles: ArticleAdminSummary[];
  categories: OptionItem[];
  authors: OptionItem[];
  sumberData: string;
  currentUser?: {
    name: string;
    email: string;
    role: string;
  };
}

export default function AdminArticlesClient({
  initialArticles,
  categories,
  authors,
  sumberData,
  currentUser,
}: AdminArticlesClientProps) {
  const [articlesList, setArticlesList] = useState<ArticleAdminSummary[]>(initialArticles);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(
    null,
  );

  const defaultCategory = categories[0]?.slug ?? "teknologi";
  const defaultAuthor = authors[0]?.slug ?? "bayu-saputra";

  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    categorySlug: defaultCategory,
    authorSlug: defaultAuthor,
    imageUrl: "",
    status: "PUBLISHED" as ArticleStatus,
  });

  function resetForm() {
    setIsEditing(false);
    setSelectedId(null);
    setFormData({
      title: "",
      excerpt: "",
      content: "",
      categorySlug: defaultCategory,
      authorSlug: defaultAuthor,
      imageUrl: "",
      status: "PUBLISHED",
    });
  }

  function handleSubmit(statusOverride?: ArticleStatus) {
    const finalStatus = statusOverride ?? formData.status;

    startTransition(async () => {
      setFeedback(null);

      if (isEditing && selectedId) {
        const res = await updateArticleAction(selectedId, {
          title: formData.title,
          excerpt: formData.excerpt,
          content: formData.content,
          categorySlug: formData.categorySlug,
          authorSlug: formData.authorSlug,
          imageUrl: formData.imageUrl || null,
          status: finalStatus,
        });

        if (!res.ok) {
          setFeedback({ type: "error", message: res.error || "Gagal memperbarui artikel." });
          return;
        }

        const cat = categories.find((c) => c.slug === formData.categorySlug);
        const aut = authors.find((a) => a.slug === formData.authorSlug);

        setArticlesList((prev) =>
          prev.map((a) =>
            a.id === selectedId
              ? {
                  ...a,
                  title: formData.title,
                  status: finalStatus,
                  category: { slug: formData.categorySlug, name: cat?.name ?? formData.categorySlug },
                  author: { slug: formData.authorSlug, name: aut?.name ?? formData.authorSlug },
                  updatedAt: new Date(),
                }
              : a,
          ),
        );

        setFeedback({ type: "success", message: "Artikel berhasil diperbarui." });
        resetForm();
      } else {
        const res = await createArticleAction({
          title: formData.title,
          excerpt: formData.excerpt,
          content: formData.content,
          categorySlug: formData.categorySlug,
          authorSlug: formData.authorSlug,
          imageUrl: formData.imageUrl || null,
          status: finalStatus,
        });

        if (!res.ok) {
          setFeedback({ type: "error", message: res.error || "Gagal membuat artikel." });
          return;
        }

        const cat = categories.find((c) => c.slug === formData.categorySlug);
        const aut = authors.find((a) => a.slug === formData.authorSlug);

        const newArticle: ArticleAdminSummary = {
          id: res.id || `art-${Date.now()}`,
          slug: formData.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          title: formData.title,
          status: finalStatus,
          publishedAt: finalStatus === "PUBLISHED" ? new Date() : null,
          updatedAt: new Date(),
          viewCount: 0,
          category: { slug: formData.categorySlug, name: cat?.name ?? formData.categorySlug },
          author: { slug: formData.authorSlug, name: aut?.name ?? formData.authorSlug },
        };

        setArticlesList((prev) => [newArticle, ...prev]);
        setFeedback({
          type: "success",
          message:
            finalStatus === "PUBLISHED"
              ? "Artikel berhasil dibuat dan diterbitkan."
              : "Artikel berhasil disimpan sebagai draft.",
        });
        resetForm();
      }
    });
  }

  function handleEdit(article: ArticleAdminSummary) {
    startTransition(async () => {
      setFeedback(null);
      const detail = await getArticleDetailAction(article.id);
      if (!detail) {
        setFeedback({ type: "error", message: "Gagal memuat isi lengkap artikel." });
        return;
      }

      setIsEditing(true);
      setSelectedId(detail.id);
      setFormData({
        title: detail.title,
        excerpt: detail.excerpt,
        content: detail.content,
        categorySlug: detail.categorySlug,
        authorSlug: detail.authorSlug,
        imageUrl: detail.imageUrl || "",
        status: detail.status,
      });

      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  function handleDelete(id: string) {
    if (!confirm("Yakin ingin menghapus artikel ini?")) return;

    startTransition(async () => {
      setFeedback(null);
      const res = await deleteArticleAction(id);
      if (!res.ok) {
        setFeedback({ type: "error", message: res.error || "Gagal menghapus artikel." });
        return;
      }

      setArticlesList((prev) => prev.filter((a) => a.id !== id));
      setFeedback({ type: "success", message: "Artikel berhasil dihapus." });
      if (selectedId === id) {
        resetForm();
      }
    });
  }

  function handleTogglePublish(article: ArticleAdminSummary) {
    startTransition(async () => {
      setFeedback(null);
      const res = await togglePublishAction(article.id, article.status);
      if (!res.ok) {
        setFeedback({ type: "error", message: res.error || "Gagal mengubah status." });
        return;
      }

      const nextStatus: ArticleStatus = article.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
      setArticlesList((prev) =>
        prev.map((a) =>
          a.id === article.id
            ? {
                ...a,
                status: nextStatus,
                publishedAt: nextStatus === "PUBLISHED" ? a.publishedAt ?? new Date() : a.publishedAt,
              }
            : a,
        ),
      );

      setFeedback({
        type: "success",
        message:
          nextStatus === "PUBLISHED"
            ? `"${article.title}" berhasil diterbitkan.`
            : `"${article.title}" dikembalikan ke draft.`,
      });
    });
  }

  return (
    <main className="max-w-5xl mx-auto px-4 py-8 space-y-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manajemen Artikel</h1>
          <p className="text-sm text-gray-500 mt-1">
            Kelola, sunting, dan terbitkan artikel berita secara langsung ke sistem monolith.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 font-medium">Sumber data:</span>
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                sumberData === "prisma"
                  ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                  : "bg-amber-100 text-amber-800 border border-amber-200"
              }`}
            >
              {sumberData === "prisma" ? "PostgreSQL (Neon)" : "In-Memory"}
            </span>
          </div>

          {currentUser && (
            <div className="flex items-center gap-2.5 pl-3 border-l border-gray-200">
              <div className="text-right">
                <div className="text-xs font-semibold text-gray-900">{currentUser.name}</div>
                <div className="text-[10px] text-gray-500">{currentUser.email}</div>
              </div>
              <button
                type="button"
                onClick={() => {
                  startTransition(async () => {
                    await logoutAction();
                  });
                }}
                title="Keluar dari sesi admin"
                className="px-2.5 py-1.5 rounded-lg border border-gray-200 text-gray-700 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-colors cursor-pointer text-xs font-medium flex items-center gap-1.5"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Keluar</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-lg text-sm border flex items-center justify-between ${
            feedback.type === "success"
              ? "bg-green-50 text-green-800 border-green-200"
              : "bg-red-50 text-red-800 border-red-200"
          }`}
        >
          <span>{feedback.message}</span>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-gray-400 hover:text-gray-600 font-bold ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {/* Form Tambah / Sunting */}
      <section className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">
            {isEditing ? "Edit Artikel" : "Tambah Artikel Baru"}
          </h2>
          {isEditing && (
            <span className="text-xs font-medium px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md border border-blue-200">
              Sedang Mengedit ID: {selectedId}
            </span>
          )}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Judul Artikel *</label>
            <input
              type="text"
              required
              placeholder="Masukkan judul berita..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Kategori *</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                value={formData.categorySlug}
                onChange={(e) => setFormData({ ...formData, categorySlug: e.target.value })}
              >
                {categories.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Penulis *</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                value={formData.authorSlug}
                onChange={(e) => setFormData({ ...formData, authorSlug: e.target.value })}
              >
                {authors.map((a) => (
                  <option key={a.slug} value={a.slug}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Deskripsi Singkat (Ringkasan)
              </label>
              <input
                type="text"
                placeholder="Deskripsi singkat untuk kartu berita..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                URL Gambar (Opsional)
              </label>
              <input
                type="text"
                placeholder="https://... atau /images/..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Isi Artikel *</label>
            <textarea
              rows={6}
              required
              placeholder="Tuliskan isi artikel lengkap di sini..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            {isEditing ? (
              <>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition disabled:opacity-50 cursor-pointer"
                >
                  {isPending ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={resetForm}
                  className="px-5 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition disabled:opacity-50 cursor-pointer"
                >
                  Batal
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => handleSubmit("PUBLISHED")}
                  className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition disabled:opacity-50 cursor-pointer"
                >
                  {isPending ? "Memproses..." : "Publikasikan Artikel"}
                </button>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => handleSubmit("DRAFT")}
                  className="px-5 py-2.5 bg-amber-600 text-white font-medium rounded-lg hover:bg-amber-700 transition disabled:opacity-50 cursor-pointer"
                >
                  {isPending ? "Memproses..." : "Simpan sebagai Draft"}
                </button>
              </>
            )}
          </div>
        </form>
      </section>

      {/* Tabel Daftar Artikel */}
      <section className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Daftar Artikel ({articlesList.length})</h2>
          <span className="text-xs text-gray-500">Terbaru diubah berada di posisi atas</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-600">
              <tr>
                <th className="px-6 py-3 font-medium">Judul</th>
                <th className="px-6 py-3 font-medium">Kategori</th>
                <th className="px-6 py-3 font-medium">Penulis</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Tanggal</th>
                <th className="px-6 py-3 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {articlesList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    Belum ada artikel. Silakan buat artikel pertama di atas.
                  </td>
                </tr>
              ) : (
                articlesList.map((article) => {
                  const tanggalFormatted = article.publishedAt
                    ? new Date(article.publishedAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : "Belum terbit";

                  return (
                    <tr key={article.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900 max-w-xs">
                        <div className="truncate font-semibold">{article.title}</div>
                        <div className="text-xs text-gray-400 font-mono mt-0.5">
                          /{article.slug}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                          {article.category.name}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{article.author.name}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            article.status === "PUBLISHED"
                              ? "bg-green-100 text-green-800 border border-green-200"
                              : article.status === "DRAFT"
                                ? "bg-amber-100 text-amber-800 border border-amber-200"
                                : "bg-gray-100 text-gray-700 border border-gray-200"
                          }`}
                        >
                          {article.status === "PUBLISHED"
                            ? "Terbit"
                            : article.status === "DRAFT"
                              ? "Draft"
                              : "Arsip"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                        {tanggalFormatted}
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap space-x-2">
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() => handleTogglePublish(article)}
                          className="px-2.5 py-1 text-xs font-medium text-gray-700 border border-gray-300 rounded hover:bg-gray-100 transition disabled:opacity-50 cursor-pointer"
                          title={
                            article.status === "PUBLISHED"
                              ? "Ubah status ke Draft"
                              : "Terbitkan artikel"
                          }
                        >
                          {article.status === "PUBLISHED" ? "Tarik Draft" : "Terbitkan"}
                        </button>
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() => handleEdit(article)}
                          className="px-2.5 py-1 text-xs font-medium text-amber-700 border border-amber-200 rounded hover:bg-amber-50 transition disabled:opacity-50 cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() => handleDelete(article.id)}
                          className="px-2.5 py-1 text-xs font-medium text-red-600 border border-red-200 rounded hover:bg-red-50 transition disabled:opacity-50 cursor-pointer"
                        >
                          Hapus
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
