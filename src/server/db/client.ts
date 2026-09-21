import "server-only";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

/**
 * Koneksi database untuk APLIKASI (bukan untuk CLI - itu di prisma.config.ts).
 *
 * Baris `import "server-only"` di atas itu pagar pengaman: kalau ada yang tidak
 * sengaja meng-import file ini dari komponen "use client", build-nya langsung
 * gagal dengan pesan jelas. Tanpa itu, Prisma bisa kebawa ke bundle browser dan
 * errornya jauh lebih membingungkan.
 *
 * Pemilik: Orang 1 (Database)
 */

/**
 * Kenapa disimpan di globalThis?
 *
 * Waktu `next dev` jalan, tiap kali file diedit modulnya dimuat ulang. Kalau
 * PrismaClient dibuat baru terus, koneksi ke database numpuk sampai kena batas
 * dan muncul error "too many connections". Neon paket gratis batas koneksinya
 * kecil, jadi ini bukan masalah teoretis.
 *
 * Di produksi trik ini tidak dipakai, karena modulnya cuma dimuat sekali.
 */
const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

/**
 * Mengambil koneksi database. Dibuat sekali, lalu dipakai ulang.
 *
 * Sengaja berbentuk FUNGSI, bukan `export const prisma = ...`.
 *
 * Alasannya: kalau berbentuk const, koneksi dibuat begitu file ini di-import.
 * Padahal selama Sprint 1 kita masih pakai data contoh dan DATABASE_URL belum
 * di-set. Akibatnya seluruh aplikasi error cuma gara-gara ada file yang
 * meng-import file ini, walaupun databasenya belum dipakai sama sekali.
 *
 * Dengan bentuk fungsi, koneksi baru dibuat waktu query pertama benar-benar
 * dijalankan.
 */
export function getPrisma(): PrismaClient {
  if (globalForPrisma.prisma) {
    return globalForPrisma.prisma;
  }

  const connectionString =
    process.env.DATABASE_URL ||
    "postgresql://neondb_owner:npg_7Qg3uBeyNHVZ@ep-summer-water-b3fbpgg2-pooler.c-4.ap-southeast-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require";

  // Mulai Prisma 7, koneksi wajib lewat driver adapter seperti ini.
  const client = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });

  // Di produksi pun aman disimpan: modulnya cuma dimuat sekali,
  // jadi tidak ada penumpukan koneksi.
  globalForPrisma.prisma = client;

  return client;
}
