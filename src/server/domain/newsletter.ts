/**
 * Bentuk data pendaftar newsletter.
 *
 * BATAS TANGGUNG JAWAB - penting dibaca Orang 4:
 *
 * Bagian database ini cuma menyimpan. Dia TIDAK melakukan:
 *   - validasi format email      -> itu Zod, punyamu
 *   - pembatasan laju (anti spam) -> itu di route handler, punyamu
 *   - pengiriman email konfirmasi -> layanan luar, punyamu
 *
 * Satu hal yang DIURUS bagian database ini: email yang sudah pernah daftar tidak
 * bikin error, tapi dianggap "sudah terdaftar". Lihat SubscribeResult.
 *
 * Pemilik: Orang 1 (Database)
 */

export interface Subscriber {
  email: string;
  subscribedAt: Date;
  unsubscribedAt: Date | null;
}

/**
 * Hasil pendaftaran, dibedakan supaya route handler bisa memberi pesan tepat.
 *
 *   "baru"           - email belum pernah ada, berhasil didaftarkan
 *   "sudah-terdaftar"- email sudah ada dan masih aktif
 *   "diaktifkan-lagi"- email pernah berhenti langganan, sekarang aktif lagi
 *
 * Kenapa dibedakan? Karena "kamu sudah terdaftar" dan "terima kasih sudah
 * mendaftar" itu dua pesan yang berbeda buat pengguna. Kalau repository cuma
 * balik true/false, Orang 4 tidak bisa membedakannya.
 */
export type SubscribeResult = "baru" | "sudah-terdaftar" | "diaktifkan-lagi";
