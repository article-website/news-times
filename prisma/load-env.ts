import fs from "node:fs";
import path from "node:path";

/**
 * Memuat variabel dari file .env untuk perintah yang jalan DI LUAR Next.js.
 *
 * Kenapa perlu?
 *
 * Next.js otomatis membaca .env.local dan .env waktu `npm run dev`. Tapi
 * `prisma migrate` dan `tsx prisma/seed.ts` itu program terpisah - mereka tidak
 * lewat Next.js sama sekali, jadi tidak ikut kebagian.
 *
 * Tanpa file ini, `npm run db:migrate` gagal dengan pesan "Connection url is
 * empty" walaupun DATABASE_URL jelas-jelas ada di .env.local.
 *
 * URUTAN PENTING: .env.local dibaca DULUAN.
 * `process.loadEnvFile` tidak menimpa nilai yang sudah ada - yang pertama
 * menang. Jadi supaya .env.local mengalahkan .env (sama seperti aturan
 * Next.js), dia harus dibaca lebih dulu.
 *
 * Pemilik: Orang 1 (Database)
 */

const URUTAN_BACA = [".env.local", ".env"];

export function loadEnvFiles(): void {
  for (const nama of URUTAN_BACA) {
    const lokasi = path.resolve(process.cwd(), nama);

    if (fs.existsSync(lokasi)) {
      // Tersedia sejak Node 20.6. Proyek ini pakai Node 24, jadi aman.
      process.loadEnvFile(lokasi);
    }
  }
}
