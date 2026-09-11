---
description: Menyambungkan halaman ke data atau menambah fungsi pengambil data di NewsTimes lewat src/server/repositories.
---

# Akses Data

Versi ringkas. Langkah lengkap beserta alasannya ada di `.agents/skills/newstimes-akses-data/SKILL.md` —
baca itu kalau ada langkah yang tidak jelas.

1. Pilih repository yang benar: `articleRepo` untuk halaman publik, `articleAdminRepo` hanya untuk redaksi
2. Halaman: tambahkan `async` pada fungsinya dan `await` pada setiap pemanggilan
3. Berkas `"use client"` tidak bisa memanggil repository — pakai Server Action
4. Fungsi baru: ubah kontrak, versi data contoh, **dan** versi Prisma, lalu tambahkan ke `scripts/compare-repositories.ts`
5. Pastikan `grep -rn "generated/prisma|server/db|@prisma/client" src/app src/components` kosong
