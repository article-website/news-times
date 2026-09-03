/**
 * Bentuk data akun admin.
 *
 * Sama seperti article.ts: murni tipe, tidak meng-import Prisma sama sekali.
 *
 * BATAS TANGGUNG JAWAB - penting dibaca Orang 3:
 *
 * Lapisan ini cuma menyimpan dan mengambil `passwordHash` apa adanya.
 * Dia TIDAK tahu dan TIDAK ikut menentukan:
 *   - algoritma hash yang dipakai (bcrypt? argon2? scrypt?)
 *   - berapa lama sesi berlaku
 *   - aturan kekuatan password
 *
 * Semua itu keputusan Orang 3 di src/server/auth/. Aku sengaja tidak
 * memutuskannya supaya tidak mengunci pilihanmu.
 *
 * Pemilik: Orang 1 (Database)
 */

export type UserRole = "ADMIN" | "EDITOR";

/**
 * Data user yang AMAN dikirim ke mana saja.
 * Perhatikan: tidak ada passwordHash di sini.
 */
export interface UserPublic {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: Date;
}

/**
 * Data user LENGKAP beserta hash password.
 *
 * Sengaja dipisah dari UserPublic supaya hash tidak ikut terbawa tanpa sengaja
 * ke komponen atau response API. Tipe ini cuma boleh dipakai di dalam
 * src/server/auth/ waktu mencocokkan password saat login.
 */
export interface UserWithSecret extends UserPublic {
  passwordHash: string;
}

export interface CreateUserInput {
  email: string;
  name: string;
  /** Sudah di-hash oleh pemanggil. Repository tidak melakukan hashing. */
  passwordHash: string;
  role?: UserRole;
}
