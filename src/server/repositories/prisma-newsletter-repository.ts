import "server-only";

import type { Subscriber, SubscribeResult } from "@/server/domain/newsletter";
import { getPrisma } from "@/server/db/client";
import type { NewsletterRepository } from "./newsletter-repository";

/**
 * Implementasi NewsletterRepository dengan Prisma.
 * Pemilik: Orang 1 (Database)
 */

function normalkanEmail(email: string): string {
  return email.trim().toLowerCase();
}

const subscriberSelect = {
  email: true,
  subscribedAt: true,
  unsubscribedAt: true,
} as const;

export const prismaNewsletterRepository: NewsletterRepository = {
  async subscribe(email: string): Promise<SubscribeResult> {
    const bersih = normalkanEmail(email);
    const prisma = getPrisma();

    const adaSebelumnya = await prisma.newsletterSubscriber.findUnique({
      where: { email: bersih },
      select: { unsubscribedAt: true },
    });

    if (!adaSebelumnya) {
      await prisma.newsletterSubscriber.create({ data: { email: bersih } });
      return "baru";
    }

    if (adaSebelumnya.unsubscribedAt === null) {
      return "sudah-terdaftar";
    }

    // Pernah berhenti langganan, sekarang daftar lagi.
    await prisma.newsletterSubscriber.update({
      where: { email: bersih },
      data: { unsubscribedAt: null, subscribedAt: new Date() },
    });
    return "diaktifkan-lagi";
  },

  async unsubscribe(email: string): Promise<boolean> {
    const bersih = normalkanEmail(email);

    const ada = await getPrisma().newsletterSubscriber.findUnique({
      where: { email: bersih },
      select: { email: true },
    });

    if (!ada) return false;

    await getPrisma().newsletterSubscriber.update({
      where: { email: bersih },
      data: { unsubscribedAt: new Date() },
    });
    return true;
  },

  async findByEmail(email: string): Promise<Subscriber | null> {
    return getPrisma().newsletterSubscriber.findUnique({
      where: { email: normalkanEmail(email) },
      select: subscriberSelect,
    });
  },

  async countActive(): Promise<number> {
    return getPrisma().newsletterSubscriber.count({
      where: { unsubscribedAt: null },
    });
  },
};
