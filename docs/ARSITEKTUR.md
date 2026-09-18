# Arsitektur NewsTimes

> **Diperbarui:** 18 September 2026 · kondisi `main` di commit `5a28131` (setelah PR #6)
>
> Dokumen ini menjelaskan **bentuk sistemnya**: lapisan apa saja, siapa boleh bergantung pada siapa,
> keputusan apa yang sudah diambil beserta alasannya, dan di mana kode baru harus diletakkan.
>
> Setiap klaim di sini diperiksa langsung ke kode. Yang masih berupa rencana ditandai **(rencana)**.
>
> Kalau kamu belum familiar dengan istilah seperti server, repository, atau `"use client"`, baca
> [PENJELASAN-UNTUK-PEMULA.md](./PENJELASAN-UNTUK-PEMULA.md) dulu.

---

## Daftar isi

1. [Ringkasan](#1-ringkasan)
2. [Gambaran sistem](#2-gambaran-sistem)
3. [Lapisan dan arah ketergantungan](#3-lapisan-dan-arah-ketergantungan)
4. [Batas server dan browser](#4-batas-server-dan-browser)
5. [Sakelar sumber data](#5-sakelar-sumber-data)
6. [Keputusan arsitektur](#6-keputusan-arsitektur)
7. [Arsitektur sekarang vs arsitektur tujuan](#7-arsitektur-sekarang-vs-arsitektur-tujuan)
8. [Titik rawan yang perlu diketahui](#8-titik-rawan-yang-perlu-diketahui)
9. [Mau menambah sesuatu? Taruh di sini](#9-mau-menambah-sesuatu-taruh-di-sini)

---

## 1. Ringkasan

NewsTimes adalah **satu aplikasi Next.js 16** (monolith) yang menyimpan data di **PostgreSQL** lewat
**Prisma 7**. Tidak ada backend terpisah.

Inti arsitekturnya satu aturan: **halaman tidak pernah menyentuh database secara langsung.** Semua
akses data lewat empat kumpulan fungsi di `src/server/repositories/`, dan masing-masing punya dua
implementasi — data contoh dan database sungguhan — yang hasilnya sudah dibuktikan sama persis.

Aturan itu **ditaati** di kode sekarang: tidak ada satu berkas pun di `src/app/` maupun
`src/components/` yang meng-import Prisma atau sambungan database.

---

## 2. Gambaran sistem

```
┌──────────────┐        HTTP         ┌───────────────────────────────────────────────┐
│   Browser    │ ──────────────────► │  Next.js 16  (rencana: di Vercel)             │
│  pengunjung  │ ◄────────────────── │                                               │
└──────────────┘                     │  src/app/          halaman (server)           │
                                     │  src/components/   potongan tampilan          │
                                     │        │                                      │
                                     │        ▼  memanggil                           │
                                     │  src/server/repositories/   [server-only]     │
                                     │        │                                      │
                                     │        ├── DATA_SOURCE=memory                 │
                                     │        │     └─► seed-source.ts               │
                                     │        │           └─► data/articles.ts (beku)│
                                     │        │                                      │
                                     │        └── DATA_SOURCE=prisma                 │
                                     │              └─► src/server/db/client.ts      │
                                     └──────────────────────┼────────────────────────┘
                                                            │  TCP + SSL
                                                            ▼
                                              ┌───────────────────────────┐
                                              │  PostgreSQL di Neon       │
                                              │  (Singapura)              │
                                              └───────────────────────────┘
```

Layanan eksternal yang **direncanakan** tapi belum terpasang: Vercel (hosting), Vercel Blob (gambar),
Auth.js (login), GitHub Actions (pengecekan otomatis).

---

## 3. Lapisan dan arah ketergantungan

Ketergantungan hanya boleh mengalir **ke bawah**. Lapisan bawah tidak boleh tahu lapisan atasnya.

| # | Lapisan | Folder | Boleh bergantung pada | **Tidak boleh** bergantung pada |
|---|---|---|---|---|
| 1 | Halaman | `src/app/` | komponen, repositories | Prisma, `src/server/db/` |
| 2 | Komponen | `src/components/` | tipe data | Prisma, `src/server/db/` |
| 3 | Akses data | `src/server/repositories/` | domain, db, `src/server/data/` | halaman, komponen |
| 4 | Bentuk data | `src/server/domain/` | — (murni tipe) | apa pun |
| 5 | Sambungan | `src/server/db/` | Prisma hasil generate | apa pun di atasnya |

**Pola yang dipakai sekarang untuk komponen:** komponen menerima data lewat *props* dari halaman,
bukan mengambil sendiri. Contoh: halaman depan mengambil artikel, lalu memberikannya ke
`<HeroFeatured articles={featured} />`. Pola ini membuat komponen mudah dipakai ulang dan mudah diuji.

### Cara memeriksa aturan ini ditaati

```bash
grep -rn "generated/prisma\|server/db\|@prisma/client" src/app src/components
```

Hasil yang benar: **kosong**. Per 18 September 2026 (setelah PR #6): kosong.

---

## 4. Batas server dan browser

Di Next.js, kode berjalan di **server** secara bawaan. Sebuah berkas pindah ke browser kalau baris
pertamanya `"use client"` — dan semua yang ia import ikut terbawa ke browser.

### Berkas yang berjalan di browser saat ini

| Berkas | Kenapa perlu di browser |
|---|---|
| `src/components/Navbar.tsx` | `usePathname()` untuk menandai menu yang sedang aktif |
| `src/components/HeroFeatured.tsx` | Slider artikel unggulan: `useState` dan tombol maju/mundur |
| `src/components/NewsletterForm.tsx` | `useState` dan `onSubmit` untuk form email |
| `src/components/ArticleFeed.tsx` | Tombol "Muat Lebih Banyak": menyimpan daftar yang sudah dimuat dan memanggil Server Action |
| `src/app/admin/AdminArticlesClient.tsx` | Form dan tabel redaksi. Halamannya sendiri (`admin/page.tsx`) tetap di server |

### Server Action

Berkas bertanda `"use server"` berisi fungsi yang **dipanggil dari browser tapi dijalankan di
server**. Dari sanalah repository boleh dipanggil untuk menulis data.

| Berkas | Fungsi | Dipakai oleh |
|---|---|---|
| `src/app/actions/articles.ts` | `loadMoreArticles(page)` — hanya membaca, lewat `articleRepo` | `ArticleFeed.tsx` |
| `src/app/admin/actions.ts` | `createArticleAction`, `updateArticleAction`, `deleteArticleAction`, `togglePublishAction`, `getArticleDetailAction` — lewat `articleAdminRepo` | `AdminArticlesClient.tsx` |

> **Penting:** setiap Server Action adalah pintu yang bisa diketuk langsung lewat HTTP, tanpa
> membuka halamannya. Jadi pemeriksaan login harus ada **di dalam fungsinya**, bukan hanya di
> halaman. Per 18 September 2026 kelima fungsi di `admin/actions.ts` belum memeriksa apa pun —
> lihat [KEAMANAN.md](./KEAMANAN.md) K-1.

### Pagar pengaman `server-only`

Lima berkas diberi `import "server-only"` di baris pertama:

- `src/server/db/client.ts`
- keempat berkas `src/server/repositories/prisma-*-repository.ts`

Kalau ada yang tidak sengaja meng-import salah satunya dari berkas `"use client"`, **build langsung
gagal dengan pesan jelas**. Tanpa pagar ini, kode database — termasuk cara membaca alamat database —
bisa ikut terkirim ke browser.

> Implementasi data contoh (`in-memory-*`) tidak diberi pagar ini. Tidak berbahaya karena tidak
> menyentuh rahasia apa pun, tapi artinya berkas-berkas itu secara teknis *bisa* terbawa ke browser.

---

## 5. Sakelar sumber data

Diatur di `src/server/repositories/index.ts` lewat variabel `DATA_SOURCE`:

| Nilai | Yang dipakai | Kapan |
|---|---|---|
| `memory` (bawaan) | Data contoh di dalam kode | Mengembangkan tampilan tanpa database |
| `prisma` | Database PostgreSQL | Pengujian sungguhan dan **produksi** |
| nilai lain | **Aplikasi berhenti dengan pesan error** | Sengaja — lihat di bawah |

**Kenapa salah ketik dibuat error, bukan diam-diam kembali ke `memory`?** Karena kalau di produksi
tertulis `DATA_SOURCE=prisam`, lebih baik situsnya gagal menyala dan ketahuan, daripada jalan dengan
data contoh tanpa ada yang sadar.

**Hal teknis yang perlu diingat:** nilai `DATA_SOURCE` dibaca **sekali, saat modul pertama kali
dimuat** — bukan setiap kali fungsi dipanggil. Konsekuensinya dijelaskan di
[bagian 8](#8-titik-rawan-yang-perlu-diketahui).

### Kenapa kedua implementasi bisa dipercaya sama

Karena dibuktikan otomatis: `npm run verify:compare` membandingkan keluaran keduanya kolom per kolom
(hasil terakhir: 20 sama, 0 beda), dan `npm run verify:all` menjalankan **rangkaian uji yang sama**
terhadap keduanya.

---

## 6. Keputusan arsitektur

Catatan keputusan yang sudah diambil. Mengubah salah satunya berarti mengubah kode di banyak tempat,
jadi **bahas dulu dengan tim**.

| # | Keputusan | Alasan | Konsekuensi yang diterima |
|---|---|---|---|
| A-01 | **Monolith**: satu aplikasi Next.js, bukan backend terpisah | Tim 5 orang, repo kecil. Dua aplikasi berarti dua deploy dan dua tempat rusak | Tidak bisa melayani aplikasi lain (mis. aplikasi HP) tanpa menambah API nanti |
| A-02 | **Repository**: halaman hanya memanggil fungsi di `src/server/repositories/` | Aturan keamanan cukup ditulis sekali; perubahan database tidak merembet | Setiap kebutuhan data baru harus dibuatkan fungsinya dulu |
| A-03 | **Dua implementasi** per repository: data contoh dan Prisma | Tim bisa bekerja sebelum database siap; tes tidak butuh database | Dua implementasi harus dijaga tetap setara — dijaga oleh `verify:compare` |
| A-04 | **Aturan tampil publik ditegakkan di lapisan data**: `PUBLISHED` **dan** `publishedAt` sudah lewat | Kalau diserahkan ke tiap halaman, cepat atau lambat ada yang lupa dan draft bocor | Halaman publik tidak bisa menampilkan draft walaupun ingin — memang disengaja |
| A-05 | **Dua bentuk data artikel**: ringkas untuk daftar, lengkap untuk detail | Daftar tidak perlu isi artikel yang panjangnya ribuan huruf | Ada dua tipe yang harus dipilih dengan benar |
| A-06 | **Sambungan database dibuat saat pertama dipakai, lalu dipakai ulang** | Tidak error selama database belum diatur; tidak menumpuk sambungan saat `next dev` | — |
| A-07 | **Prisma 7 dengan driver adapter**; alamat untuk migrasi di `prisma.config.ts`, dan migrasi memakai sambungan *unpooled* bila tersedia | Wajib di Prisma 7; perintah pengubah tabel kurang cocok lewat pooler | Ada dua tempat alamat database dibaca: aplikasi dan CLI |
| A-08 | **Server Action, bukan API buatan tangan** — URL hanya untuk yang dibaca mesin luar (`sitemap.xml`, `rss.xml`, `robots.txt`) | Form di monolith tidak perlu keluar-masuk jaringan | Kalau kelak ada aplikasi lain yang butuh data, API harus dibuat saat itu |
| A-09 | **Gambar ke layanan penyimpanan, bukan `public/`** (rencana: Vercel Blob) | `public/` sudah 18 MB; server produksi tidak bisa ditulisi | Butuh token layanan penyimpanan |
| A-10 | **`src/data/articles.ts` dibekukan**; data lama diterjemahkan lewat `src/server/data/seed-source.ts` | Dulu beberapa halaman memakainya; mengubah bentuknya merusak kerjaan orang lain | Sejak PR #6 tidak ada halaman yang memakainya lagi — tinggal jadi sumber data awal untuk seed dan mode `memory` |
| A-11 | **`DATA_SOURCE` bawaannya `memory` dan gagal keras kalau salah ketik** | Orang baru bisa langsung `npm run dev`; produksi tidak diam-diam memakai data contoh | Produksi **wajib** mengisi `DATA_SOURCE=prisma` secara eksplisit |

---

## 7. Arsitektur sekarang vs arsitektur tujuan

Bagian ini paling penting untuk dipahami, karena di sinilah jarak antara rancangan dan kenyataan.

| Bagian | Sekarang | Tujuan | Pemilik |
|---|---|---|---|
| Halaman publik | ✅ **Sudah sesuai tujuan** (PR #6) — memanggil `articleRepo` | Memanggil `articleRepo` | Orang 2 |
| Halaman admin | ✅ **Bentuknya sudah sesuai tujuan** (PR #6) — halaman server + form client + Server Action + `articleAdminRepo`. Yang belum: pemeriksaan sesi dan validasi di dalam Server Action | Halaman server + form client + Server Action + `articleAdminRepo` | Orang 3 |
| Login | Tidak ada | Auth.js, sesi di cookie `httpOnly` | Orang 3 |
| Penguncian `/admin` | Tidak ada, tautannya publik di footer — **dan sekarang sudah menulis ke database** | `proxy.ts` untuk pengalihan cepat, **ditambah** pemeriksaan sesi di sisi server sebelum setiap penulisan data | Orang 3 |
| Aturan bisnis | Belum ada lapisannya. Pembuatan slug ditulis langsung di `src/app/admin/actions.ts` (`toSlug`) | `src/server/services/` (pembuatan slug, aturan terbit) | Orang 4 |
| Validasi input | Hanya "judul dan isi tidak kosong" di `admin/actions.ts` | Skema Zod di `src/lib/validation/`, dipakai di setiap Server Action | Orang 4 |
| Gambar | `public/` | Vercel Blob | Orang 3 |

### Halaman admin sudah disusun ulang — tinggal dua lapis pengaman

Dulu baris `"use client"` di `src/app/admin/page.tsx` memindahkan seluruh halaman ke browser, dan
datanya disimpan di `localStorage`. PR #6 memindahkan **batasnya** sesuai rancangan: halaman kembali
ke server, hanya form dan tabelnya yang di browser.

```
Sebelum PR #6                     Sekarang (sejak PR #6)
────────────────────────          ─────────────────────────────────────────
admin/page.tsx  "use client"      admin/page.tsx            (server)
  ├─ useState                       ├─ ambil data: articleAdminRepo.list()
  ├─ localStorage                   └─ <AdminArticlesClient /> "use client"
  └─ form                                 └─ kirim ke admin/actions.ts
                                               ├─ periksa sesi login   ❌ belum
                                               ├─ validasi Zod         ❌ belum
                                               └─ articleAdminRepo.create()  ✅
```

Dua kotak yang masih ❌ itulah pekerjaan berikutnya. Keduanya ditambahkan **di dalam** fungsi-fungsi
`admin/actions.ts`, tanpa perlu mengubah bentuk halaman lagi.

### Soal `proxy.ts` — perhatikan nama ini

Di **Next.js 16, `middleware.ts` sudah berganti nama menjadi `proxy.ts`** (fungsinya sama). Banyak
tutorial di internet masih memakai nama lama. Sumber: `node_modules/next/dist/docs/01-app/01-getting-started/16-proxy.md`.

Panduan autentikasi Next.js sendiri (`.../02-guides/authentication.md`) menyebut pemeriksaan di proxy
sebagai pemeriksaan **optimistis**. Artinya proxy cocok untuk mengalihkan pengunjung yang belum login,
tapi **bukan satu-satunya pengaman**. Setiap Server Action yang mengubah data tetap wajib memeriksa
sesi sendiri.

---

## 8. Titik rawan yang perlu diketahui

### 8.1 Urutan `import` pada skrip

`DATA_SOURCE` dibaca saat modul `src/server/repositories/index.ts` dimuat. Pada skrip yang dijalankan
lewat `tsx`, semua `import` dieksekusi **sebelum** baris kode biasa. Kalau setelan dibaca dengan
memanggil fungsi setelah `import`, repository sudah terlanjur memakai nilai bawaan.

**Gejalanya: tidak ada error sama sekali** — skripnya jalan normal, tapi membaca sumber data yang
salah. Perbaikan yang sudah dipasang: memuat setelan sebagai `import` paling atas. Aplikasi Next.js
tidak terkena, karena Next.js membaca `.env` sebelum kode apa pun berjalan.

### 8.2 Mode `memory` tidak menyimpan tulisan secara permanen

Implementasi data contoh untuk admin menyimpan perubahan **di memori proses**. Artinya:

- Semua perubahan hilang begitu server dimulai ulang
- Di hosting serverless, tiap *instance* punya memorinya sendiri — tulisan bisa "hilang" di antara
  dua permintaan

Mode `memory` **hanya untuk pengembangan**. Produksi wajib `prisma`.

### 8.3 Pencarian masih memakai pencocokan teks biasa

`search()` memakai pencocokan tanpa peduli huruf besar-kecil. Cukup untuk ratusan artikel, tapi akan
melambat di puluhan ribu. Komentar di kodenya sudah menandai: kalau sampai skala itu, pindah ke
*full-text search* PostgreSQL.

### 8.4 Penghitung "jumlah dibaca" adalah perkiraan kasar

Sejak PR #6, halaman detail artikel memanggil `articleRepo.incrementViewCount()` setiap kali dibuka.
Kegagalannya sengaja diabaikan supaya halaman artikel tetap tampil walaupun database sedang
bermasalah.

Angkanya **perkiraan kasar**: bisa digelembungkan dengan me-refresh berulang, dan sesekali terlewat
saat database bermasalah. Cukup untuk daftar "artikel populer", tidak cukup untuk laporan statistik.

### 8.5 Halaman depan dan `/articles` dibangun statis

`npm run build` menandai `/` dan `/articles` sebagai halaman **statis**: isinya diambil dari database
sekali saat build, lalu disimpan. Halaman itu baru diperbarui saat Server Action admin memanggil
`revalidatePath("/")` dan `revalidatePath("/articles")` — yaitu setiap kali artikel dibuat, diubah,
diterbitkan, atau dihapus.

Konsekuensinya:

- Artikel dari admin **tetap muncul** di depan, karena setiap penulisan memicu pembaruan
- Daftar "artikel populer" **tidak** ikut bergerak saat artikel dibaca, karena menambah `viewCount`
  tidak memicu pembaruan. Angkanya baru berubah di halaman depan setelah ada penulisan berikutnya
  atau build ulang
- Build membutuhkan database yang bisa dihubungi kalau `DATA_SOURCE=prisma`

### 8.6 Gambar dari alamat luar

Form admin mengizinkan alamat gambar `https://...`, dan halaman menampilkan gambar lewat
`next/image`. Tapi `next.config.ts` belum punya `images.remotePatterns`. Dari membaca kode, gambar
dari domain luar akan ditolak `next/image` saat artikelnya ditampilkan — **belum dicoba di browser**.
Pilihan perbaikannya: daftarkan domain yang diizinkan di `next.config.ts`, atau batasi isian ke
alamat `/images/...` sampai unggah gambar (Vercel Blob) tersedia.

---

## 9. Mau menambah sesuatu? Taruh di sini

| Mau menambah | Taruh di | Catatan |
|---|---|---|
| Halaman baru | `src/app/<nama>/page.tsx` | Nama folder = alamat halaman |
| Potongan tampilan | `src/components/` | Terima data lewat props |
| Cara baru mengambil data | `src/server/repositories/` — **di kedua implementasi** | Tambahkan juga ke `verify:compare`. Bicarakan dengan Orang 1 |
| Tabel atau kolom baru | `prisma/schema.prisma` + migration baru | **Wajib dibahas tim dulu** |
| Aturan bisnis (slug, boleh terbit) | `src/server/services/` (rencana) | Wilayah Orang 4 |
| Aturan validasi form | `src/lib/validation/` (rencana) | Wilayah Orang 4 |
| Aksi form (simpan, hapus) | Server Action di dekat halaman yang memakainya — contoh: `src/app/admin/actions.ts` | Periksa sesi dan validasi di dalamnya |
| Aksi yang dipakai halaman publik | `src/app/actions/` — contoh: `articles.ts` | Hanya boleh memakai `articleRepo`, jangan `articleAdminRepo` |
| Variabel setelan baru | `.env.example` — di PR yang sama | Tanpa nilai rahasia |
| Pemeriksaan otomatis baru | `scripts/` sekarang; `tests/` (rencana) | Lihat [PENGUJIAN.md](./PENGUJIAN.md) |

**Tanda sebuah perubahan berada di tempat yang salah:** kamu menulis `import` dari
`@/generated/prisma` atau `@/server/db` di mana pun di luar `src/server/`.

---

## Dokumen terkait

[KEAMANAN.md](./KEAMANAN.md) · [DEPLOY.md](./DEPLOY.md) · [PENGUJIAN.md](./PENGUJIAN.md) ·
[DATABASE.md](./DATABASE.md) · [LAPORAN-DATABASE.md](./LAPORAN-DATABASE.md) · [PRD.md](./PRD.md)
