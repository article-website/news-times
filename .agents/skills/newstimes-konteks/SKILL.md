---
name: newstimes-konteks
description: Orientasi proyek NewsTimes — kondisi terkini, peta folder, siapa pegang apa, dan aturan yang berlaku. Pakai di awal setiap sesi kerja di repo ini, sebelum mengubah berkas apa pun, atau saat perlu tahu apa yang sudah jalan dan apa yang belum.
---

# Orientasi proyek NewsTimes

Jalankan langkah ini **sebelum** mengubah berkas apa pun di repo.

## 1. Baca kondisi terkini

Buka `STATUS.md` di root repo. Perhatikan:

- **Tanggal "Diperbarui"** di baris paling atas
- Tabel **Kondisi per bagian** dan **Yang belum jalan**
- Tabel **Perintah dan hasil terakhir**

**Kalau tanggalnya sudah lebih dari seminggu**, jangan langsung percaya. Jalankan ulang pengecekan
dengan skill `newstimes-verifikasi`, lalu perbarui `STATUS.md`.

## 2. Baca aturan

Buka `AGENTS.md`. Sembilan aturan di sana **selalu menang** atas aturan lain, termasuk aturan bawaan
ECC di `.claude/rules/ecc/`. Salinannya ada di `.agents/rules/newstimes.md`.

## 3. Pahami fakta yang paling sering disalahpahami

| Fakta | Akibatnya kalau diabaikan |
|---|---|
| Sejak PR #6 halaman publik memakai `articleRepo`; `src/data/articles.ts` hanya dibaca `seed-source.ts` | Agent mengira halaman masih memakai data tulisan tangan dan "memperbaiki" yang sudah benar |
| `/admin` = `page.tsx` (server) + `AdminArticlesClient.tsx` (`"use client"`) + `actions.ts` (`"use server"`) | Agent memanggil repository dari `AdminArticlesClient.tsx` — build gagal karena pagar `server-only`. Tulis lewat `actions.ts` |
| Belum ada login, tapi `/admin` **sudah** menulis ke database dan tautannya publik di footer | Siapa pun bisa menghapus artikel. Jangan menganggap situs siap deploy; setiap Server Action penulis data wajib memeriksa sesi begitu login ada |
| Next.js 16: `middleware.ts` sudah berganti nama jadi `proxy.ts` | Kode dari tutorial lama tidak berjalan |
| `npm run lint` di `main` sudah 1 error (`Footer.tsx:21`) sebelum kamu mengubah apa pun | Agent mengira perubahannya yang merusak |

## 4. Kenali peta dan wilayah

| Folder | Isinya | Pemilik |
|---|---|---|
| `prisma/` | Rancangan database, migrasi, seed | Orang 1 |
| `src/server/repositories/` | Satu-satunya jalan ke data | Orang 1 |
| `src/server/db/` | Sambungan database | Orang 1 |
| `src/app/` | Halaman | Orang 2 (publik), Orang 3 (`admin/`) |
| `src/components/` | Potongan tampilan | Orang 2 |
| `src/data/articles.ts` | Data contoh — **beku** | — |
| `docs/` | Dokumentasi | — |

Mengubah wilayah orang lain boleh, tapi PR-nya harus direview pemiliknya.

## 5. Tahu ke mana mencari detail

| Kebutuhan | Dokumen |
|---|---|
| Menaruh kode baru di mana | `docs/ARSITEKTUR.md` bagian 9 |
| Mengambil atau menyimpan data | `docs/DATABASE.md`, lalu skill `newstimes-akses-data` |
| Menyentuh login, input, atau data akun | `docs/KEAMANAN.md` |
| Pengecekan sebelum selesai | `docs/PENGUJIAN.md`, lalu skill `newstimes-verifikasi` |
| Apa pun yang menyentuh database produksi | `docs/DEPLOY.md` bagian 6 |

## Selesai orientasi kalau

Kamu bisa menjawab tiga pertanyaan ini tanpa menebak:

1. Bagian mana yang sudah jalan, dan mana yang belum?
2. Wilayah siapa yang akan kamu sentuh?
3. Pengecekan apa yang harus lulus sebelum pekerjaanmu boleh disebut selesai?
