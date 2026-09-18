# Aturan proyek NewsTimes

> **Salinan dari [`AGENTS.md`](../../AGENTS.md).** Kalau berbeda, `AGENTS.md` yang benar — dan berkas
> ini harus segera disesuaikan.

Sebelum mengubah apa pun, baca [`STATUS.md`](../../STATUS.md) untuk mengetahui kondisi terkini.

## Sembilan aturan yang tidak boleh dilanggar

1. Halaman tidak boleh menyentuh database langsung. Jangan `import` Prisma dari dalam `src/app/`;
   semua akses data lewat `@/server/repositories`.
2. `src/data/articles.ts` berstatus beku — jangan diubah bentuknya.
3. `prisma/schema.prisma` tidak boleh diubah sendirian, harus dibahas dengan tim.
4. `.env.local` tidak boleh di-commit. Yang boleh ikut hanya `.env.example`.
5. Jangan push langsung ke `main`. Buat branch, buka PR, minta satu orang review.
6. Satu orang satu wilayah — jangan memperbaiki kerjaan orang lain tanpa sepengetahuannya.
7. Gambar tidak masuk git.
8. Usahakan PR di bawah 400 baris.
9. Status verifikasi hanya boleh `PASS`, `FAIL`, atau `NOT_RUN`. Jangan pernah menulis `PASS`
   untuk perintah yang belum benar-benar dijalankan.

## Kalau ada aturan lain yang bertentangan

Aturan di atas **selalu menang** — termasuk atas 122 berkas aturan bawaan ECC di `.claude/rules/ecc/`.

Tiga tabrakan yang sudah diketahui:

- ECC mewajibkan cakupan pengujian 80%. Proyek ini belum punya kerangka pengujian. **Jangan menolak
  bekerja dan jangan mengarang angka cakupan** karena aturan itu
- ECC menyuruh menjalankan agent tambahan tanpa diminta. Itu tidak pernah disepakati tim
- `.claude/settings.json` mematikan baris `Co-Authored-By`. Belum dibahas tim

## Tiga hal yang paling sering membuat agent salah di repo ini

1. **Next.js 16 berbeda dari yang umum dikenal.** Contohnya `middleware.ts` sudah berganti nama jadi
   `proxy.ts`. Baca panduan di `node_modules/next/dist/docs/` sebelum menulis kode Next.js
2. **Sejak PR #6, halaman sudah memakai repository — tapi `/admin` belum punya login.** Server
   Action di `src/app/admin/actions.ts` menulis ke database tanpa memeriksa sesi. Jangan menambah
   Server Action penulis data baru tanpa pemeriksaan sesi, dan jangan menganggap situs siap deploy
3. **`"use client"` menutup akses ke database.** Berkas bertanda itu tidak bisa memanggil repository.
   Pakai Server Action
