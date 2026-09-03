import { defineConfig } from "prisma/config";
import { loadEnvFiles } from "./prisma/load-env";

/**
 * Konfigurasi Prisma CLI (dipakai saat `prisma migrate`, `prisma studio`, `prisma db seed`).
 *
 * Mulai Prisma 7, connection string tidak boleh lagi ditulis di schema.prisma.
 * File ini yang memberi tahu CLI harus nyambung ke database mana.
 *
 * Aplikasinya sendiri TIDAK memakai file ini - lihat src/server/db/client.ts.
 */

// Wajib dipanggil sebelum process.env dibaca di bawah.
// Prisma CLI tidak baca .env.local sendiri, padahal di situlah Neon menaruh
// connection string-nya.
loadEnvFiles();

export default defineConfig({
  schema: "prisma/schema.prisma",

  datasource: {
    // Sengaja TIDAK pakai helper env() bawaan Prisma: helper itu melempar error
    // kalau variabelnya belum ada, padahal `prisma generate` sama sekali tidak
    // butuh koneksi database. Kalau dibiarkan, CI jadi merah cuma karena
    // DATABASE_URL belum di-set di GitHub Actions.
    //
    // Perintah yang benar-benar butuh koneksi (`migrate`, `studio`, `db seed`)
    // tetap akan gagal dengan pesan jelas kalau nilainya kosong.
    //
    // Pakai yang UNPOOLED kalau ada: migration menjalankan perintah DDL
    // (bikin/ubah tabel) yang kurang cocok lewat connection pooler.
    // Aplikasinya tetap pakai yang pooled - lihat src/server/db/client.ts.
    url: process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL ?? "",
  },

  migrations: {
    seed: "tsx prisma/seed.ts",
  },
});
