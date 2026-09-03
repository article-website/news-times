import type {
  CreateUserInput,
  UserPublic,
  UserWithSecret,
} from "@/server/domain/user";

/**
 * Kesepakatan cara mengambil data akun admin. Dipakai Orang 3 di src/server/auth/.
 *
 * Cara pakainya waktu login:
 *
 *   const user = await userRepo.findByEmailWithSecret(email);
 *   if (!user) return null;                       // email tidak terdaftar
 *   const cocok = await verifikasiPassword(password, user.passwordHash);
 *   if (!cocok) return null;                      // password salah
 *   return toPublic(user);
 *
 * CATATAN KEAMANAN: fungsi `verifikasiPassword` di atas BUKAN bagian dari
 * bagian database ini - itu punyamu, Orang 3. Repository ini sengaja tidak tahu
 * algoritma hash apa pun.
 *
 * Satu saran (bukan keharusan): balas dengan pesan error yang sama untuk
 * "email tidak ada" dan "password salah". Kalau dibedakan, orang bisa menebak
 * email mana yang terdaftar.
 *
 * Pemilik: Orang 1 (Database)
 */
export interface UserRepository {
  /**
   * Mencari user berikut hash password-nya. HANYA untuk proses login.
   *
   * Jangan pernah mengirim hasil fungsi ini ke browser atau response API -
   * di dalamnya ada `passwordHash`. Untuk keperluan lain pakai `findById`.
   */
  findByEmailWithSecret(email: string): Promise<UserWithSecret | null>;

  /** Mencari user tanpa data rahasia. Aman dipakai untuk sesi. */
  findById(id: string): Promise<UserPublic | null>;

  /** Daftar semua akun. Untuk halaman kelola pengguna. */
  list(): Promise<UserPublic[]>;

  /**
   * Membuat akun baru. Email harus unik.
   * Melempar error kalau emailnya sudah dipakai.
   */
  create(input: CreateUserInput): Promise<UserPublic>;

  /** Mengganti hash password. Hashing dilakukan pemanggil, bukan di sini. */
  updatePasswordHash(id: string, passwordHash: string): Promise<void>;

  /**
   * Jumlah akun yang ada.
   *
   * Gunanya: mendeteksi instalasi baru. Kalau hasilnya 0, artinya belum ada
   * admin sama sekali dan Orang 3 bisa menampilkan halaman "buat admin
   * pertama" alih-alih halaman login yang tidak mungkin berhasil.
   */
  count(): Promise<number>;
}
