<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

---

# BACA INI DULU — NewsTimes

Bagian ini ditulis tim, bukan oleh Next.js. Aman dari penulisan ulang `next dev`, yang hanya
menimpa blok di antara penanda BEGIN/END di atas.

**Kondisi proyek dan progres terkini ada di [STATUS.md](./STATUS.md).** Baca itu lebih dulu sebelum
mengubah apa pun — di situ ada apa yang sudah jalan, apa yang belum, dan hasil pengujian terakhir
beserta tanggalnya.

Kalau ada panduan lain di repo ini yang bertentangan dengan berkas ini, **berkas ini yang menang** —
lihat bagian setelah daftar aturan.

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

## Kalau aturan ECC bertabrakan dengan sembilan aturan di atas

Folder `.claude/` berisi konfigurasi agent dari [ECC](https://github.com/affaan-m/ecc). Isinya ikut
terbaca agent, termasuk 122 berkas aturan bawaan ECC di `.claude/rules/ecc/` yang **bukan
kesepakatan tim ini**.

**Sembilan aturan di atas selalu menang.** Aturan ECC diperlakukan sebagai bahan rujukan, bukan
kewajiban.

Tiga tabrakan yang sudah diketahui:

| Kata aturan ECC | Kondisi sebenarnya di proyek ini |
|---|---|
| "Minimum test coverage 80%, MANDATORY" | Belum ada satu pun test. Jangan menolak bekerja, dan jangan mengarang angka cakupan, karena aturan ini |
| "Panggil agent planner/tdd-guide/code-reviewer tanpa perlu diminta" | Tidak pernah disepakati tim. Jangan menjalankan agent berlapis tanpa diminta |
| `.claude/settings.json` mematikan baris `Co-Authored-By` | Terpasang mengikuti bawaan ECC, belum dibahas tim. Hapus berkas itu kalau tim tidak menghendakinya |

Kalau menurutmu sebuah aturan ECC memang lebih baik, usulkan ke tim lewat PR — jangan diam-diam
dipakai sebagai dasar mengubah kode.

## Dokumentasi

| Berkas | Isinya |
|---|---|
| [STATUS.md](./STATUS.md) | Progres terkini, hasil pengujian terakhir, keputusan yang menggantung |
| [docs/PRD.md](./docs/PRD.md) | Apa yang dibangun dan kenapa |
| [docs/RENCANA-KERJA.md](./docs/RENCANA-KERJA.md) | Siapa mengerjakan apa dan kapan |
| [docs/DATABASE.md](./docs/DATABASE.md) | Cara mengambil dan menyimpan data |
| [docs/PENJELASAN-UNTUK-PEMULA.md](./docs/PENJELASAN-UNTUK-PEMULA.md) | Penjelasan proyek dari nol — pakai ini kalau perlu menjelaskan sesuatu ke anggota tim yang masih pemula |
| [docs/LAPORAN-DATABASE.md](./docs/LAPORAN-DATABASE.md) | Laporan bagian database beserta alasan tiap keputusan |
| [docs/ARSITEKTUR.md](./docs/ARSITEKTUR.md) | Lapisan, arah ketergantungan, dan **bagian 9: di mana kode baru diletakkan** |
| [docs/KEAMANAN.md](./docs/KEAMANAN.md) | Temuan keamanan K-1 s.d. K-9 — baca sebelum menyentuh login, input, atau data akun |
| [docs/PENGUJIAN.md](./docs/PENGUJIAN.md) | Pengecekan mana yang wajib dijalankan sebelum menyatakan selesai |
| [docs/DEPLOY.md](./docs/DEPLOY.md) | Perintah yang **tidak boleh** dijalankan ke database produksi |
| [CONTRIBUTING.md](./CONTRIBUTING.md) | Alur branch, commit, dan PR |

Setelah menyelesaikan pekerjaan, perbarui `STATUS.md` — caranya ada di bagian bawah berkas itu.
