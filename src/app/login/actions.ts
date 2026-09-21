"use server";

import { redirect } from "next/navigation";
import { userRepo } from "@/server/repositories";
import { hashPassword, verifyPassword, createSession, destroySession } from "@/server/auth";

export interface AuthActionResult {
  ok: boolean;
  error?: string;
}

export async function loginAction(formData: FormData): Promise<AuthActionResult> {
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = (formData.get("password") as string)?.trim();

  if (!email || !password) {
    return { ok: false, error: "Email dan kata sandi wajib diisi." };
  }

  try {
    const user = await userRepo.findByEmailWithSecret(email);
    if (!user) {
      // Respons pesan seragam untuk mencegah enumerasi email
      return { ok: false, error: "Email atau kata sandi salah." };
    }

    const isMatch = verifyPassword(password, user.passwordHash);
    if (!isMatch) {
      return { ok: false, error: "Email atau kata sandi salah." };
    }

    await createSession({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    return { ok: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Terjadi kesalahan saat proses login.";
    return { ok: false, error: message };
  }
}

export async function setupFirstAdminAction(formData: FormData): Promise<AuthActionResult> {
  const count = await userRepo.count();
  if (count > 0) {
    return { ok: false, error: "Admin sudah terdaftar. Silakan login menggunakan akun yang ada." };
  }

  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = (formData.get("password") as string)?.trim();
  const confirmPassword = (formData.get("confirmPassword") as string)?.trim();

  if (!name || name.length < 2) {
    return { ok: false, error: "Nama admin minimal 2 karakter." };
  }

  if (!email || !email.includes("@")) {
    return { ok: false, error: "Alamat email tidak valid." };
  }

  if (!password || password.length < 6) {
    return { ok: false, error: "Kata sandi minimal 6 karakter." };
  }

  if (password !== confirmPassword) {
    return { ok: false, error: "Konfirmasi kata sandi tidak cocok." };
  }

  try {
    const passwordHash = hashPassword(password);
    const createdUser = await userRepo.create({
      name,
      email,
      passwordHash,
      role: "ADMIN",
    });

    await createSession(createdUser);
    return { ok: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gagal membuat akun admin pertama.";
    return { ok: false, error: message };
  }
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/login");
}
