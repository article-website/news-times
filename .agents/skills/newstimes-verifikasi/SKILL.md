---
name: newstimes-verifikasi
description: Menjalankan pengecekan proyek NewsTimes (typecheck, lint, build, skrip verify) dan melaporkan hasilnya dengan status PASS, FAIL, atau NOT_RUN. Pakai sebelum menyatakan pekerjaan selesai, sebelum commit, sebelum membuka pull request, atau saat STATUS.md sudah lama tidak diperbarui.
---

# Verifikasi pekerjaan di NewsTimes

## Aturan pelaporan

Status yang sah **hanya tiga**:

| Status | Artinya |
|---|---|
| `PASS` | Sudah dijalankan, dan berhasil |
| `FAIL` | Sudah dijalankan, dan gagal |
| `NOT_RUN` | Belum dijalankan — **wajib disertai alasan** |

**Jangan pernah menulis `PASS` untuk perintah yang tidak kamu jalankan.** Jangan pula menyalin hasil
lama dari `STATUS.md` seolah baru dijalankan.

## Langkah 1 — Pengecekan dasar

Selalu jalankan keempatnya:

```bash
npm run typecheck
npm run lint
npm run build
npm run verify:repo
```

`verify:repo` tidak butuh database dan harus menghasilkan **37 lulus**.

## Langkah 2 — Pengecekan sesuai jenis perubahan

| Kalau yang diubah | Jalankan juga |
|---|---|
| Berkas di `src/server/repositories/` | `npm run verify:compare` (harus 0 beda) dan `npm run verify:all` |
| `prisma/schema.prisma` | `npm run db:migrate`, lalu `npm run verify:all` |
| Halaman atau komponen | Buka halamannya di browser — atau tulis `NOT_RUN` kalau tidak bisa |

`verify:compare` dan `verify:all` **butuh database**. Kalau `.env.local` tidak berisi `DATABASE_URL`
yang valid, laporkan sebagai `NOT_RUN — tidak ada database`, bukan `FAIL`.

## Langkah 3 — Bandingkan dengan kondisi awal

Beberapa hal **sudah gagal sebelum kamu mulai**. Per 11 September 2026:

| Perintah | Kondisi awal di `main` |
|---|---|
| `npm run lint` | 2 error — `src/components/Footer.tsx:21` dan `src/app/admin/page.tsx:23` |

Kalau hanya dua error itu yang muncul, perubahanmu tidak menambah masalah — laporkan apa adanya dan
sebutkan bahwa keduanya bawaan. Kalau ada error **baru**, itu tanggung jawab perubahanmu.

Kondisi awal terbaru selalu ada di `STATUS.md`, tabel **Perintah dan hasil terakhir**.

## Langkah 4 — Laporkan

Format di deskripsi PR atau laporan akhir:

```
npm run typecheck      PASS
npm run lint           FAIL — 2 error, keduanya sudah ada di main sebelum perubahan ini
npm run build          PASS — 6 halaman
npm run verify:repo    PASS — 37
npm run verify:all     NOT_RUN — tidak ada database di lingkungan ini
```

## Celah yang perlu diketahui

Aturan **"draft tidak bocor"** diuji 12 pengecekan di `npm run verify:all` — tapi **hanya kalau ada
database**. Kalau perubahanmu menyentuh `src/server/repositories/prisma-article-repository.ts` dan
kamu tidak bisa menjalankan `verify:all`, laporkan `NOT_RUN` dan periksa manual bahwa kondisi ini
tetap ada:

```ts
status: "PUBLISHED" as const,
publishedAt: { not: null, lte: new Date() },
```

## Setelah verifikasi

Kalau hasilnya mengubah sesuatu yang tercatat di `STATUS.md`, pakai skill `newstimes-perbarui-status`.
