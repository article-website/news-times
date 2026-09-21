"use server";

import { articleAdminRepo } from "@/server/repositories";
import { requireAuth } from "@/server/auth";
import { revalidatePath } from "next/cache";
import type { ArticleStatus } from "@/server/domain/article";

function toSlug(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export interface ArticleFormData {
  title: string;
  excerpt: string;
  content: string;
  categorySlug: string;
  authorSlug: string;
  imageUrl?: string | null;
  status?: ArticleStatus;
}

export async function createArticleAction(data: ArticleFormData) {
  try {
    await requireAuth();

    const title = data.title?.trim();
    const content = data.content?.trim();

    if (!title || !content) {
      return { ok: false, error: "Judul dan isi artikel wajib diisi." };
    }

    let slug = toSlug(title);
    if (!slug) {
      slug = `artikel-${Date.now().toString().slice(-4)}`;
    }

    if (await articleAdminRepo.slugDipakai(slug)) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    const excerpt = data.excerpt?.trim() || title.slice(0, 150);
    const imageUrl = data.imageUrl?.trim() || null;
    const categorySlug = data.categorySlug || "teknologi";
    const authorSlug = data.authorSlug || "bayu-saputra";

    const created = await articleAdminRepo.create({
      slug,
      title,
      excerpt,
      content,
      imageUrl,
      categorySlug,
      authorSlug,
      status: "DRAFT",
    });

    if (data.status === "PUBLISHED") {
      await articleAdminRepo.publish(created.id);
    }

    revalidatePath("/admin");
    revalidatePath("/");
    revalidatePath("/articles");

    return { ok: true, id: created.id };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gagal membuat artikel.";
    return { ok: false, error: message };
  }
}

export async function updateArticleAction(id: string, data: ArticleFormData) {
  try {
    await requireAuth();

    const title = data.title?.trim();
    const content = data.content?.trim();

    if (!title || !content) {
      return { ok: false, error: "Judul dan isi artikel wajib diisi." };
    }

    const existing = await articleAdminRepo.findById(id);
    if (!existing) {
      return { ok: false, error: "Artikel tidak ditemukan." };
    }

    let slug = existing.slug;
    const newSlug = toSlug(title);
    if (newSlug && newSlug !== existing.slug) {
      if (await articleAdminRepo.slugDipakai(newSlug, id)) {
        slug = `${newSlug}-${Date.now().toString().slice(-4)}`;
      } else {
        slug = newSlug;
      }
    }

    const excerpt = data.excerpt?.trim() || title.slice(0, 150);
    const imageUrl = data.imageUrl?.trim() || null;
    const categorySlug = data.categorySlug || existing.category.slug;
    const authorSlug = data.authorSlug || existing.author.slug;

    await articleAdminRepo.update(id, {
      slug,
      title,
      excerpt,
      content,
      imageUrl,
      categorySlug,
      authorSlug,
    });

    if (data.status === "PUBLISHED" && existing.status !== "PUBLISHED") {
      await articleAdminRepo.publish(id);
    } else if (data.status === "DRAFT" && existing.status === "PUBLISHED") {
      await articleAdminRepo.unpublish(id);
    }

    revalidatePath("/admin");
    revalidatePath("/");
    revalidatePath("/articles");
    revalidatePath(`/articles/${slug}`);

    return { ok: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gagal memperbarui artikel.";
    return { ok: false, error: message };
  }
}

export async function deleteArticleAction(id: string) {
  try {
    await requireAuth();

    const success = await articleAdminRepo.remove(id);
    if (!success) {
      return { ok: false, error: "Artikel tidak ditemukan atau sudah dihapus." };
    }

    revalidatePath("/admin");
    revalidatePath("/");
    revalidatePath("/articles");

    return { ok: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gagal menghapus artikel.";
    return { ok: false, error: message };
  }
}

export async function togglePublishAction(id: string, currentStatus: ArticleStatus) {
  try {
    await requireAuth();

    if (currentStatus === "PUBLISHED") {
      await articleAdminRepo.unpublish(id);
    } else {
      await articleAdminRepo.publish(id);
    }

    revalidatePath("/admin");
    revalidatePath("/");
    revalidatePath("/articles");

    return { ok: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gagal mengubah status artikel.";
    return { ok: false, error: message };
  }
}

export async function getArticleDetailAction(id: string) {
  try {
    await requireAuth();

    const article = await articleAdminRepo.findById(id);
    if (!article) return null;
    return {
      id: article.id,
      slug: article.slug,
      title: article.title,
      excerpt: article.excerpt,
      content: article.content,
      imageUrl: article.imageUrl,
      status: article.status,
      categorySlug: article.category.slug,
      authorSlug: article.author.slug,
    };
  } catch {
    return null;
  }
}
