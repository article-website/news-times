# PRD — NewsTimes

> **Status dokumen:** draft pertama, ditulis **10 September 2026** — setelah Sprint 1 berjalan,
> bukan sebelumnya. Idealnya dokumen ini ada sejak hari pertama; karena tidak, isinya menggabungkan
> dua hal: kesepakatan yang memang sudah pernah dibahas, dan kondisi kode yang sudah terlanjur jalan.
>
> Hal yang belum pernah diputuskan siapa pun ditandai **[PERLU DIPUTUSKAN]**. Jangan dianggap final
> hanya karena tertulis di sini.
>
> **Sumber fakta:** `prisma/schema.prisma`, isi folder `src/`, [RENCANA-KERJA.md](./RENCANA-KERJA.md),
> dan riwayat commit sampai `f9f4ece`. Tidak ada angka atau fitur di dokumen ini yang dikarang.
>
> **Bedanya dengan RENCANA-KERJA.md:** dokumen itu soal *siapa mengerjakan apa dan kapan*.
> PRD ini soal *apa yang dibangun dan kenapa*.

---

## Daftar isi

1. [Ringkasan produk](#1-ringkasan-produk)
2. [Masalah yang diselesaikan](#2-masalah-yang-diselesaikan)
3. [Siapa penggunanya](#3-siapa-penggunanya)
4. [Lingkup rilis pertama](#4-lingkup-rilis-pertama)
5. [Kebutuhan fungsional](#5-kebutuhan-fungsional)
6. [Aturan produk yang sudah diputuskan](#6-aturan-produk-yang-sudah-diputuskan)
7. [Model data](#7-model-data)
8. [Kebutuhan non-fungsional](#8-kebutuhan-non-fungsional)
9. [Yang sengaja di luar lingkup](#9-yang-sengaja-di-luar-lingkup)
10. [Kriteria selesai](#10-kriteria-selesai)
11. [Yang masih harus diputuskan](#11-yang-masih-harus-diputuskan)

---

## 1. Ringkasan produk

NewsTimes adalah portal berita berbahasa Indonesia dengan ruang redaksi sendiri. Pengunjung membaca
artikel tanpa perlu akun; redaksi menulis dan menerbitkan artikel lewat halaman admin, tanpa
menyentuh kode.

| | |
|---|---|
| Bentuk | Satu aplikasi web Next.js 16 (monolith — satu repo, satu deploy) |
| Database | PostgreSQL di Neon |
| Hosting | Vercel |
| Bahasa konten | Indonesia |
| Tim | 5 orang, proyek magang |
| Biaya | Nol — semua layanan memakai paket gratis |

Keputusan "satu aplikasi, bukan backend terpisah" sudah diambil dan alasannya ada di
[RENCANA-KERJA.md](./RENCANA-KERJA.md). Konsekuensinya: sebagian besar hal yang biasanya butuh API
cukup memakai Server Action.

---

## 2. Masalah yang diselesaikan

Kondisi awal proyek: tampilannya sudah jadi, tapi **5 artikel ditulis tangan di dalam kode**
(`src/data/articles.ts`).

Akibatnya:

| Masalah | Dampaknya |
|---|---|
| Menambah artikel harus mengubah kode lalu deploy ulang | Redaksi tidak bisa menulis sendiri; semua lewat programmer |
| Tanggal disimpan sebagai teks (`"28 Juni 2025"`) | Artikel tidak bisa diurutkan dari yang terbaru — fungsi paling dasar sebuah situs berita |
| Menu kategori di navbar semuanya `href="#"` | Pengunjung tidak bisa menelusuri per topik |
| Tidak ada pencarian | Artikel lama praktis hilang begitu tergeser artikel baru |
| Form newsletter cuma memunculkan `alert()` | Tidak ada satu pun email yang tersimpan |

**Tujuan rilis pertama:** redaksi bisa menerbitkan artikel tanpa ngoding, dan pengunjung bisa
menemukan artikel lewat kategori maupun pencarian.

---

## 3. Siapa penggunanya

| Peran | Siapa | Yang dia butuhkan | Yang tidak boleh dia lakukan |
|---|---|---|---|
| **Pengunjung** | Siapa saja, tanpa akun | Membaca, menelusuri kategori, mencari, berlangganan newsletter | Melihat draft atau artikel yang belum waktunya tayang |
| **Editor** | Anggota redaksi | Menulis, mengedit, menerbitkan artikel | Mengelola akun orang lain |
| **Admin** | Penanggung jawab redaksi | Semua yang bisa dilakukan Editor, plus mengelola akun | — |
| **Tim pengembang** | 5 anggota | Bisa mulai bekerja tanpa saling menunggu | Menyentuh wilayah orang lain tanpa review |

Pembedaan Editor dan Admin sudah tertanam di database (`enum UserRole`), tapi **aturan detail siapa
boleh apa belum diputuskan** — lihat bagian 11.

---

## 4. Lingkup rilis pertama

**Wajib ada (v1)**

- Pengunjung bisa membaca artikel, menelusuri kategori, dan mencari
- Redaksi bisa login, menulis, mengedit, menerbitkan, dan menghapus artikel
- Artikel tersimpan permanen di database — bukan di dalam kode, bukan di browser
- Draft dan artikel terjadwal tidak bocor ke publik
- Situs bisa diakses publik lewat satu alamat, dan lolos pengecekan otomatis

**Sebaiknya ada (v1, boleh mundur kalau waktunya mepet)**

- Newsletter yang benar-benar menyimpan email
- `sitemap.xml`, `rss.xml`, `robots.txt`, dan preview link saat artikel dibagikan
- Upload gambar

**Tidak dikerjakan di v1** — lihat bagian 9.

---

## 5. Kebutuhan fungsional

Kolom **Sekarang** diisi berdasarkan kode di commit `f9f4ece`, bukan berdasarkan rencana.

Keterangan: ✅ jalan · 🟡 sebagian · ⬜ belum ada

### Untuk pengunjung

| ID | Kebutuhan | Sekarang | Catatan |
|---|---|---|---|
| P-01 | Halaman depan menampilkan artikel unggulan dan artikel terbaru | 🟡 | Jalan, tapi datanya masih dari `articles.ts` |
| P-02 | Daftar artikel bisa dilanjutkan (paginasi / "Muat Lebih Banyak") | 🟡 | Tombolnya ada di `src/app/page.tsx:36` tapi belum melakukan apa-apa |
| P-03 | Halaman detail artikel per alamat | 🟡 | Jalan, data masih dari `articles.ts` |
| P-04 | Halaman per kategori | ⬜ | Enam menu di `Navbar.tsx` semuanya masih `href="#"` |
| P-05 | Pencarian artikel | ⬜ | Halamannya belum ada; fungsi `articleRepo.search()` sudah tersedia |
| P-06 | Daftar artikel populer di sidebar | 🟡 | Memakai `viewCount`; sekarang dari data contoh |
| P-07 | Berlangganan newsletter | 🟡 | Form ada, tapi `NewsletterForm.tsx:10` cuma memanggil `alert()` |
| P-08 | Alamat artikel yang salah menampilkan halaman "tidak ditemukan" | ✅ | Sudah diuji |
| P-09 | Tiap halaman punya tampilan loading dan error | ⬜ | Belum ada `loading.tsx` maupun `error.tsx` |
| P-10 | Tampilan rapi dari layar 360px sampai desktop | ⬜ | Belum pernah dicek di perangkat sungguhan |

### Untuk redaksi

| ID | Kebutuhan | Sekarang | Catatan |
|---|---|---|---|
| R-01 | Login dengan email dan password | ⬜ | Tabel `User` sudah siap, sistem loginnya belum dibuat |
| R-02 | Semua halaman `/admin` terkunci untuk yang belum login | ⬜ | **Tautan "Redaksi (Admin)" sudah publik di footer** |
| R-03 | Melihat daftar artikel termasuk draft | 🟡 | Ada di `/admin`, tapi datanya dari `localStorage` browser |
| R-04 | Menulis dan mengedit artikel | 🟡 | Sama — belum tersimpan ke database |
| R-05 | Memilih status draft atau terbit | ⬜ | Form sekarang selalu langsung menerbitkan |
| R-06 | Menjadwalkan artikel tayang di tanggal tertentu | ⬜ | Database sudah mendukung lewat `publishedAt` |
| R-07 | Menghapus artikel | 🟡 | Ada, masih di `localStorage` |
| R-08 | Mengunggah gambar artikel | ⬜ | Rencananya ke Vercel Blob, bukan ke folder `public/` |
| R-09 | Membuat admin pertama saat belum ada akun sama sekali | ⬜ | `userRepo.count()` sudah disediakan untuk mendeteksinya |

> **Catatan penting soal R-03, R-04, dan R-07.** Halaman `/admin` sudah jadi dan tampilannya rapi,
> tapi menyimpan data di `localStorage` — kotak penyimpanan milik browser. Artinya artikel yang
> ditambah hanya terlihat di perangkat yang menambahkannya, dan tidak pernah muncul di halaman
> depan. Menyambungkannya ke database tidak mengubah tampilan, hanya sumber datanya.

### Untuk sistem

| ID | Kebutuhan | Sekarang | Catatan |
|---|---|---|---|
| S-01 | Data artikel tersimpan permanen | 🟡 | Database dan fungsi aksesnya siap; halaman belum memakainya |
| S-02 | Draft dan artikel terjadwal tidak bocor ke publik | ✅ | Ditegakkan di lapisan data, bukan di tiap halaman |
| S-03 | Urutan artikel stabil antar halaman | ✅ | Memakai dua patokan urutan |
| S-04 | `sitemap.xml`, `rss.xml`, `robots.txt` | ⬜ | Wajib berupa URL, karena yang membacanya mesin dari luar |
| S-05 | Preview link saat dibagikan ke WhatsApp atau Facebook | ⬜ | |
| S-06 | Semua data dari luar divalidasi sebelum masuk | ⬜ | Rencananya memakai Zod |
| S-07 | Newsletter tahan spam dan menolak email ganda | ⬜ | Penolakan email ganda sudah ada di lapisan data |
| S-08 | Tiap pull request diperiksa otomatis | ⬜ | Belum ada `.github/workflows/`; branch `main` juga belum dikunci |
| S-09 | Situs bisa diakses publik | ⬜ | Belum ada bukti deploy di dalam repo |

---

## 6. Aturan produk yang sudah diputuskan

Delapan aturan ini sudah tertanam di kode. Mengubahnya berarti mengubah kode, jadi bahas dulu.

| # | Aturan | Kenapa |
|---|---|---|
| 1 | Artikel terlihat publik hanya kalau statusnya `PUBLISHED` **dan** tanggal terbitnya sudah lewat | Tanpa syarat kedua, artikel terjadwal bisa dibaca lebih awal oleh siapa pun yang menebak alamatnya |
| 2 | Daftar artikel tidak membawa isi lengkap artikel | Kartu artikel cuma butuh judul dan ringkasan; membawa isi penuh memperbesar data puluhan kali lipat |
| 3 | Tanggal terbit disimpan sebagai tanggal sungguhan, bukan teks | Teks diurutkan per huruf: `"28 Juni"` dianggap lebih kecil dari `"3 Mei"` |
| 4 | Urutan artikel memakai dua patokan (tanggal, lalu alamat) | Ada tiga artikel bertanggal sama; tanpa patokan kedua, satu artikel bisa muncul dua kali di halaman berbeda |
| 5 | Tidak ada akun admin bawaan | Akun contoh dengan password mudah ditebak jadi pintu belakang kalau ikut terpasang di produksi |
| 6 | Kategori tetap enam, walaupun dua di antaranya belum ada artikelnya | Kalau daftar kategori diambil dari artikel saja, menu Internasional dan Olahraga hilang sendiri |
| 7 | Gambar tidak masuk git, disimpan di layanan penyimpanan | Folder `public/` sudah 18 MB, dan server produksi tidak bisa ditulisi |
| 8 | `src/data/articles.ts` dibekukan — hanya jadi sumber data awal | Beberapa halaman masih memakainya; mengubah bentuknya akan merusak kerjaan orang lain |

---

## 7. Model data

Lima tabel. Bentuk lengkapnya ada di `prisma/schema.prisma`; yang di bawah cuma intinya.

| Tabel | Isinya | Yang perlu diingat |
|---|---|---|
| `Article` | Artikel | `publishedAt` boleh kosong (berarti draft). Punya `status`, `viewCount`, dan 3 index yang mengikuti pola pencarian tersering |
| `Category` | Kategori | Punya `order` untuk mengatur urutan di navbar tanpa hardcode di komponen |
| `Author` | Penulis artikel | Terpisah dari akun login — penulis tidak harus punya akun |
| `User` | Akun redaksi | Hanya menyimpan hash password. Punya peran `ADMIN` atau `EDITOR` |
| `NewsletterSubscriber` | Pendaftar newsletter | Berhenti berlangganan dicatat lewat `unsubscribedAt`, datanya tidak dihapus |

Satu artikel punya tepat satu kategori dan satu penulis. Kategori dan penulis tidak bisa dihapus
selama masih dipakai artikel.

**Aturan tunggal:** halaman tidak boleh menyentuh database langsung. Semua lewat empat kumpulan
fungsi di `@/server/repositories` — cara memakainya ada di [DATABASE.md](./DATABASE.md).

---

## 8. Kebutuhan non-fungsional

| Aspek | Targetnya | Batas nyata yang perlu diingat |
|---|---|---|
| Kecepatan | Halaman depan terasa cepat dibuka | Database ada di Singapura, sekitar 0,3 detik per permintaan. Neon "tidur" setelah 5 menit menganggur dan bangun lagi sekitar 1 detik |
| Batas gratis | Tetap di dalam jatah | Vercel Hobby 100 GB bandwidth · Neon 0,5 GB dan 100 jam komputasi per bulan · Blob 1 GB |
| Keamanan | Password hanya disimpan sebagai hash; rahasia tidak pernah masuk repo | `.env.local` tidak boleh di-commit. Kode database dipagari supaya tidak ikut terkirim ke browser |
| Aksesibilitas | Bisa dipakai dengan keyboard, kontras cukup, tiap gambar punya `alt` | Belum pernah diaudit |
| Perangkat | 360px sampai desktop | Belum pernah dicek di HP sungguhan |
| Kualitas kode | `typecheck`, `lint`, dan `build` bersih sebelum digabung | Saat ini `lint` masih 2 error, jadi pengecekan otomatis belum bisa dinyalakan |

---

## 9. Yang sengaja di luar lingkup

Tidak dikerjakan di v1: komentar pembaca, akun untuk pengunjung, notifikasi, iklan, statistik
pengunjung, aplikasi mobile, multi-bahasa, dan banyak redaksi dalam satu situs.

**[PERLU DIPUTUSKAN]** Daftar ini disusun dari apa yang tidak pernah disebut di rencana kerja
maupun di kode. Kalau ada yang sebenarnya diharapkan pembimbing, sebutkan sekarang — bukan di
minggu terakhir.

---

## 10. Kriteria selesai

Rilis pertama dianggap selesai kalau seluruh baris ini benar dan **sudah dibuktikan dengan
dijalankan**, bukan diasumsikan:

1. Redaksi bisa login, menulis artikel baru, menerbitkannya, dan artikel itu langsung muncul di
   halaman depan — tanpa menyentuh kode
2. Draft dan artikel terjadwal tidak bisa dibuka pengunjung, walaupun alamatnya ditebak
3. Tidak ada lagi menu atau tautan yang buntu
4. Pencarian dan halaman kategori mengembalikan hasil yang benar
5. Tiap halaman punya tampilan loading, error, dan kosong
6. `npm run typecheck`, `npm run lint`, dan `npm run build` semuanya bersih
7. Pull request tidak bisa digabung kalau pengecekan otomatis merah
8. Situs bisa dibuka publik, dan tampilannya rapi di HP sungguhan

Status yang sah untuk tiap baris hanya **PASS**, **FAIL**, atau **NOT_RUN**.

---

## 11. Yang masih harus diputuskan

Diurutkan dari yang paling berisiko kalau dibiarkan.

| # | Pertanyaan | Kenapa penting | Siapa yang memutuskan |
|---|---|---|---|
| 1 | Proyek ini komersial atau bukan? | Vercel paket gratis **melarang** pemakaian komersial. Kalau ternyata untuk perusahaan, anggaran hosting harus dibahas dari sekarang | Semua + pembimbing |
| 2 | Siapa Orang 4 (Validasi & SEO) dan Orang 5 (Deploy & Testing)? | Tanpa Orang 5, tidak ada yang mengunci `main` dan memasang pengecekan otomatis | Semua |
| 3 | Halaman `/admin` disambungkan ke database, atau dibiarkan `localStorage` dulu? | Selama masih `localStorage`, R-01 sampai R-09 tidak bisa dianggap selesai | Pemilik `/admin` + Orang 1 |
| 4 | Login dipasang sebelum atau sesudah `/admin` menyentuh database? | Tautan Redaksi sudah publik di footer. Kalau urutannya terbalik, siapa pun bisa menghapus artikel | Pemilik `/admin` |
| 5 | Editor boleh apa saja, Admin boleh apa saja? | Perannya sudah ada di database tapi belum berarti apa-apa | Semua |
| 6 | Berapa artikel yang harus ada saat rilis? | Situs berita berisi 5 artikel tidak bisa dinilai. Rencana kerja menyebut 30–50 | Semua |
| 7 | Repo ini public atau private? | Menentukan jatah menit GitHub Actions | Semua |
| 8 | Pakai domain sendiri atau alamat bawaan Vercel? | Perlu diputuskan sebelum sitemap dan metadata dibuat | Semua |

---

## Riwayat dokumen

| Tanggal | Perubahan |
|---|---|
| 10 September 2026 | Draft pertama. Disusun dari kondisi kode di commit `f9f4ece` |
