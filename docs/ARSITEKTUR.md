# Arsitektur NewsTimes

> **Diperbarui:** 11 September 2026 · kondisi `main` di commit `bdf88c4`
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
                                     │        │     └─► src/data/articles.ts (beku)  │
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

Hasil yang benar: **kosong**. Per 11 September 2026: kosong.

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
| `src/app/admin/page.tsx` | **Seluruh halaman** — lihat [bagian 7](#7-arsitektur-sekarang-vs-arsitektur-tujuan) |

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
| A-10 | **`src/data/articles.ts` dibekukan**; data lama diterjemahkan lewat `src/server/data/seed-source.ts` | Beberapa halaman masih memakainya; mengubah bentuknya merusak kerjaan orang lain | Selama transisi ada dua bentuk data artikel yang hidup berdampingan |
| A-11 | **`DATA_SOURCE` bawaannya `memory` dan gagal keras kalau salah ketik** | Orang baru bisa langsung `npm run dev`; produksi tidak diam-diam memakai data contoh | Produksi **wajib** mengisi `DATA_SOURCE=prisma` secara eksplisit |

---

## 7. Arsitektur sekarang vs arsitektur tujuan

Bagian ini paling penting untuk dipahami, karena di sinilah jarak antara rancangan dan kenyataan.

| Bagian | Sekarang | Tujuan | Pemilik |
|---|---|---|---|
| Halaman publik | Membaca langsung `src/data/articles.ts` | Memanggil `articleRepo` | Orang 2 |
| Halaman admin | Satu berkas `"use client"`, data di `localStorage` browser | Halaman server + form client + Server Action + `articleAdminRepo` | Orang 3 |
| Login | Tidak ada | Auth.js, sesi di cookie `httpOnly` | Orang 3 |
| Penguncian `/admin` | Tidak ada, tautannya publik di footer | `proxy.ts` untuk pengalihan cepat, **ditambah** pemeriksaan sesi di sisi server sebelum setiap penulisan data | Orang 3 |
| Aturan bisnis | Belum ada lapisannya | `src/server/services/` (pembuatan slug, aturan terbit) | Orang 4 |
| Validasi input | Tidak ada | Skema Zod di `src/lib/validation/`, dipakai di setiap Server Action | Orang 4 |
| Gambar | `public/` | Vercel Blob | Orang 3 |

### Kenapa halaman admin perlu disusun ulang, bukan sekadar "ditambah fungsi"

Baris `"use client"` di `src/app/admin/page.tsx` memindahkan seluruh halaman ke browser. Dari sana,
`articleAdminRepo` **tidak mungkin** dipanggil — pagar `server-only` akan menggagalkan build. Jadi yang
perlu dipindah adalah **batasnya**:

```
Sekarang                          Tujuan
────────────────────────          ─────────────────────────────────────
admin/page.tsx  "use client"      admin/page.tsx            (server)
  ├─ useState                       ├─ ambil data: articleAdminRepo.list()
  ├─ localStorage                   └─ <FormArtikel />      "use client"
  └─ form                                 └─ kirim ke Server Action
                                               ├─ periksa sesi login
                                               ├─ validasi Zod
                                               └─ articleAdminRepo.create()
```

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

### 8.4 Penghitung "jumlah dibaca" belum tersambung

Fungsinya sudah ada — `articleRepo.incrementViewCount()` — dan kegagalannya sengaja diabaikan
supaya halaman artikel tetap tampil walaupun database sedang bermasalah. Tapi **belum ada satu
halaman pun yang memanggilnya**, karena halaman memang belum memakai repository.

Begitu nanti disambungkan, perlu disadari bahwa angkanya **perkiraan kasar**: bisa digelembungkan
dengan me-refresh berulang, dan sesekali terlewat saat database bermasalah. Cukup untuk daftar
"artikel populer", tidak cukup untuk laporan statistik.

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
| Aksi form (simpan, hapus) | Server Action di dekat halaman yang memakainya | Periksa sesi dan validasi di dalamnya |
| Variabel setelan baru | `.env.example` — di PR yang sama | Tanpa nilai rahasia |
| Pemeriksaan otomatis baru | `scripts/` sekarang; `tests/` (rencana) | Lihat [PENGUJIAN.md](./PENGUJIAN.md) |

**Tanda sebuah perubahan berada di tempat yang salah:** kamu menulis `import` dari
`@/generated/prisma` atau `@/server/db` di mana pun di luar `src/server/`.

---

## Dokumen terkait

[KEAMANAN.md](./KEAMANAN.md) · [DEPLOY.md](./DEPLOY.md) · [PENGUJIAN.md](./PENGUJIAN.md) ·
[DATABASE.md](./DATABASE.md) · [LAPORAN-DATABASE.md](./LAPORAN-DATABASE.md) · [PRD.md](./PRD.md)
