"use server";

import { articleRepo } from "@/server/repositories";

export async function loadMoreArticles(page: number) {
  return articleRepo.listPublished({
    page,
    perPage: 3,
  });
}
