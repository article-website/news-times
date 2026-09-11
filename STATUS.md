# STATUS — NewsTimes

> **Diperbarui:** 11 September 2026 · **Kode aplikasi terakhir berubah di commit `f9f4ece`**
>
> Semua commit setelah `f9f4ece` isinya dokumentasi dan konfigurasi agent, bukan kode aplikasi.
> Karena itu seluruh hasil pengujian di bawah masih berlaku. Kalau ada commit yang mengubah isi
> `src/`, `prisma/`, atau `package.json`, jalankan ulang pengujiannya dan perbarui tanggal di atas.
>
> Berkas ini ditujukan untuk **manusia maupun AI agent** yang baru membuka repo ini. Bacalah ini
> lebih dulu sebelum mengubah apa pun. Cara memperbaruinya ada di bagian paling bawah.
>
> Isi berkas ini adalah kondisi yang **sudah diverifikasi dengan dijalankan**, bukan rencana. Yang
> belum diverifikasi ditulis apa adanya sebagai `NOT_RUN`.

---

## Baca 30 detik

NewsTimes adalah portal berita berbahasa Indonesia — satu aplikasi Next.js 16 (App Router,
TypeScript, Tailwind v4), database PostgreSQL di Neon lewat Prisma 7. Dikerjakan 5 orang sebagai
proyek magang. Tidak ada backend terpisah; semuanya satu repo, satu deploy.

**Inti kondisi sekarang:** lapisan datanya sudah jadi dan teruji, tapi **belum ada satu halaman pun
yang memakainya.** Seluruh halaman masih membaca 5 artikel yang ditulis tangan di
`src/data/articles.ts`. Jadi database sudah siap, tapi situsnya belum benar-benar memakai database.

---

## Kondisi per bagian

| Bagian | Status | Bukti / catatan |
|---|---|---|
| Lapisan data (schema, repository, seed) | **Selesai** | PR #2 digabung 5 Sep 2026; 151 pengecekan otomatis lulus |
| Tampilan publik | **Sebagian** | Halaman ada, tapi datanya masih dari `articles.ts`; 6 menu kategori masih `href="#"` |
| Halaman admin | **Sebagian** | `/admin` ada (PR #3), tapi menyimpan ke `localStorage`, bukan database |
| Login & penguncian `/admin` | **Belum** | Tabel `User` siap, sistemnya belum dibuat. Tautan `/admin` sudah publik di footer |
| Validasi & SEO | **Belum** | Belum ada Zod, sitemap, rss, robots, maupun metadata OG |
| Deploy & pengecekan otomatis | **Belum** | Tidak ada `.github/workflows/`, tidak ada `tests/`, `main` belum dikunci |
| Dokumentasi | **Selesai** | README, PRD, rencana kerja, panduan database, laporan database, dan berkas ini |

Mengacu ke jadwal di `docs/RENCANA-KERJA.md`, posisi tim ada di **Sprint 1 yang belum tuntas**.

---

## Yang sudah benar-benar jalan

- 5 tabel database (`Article`, `Category`, `Author`, `User`, `NewsletterSubscriber`) beserta
  migration dan seed
- Empat kumpulan fungsi akses data di `@/server/repositories`, masing-masing punya dua implementasi:
  data contoh (in-memory) dan Prisma. Ditukar lewat satu variabel di `.env.local`
- Halaman: `/`, `/articles`, `/articles/[slug]`, `/about`, `/admin`
- Alamat artikel yang salah menampilkan halaman "tidak ditemukan"

## Yang belum jalan

| Hal | Bukti di kode |
|---|---|
| Halaman belum memakai database | `src/app/page.tsx`, `src/app/articles/[slug]/page.tsx`, dan komponen masih `import { articles } from "@/data/articles"` |
| Menu kategori buntu | `src/components/Navbar.tsx` — enam menu masih `href: "#"` |
| Halaman kategori & pencarian | Belum ada berkasnya. Fungsi `articleRepo.listByCategory()` dan `.search()` sudah tersedia |
| Tombol "Muat Lebih Banyak" | Ada di `src/app/page.tsx:36`, diklik tidak melakukan apa-apa |
| Newsletter | `src/components/NewsletterForm.tsx:10` hanya memanggil `alert()` |
| Admin tidak menyimpan ke database | `src/app/admin/page.tsx` bertanda `"use client"` dan memakai `localStorage` |
| Tampilan loading & error | Belum ada `loading.tsx` maupun `error.tsx` di mana pun |
| Pengecekan otomatis | Tidak ada `.github/workflows/`; `npm run lint` masih 2 error sehingga CI akan langsung merah |
| Aturan "draft tidak bocor" belum diuji | Ditegakkan di `src/server/repositories/prisma-article-repository.ts:59-60`, tapi tidak ada skrip yang memeriksa sisi publik. Kalau baris itu rusak, 151 pengecekan tetap lulus — `docs/KEAMANAN.md` temuan K-9 |

---

## Aturan yang tidak boleh dilanggar

Berlaku untuk anggota tim maupun AI agent. Melanggar satu saja bisa merusak kerjaan orang lain.

1. **Halaman tidak boleh menyentuh database langsung.** Jangan pernah `import` Prisma dari dalam
   `src/app/`. Semua akses data lewat `@/server/repositories`. Kalau fungsinya belum ada, minta
   dibuatkan — jangan menulis query sendiri.
2. **`src/data/articles.ts` berstatus beku.** Masih dipakai beberapa halaman. Jangan diubah
   bentuknya; kalau perlu bentuk baru, pakai penerjemah di `src/server/data/seed-source.ts`.
3. **`prisma/schema.prisma` tidak boleh diubah sendirian.** Kode orang lain dibangun di atas bentuk
   data itu. Bahas dulu.
4. **`.env.local` tidak boleh di-commit.** Yang boleh ikut cuma `.env.example`.
5. **Jangan push langsung ke `main`.** Buat branch, buka PR, minta satu orang review. Aturan ini
   belum ditegakkan GitHub, jadi penegakannya masih bergantung pada disiplin sendiri.
6. **Satu orang satu wilayah.** Boleh mengubah folder orang lain, tapi PR-nya harus direview
   pemiliknya. Jangan memperbaiki kerjaan orang lain diam-diam.
7. **Gambar tidak masuk git.** Folder `public/` sudah 18 MB. Unggahan baru ke layanan penyimpanan.
8. **Usahakan PR di bawah 400 baris.**
9. **Status verifikasi hanya boleh `PASS`, `FAIL`, atau `NOT_RUN`.** Jangan pernah menulis `PASS`
   untuk perintah yang belum benar-benar dijalankan.

---

## Peta folder

```
prisma/                  schema, migration, seed          -> Orang 1
src/server/db/           sambungan database               -> Orang 1
src/server/repositories/ fungsi akses data (4 kumpulan)   -> Orang 1
src/server/domain/       bentuk data                      -> Orang 1
src/app/                 halaman
  admin/                 halaman redaksi                  -> Orang 3
src/components/          komponen tampilan                -> Orang 2
src/data/articles.ts     data contoh, BEKU
scripts/                 skrip verifikasi
docs/                    dokumentasi tim
.claude/                 konfigurasi Claude Code (ECC, profil minimal, tanpa hooks)
.agents/                 aturan, skill, dan alur kerja untuk agent selain Claude
```

---

## Siapa pegang apa

| Peran | Orang | Wilayah |
|---|---|---|
| Orang 1 — Database | `kvnlhm` | `prisma/`, `src/server/` |
| Orang 2 — Tampilan Publik | `azridalimunthe7` | `src/components/`, halaman publik |
| Orang 3 — Admin & Login | `fikarnugraha18` | `src/app/admin/` |
| Orang 4 — Validasi & SEO | **belum ada** | `src/lib/validation/`, `src/server/services/` |
| Orang 5 — Deploy & Testing | **belum ada** | `.github/workflows/`, `tests/`, `README.md` |

Anggota organisasi ada 5: `kvnlhm`, `azridalimunthe7`, `fikarnugraha18`, `astroceilo`,
`rizkikusnadi03`. Dua nama terakhir belum kebagian peran.

---

## Perintah dan hasil terakhir

Semuanya dijalankan **10 September 2026** pada commit `f9f4ece`.

| Perintah | Hasil terakhir |
|---|---|
| `npm run typecheck` | **PASS** |
| `npm run build` | **PASS** — 6 halaman |
| `npm run lint` | **2 error, 5 warning** — `src/components/Footer.tsx:21` dan `src/app/admin/page.tsx:23` |
| `npm run verify:repo` | **PASS** — 37 pengecekan, tidak butuh database |
| `npm run verify:compare` | **PASS** — 20 sama, 0 beda |
| `npm run verify:all` | **PASS** — 94 pengecekan, butuh database |
| `npm run db:migrate` / `db:seed` / `db:reset` | **NOT_RUN** sejak PR #3 masuk (terakhir PASS 5 Sep) |
| Pemeriksaan manual di browser | **NOT_RUN** sejak PR #3 masuk |

Menjalankan `verify:all` dan `verify:compare` butuh `.env.local` yang menunjuk ke database Neon.
`verify:repo` tidak butuh database sama sekali.

---

## Keputusan yang masih menggantung

Diurutkan dari yang paling berisiko. Daftar lengkap beserta alasannya ada di `docs/PRD.md` bagian 11.

1. Proyek ini komersial atau bukan — Vercel paket gratis melarang pemakaian komersial
2. Siapa Orang 4 dan Orang 5 — tanpa Orang 5, `main` tetap tidak terkunci
3. `/admin` disambungkan ke database atau dibiarkan `localStorage` dulu
4. Login harus jalan **sebelum** `/admin` menyentuh database, karena tautannya sudah publik di footer
5. Editor boleh apa, Admin boleh apa

---

## Kalau kamu baru memulai sesi

1. `git checkout main && git pull && npm install`
2. Baca `docs/PRD.md` (apa yang dibangun) dan `docs/DATABASE.md` (cara mengambil data)
3. Jalankan `npm run verify:repo` — kalau 37 lulus, lingkunganmu sehat
4. Buat branch sendiri, jangan bekerja di `main`
5. Sebelum menyatakan selesai: jalankan `typecheck`, `lint`, dan `build`, lalu laporkan hasilnya
   apa adanya

**Untuk AI agent:** jangan menyimpulkan status dari berkas ini saja kalau tanggal pembaruannya sudah
lama — verifikasi ulang dengan menjalankan perintah di tabel atas, lalu perbarui berkas ini.

---

## Dokumentasi lain

| Berkas | Isinya |
|---|---|
| `README.md` | Pintu depan repo: cara menjalankan, daftar perintah, struktur folder, aturan kerja |
| `docs/PENJELASAN-UNTUK-PEMULA.md` | Penjelasan proyek dari nol untuk yang baru mulai: cara kerja web, teknologi, konsep, alur git |
| `docs/PRD.md` | Apa yang dibangun dan kenapa: pengguna, lingkup, daftar kebutuhan ber-ID beserta statusnya |
| `docs/RENCANA-KERJA.md` | Siapa mengerjakan apa dan kapan: pembagian peran, jadwal 4 sprint, aturan tim |
| `docs/DATABASE.md` | Cara memakai fungsi akses data, lengkap dengan contoh kode per peran |
| `docs/LAPORAN-DATABASE.md` | Laporan bagian database: keputusan dan alasannya, bukti pengujian |
| `docs/presentasi/` | Slide laporan progres (14 slide) beserta skrip pembuatnya |
| `docs/ARSITEKTUR.md` | Lapisan sistem, keputusan arsitektur A-01 s.d. A-11, di mana kode baru diletakkan |
| `docs/KEAMANAN.md` | Audit keamanan: temuan K-1 s.d. K-9 beserta buktinya, syarat wajib sebelum deploy |
| `docs/PENGUJIAN.md` | Pengujian yang ada, celah terbesar, prioritas pengujian |
| `docs/DEPLOY.md` | Rencana deploy, variabel produksi, perintah yang boleh dan tidak boleh ke database produksi |
| `CONTRIBUTING.md` | Alur kerja dari branch sampai PR digabung |

---

## Cara memperbarui berkas ini

Perbarui setiap kali ada PR digabung, atau setiap kali status di tabel mana pun berubah.

1. Ganti tanggal dan nomor commit di bagian paling atas
2. Perbarui tabel **Kondisi per bagian** dan **Perintah dan hasil terakhir**
3. Tulis hasil apa adanya. Kalau sebuah perintah tidak dijalankan, tulis `NOT_RUN` beserta
   alasannya — jangan menyalin hasil lama seolah baru dijalankan
4. Pindahkan hal yang sudah selesai dari "Yang belum jalan" ke "Yang sudah benar-benar jalan",
   dan sertakan bukti di kode

Berkas ini sengaja pendek. Penjelasan panjang tempatnya di `docs/`, bukan di sini.
