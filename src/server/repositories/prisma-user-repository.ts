import "server-only";

import type {
  CreateUserInput,
  UserPublic,
  UserWithSecret,
} from "@/server/domain/user";
import { getPrisma } from "@/server/db/client";
import type { UserRepository } from "./user-repository";

/**
 * Implementasi UserRepository dengan Prisma.
 * Pemilik: Orang 1 (Database)
 */

/** Kolom aman - sengaja TANPA passwordHash. */
const publicSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
  createdAt: true,
} as const;

/** Email disimpan huruf kecil semua supaya pencarian konsisten. */
function normalkanEmail(email: string): string {
  return email.trim().toLowerCase();
}

export const prismaUserRepository: UserRepository = {
  async findByEmailWithSecret(email: string): Promise<UserWithSecret | null> {
    return getPrisma().user.findUnique({
      where: { email: normalkanEmail(email) },
      select: { ...publicSelect, passwordHash: true },
    });
  },

  async findById(id: string): Promise<UserPublic | null> {
    return getPrisma().user.findUnique({
      where: { id },
      select: publicSelect,
    });
  },

  async list(): Promise<UserPublic[]> {
    return getPrisma().user.findMany({
      select: publicSelect,
      orderBy: { createdAt: "asc" },
    });
  },

  async create(input: CreateUserInput): Promise<UserPublic> {
    return getPrisma().user.create({
      data: {
        email: normalkanEmail(input.email),
        name: input.name,
        passwordHash: input.passwordHash,
        role: input.role ?? "EDITOR",
      },
      select: publicSelect,
    });
  },

  async updatePasswordHash(id: string, passwordHash: string): Promise<void> {
    await getPrisma().user.update({
      where: { id },
      data: { passwordHash },
    });
  },

  async count(): Promise<number> {
    return getPrisma().user.count();
  },
};
