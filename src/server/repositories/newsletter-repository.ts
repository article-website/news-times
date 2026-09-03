import type { Subscriber, SubscribeResult } from "@/server/domain/newsletter";

/**
 * Kontrak akses data newsletter. Dipakai Orang 4 di src/app/api/newsletter/.
 *
 * Cara pakainya di route handler:
 *
 *   const email = skemaZod.parse(body).email;      // validasi: punyamu
 *   const hasil = await newsletterRepo.subscribe(email);
 *
 *   switch (hasil) {
 *     case "baru":            return "Terima kasih, kamu sudah terdaftar.";
 *     case "diaktifkan-lagi": return "Selamat datang kembali.";
 *     case "sudah-terdaftar": return "Email ini sudah terdaftar sebelumnya.";
 *   }
 *
 * Pemilik: Orang 1 (Database)
 */
export interface NewsletterRepository {
  /**
   * Mendaftarkan email. AMAN dipanggil berkali-kali dengan email sama -
   * tidak akan bikin baris dobel dan tidak melempar error.
   *
   * Email dinormalkan dulu (huruf kecil semua, spasi dibuang), supaya
   * "Budi@Mail.com " dan "budi@mail.com" dianggap orang yang sama.
   */
  subscribe(email: string): Promise<SubscribeResult>;

  /**
   * Berhenti langganan. Barisnya TIDAK dihapus, cuma ditandai waktu berhentinya.
   *
   * Kenapa tidak dihapus? Supaya kalau orangnya daftar lagi nanti, kita masih
   * tahu dia pernah berhenti - berguna buat menghormati keputusannya dan buat
   * data. Mengembalikan false kalau emailnya memang tidak pernah terdaftar.
   */
  unsubscribe(email: string): Promise<boolean>;

  findByEmail(email: string): Promise<Subscriber | null>;

  /** Jumlah pendaftar yang masih aktif (belum berhenti). */
  countActive(): Promise<number>;
}
