# Laporan Pekerjaan — Bagian Database (Orang 1)

> **Untuk siapa:** seluruh anggota tim.
>
> **Bedanya dengan [DATABASE.md](./DATABASE.md):** dokumen itu menjelaskan *cara memakainya*.
> Dokumen ini menjelaskan *apa yang dibuat, kenapa dibuat begitu, apa yang sengaja tidak dikerjakan,
> dan apa buktinya sudah jalan*. Kalau kamu cuma mau mulai ngoding, langsung ke DATABASE.md saja.
>
> **Status:** selesai dan sudah masuk `main` lewat [PR #2](https://github.com/article-website/news-times/pull/2),
> digabung 5 September 2026 dalam 7 commit.

---

## 1. Ringkas

Bagian ini membuat tiga hal: rancangan tabel database, kode untuk mengambil dan menyimpan data,
serta data awal supaya tidak kosong.

Yang paling penting untuk anggota lain: **kode pengambil data punya dua versi** — satu memakai data
contoh yang menempel di kode, satu memakai database sungguhan. Keduanya menghasilkan bentuk data
yang sama persis.

Artinya kalian bisa mulai bekerja sekarang tanpa punya database. Saat nanti pindah ke database
asli, yang berubah cuma satu baris di file setelan — kode halaman kalian tidak perlu disentuh.

---

## 2. Yang dibuat

| Berkas | Isinya |
|---|---|
| `prisma/schema.prisma` | Rancangan 5 tabel |
| `prisma/seed.ts` | Pengisi data awal |
| `prisma.config.ts`, `prisma/load-env.ts` | Setelan Prisma dan pembaca berkas rahasia |
| `src/server/domain/` | Bentuk data: artikel, akun, newsletter |
| `src/server/repositories/` | Kontrak akses data + dua implementasinya |
| `src/server/db/client.ts` | Sambungan ke database |
| `src/server/data/seed-source.ts` | Pengubah data lama menjadi bentuk baru |
| `scripts/` | Tiga skrip verifikasi + satu skrip coba-coba |
| `docs/DATABASE.md` | Panduan pakai untuk tim |
| `.env.example` | Daftar setelan yang dibutuhkan |

### Empat kumpulan fungsi yang tersedia

Semuanya di-import dari `@/server/repositories`.

| Nama | Untuk apa | Dipakai siapa |
|---|---|---|
| `articleRepo` | Artikel untuk pengunjung. Otomatis hanya yang sudah terbit | Tampilan publik |
| `articleAdminRepo` | Artikel untuk admin. Termasuk draft, bisa tulis dan hapus | Halaman admin |
| `userRepo` | Akun redaksi, untuk proses login | Halaman admin |
| `newsletterRepo` | Daftar pelanggan newsletter | Validasi & SEO |

Daftar fungsi lengkap beserta contoh kodenya ada di [DATABASE.md](./DATABASE.md).

---

## 3. Keputusan penting dan alasannya

Bagian ini yang paling berguna kalau nanti ada yang bertanya "kenapa begini?", atau kalau ada yang
mau mengubahnya.

### K-01 · Dua implementasi di balik satu kontrak

**Masalah:** kalau halaman langsung menyambung ke database, tidak ada satu pun anggota tim yang bisa
mulai bekerja sebelum databasenya jadi.

**Keputusan:** buat satu kontrak, lalu dua implementasi — data contoh dan Prisma. Yang dipakai
ditentukan satu baris di `.env.local`.

**Untungnya:** tim bekerja paralel, tes otomatis nanti tidak butuh database sungguhan, dan kalau
suatu saat ganti teknologi database, yang diubah cuma satu lapisan.

### K-02 · Daftar artikel tidak membawa isi lengkapnya

Isi satu artikel bisa ribuan huruf, padahal kartu artikel di halaman depan cuma menampilkan judul
dan ringkasan. Karena itu ada dua bentuk data: versi ringkas untuk daftar, versi lengkap untuk
halaman detail.

### K-03 · Tanggal disimpan sebagai tanggal, bukan teks

Data lama menyimpan `date: "28 Juni 2025"`. Komputer mengurutkan teks per huruf, jadi `"28 Juni"`
dianggap lebih kecil dari `"3 Mei"` — artinya **artikel tidak bisa diurutkan dari yang terbaru sama
sekali**.

Sekarang disimpan sebagai `DateTime`, dan ada penerjemah untuk data lama. Penerjemah itu juga
menolak tanggal yang tidak ada seperti `"31 Februari"` — JavaScript diam-diam menggesernya jadi
3 Maret tanpa memberi tahu, jadi hasilnya dicek balik dan artikel dengan tanggal ngawur dilewati.

### K-04 · `publishedAt` boleh kosong

Artikel draft memang belum punya tanggal terbit. Kalau diisi tanggal yang belum datang, artinya
artikel itu dijadwalkan tayang nanti.

### K-05 · Aturan "boleh dilihat publik" punya dua syarat

Statusnya `PUBLISHED` **dan** tanggal terbitnya sudah lewat. Tanpa syarat kedua, artikel yang
dijadwalkan besok sudah bisa dibaca hari ini oleh siapa pun yang menebak alamatnya.

Aturan ini ditegakkan di lapisan data, bukan di tiap halaman — supaya tidak ada halaman yang lupa
memeriksanya.

### K-06 · Urutan memakai dua patokan

Kalau dua artikel terbit di tanggal yang sama, database bebas menaruh yang mana duluan, dan
urutannya bisa berubah tiap kali diambil. Akibatnya satu artikel bisa muncul dua kali di halaman 1
dan 2 sementara artikel lain hilang.

Karena data kita memang punya **tiga artikel bertanggal 28 Mei 2025**, ditambahkan patokan kedua:
kalau tanggalnya sama, urutkan berdasarkan alamat artikel.

### K-07 · Sambungan database dibungkus fungsi dan dipakai ulang

Dua alasan terpisah:

- **Dibungkus fungsi** supaya sambungan baru dibuat saat data benar-benar diminta. Selama alamat
  database belum diisi, menyebut berkas sambungan tidak lagi membuat seluruh aplikasi error.
- **Dipakai ulang** supaya `npm run dev` tidak menumpuk sambungan tiap kali berkas disimpan. Neon
  paket gratis punya batas sambungan yang kecil, jadi ini bukan masalah teori.

### K-08 · `import "server-only"` sebagai pagar

Kode database tidak boleh sampai ke browser pengunjung — kalau bocor, alamat dan password database
ikut terlihat. Dengan pagar ini, pemakaian yang salah langsung gagal dengan pesan jelas, bukan
gagal belakangan dengan pesan membingungkan.

### K-09 · Angka "jumlah dibaca" di data contoh tidak diacak

Mengacaknya akan membuat urutan artikel populer berubah tiap refresh, hasil di server berbeda
dengan di browser (React akan protes), dan tes jadi kadang lulus kadang gagal. Angkanya dihitung
dari huruf-huruf pada alamat artikel: selalu sama untuk artikel yang sama, tetap berbeda antar
artikel.

### K-10 · Kegagalan penghitung pembaca sengaja diabaikan

Jumlah pembaca itu bonus, bukan hal penting. Kalau database sedang bermasalah, halaman artikel tetap
harus tampil — tidak masuk akal menggagalkan seluruh halaman karena satu angka gagal naik.

### K-11 · Kategori diisi enam, walaupun artikel hanya mengisi empat

Menu navbar ada enam. Kalau daftar kategori diambil dari artikel saja, menu Internasional dan
Olahraga akan hilang sendiri begitu navbarnya dibuat otomatis.

### K-12 · `src/data/articles.ts` tidak diubah sama sekali

Berkas itu masih dipakai beberapa halaman. Mengubah bentuknya akan langsung merusak halaman-halaman
tersebut dan menggagalkan build — padahal itu bukan wilayah saya.

Berkas itu sekarang berstatus beku dan cuma jadi sumber data awal. Ada penerjemah terpisah yang
mengubahnya ke bentuk baru, jadi perpindahan bisa dilakukan **halaman per halaman, kapan pun yang
memilikinya siap**.

### K-13 · Tidak ada akun admin bawaan

Akun contoh seperti `admin / admin123` memang memudahkan pengujian, tapi jadi pintu belakang kalau
sampai ikut terpasang di server sungguhan. Karena itu tidak ada satu pun akun dibuat.

Sebagai gantinya, `userRepo.count()` bisa dipakai untuk mendeteksi "belum ada admin sama sekali",
lalu menampilkan halaman pembuatan admin pertama.

### K-14 · Password acak dipisahkan ke fungsi tersendiri

Ada dua fungsi untuk mencari akun: satu membawa hash password (`findByEmailWithSecret`, khusus saat
login), satu tidak membawa (untuk semua keperluan lain). Namanya sengaja dibuat panjang supaya orang
berpikir dulu sebelum memakainya.

---

## 4. Yang sengaja TIDAK diputuskan

Hal-hal berikut menyentuh bagian ini, tapi keputusannya bukan milik Orang 1. Lapisan data hanya
menyimpan hasilnya, dan semua sudah ditandai di komentar kode.

| Hal | Pemiliknya |
|---|---|
| Cara mengacak password (algoritma hash) | Halaman Admin & Login |
| Berapa lama sesi login berlaku | Halaman Admin & Login |
| Upload gambar — lapisan data cuma menyimpan alamatnya | Halaman Admin & Login |
| Pengecekan format email | Validasi & SEO |
| Pembatasan spam newsletter | Validasi & SEO |
| Pembuatan alamat artikel dari judul | Validasi & SEO |

Silakan diputuskan sendiri — sengaja tidak dikunci dari sini.

---

## 5. Dua bug yang ditemukan saat pengujian

Keduanya lahir dari menguji **kondisi orang lain**, bukan kondisi komputer sendiri.

### Bug 1 — Build gagal di komputer yang baru clone repo

Ditemukan dengan sengaja menghapus satu folder hasil generate, meniru kondisi orang yang baru
pertama kali mengunduh repo. Ternyata proses build langsung gagal, karena folder itu hanya dibuat
saat `npm install` — sementara Vercel sering melewati langkah itu karena memakai cache.

Kalau tidak ketahuan, yang memasang deploy akan kena error aneh yang tidak menunjukkan penyebab
sebenarnya. Perbaikannya satu baris: folder itu sekarang dibuat ulang sebagai bagian dari build.

### Bug 2 — `db:reset` menghasilkan database kosong

Di Prisma 7, perintah untuk mengosongkan dan membangun ulang database **tidak lagi mengisi data
otomatis** seperti versi sebelumnya. Perilakunya memang sengaja diubah oleh pembuatnya.

Kalau tidak ketahuan, siapa pun yang menjalankan perintah itu akan mendapati databasenya kosong lalu
mengira pengisi datanya rusak — padahal pengisi datanya baik-baik saja, cuma tidak pernah dipanggil.
Sekarang seed dipanggil eksplisit di `package.json`.

---

## 6. Bukti pengujian

Semua baris ini **dijalankan ulang pada 11 September 2026** di `main`, setelah PR #2 dan PR #3
digabung. Bukan hasil lama dari branch pengembangan.

| Perintah | Hasil |
|---|---|
| `npm run typecheck` | **PASS** |
| `npm run build` | **PASS** — 6 halaman |
| `npm run verify:repo` | **PASS** — 37 pengecekan |
| `npm run verify:compare` | **PASS** — 20 sama, 0 beda |
| `npm run verify:all` | **PASS** — 106 pengecekan |
| `npm run lint` | 2 error, 5 warning — keduanya di luar berkas bagian ini |

Total **163 pengecekan otomatis lulus**. Tidak ada satu pun yang diasumsikan jalan.

> **Ditambahkan 11 September 2026:** 12 pengecekan aturan tampil publik di `verify:all`, menutup celah
> K-9 di [KEAMANAN.md](./KEAMANAN.md). Sebelumnya aturan "draft tidak bocor" ditegakkan di kode tapi
> tidak pernah diuji dari sisi pengunjung. Pengujian barunya dibuktikan lewat uji mutasi: syarat di
> `syaratTerbit()` sengaja dirusak, dan pengujiannya langsung gagal.

Pengujian berikut **PASS pada pengujian sebelumnya dan belum diulang** setelah PR #3 masuk:
membuat tabel, mengisi data awal, `db:reset`, serta pemeriksaan manual halaman depan, daftar,
detail, dan tentang.

### Kalian bisa membuktikannya sendiri

```bash
npm run verify:repo      # 37 pengecekan, tidak butuh database
npm run verify:compare   # bandingkan data contoh vs database
npm run verify:all       # 106 pengecekan admin, login, newsletter, aturan tampil publik
```

Yang paling penting `verify:compare`. Dia membandingkan hasil kedua implementasi **kolom per
kolom**. Karena hasilnya sama, kode halaman tidak perlu diubah sama sekali saat pindah ke database
sungguhan.

---

## 7. Batasan yang perlu diketahui

1. **Ini hanya lapisan data.** Tidak ada sistem login, tidak ada validasi input, tidak ada tampilan.
   Semuanya milik peran lain.
2. **Halaman-halaman masih memakai `src/data/articles.ts`.** Perpindahan ke fungsi repository adalah
   pekerjaan pemilik halaman masing-masing, dan bisa dicicil.
3. **Satu perbedaan yang sudah dicatat sebagai pengecualian:** kolom "kapan data terakhir diubah"
   berbeda antara data contoh dan database. Data contoh memakai tanggal terbit, database memakai
   waktu data dimasukkan. Wajar — data contoh tidak punya catatan penyuntingan. Belum ada halaman
   yang memakai kolom itu.
4. **Ada beberapa paket dari Neon yang ikut terpasang** tapi tidak dipakai aplikasi. Perlu
   diputuskan bersama sebelum dihapus, jangan dihapus sendirian.
5. **Setelah `git pull`, jalankan `npm install` ulang** — ada beberapa paket baru.

---

## 8. Kalau butuh fungsi baru

Kalau ada data yang kalian butuhkan tapi fungsinya belum ada, **bilang saja** — jangan menulis query
Prisma sendiri di dalam `src/app/`. Satu aturan itu yang menjaga supaya perubahan database tidak
merembet ke mana-mana.

Menambah tabel atau kolom wajib dibahas bersama dulu, karena kode anggota lain dibangun di atas
bentuk data ini.

---

## Riwayat dokumen

| Tanggal | Perubahan |
|---|---|
| 10 September 2026 | Versi pertama. Dirangkum dari PR #2 dan kondisi `main` di commit `f9f4ece` |
