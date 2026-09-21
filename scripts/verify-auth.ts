/**
 * Skrip verifikasi sistem autentikasi NewsTimes.
 * Menguji hashing password (scrypt), verifikasi, pembuatan token sesi HMAC-SHA256,
 * dan perlindungan terhadap manipulasi/tampering.
 *
 * Jalankan: npx tsx scripts/verify-auth.ts
 */
import { hashPassword, verifyPassword } from "../src/server/auth/password";
import { createSessionToken, verifySessionToken } from "../src/server/auth/session";

let passed = 0;
let failed = 0;

function assert(description: string, condition: boolean) {
  if (condition) {
    passed++;
    console.log(`  PASS: ${description}`);
  } else {
    failed++;
    console.error(`  FAIL: ${description}`);
  }
}

console.log("\n=== Verifikasi Sistem Autentikasi NewsTimes ===\n");

// 1. Uji Hashing Password
console.log("-- Password Hashing (scrypt) --");
const rawPassword = "SuperSecretPassword123!";
const hash = hashPassword(rawPassword);

assert("format hash diawali 'scrypt:'", hash.startsWith("scrypt:"));
assert("hash memiliki 3 bagian (alg:salt:key)", hash.split(":").length === 3);
assert("dua hash dari password yang sama menghasilkan salt berbeda", hash !== hashPassword(rawPassword));

assert("password yang benar berhasil diverifikasi", verifyPassword(rawPassword, hash));
assert("password yang salah ditolak", !verifyPassword("SalahPassword123!", hash));
assert("password kosong ditolak", !verifyPassword("", hash));
assert("hash kosong ditolak", !verifyPassword(rawPassword, ""));
assert("hash manipulasi/rusak ditolak dengan aman", !verifyPassword(rawPassword, "scrypt:bad:bad"));

// 2. Uji Token Sesi HMAC-SHA256
console.log("\n-- Sesi & Token Kriptografi (HMAC-SHA256) --");
const dummyUser = {
  id: "test-user-1",
  email: "admin@newstimes.id",
  name: "Administrator",
  role: "ADMIN" as const,
};

const token = createSessionToken(dummyUser);
assert("token sesi memiliki format payload.signature", token.includes("."));

const session = verifySessionToken(token);
assert("token valid berhasil didekode", session !== null);
assert("id user sesuai", session?.id === dummyUser.id);
assert("email user sesuai", session?.email === dummyUser.email);
assert("role user sesuai", session?.role === dummyUser.role);

// 3. Uji Keamanan: Tampering
const [payloadPart, sigPart] = token.split(".");
const tamperedPayload = Buffer.from(
  JSON.stringify({ ...dummyUser, role: "SUPERADMIN", exp: Math.floor(Date.now() / 1000) + 3600 }),
).toString("base64url");
const tamperedToken = `${tamperedPayload}.${sigPart}`;
assert("token yang diubah isinya (tampered) ditolak", verifySessionToken(tamperedToken) === null);

const forgedToken = `${payloadPart}.invalidsignature123`;
assert("token dengan tandatangan palsu ditolak", verifySessionToken(forgedToken) === null);

console.log("\n==============================================");
console.log(`  LULUS : ${passed}`);
console.log(`  GAGAL : ${failed}`);
console.log("==============================================\n");

if (failed > 0) {
  process.exit(1);
}
