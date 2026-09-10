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

## Dokumentasi

| Berkas | Isinya |
|---|---|
| [STATUS.md](./STATUS.md) | Progres terkini, hasil pengujian terakhir, keputusan yang menggantung |
| [docs/PRD.md](./docs/PRD.md) | Apa yang dibangun dan kenapa |
| [docs/RENCANA-KERJA.md](./docs/RENCANA-KERJA.md) | Siapa mengerjakan apa dan kapan |
| [docs/DATABASE.md](./docs/DATABASE.md) | Cara mengambil dan menyimpan data |
| [docs/LAPORAN-DATABASE.md](./docs/LAPORAN-DATABASE.md) | Laporan bagian database beserta alasan tiap keputusan |

Setelah menyelesaikan pekerjaan, perbarui `STATUS.md` — caranya ada di bagian bawah berkas itu.
