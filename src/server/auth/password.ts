import { scryptSync, randomBytes, timingSafeEqual } from "node:crypto";

const KEY_LENGTH = 64;

/**
 * Melakukan hashing kata sandi menggunakan algoritma scrypt.
 * scrypt aman terhadap serangan ASIC/GPU hardware.
 * Format tersimpan: scrypt:<salt_hex>:<derived_key_hex>
 */
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = scryptSync(password, salt, KEY_LENGTH);
  return `scrypt:${salt}:${derivedKey.toString("hex")}`;
}

/**
 * Memverifikasi apakah kata sandi cocok dengan hash yang tersimpan di database/repository.
 * Menggunakan timingSafeEqual untuk mencegah serangan side-channel timing attack.
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  if (!password || !storedHash) {
    return false;
  }

  const parts = storedHash.split(":");
  if (parts.length !== 3 || parts[0] !== "scrypt") {
    return false;
  }

  const [, salt, expectedHex] = parts;
  try {
    const expectedBuffer = Buffer.from(expectedHex, "hex");
    const actualBuffer = scryptSync(password, salt, expectedBuffer.length);

    if (actualBuffer.length !== expectedBuffer.length) {
      return false;
    }

    return timingSafeEqual(actualBuffer, expectedBuffer);
  } catch {
    return false;
  }
}
