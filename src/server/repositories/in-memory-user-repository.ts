import type {
  CreateUserInput,
  UserPublic,
  UserWithSecret,
} from "@/server/domain/user";
import type { UserRepository } from "./user-repository";

/**
 * Versi data contoh UserRepository, isinya array di memori.
 *
 * Sengaja dimulai KOSONG - tidak ada akun bawaan sama sekali.
 *
 * Kenapa? Karena akun bawaan dengan password yang bisa ditebak itu pintu
 * belakang. Kalau nanti tidak sengaja ikut ke produksi, siapa pun yang pernah
 * baca kode ini bisa masuk sebagai admin.
 *
 * Jadi Orang 3, buat akun pertamamu lewat kode, bukan lewat data bawaan:
 *
 *   if (await userRepo.count() === 0) {
 *     // tampilkan halaman "buat admin pertama"
 *   }
 *
 * Pemilik: Orang 1 (Database)
 */

function normalkanEmail(email: string): string {
  return email.trim().toLowerCase();
}

/** Kunci di Map = email yang sudah dinormalkan. */
const users = new Map<string, UserWithSecret>();

let urutan = 0;

function tanpaRahasia(u: UserWithSecret): UserPublic {
  // Sengaja disalin field per field, bukan pakai spread lalu hapus.
  // Kalau nanti ada field rahasia baru, cara ini tidak diam-diam membocorkannya.
  return {
    id: u.id,
    email: u.email,
    name: u.name,
    role: u.role,
    createdAt: u.createdAt,
  };
}

export const inMemoryUserRepository: UserRepository = {
  async findByEmailWithSecret(email) {
    return users.get(normalkanEmail(email)) ?? null;
  },

  async findById(id) {
    for (const u of users.values()) {
      if (u.id === id) return tanpaRahasia(u);
    }
    return null;
  },

  async list() {
    return [...users.values()]
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
      .map(tanpaRahasia);
  },

  async create(input: CreateUserInput) {
    const email = normalkanEmail(input.email);

    if (users.has(email)) {
      // Pesan errornya disamakan dengan yang dilempar Prisma,
      // supaya perilaku dua implementasi ini tetap sama.
      throw new Error(`Email "${email}" sudah dipakai.`);
    }

    const baru: UserWithSecret = {
      id: `mem-user-${++urutan}`,
      email,
      name: input.name,
      passwordHash: input.passwordHash,
      role: input.role ?? "EDITOR",
      createdAt: new Date(),
    };

    users.set(email, baru);
    return tanpaRahasia(baru);
  },

  async updatePasswordHash(id, passwordHash) {
    for (const u of users.values()) {
      if (u.id === id) {
        u.passwordHash = passwordHash;
        return;
      }
    }
    throw new Error(`User dengan id "${id}" tidak ditemukan.`);
  },

  async count() {
    return users.size;
  },
};
