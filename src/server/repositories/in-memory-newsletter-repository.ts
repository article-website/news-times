import type { Subscriber, SubscribeResult } from "@/server/domain/newsletter";
import type { NewsletterRepository } from "./newsletter-repository";

/**
 * Implementasi palsu NewsletterRepository.
 * Data hilang tiap server restart - itu wajar, ini memang cuma buat Sprint 1.
 *
 * Pemilik: Orang 1 (Database)
 */

function normalkanEmail(email: string): string {
  return email.trim().toLowerCase();
}

const pendaftar = new Map<string, Subscriber>();

export const inMemoryNewsletterRepository: NewsletterRepository = {
  async subscribe(email: string): Promise<SubscribeResult> {
    const bersih = normalkanEmail(email);
    const ada = pendaftar.get(bersih);

    if (!ada) {
      pendaftar.set(bersih, {
        email: bersih,
        subscribedAt: new Date(),
        unsubscribedAt: null,
      });
      return "baru";
    }

    if (ada.unsubscribedAt === null) {
      return "sudah-terdaftar";
    }

    pendaftar.set(bersih, {
      email: bersih,
      subscribedAt: new Date(),
      unsubscribedAt: null,
    });
    return "diaktifkan-lagi";
  },

  async unsubscribe(email: string): Promise<boolean> {
    const bersih = normalkanEmail(email);
    const ada = pendaftar.get(bersih);

    if (!ada) return false;

    pendaftar.set(bersih, { ...ada, unsubscribedAt: new Date() });
    return true;
  },

  async findByEmail(email: string): Promise<Subscriber | null> {
    return pendaftar.get(normalkanEmail(email)) ?? null;
  },

  async countActive(): Promise<number> {
    let jumlah = 0;
    for (const p of pendaftar.values()) {
      if (p.unsubscribedAt === null) jumlah++;
    }
    return jumlah;
  },
};
