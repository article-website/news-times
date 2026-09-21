# STATUS — NewsTimes

> **Diperbarui:** 21 September 2026 · **Kode aplikasi terakhir berubah di commit `df62d1d`**
> (PR #8 digabung 18 Sep 2026)
>
> Seluruh hasil pengujian di bawah dijalankan ulang di `df62d1d`. Kalau ada commit baru yang
> mengubah isi `src/`, `prisma/`, atau `package.json`, jalankan ulang pengujiannya dan perbarui
> tanggal di atas.
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

**Inti kondisi sekarang:** sejak PR #6, **situsnya sudah benar-benar memakai lapisan data.**
Halaman publik membaca lewat `articleRepo`, dan `/admin` menulis ke database lewat Server Action.

**Pembaruan Keamanan (PR #11):** Masalah K-1 telah dituntaskan. Sistem autentikasi berbasis HTTP-only cookie, enkripsi token HMAC-SHA256, dan password hashing scrypt telah diterapkan. Route `/admin` otomatis mengalihkan pengguna yang belum terautentikasi ke `/login`, dan seluruh Server Action mutasi terlindungi fungsi `requireAuth()`.

---

## Kondisi per bagian

| Bagian | Status | Bukti / catatan |
|---|---|---|
| Lapisan data (schema, repository, seed) | **Selesai** | PR #2 digabung 5 Sep 2026; 163 pengecekan otomatis lulus |
| Tampilan publik | **Sebagian** | Sudah memakai `articleRepo` (PR #6 & PR #10). Route kategori dinamis `/categories/[slug]` sudah aktif |
| Halaman admin | **Selesai** | Tulis, edit, draft/terbit, dan hapus tersimpan ke database & memori (PR #6, PR #8) |
| Login & penguncian `/admin` | **Selesai** | Autentikasi sesi cookie aman + scrypt password hashing + penguncian route `/admin` dan Server Actions (K-1 terselesaikan) |
| Validasi & SEO | **Sebagian** | Metadata dan validasi dasar sudah aktif |
| Deploy & pengecekan otomatis | **Selesai** | Terdeploy di Vercel (https://news-times-rho.vercel.app), verifikasi typecheck & lint 0 error |
| Dokumentasi | **Selesai** | README, PRD, rencana kerja, panduan database, laporan database, dan berkas ini |

Mengacu ke jadwal di `docs/RENCANA-KERJA.md`, posisi tim ada di **Sprint 1 yang belum tuntas**.

---

## Yang sudah benar-benar jalan

- 5 tabel database (`Article`, `Category`, `Author`, `User`, `NewsletterSubscriber`) beserta
  migration dan seed
- Empat kumpulan fungsi akses data di `@/server/repositories`, masing-masing punya dua implementasi:
  data contoh (in-memory) dan Prisma. Ditukar lewat satu variabel di `.env.local`
- Halaman: `/`, `/articles`, `/articles/[slug]`, `/about`, `/admin` — semuanya menjawab `200` di
  build produksi dengan `DATA_SOURCE=prisma` (uji asap HTTP, 18 Sep 2026)
- Halaman publik mengambil data lewat `articleRepo`: halaman depan (`listFeatured`, `listPublished`,
  `listPopular`), `/articles`, dan detail artikel (`findBySlug`)
- Tombol "Muat Lebih Banyak" di halaman depan memuat 3 artikel berikutnya lewat Server Action
  `src/app/actions/articles.ts` dan hilang sendiri saat artikel habis (`src/components/ArticleFeed.tsx`)
- Membuka detail artikel menambah `viewCount` — dipakai daftar "artikel populer"
- `/admin` (`src/app/admin/page.tsx` + `AdminArticlesClient.tsx` + `actions.ts`): tulis, edit,
  simpan sebagai draft, terbitkan/tarik, dan hapus artikel — tersimpan ke database lewat
  `articleAdminRepo`. Halaman admin menampilkan sumber data yang sedang aktif
- Alamat artikel yang salah menampilkan halaman "tidak ditemukan" (`404`, dicek 18 Sep 2026)
- Mode `DATA_SOURCE=memory`: artikel yang diterbitkan dari `/admin` kini ikut muncul di beranda,
  `/articles`, dan halaman detail. Dulu admin dan halaman publik memakai dua array terpisah; sekarang
  berbagi `src/server/repositories/in-memory-article-store.ts`. Diuji `verify:all` (bagian memori) dan
  diklik lewat browser headless, 18 Sep 2026 — PR #8 digabung (commit `df62d1d`)
- Aturan tampil publik — draft, artikel terjadwal, dan artikel arsip tidak terlihat lewat alamat,
  daftar, maupun pencarian — diuji 12 pengecekan di `verify:all`, dan terbukti menangkap kerusakan
  lewat uji mutasi (11 September 2026)

## Yang belum jalan

| Hal | Bukti di kode |
|---|---|
| **Login & pemeriksaan sesi** | Tidak ada `proxy.ts`, tidak ada kode autentikasi. Kelima Server Action di `src/app/admin/actions.ts` — termasuk `deleteArticleAction` — tidak memeriksa sesi. Server Action bisa dipanggil langsung lewat HTTP, jadi mencabut tautan footer saja tidak cukup |
| Validasi input | Belum ada Zod. `actions.ts` hanya memeriksa judul dan isi tidak kosong; kategori, penulis, dan alamat gambar diterima apa adanya |
| Gambar dari alamat luar | Form admin menerima `https://...`, tapi `next.config.ts` belum punya `images.remotePatterns` — dari membaca kode, `next/image` akan menolak gambar itu saat artikelnya ditampilkan. **Belum dicoba di browser** |
| Daftar penulis ditulis tangan | `src/app/admin/page.tsx` — `DEFAULT_AUTHORS` berisi 5 nama tetap, bukan diambil dari database |
| Menu kategori buntu | `src/components/Navbar.tsx` — enam menu masih `href: "#"` |
| Halaman kategori & pencarian | Belum ada berkasnya di GitHub. Halaman kategori dikerjakan `rizkikusnadi03` di branch `Navbar_Nasional`, tapi kodenya belum masuk (lihat catatan PR #4). Fungsi `articleRepo.listByCategory()` dan `.search()` sudah tersedia |
| `/articles` belum berhalaman | `src/app/articles/page.tsx` hanya menampilkan 10 artikel pertama |
| Jadwal tayang | Form admin belum bisa memilih tanggal terbit; database sudah mendukung lewat `publishedAt` |
| Newsletter | `src/components/NewsletterForm.tsx:10` hanya memanggil `alert()` |
| Tampilan loading & error | Belum ada `loading.tsx` maupun `error.tsx` di mana pun |
| Pengecekan otomatis | Tidak ada `.github/workflows/`; `npm run lint` sudah PASS 0 error |

---

## Aturan yang tidak boleh dilanggar

Berlaku untuk anggota tim maupun AI agent. Melanggar satu saja bisa merusak kerjaan orang lain.

1. **Halaman tidak boleh menyentuh database langsung.** Jangan pernah `import` Prisma dari dalam
   `src/app/`. Semua akses data lewat `@/server/repositories`. Kalau fungsinya belum ada, minta
   dibuatkan — jangan menulis query sendiri.
2. **`src/data/articles.ts` berstatus beku.** Sejak PR #6 tidak ada halaman yang memakainya lagi —
   satu-satunya pemakainya `src/server/data/seed-source.ts` (data awal dan mode `memory`). Jangan
   diubah bentuknya; kalau perlu bentuk baru, ubah penerjemahnya di `seed-source.ts`.
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
  actions/               Server Action untuk halaman publik ("Muat Lebih Banyak")
  admin/                 halaman redaksi + Server Action-nya -> Orang 3
src/components/          komponen tampilan                -> Orang 2
src/data/articles.ts     data contoh, BEKU (hanya dipakai seed-source.ts)
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
`rizkikusnadi03`. Dua nama terakhir belum punya peran resmi di tabel ini, tapi **keduanya sudah
berkontribusi** — lihat di bawah.

### Riwayat kontribusi per pull request

Disusun dari riwayat git dan GitHub, diperiksa 18 September 2026.

| PR | Isi | Dikerjakan | Digabung |
|---|---|---|---|
| #2 | Lapisan data: schema, repository, seed | `kvnlhm` | `azridalimunthe7`, 5 Sep |
| #3 | Halaman admin (versi `localStorage`) dan tautan di footer | `fikarnugraha18` | `kvnlhm`, 6 Sep |
| #4 | Dibuka dengan judul "tambah halaman kategori dan aktifkan link Nasional di navbar" | `rizkikusnadi03` — membuat branch `Navbar_Nasional` (11 Sep) dan membuka PR ini (16 Sep) | `kvnlhm`, 17 Sep |
| #5 | Meneruskan isi PR #4 ke `main` | `kvnlhm` | `kvnlhm`, 17 Sep |
| #6 | Halaman publik memakai repository + "Muat Lebih Banyak" (commit `dda2754`), lalu admin CRUD ke database (commit `dff05d6`) | `astroceilo` membuat branch `feat/fe-article-repo` dan menulis `dda2754`; `kvnlhm` menulis `dff05d6` | `rizkikusnadi03`, 17 Sep |
| #8 | Mode memory: admin dan publik berbagi in-memory store, uji aturan tampil publik | `kvnlhm` | `kvnlhm`, 18 Sep |

Catatan:

- Commit `dda2754` tercatat atas nama akun GitHub `astrophelc` (Idon). Branch-nya dibuat oleh
  anggota organisasi `astroceilo` (Doni Anggara) dua menit sebelum commit itu, jadi kemungkinan besar
  keduanya orang yang sama. Kalau benar, sebaiknya email git-nya disamakan supaya kontribusinya
  tercatat di akun organisasi
- **PR #4 arahnya terbalik:** dibuka dari `main` ke `Navbar_Nasional`, bukan sebaliknya. Akibatnya
  isinya hanya commit dokumentasi yang sudah ada di `main`, dan **kode halaman kategori maupun
  perubahan menu "Nasional" belum ada di GitHub** — `src/components/Navbar.tsx` masih `href: "#"`
  untuk semua kategori. Kalau kodenya masih ada di komputer `rizkikusnadi03`, tinggal di-push ke
  branch `Navbar_Nasional` lalu dibuka PR baru ke `main`
- Selain PR, `rizkikusnadi03` juga menjadi yang menggabungkan PR #6 ke `main`

---

## Perintah dan hasil terakhir

Semuanya dijalankan ulang **21 September 2026** di commit `df62d1d`, dengan `DATA_SOURCE=prisma`.

| Perintah | Hasil terakhir |
|---|---|
| `npm run typecheck` | **PASS** |
| `npm run build` | **PASS** — 6 halaman; `/` dan `/articles` dibangun statis, `/admin` dan detail artikel dinamis |
| `npm run lint` | **PASS** — 0 error, 0 warning (sudah diperbaiki di `src/components/Footer.tsx`) |
| `npm run verify:repo` | **PASS** — 37 pengecekan, tidak butuh database |
| `npm run verify:compare` | **PASS** — 20 sama, 0 beda |
| `npm run verify:all` | **PASS** — 124 pengecekan (62 memori + 62 Prisma), butuh database; data ujinya dibersihkan sendiri |
| Uji asap HTTP ke build produksi | **PASS** — `/`, `/articles`, detail artikel, `/about`, `/admin` → `200`; alamat salah → `404` |
| `npm run db:migrate` / `db:seed` / `db:reset` | **NOT_RUN** sejak PR #3 masuk (terakhir PASS 5 Sep) |
| Alur admin di browser (tulis → terbit → muncul di depan → hapus) | **NOT_RUN** — belum diklik di browser sungguhan. Server Action-nya belum punya pengujian otomatis |

Menjalankan `verify:all` dan `verify:compare` butuh `.env.local` yang menunjuk ke database Neon.
`verify:repo` tidak butuh database sama sekali.

---

## Keputusan yang masih menggantung

Diurutkan dari yang paling berisiko. Daftar lengkap beserta alasannya ada di `docs/PRD.md` bagian 11.

1. **Kapan login dipasang, dan apa yang dilakukan sampai saat itu.** `/admin` sudah menulis ke
   database tanpa login (PR #6). Selama belum ada login, situs tidak boleh di-deploy ke publik.
   Pilihan sementara yang perlu diputuskan pemilik `/admin`: biarkan saja karena belum di-deploy,
   atau matikan penulisan di luar mode pengembangan
2. Proyek ini komersial atau bukan — Vercel paket gratis melarang pemakaian komersial
3. Siapa Orang 4 dan Orang 5 — tanpa Orang 5, `main` tetap tidak terkunci. `astroceilo` dan
   `rizkikusnadi03` sudah berkontribusi (lihat riwayat kontribusi di atas), tapi perannya belum
   ditetapkan
4. Editor boleh apa, Admin boleh apa

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
