import { loadEnvFiles } from "./load-env";

/**
 * Memuat file .env SEGERA saat file ini di-import.
 *
 * ============================================================================
 * KENAPA FILE INI PERLU ADA — jebakan yang gampang bikin bingung
 * ============================================================================
 *
 * Semua baris `import` di sebuah file dijalankan LEBIH DULU, sebelum baris
 * kode biasa - tidak peduli urutan penulisannya. Jadi kode seperti ini SALAH:
 *
 *     import { loadEnvFiles } from "../prisma/load-env";
 *     loadEnvFiles();                                    // <- baru jalan ke-2
 *     import { articleRepo } from "@/server/repositories";  // <- jalan ke-1
 *
 * Kelihatannya loadEnvFiles() dipanggil duluan, padahal tidak. Akibatnya
 * repositories dimuat saat DATA_SOURCE masih kosong, lalu jatuh ke nilai
 * bawaan "memory" - walaupun .env.local jelas-jelas berisi "prisma".
 *
 * Yang bikin susah dilacak: tidak ada error sama sekali. Programnya jalan
 * normal, cuma diam-diam membaca sumber data yang salah.
 *
 * Cara yang BENAR - taruh baris ini paling atas:
 *
 *     import "../prisma/load-env-auto";
 *     import { articleRepo } from "@/server/repositories";
 *
 * Karena urutan antar-import tetap dihormati, file ini dijalankan lebih dulu
 * dan .env sudah terbaca sebelum repositories dimuat.
 *
 * Catatan: ini HANYA masalah untuk script yang dijalankan lewat tsx.
 * Aplikasi Next.js membaca .env sendiri sebelum kode mana pun jalan.
 *
 * Pemilik: Orang 1 (Database)
 */
loadEnvFiles();
