import "server-only";

import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "node:crypto";
import type { UserRole } from "@/server/domain/user";

export const SESSION_COOKIE_NAME = "newstimes_session";
const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60; // 7 hari

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

interface SessionPayload extends SessionUser {
  exp: number;
}

function getAuthSecret(): string {
  return process.env.AUTH_SECRET || "newstimes-dev-secret-key-please-replace-in-production";
}

function signPayload(payloadString: string): string {
  return createHmac("sha256", getAuthSecret()).update(payloadString).digest("base64url");
}

/**
 * Membuat token sesi yang ditandatangani HMAC-SHA256.
 */
export function createSessionToken(user: SessionUser): string {
  const payload: SessionPayload = {
    ...user,
    exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SECONDS,
  };

  const payloadString = Buffer.from(JSON.stringify(payload), "utf-8").toString("base64url");
  const signature = signPayload(payloadString);
  return `${payloadString}.${signature}`;
}

/**
 * Memvalidasi token sesi dan memverifikasi integritas tandatangan kriptografis.
 */
export function verifySessionToken(token: string): SessionUser | null {
  if (!token || typeof token !== "string") {
    return null;
  }

  const dotIndex = token.indexOf(".");
  if (dotIndex === -1) {
    return null;
  }

  const payloadString = token.slice(0, dotIndex);
  const signature = token.slice(dotIndex + 1);

  const expectedSignature = signPayload(payloadString);
  const sigBuffer = Buffer.from(signature);
  const expectedSigBuffer = Buffer.from(expectedSignature);

  if (sigBuffer.length !== expectedSigBuffer.length) {
    return null;
  }

  if (!timingSafeEqual(sigBuffer, expectedSigBuffer)) {
    return null;
  }

  try {
    const json = Buffer.from(payloadString, "base64url").toString("utf-8");
    const payload = JSON.parse(json) as SessionPayload;

    const nowInSeconds = Math.floor(Date.now() / 1000);
    if (!payload.exp || payload.exp < nowInSeconds) {
      return null;
    }

    return {
      id: payload.id,
      email: payload.email,
      name: payload.name,
      role: payload.role,
    };
  } catch {
    return null;
  }
}

/**
 * Menyimpan sesi login ke HTTP-only cookie.
 */
export async function createSession(user: SessionUser): Promise<void> {
  const token = createSessionToken(user);
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

/**
 * Mengambil sesi user yang sedang aktif dari cookie.
 */
export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(SESSION_COOKIE_NAME);
  if (!cookie?.value) {
    return null;
  }

  return verifySessionToken(cookie.value);
}

/**
 * Menghapus sesi login (logout).
 */
export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

/**
 * Memastikan pemanggil sudah login. Melempar error jika belum terautentikasi.
 * Digunakan untuk memproteksi Server Actions.
 */
export async function requireAuth(): Promise<SessionUser> {
  const session = await getSession();
  if (!session) {
    throw new Error("UNAUTHORIZED: Sesi login diperlukan untuk tindakan ini.");
  }
  return session;
}
