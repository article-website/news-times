"use client";

import { useState, useEffect } from "react";
import { articles as initialArticles, Article } from "@/data/articles";

export default function AdminArticlesPage() {
  const [articlesList, setArticlesList] = useState<Article[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    category: "Teknologi",
    author: "",
    image: "",
  });

  useEffect(() => {
    const saved = localStorage.getItem("news_articles");
    if (saved) {
      setArticlesList(JSON.parse(saved));
    } else {
      setArticlesList(initialArticles);
      localStorage.setItem("news_articles", JSON.stringify(initialArticles));
    }
  }, []);

  const updateArticles = (updatedList: Article[]) => {
    setArticlesList(updatedList);
    localStorage.setItem("news_articles", JSON.stringify(updatedList));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isEditing && selectedSlug) {
      const updated = articlesList.map((article) => {
        if (article.slug === selectedSlug) {
          return { ...article, ...formData };
        }
        return article;
      });
      updateArticles(updated);
      setIsEditing(false);
      setSelectedSlug(null);
    } else {
      const slug = `${formData.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now().toString().slice(-4)}`;
      const newArticle: Article = {
        slug,
        title: formData.title,
        excerpt: formData.excerpt || formData.title,
        content: formData.content,
        category: formData.category,
        date: new Date().toLocaleDateString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
        author: formData.author || "Admin",
        image: formData.image || "/images/ekonomi/ekonomi1.jpg",
      };
      updateArticles([newArticle, ...articlesList]);
    }

    setFormData({
      title: "",
      excerpt: "",
      content: "",
      category: "Teknologi",
      author: "",
      image: "",
    });
  };

  const handleEdit = (article: Article) => {
    setIsEditing(true);
    setSelectedSlug(article.slug);
    setFormData({
      title: article.title,
      excerpt: article.excerpt,
      content: article.content,
      category: article.category,
      author: article.author,
      image: article.image,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = (slug: string) => {
    if (confirm("Yakin ingin menghapus artikel ini?")) {
      const filtered = articlesList.filter((a) => a.slug !== slug);
      updateArticles(filtered);
    }
  };

  return (
    <main className="max-w-5xl mx-auto px-4 py-8 space-y-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Manajemen Artikel</h1>
      </div>

      <section className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">
          {isEditing ? "Edit Artikel" : "Tambah Artikel Baru"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Judul Artikel</label>
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
              <label className="block text-sm font-medium mb-1">Kategori</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="Teknologi">Teknologi</option>
                <option value="Ekonomi">Ekonomi</option>
                <option value="Nasional">Nasional</option>
                <option value="Lifestyle">Lifestyle</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Nama Penulis</label>
              <input
                type="text"
                placeholder="cth: Budi Santoso"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Deskripsi Singkat</label>
            <input
              type="text"
              placeholder="Deskripsi singkat artikel..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Isi Artikel</label>
            <textarea
              rows={5}
              required
              placeholder="Tuliskan isi artikel lengkap di sini..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
            >
              {isEditing ? "Simpan Perubahan" : "Publikasikan Artikel"}
            </button>
            {isEditing && (
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setSelectedSlug(null);
                  setFormData({ title: "", excerpt: "", content: "", category: "Teknologi", author: "", image: "" });
                }}
                className="px-5 py-2.5 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition"
              >
                Batal
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Daftar Artikel Aktif ({articlesList.length})</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-600">
              <tr>
                <th className="px-6 py-3 font-medium">Judul</th>
                <th className="px-6 py-3 font-medium">Kategori</th>
                <th className="px-6 py-3 font-medium">Penulis</th>
                <th className="px-6 py-3 font-medium">Tanggal</th>
                <th className="px-6 py-3 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {articlesList.map((article) => (
                <tr key={article.slug} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900 max-w-xs truncate">
                    {article.title}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                      {article.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{article.author}</td>
                  <td className="px-6 py-4 text-gray-500 whitespace-nowrap">{article.date}</td>
                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    <button
                      onClick={() => handleEdit(article)}
                      className="px-3 py-1 mr-2 text-sm font-medium text-amber-600 border border-amber-200 rounded hover:bg-amber-50"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(article.slug)}
                      className="px-3 py-1 text-sm font-medium text-red-600 border border-red-200 rounded hover:bg-red-50"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}