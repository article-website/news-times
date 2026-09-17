# Panduan Deploy

> **Status: situs ini BELUM PERNAH di-deploy.**
>
> Dokumen ini adalah rencana dan daftar periksa, disusun dari konfigurasi yang **sudah ada** di repo.
> Langkah yang belum pernah dicoba di proyek ini ditandai **(belum dicoba)**. Setelah deploy pertama
> berhasil, perbarui dokumen ini dengan apa yang sebenarnya terjadi.
>
> Pemilik: Orang 5 (Deploy & Testing) — posisi ini masih kosong.

---

## Daftar isi

0. [Satu keputusan yang wajib ada sebelum mulai](#0-satu-keputusan-yang-wajib-ada-sebelum-mulai)
1. [Yang terjadi saat deploy](#1-yang-terjadi-saat-deploy)
2. [Yang sudah disiapkan repo](#2-yang-sudah-disiapkan-repo)
3. [Variabel setelan produksi](#3-variabel-setelan-produksi)
4. [Database produksi](#4-database-produksi)
5. [Langkah deploy pertama](#5-langkah-deploy-pertama)
6. [Migrasi database di produksi](#6-migrasi-database-di-produksi)
7. [Setelah deploy: yang harus dicek](#7-setelah-deploy-yang-harus-dicek)
8. [Kalau deploy gagal](#8-kalau-deploy-gagal)
9. [Batas paket gratis](#9-batas-paket-gratis)

---

## 0. Satu keputusan yang wajib ada sebelum mulai

**Apakah proyek ini komersial?**

Vercel paket gratis (Hobby) **hanya boleh untuk proyek non-komersial**. Kalau situs ini nantinya
dipakai perusahaan atau menghasilkan uang, memakai paket gratis melanggar aturan Vercel.

| Jawabannya | Yang dilakukan |
|---|---|
| Portofolio dan penilaian magang | Aman memakai Vercel Hobby |
| Dipakai perusahaan sungguhan | Bahas anggaran hosting **sekarang**, bukan seminggu sebelum tenggat |

Keputusan ini tercatat sebagai pertanyaan terbuka nomor 1 di [PRD.md](./PRD.md#11-yang-masih-harus-diputuskan).

---

## 1. Yang terjadi saat deploy

```
git push ke main
      │
      ▼
Vercel mengunduh repo
      │
      ▼
npm install            ← memasang pustaka; menjalankan "postinstall": prisma generate
      │
      ▼
npm run build          ← "prisma generate && next build"
      │
      ▼
Situs versi baru aktif
```

**Yang TIDAK terjadi otomatis:** migrasi database. Perubahan tabel harus dijalankan terpisah — lihat
[bagian 6](#6-migrasi-database-di-produksi). Ini disengaja, karena migrasi yang salah bisa merusak
data sungguhan.

---

## 2. Yang sudah disiapkan repo

Empat hal ini sudah ada dan sudah teruji di lingkungan pengembangan:

| Yang disiapkan | Di mana | Kenapa penting |
|---|---|---|
| `prisma generate` ikut dijalankan saat build | `package.json` → `"build"` | Vercel sering melewati `npm install` karena memakai cache. Tanpa ini, build gagal dengan error yang tidak menunjukkan penyebab sebenarnya. **Bug ini pernah terjadi dan sudah diperbaiki** |
| Perintah migrasi produksi yang aman | `package.json` → `"db:deploy": "prisma migrate deploy"` | Hanya menjalankan migrasi yang belum pernah dijalankan. Tidak pernah menghapus data |
| Migrasi memakai sambungan langsung (*unpooled*) | `prisma.config.ts` membaca `DATABASE_URL_UNPOOLED` lebih dulu | Perintah pengubah tabel kurang cocok lewat *connection pooler* |
| Salah setelan langsung ketahuan | `src/server/repositories/index.ts` | `DATA_SOURCE` yang salah ketik menghentikan aplikasi, bukan diam-diam memakai data contoh |

Build terakhir di lingkungan lokal: **PASS**, 6 halaman (10 September 2026). Build di Vercel:
**NOT_RUN**.

---

## 3. Variabel setelan produksi

Diisi di Vercel → proyek → *Settings* → *Environment Variables*. **Jangan pernah** ditaruh di berkas
yang ter-commit.

| Variabel | Wajib? | Nilai di produksi | Catatan |
|---|---|---|---|
| `DATA_SOURCE` | **Wajib** | `prisma` | Kalau `memory`, situs produksi memakai data contoh, dan semua tulisan admin hilang setiap server dimulai ulang |
| `DATABASE_URL` | **Wajib** | Alamat Neon versi *pooled* | Wajib diakhiri `?sslmode=require` |
| `DATABASE_URL_UNPOOLED` | Disarankan | Alamat Neon versi langsung | Dipakai saat migrasi |
| `AUTH_SECRET` | Wajib setelah login dibuat | Buat dengan `npx auth secret` | **Berbeda** dari yang dipakai di lokal |
| `AUTH_URL` | Wajib setelah login dibuat | Alamat situs produksi | |
| `BLOB_READ_WRITE_TOKEN` | Wajib setelah upload gambar dibuat | Dari Vercel → *Storage* → *Blob* | |
| `NEXT_PUBLIC_SITE_URL` | Wajib setelah SEO dibuat | Alamat situs produksi | Awalan `NEXT_PUBLIC_` berarti **nilainya terlihat di browser** — jangan pernah menaruh rahasia di variabel berawalan ini |

Daftar lengkapnya selalu mengikuti [`.env.example`](../.env.example). Kalau ada variabel baru di sana,
tambahkan juga di Vercel.

---

## 4. Database produksi

**Database produksi harus terpisah dari database siapa pun di tim.**

| | Pengembangan | Produksi |
|---|---|---|
| Milik siapa | Masing-masing anggota | Satu, milik proyek |
| Boleh dikosongkan? | Boleh, kapan saja | **Tidak pernah** |
| Boleh `db:reset`? | Boleh | **Tidak pernah** |
| Data | Contoh | Artikel sungguhan |

Di Neon, cara paling rapi adalah membuat **proyek terpisah** untuk produksi, atau paling tidak
*branch* tersendiri. **(belum dicoba)**

---

## 5. Langkah deploy pertama

**(belum dicoba)** — urutan ini disusun dari konfigurasi repo, bukan dari pengalaman deploy.

1. **Pastikan syarat keamanan terpenuhi.** Lihat [KEAMANAN.md bagian 7](./KEAMANAN.md#7-wajib-sebelum-deploy-produksi).
   Minimal: login sudah jalan dan `/admin` terkunci. Deploy tanpa itu berarti membuka halaman redaksi
   ke seluruh internet
2. **Siapkan database produksi** di Neon, catat alamat *pooled* dan *unpooled*
3. **Jalankan migrasi pertama** ke database produksi dari komputer sendiri:
   ```bash
   # isi sementara DATABASE_URL dan DATABASE_URL_UNPOOLED dengan alamat PRODUKSI
   npm run db:deploy
   ```
   Setelah itu **kembalikan** `.env.local` ke alamat database pengembanganmu
4. **Isi data awal** kalau diperlukan: `npm run db:seed` — seed tidak membuat akun apa pun, dan
   **cukup sekali**. Menjalankannya lagi nanti akan menimpa editan redaksi (lihat [bagian 6](#6-migrasi-database-di-produksi))
5. **Hubungkan repo ke Vercel**: vercel.com → *Add New Project* → pilih `article-website/news-times`
6. **Isi variabel setelan** sesuai [bagian 3](#3-variabel-setelan-produksi)
7. **Deploy**, lalu jalankan pemeriksaan di [bagian 7](#7-setelah-deploy-yang-harus-dicek)
8. **Buat akun admin pertama** lewat alur yang disediakan halaman login — bukan lewat seed

> **Langkah 3 adalah yang paling berbahaya.** Selama `.env.local` menunjuk ke database produksi,
> perintah apa pun yang kamu jalankan mengenai data sungguhan. Selesaikan, lalu segera kembalikan.

---

## 6. Migrasi database di produksi

Setiap kali ada PR yang menambahkan folder baru di `prisma/migrations/`, database produksi perlu
diperbarui.

### Perintah yang boleh dan tidak boleh

| Perintah | Ke database produksi | Kenapa |
|---|---|---|
| `npm run db:deploy` | ✅ **Boleh** — satu-satunya yang boleh | Hanya menjalankan migrasi baru, tidak menghapus apa pun |
| `npm run db:migrate` | ❌ **Jangan** | Perintah pengembangan. Bisa meminta mengosongkan database kalau mendeteksi perbedaan |
| `npm run db:reset` | ❌ **JANGAN PERNAH** | **Menghapus seluruh isi database** |
| `npm run db:seed` | ⚠️ Hanya sekali di awal | Tidak menggandakan data, tapi **menimpa** — lihat di bawah |

### Kenapa `db:seed` berbahaya kalau diulang di produksi

Seed memakai `upsert`: kalau datanya sudah ada, **isinya ditimpa** dengan isi dari seed
(`prisma/seed.ts`, bagian `update: isi`). Artinya kalau redaksi sudah mengedit salah satu dari lima
artikel awal, menjalankan seed lagi akan **mengembalikan artikel itu ke isi aslinya — tanpa
peringatan apa pun**.

Artikel baru yang ditulis redaksi tidak tersentuh, karena alamatnya tidak ada di data seed.

### Urutan yang aman

1. Gabungkan PR yang berisi migrasi
2. Jalankan `npm run db:deploy` ke produksi
3. **Baru** deploy kode yang memakai kolom baru

Kalau kode yang memakai kolom baru ter-deploy lebih dulu dari migrasinya, situs akan error karena
kolom yang dicari belum ada.

### Migrasi hanya bisa maju

Tidak ada tombol "batalkan migrasi". Kalau sebuah migrasi ternyata salah, perbaikannya adalah
**migrasi baru** yang membetulkannya. Karena itu aturan tim nomor 3 berlaku keras: perubahan
`prisma/schema.prisma` wajib dibahas dulu.

---

## 7. Setelah deploy: yang harus dicek

Isi dengan **PASS**, **FAIL**, atau **NOT_RUN**. Jangan menulis PASS untuk yang tidak dibuka.

| # | Cek | Cara |
|---|---|---|
| 1 | Halaman depan terbuka | Buka alamat situs |
| 2 | Artikel tampil dari database, bukan data contoh | Tambah satu artikel lewat admin, pastikan muncul di depan |
| 3 | Alamat artikel yang salah menampilkan "tidak ditemukan" | Buka `/articles/tidak-ada` |
| 4 | Draft tidak terlihat publik | Buat draft, coba buka alamatnya tanpa login |
| 5 | `/admin` mengalihkan pengunjung yang belum login | Buka di jendela *incognito* |
| 6 | Tidak ada error di console browser | *DevTools* → *Console* |
| 7 | Tampilan rapi di HP sungguhan | Buka di HP, bukan mode responsif browser |
| 8 | Setelah 5 menit didiamkan, situs tetap bisa dibuka | Neon "tidur" lalu bangun — pembukaan pertama sedikit lambat, itu wajar |

---

## 8. Kalau deploy gagal

### Build gagal di Vercel

1. Buka *Deployments* → deploy yang gagal → baca log dari **baris error pertama**
2. Coba ulangi di komputer sendiri: `npm run build`. Kalau di lokal juga gagal, masalahnya di kode
3. Kalau di lokal berhasil tapi di Vercel gagal, curigai **variabel setelan** yang belum diisi

### Situs sudah aktif tapi rusak

Vercel menyimpan setiap deploy sebelumnya. Di *Deployments*, pilih versi terakhir yang sehat, lalu
**Promote to Production** untuk kembali ke versi itu. **(belum dicoba)**

**Tapi ingat:** ini hanya mengembalikan **kode**. Database tidak ikut kembali. Kalau masalahnya dari
migrasi, lihat [bagian 6](#migrasi-hanya-bisa-maju).

### Error `too many connections`

Terlalu banyak sambungan ke database. Pastikan `DATABASE_URL` memakai alamat versi *pooled*, bukan
yang langsung.

---

## 9. Batas paket gratis

Dicek September 2026, bisa berubah. Perbarui setelah membuat akun.

| Layanan | Jatah gratis | Kalau habis |
|---|---|---|
| Vercel Hobby | 100 GB bandwidth · 100 ribu pemanggilan fungsi · maks 10 detik per fungsi | **Situs dimatikan sampai bulan berikutnya** — tidak bisa menambah dengan membayar |
| Neon Free | 0,5 GB · 100 jam komputasi per bulan | Database berhenti melayani |
| Vercel Blob | 1 GB penyimpanan · 10 GB transfer per bulan | Upload gagal |

Untuk situs dengan puluhan artikel dan pengunjung sesekali, jatah ini lebih dari cukup. Yang paling
cepat habis biasanya **bandwidth gambar** — alasan lain kenapa gambar sebaiknya dikompres sebelum
diunggah.

---

## Dokumen terkait

[KEAMANAN.md](./KEAMANAN.md) · [ARSITEKTUR.md](./ARSITEKTUR.md) · [PENGUJIAN.md](./PENGUJIAN.md) ·
[DATABASE.md](./DATABASE.md)
