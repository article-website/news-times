# Memahami NewsTimes dari Nol

> **Untuk siapa:** siapa pun yang ingin benar-benar paham proyek ini, tanpa perlu sudah mengerti
> Next.js, database, atau istilah teknis lainnya. Tidak apa-apa kalau kamu masih pemula — dokumen
> ini memang ditulis untuk itu.
>
> **Cara membacanya:** tidak harus sekali duduk. Satu bagian per hari juga boleh. Kalau ada istilah
> yang belum kamu kenal, cek [kamus istilah](#kamus-istilah) di bagian paling bawah.
>
> **Bedanya dengan dokumen lain:** [README](../README.md) memberi tahu *cara menjalankan*,
> [PRD](./PRD.md) memberi tahu *apa yang dibangun*, [DATABASE.md](./DATABASE.md) memberi tahu *cara
> memakai fungsinya*. Dokumen ini menjelaskan ***kenapa semuanya begitu***, dari paling dasar.

---

## Daftar isi

**Bagian 1 — Gambaran besar** · sekitar 20 menit
1. [Kita sebenarnya membuat apa?](#1-kita-sebenarnya-membuat-apa)
2. [Bagaimana sebuah website bekerja](#2-bagaimana-sebuah-website-bekerja)
3. [Kenapa harus pakai database?](#3-kenapa-harus-pakai-database)

**Bagian 2 — Teknologi yang dipakai** · sekitar 20 menit
4. [Peta teknologi, satu per satu](#4-peta-teknologi-satu-per-satu)
5. [Kenapa pilih yang ini, bukan yang lain](#5-kenapa-pilih-yang-ini-bukan-yang-lain)

**Bagian 3 — Cara kerja proyek ini** · sekitar 30 menit
6. [Perjalanan satu klik](#6-perjalanan-satu-klik)
7. [Isi folder, dijelaskan satu per satu](#7-isi-folder-dijelaskan-satu-per-satu)
8. [Lima tabel data kita](#8-lima-tabel-data-kita)
9. [Aturan terpenting: halaman tidak boleh menyentuh database](#9-aturan-terpenting-halaman-tidak-boleh-menyentuh-database)

**Bagian 4 — Konsep yang sering bikin bingung** · sekitar 30 menit
10. [Server dan browser itu dua tempat berbeda](#10-server-dan-browser-itu-dua-tempat-berbeda)
11. [`async` dan `await`](#11-async-dan-await)
12. [Schema, migration, dan seed](#12-schema-migration-dan-seed)
13. [Berkas rahasia `.env.local`](#13-berkas-rahasia-envlocal)

**Bagian 5 — Kerja sehari-hari** · sekitar 20 menit
14. [Menjalankan proyek di komputermu](#14-menjalankan-proyek-di-komputermu)
15. [Alur git untuk pemula](#15-alur-git-untuk-pemula)
16. [Kalau muncul error](#16-kalau-muncul-error)

**Bagian 6 — Di mana kita sekarang** · sekitar 10 menit
17. [Yang sudah jalan dan yang belum](#17-yang-sudah-jalan-dan-yang-belum)
18. [Kalau kamu mau mulai berkontribusi](#18-kalau-kamu-mau-mulai-berkontribusi)

[Kamus istilah](#kamus-istilah)

---
---

# Bagian 1 — Gambaran besar

## 1. Kita sebenarnya membuat apa?

NewsTimes itu **situs berita** — seperti Detik atau Kompas, tapi jauh lebih kecil.

Ada dua sisi yang dibangun:

| Sisi | Siapa yang memakai | Isinya |
|---|---|---|
| **Sisi depan** | Pengunjung biasa | Membaca artikel, menelusuri kategori, mencari berita |
| **Sisi belakang** | Redaksi | Menulis artikel, mengedit, menerbitkan |

Yang membuat ini menarik untuk dipelajari: **sisi belakangnya**. Kalau situs cuma menampilkan
artikel yang ditulis programmer di dalam kode, itu bukan situs berita — itu brosur.

Situs berita sungguhan harus bisa dipakai wartawan yang tidak bisa ngoding sama sekali. Dia buka
halaman admin, mengetik artikel, klik "terbitkan", dan artikelnya muncul di halaman depan.
**Itulah yang sedang dibangun.**

> **Analogi restoran** yang akan dipakai berulang-ulang di dokumen ini:
>
> - **Ruang makan** = halaman yang dilihat pengunjung
> - **Dapur** = database, tempat semua bahan disimpan
> - **Pelayan** = kode yang mengambil data dari dapur lalu mengantarnya ke ruang makan
>
> Tamu tidak pernah masuk dapur. Dia cukup bilang "tolong ambilkan 10 artikel terbaru" ke pelayan.

---

## 2. Bagaimana sebuah website bekerja

Ini konsep paling dasar. Kalau bagian ini sudah jelas, sisanya jauh lebih mudah.

### Ada dua komputer, bukan satu

Waktu kamu membuka sebuah website, ada **dua komputer** yang bekerja:

| | Namanya | Milik siapa | Contoh |
|---|---|---|---|
| Komputer 1 | **Browser** (klien) | Pengunjung | HP atau laptop orang yang membaca |
| Komputer 2 | **Server** | Kita | Komputer yang menyala 24 jam di suatu tempat |

Keduanya berkomunikasi seperti surat-menyurat:

```
Pengunjung mengetik alamat
        ↓
Browser mengirim permintaan  ──────────►  Server menerima
                                              ↓
                                          Server menyiapkan halaman
                                              ↓
Browser menampilkan halaman  ◄──────────  Server mengirim balasan
```

### Kenapa pemisahan ini penting

Karena **apa pun yang sampai ke browser bisa dilihat semua orang.** Pengunjung bisa klik kanan →
"View Page Source", dan melihat isinya.

Jadi ada hal-hal yang **tidak boleh** dikirim ke browser:

- Alamat dan password database
- Kunci rahasia untuk login
- Artikel yang masih draft

Ini bukan teori. Di proyek kita, kode database sengaja diberi pagar supaya tidak mungkin ikut
terkirim ke browser. Penjelasannya di [bagian 10](#10-server-dan-browser-itu-dua-tempat-berbeda).

---

## 3. Kenapa harus pakai database?

### Kondisi awal proyek ini

Buka `src/data/articles.ts`. Isinya kira-kira begini:

```ts
export const articles = [
  { slug: "perekonomian-global", title: "Perekonomian Global...", ... },
  { slug: "perkembangan-ai",     title: "Perkembangan Terbaru...", ... },
];
```

Itu **daftar yang ditulis tangan di dalam kode**. Seperti mencatat nomor telepon di buku tulis.

Kelihatannya baik-baik saja — situsnya jalan, artikelnya muncul. Tapi ada tiga masalah besar:

1. **Menambah artikel berarti ngoding.** Wartawan tidak bisa menulis sendiri.
2. **Setiap perubahan artikel butuh deploy ulang** — menaikkan versi baru situs ke internet.
3. **Semua orang melihat isi yang sama persis**, dan tidak ada yang bisa diubah lewat website.

### Apa itu database

Database adalah **tempat penyimpanan yang terpisah dari kode**, dan berjalan sebagai program
tersendiri.

| | Ditulis di dalam kode | Disimpan di database |
|---|---|---|
| Menambah data | Harus ngoding lalu deploy ulang | Isi form, klik simpan |
| Siapa yang bisa | Cuma programmer | Siapa pun yang punya akun |
| Mencari data | Harus ditelusuri satu per satu | Tinggal minta, database yang mencari |
| Kalau datanya banyak | Lambat dan berat | Cepat — memang dirancang untuk itu |

Database kita bernama **PostgreSQL**, dan dititipkan di layanan bernama **Neon**, yang servernya
ada di Singapura.

> Itu sebabnya setiap permintaan data butuh sekitar 0,3 detik: datanya memang harus bolak-balik
> Indonesia–Singapura.

---
---

# Bagian 2 — Teknologi yang dipakai

## 4. Peta teknologi, satu per satu

Jangan hafal semuanya sekaligus. Cukup tahu masing-masing gunanya apa.

### Yang membangun tampilan

**React** — cara menyusun tampilan dari potongan-potongan kecil yang bisa dipakai ulang, disebut
*komponen*. Contoh nyata di proyek kita: `ArticleCard.tsx` adalah satu kartu artikel. Halaman depan
memakai komponen yang sama itu berulang kali untuk 10 artikel, alih-alih menyalin kodenya 10 kali.

**Next.js** — kerangka kerja di atas React. Dia yang mengurus hal-hal yang kalau dikerjakan sendiri
akan makan waktu berminggu-minggu: mengatur alamat halaman, menyiapkan halaman di server sebelum
dikirim, dan menggabungkan sisi server dengan sisi tampilan dalam satu proyek.

> Cara alamat halaman ditentukan di Next.js sangat sederhana: **struktur folder = struktur alamat.**
>
> | Berkas | Alamatnya jadi |
> |---|---|
> | `src/app/page.tsx` | `/` |
> | `src/app/about/page.tsx` | `/about` |
> | `src/app/articles/page.tsx` | `/articles` |
> | `src/app/articles/[slug]/page.tsx` | `/articles/apa-saja` |
>
> Kurung siku `[slug]` artinya "bagian ini bisa apa saja" — itulah cara satu berkas melayani ribuan
> artikel berbeda.

**Tailwind CSS** — cara mengatur tampilan (warna, jarak, ukuran) dengan menulis nama-nama pendek
langsung di dalam kode tampilan. Misalnya `text-xl font-bold text-gray-900` berarti "huruf besar,
tebal, warna abu-abu sangat gelap".

**TypeScript** — JavaScript yang diberi label jenis data. Kalau sebuah fungsi seharusnya menerima
tanggal, tapi kamu memberinya tulisan, TypeScript memberi tahu **sebelum** programnya dijalankan.
Ini yang menangkap banyak kesalahan sejak awal.

### Yang mengurus data

**PostgreSQL** — jenis databasenya. Cocok untuk data yang saling terhubung, seperti punya kita:
satu artikel punya satu kategori dan satu penulis.

**Neon** — perusahaan yang menyediakan PostgreSQL secara online, gratis untuk pemakaian kecil.
Kita tidak perlu mengurus servernya sendiri.

**Prisma** — penerjemah antara kode kita dan database. Tanpa Prisma, kita harus menulis perintah
database mentah seperti:

```sql
SELECT * FROM articles WHERE status = 'PUBLISHED' ORDER BY published_at DESC LIMIT 10;
```

Dengan Prisma, kita menulis JavaScript biasa. Prisma yang menerjemahkannya jadi perintah di atas.

### Yang menaruh situs di internet

**Vercel** — tempat situs ini nanti diletakkan supaya bisa dibuka siapa saja. Gratis untuk proyek
non-komersial. **Ini belum dikerjakan.**

---

## 5. Kenapa pilih yang ini, bukan yang lain

Pertanyaan ini sering muncul saat presentasi, jadi bagus kalau kamu tahu jawabannya.

### Kenapa Neon, bukan Supabase?

Supabase juga gratis dan lebih lengkap fiturnya. Tapi paket gratisnya **mematikan proyek total
kalau 7 hari tidak dipakai**, dan harus dinyalakan manual lewat dashboard.

Bayangkan pembimbing membuka situs kita setelah libur seminggu — situsnya error. Neon cuma "tidur"
setelah 5 menit menganggur, dan bangun lagi sekitar satu detik begitu ada yang membuka.

### Kenapa PostgreSQL, bukan MongoDB?

Data kita saling terhubung. Satu artikel punya satu kategori dan satu penulis, dan kita sering
butuh "semua artikel di kategori Teknologi, urut dari terbaru". Itu justru yang paling dikuasai
PostgreSQL.

### Kenapa satu aplikasi, bukan backend terpisah?

Ada dua gaya membangun aplikasi web:

| | Satu aplikasi (**monolith**) | Backend terpisah |
|---|---|---|
| Jumlah repo | 1 | 2 |
| Jumlah deploy | 1 | 2 |
| Tempat yang bisa rusak | 1 | 2, plus sambungan di antaranya |
| Cocok untuk | Tim kecil, proyek kecil | Tim besar, banyak aplikasi berbagi data |

Tim kita 5 orang dengan proyek kecil. Backend terpisah cuma menambah pekerjaan tanpa memberi
manfaat yang sepadan.

---
---

# Bagian 3 — Cara kerja proyek ini

## 6. Perjalanan satu klik

Ini bagian yang paling membantu untuk memahami keseluruhan. Kita ikuti satu permintaan dari awal
sampai akhir.

**Kejadiannya:** seseorang membuka `newstimes.com/articles/perkembangan-ai`

```
1.  Browser mengirim permintaan ke server
        │
2.  Next.js melihat alamatnya, memilih berkas
    src/app/articles/[slug]/page.tsx
    dan mengisi [slug] = "perkembangan-ai"
        │
3.  Berkas itu memanggil:
    await articleRepo.findBySlug("perkembangan-ai")
        │
4.  Fungsi itu mengecek setelan: pakai data contoh, atau database?
        │
        ├── kalau "memory"  → ambil dari daftar di dalam kode
        └── kalau "prisma"  → tanya ke database di Singapura
        │
5.  Sebelum mengembalikan, dia memeriksa dua hal:
    · statusnya sudah PUBLISHED?
    · tanggal terbitnya sudah lewat?
    Kalau salah satu tidak terpenuhi → dianggap tidak ada
        │
6.  Data artikel kembali ke halaman
        │
7.  Halaman menyusun tampilan: judul, gambar, isi, sidebar
        │
8.  Server mengirim hasilnya sebagai halaman jadi
        │
9.  Browser menampilkannya
```

**Yang perlu diperhatikan di langkah 5.** Pemeriksaan "boleh dilihat publik" tidak dilakukan di
halaman, tapi di dalam fungsi pengambil data. Kenapa? Karena kalau tiap halaman harus memeriksa
sendiri, cepat atau lambat akan ada satu halaman yang lupa — dan draft pun bocor.

**Yang perlu diperhatikan di langkah 4.** Halaman sama sekali tidak tahu datanya datang dari mana.
Itulah yang membuat tim bisa bekerja sebelum databasenya siap.

---

## 7. Isi folder, dijelaskan satu per satu

```
news-times/
├── prisma/              ← rancangan database
├── src/
│   ├── app/             ← halaman-halaman
│   ├── components/      ← potongan tampilan yang dipakai ulang
│   ├── data/            ← data contoh
│   └── server/          ← kode yang HANYA jalan di server
├── scripts/             ← program pengecek
├── docs/                ← dokumentasi (kamu sedang membacanya)
└── public/              ← gambar dan berkas statis
```

Sekarang satu per satu.

### `prisma/` — rancangan database

| Berkas | Isinya |
|---|---|
| `schema.prisma` | **Denah database.** Ada tabel apa saja, tiap tabel punya kolom apa |
| `migrations/` | Riwayat perubahan denah, tersimpan berurutan |
| `seed.ts` | Program pengisi data awal, supaya database tidak kosong saat diuji |

### `src/app/` — halaman

Tiap folder di sini menjadi satu alamat. Berkas namanya selalu `page.tsx`.

| Berkas | Alamat | Isinya |
|---|---|---|
| `page.tsx` | `/` | Halaman depan |
| `articles/page.tsx` | `/articles` | Daftar semua artikel |
| `articles/[slug]/page.tsx` | `/articles/apa-saja` | Satu artikel |
| `about/page.tsx` | `/about` | Tentang kami |
| `admin/page.tsx` | `/admin` | Halaman redaksi |
| `layout.tsx` | — | Kerangka yang membungkus semua halaman: navbar dan footer |

### `src/components/` — potongan tampilan

Bagian tampilan yang muncul di banyak halaman, ditulis sekali lalu dipakai berulang.

`ArticleCard` (satu kartu artikel) · `Navbar` (menu atas) · `Footer` (bagian bawah) ·
`Sidebar` · `HeroFeatured` (artikel utama besar di atas) · `PopularArticles` ·
`CategoryList` · `NewsletterForm`

### `src/server/` — kode yang hanya jalan di server

**Ini folder paling penting untuk dipahami.** Isinya tidak pernah sampai ke browser pengunjung.

| Folder | Isinya |
|---|---|
| `db/` | Sambungan ke database |
| `domain/` | Bentuk data: sebuah artikel terdiri dari apa saja |
| `repositories/` | **Fungsi untuk mengambil dan menyimpan data.** Yang paling sering dipakai |
| `data/` | Penerjemah data lama ke bentuk baru |

### `scripts/` — program pengecek

Program kecil yang dijalankan lewat terminal untuk membuktikan kodenya benar. Tidak ikut menjadi
bagian dari situs.

### `public/` — gambar

Berkas yang bisa diakses langsung lewat alamat. Sudah 18 MB, karena itu ada aturan **gambar baru
tidak boleh ditambahkan ke sini** — nanti dipindah ke layanan penyimpanan terpisah.

---

## 8. Lima tabel data kita

Bayangkan tabel database seperti satu sheet di Excel: barisnya data, kolomnya jenis informasi.

### `Article` — artikel

| Kolom | Isinya | Catatan |
|---|---|---|
| `id` | Nomor pengenal unik | Acak, bukan 1-2-3 |
| `slug` | Alamat artikel | Contoh: `perkembangan-ai` |
| `title` | Judul | |
| `excerpt` | Ringkasan pendek | Yang muncul di kartu artikel |
| `content` | Isi lengkap | Bisa ribuan huruf |
| `imageUrl` | Alamat gambar | Boleh kosong |
| `status` | `DRAFT`, `PUBLISHED`, atau `ARCHIVED` | |
| `publishedAt` | Tanggal terbit | **Boleh kosong** — artinya masih draft |
| `viewCount` | Berapa kali dibaca | Untuk daftar "artikel populer" |
| `categoryId` | Kategori mana | Menunjuk ke tabel `Category` |
| `authorId` | Penulisnya siapa | Menunjuk ke tabel `Author` |

> **Kenapa `id` dibuat acak, bukan 1, 2, 3?**
> Kalau berurutan, orang bisa menebak alamat dan tahu berapa total artikel kita. Yang acak tidak
> membocorkan informasi apa pun.

> **Kenapa artikel tidak menyimpan nama kategori langsung?**
> Kalau nama kategori "Teknologi" ditulis di 200 artikel, lalu suatu hari mau diubah jadi "Tekno",
> harus mengubah 200 baris. Dengan menyimpan penunjuk ke tabel `Category`, cukup ubah satu tempat.

### `Category` — kategori

Nasional, Internasional, Ekonomi, Teknologi, Olahraga, Lifestyle. Punya kolom urutan supaya
susunan menu navbar bisa diatur dari database, bukan ditulis mati di dalam kode tampilan.

### `Author` — penulis artikel

Sengaja **terpisah** dari tabel akun. Alasannya: penulis artikel belum tentu punya akun login.
Artikel bisa ditulis kontributor luar yang tidak pernah masuk ke sistem.

### `User` — akun redaksi

Hanya menyimpan **hash** password, bukan passwordnya. Hash itu hasil pengacakan satu arah: bisa
dicek cocok atau tidak, tapi tidak bisa dikembalikan jadi password aslinya. Jadi kalau database
bocor, password aslinya tetap tidak terbaca.

### `NewsletterSubscriber` — pendaftar newsletter

Kalau seseorang berhenti berlangganan, datanya **tidak dihapus** — hanya dicatat tanggal
berhentinya. Supaya kalau dia mendaftar lagi, kita tahu riwayatnya.

### Kenapa ada "index"?

Index itu seperti **daftar isi di buku**. Tanpa daftar isi, mencari satu bab berarti membuka
halaman satu per satu. Dengan daftar isi, langsung ketemu.

Kita punya tiga index, masing-masing mengikuti pola pencarian yang paling sering dipakai — misalnya
"ambil artikel yang sudah terbit, urut dari terbaru".

---

## 9. Aturan terpenting: halaman tidak boleh menyentuh database

Kembali ke analogi restoran: **tamu tidak masuk dapur.**

```
BOLEH:
  Halaman  →  articleRepo.listPublished()  →  database

TIDAK BOLEH:
  Halaman  →  langsung ke database
```

Ada empat "pelayan" yang tersedia, semuanya diambil dari `@/server/repositories`:

| Nama | Untuk apa |
|---|---|
| `articleRepo` | Artikel untuk pengunjung. **Otomatis hanya yang sudah terbit** |
| `articleAdminRepo` | Artikel untuk halaman redaksi. Termasuk draft, bisa tulis dan hapus |
| `userRepo` | Akun redaksi, untuk proses login |
| `newsletterRepo` | Daftar pelanggan newsletter |

### Kenapa aturan ini penting

**Satu:** aturan keamanan cukup ditulis di satu tempat. Kalau tiap halaman mengambil sendiri, satu
halaman yang lupa memeriksa status artikel sudah cukup untuk membocorkan draft.

**Dua:** kalau suatu hari cara menyimpan data berubah, yang perlu diubah cuma satu lapisan.
Halamannya tidak tersentuh.

**Tiga:** ini yang membuat tim bisa bekerja paralel. Ada dua versi dari keempat pelayan itu:

| | Versi data contoh | Versi database |
|---|---|---|
| Butuh database? | Tidak | Ya |
| Bentuk hasilnya | Sama persis | Sama persis |

Yang dipakai ditentukan **satu baris** di `.env.local`:

```
DATA_SOURCE=memory     # pakai data contoh
DATA_SOURCE=prisma     # pakai database sungguhan
```

Sudah dibuktikan lewat 20 pemeriksaan yang membandingkan hasil kedua versi kolom per kolom —
semuanya sama, nol perbedaan.

---
---

# Bagian 4 — Konsep yang sering bikin bingung

## 10. Server dan browser itu dua tempat berbeda

Ini konsep yang paling sering membuat pemula tersesat, dan sudah terbukti membingungkan di proyek
ini sendiri.

### Aturan dasarnya

Di Next.js, kode **jalan di server secara bawaan**. Kecuali kalau berkasnya diberi tanda ini di
baris paling atas:

```tsx
"use client";
```

Satu baris itu memindahkan **seluruh berkas** ke browser pengunjung.

| | Jalan di server | Jalan di browser (`"use client"`) |
|---|---|---|
| Bisa menyentuh database? | **Ya** | **Tidak** |
| Bisa membaca berkas rahasia? | Ya | Tidak |
| Bisa pakai tombol interaktif, `useState`? | Tidak | Ya |
| Kodenya bisa dilihat pengunjung? | Tidak | Ya |

### Contoh nyata di proyek kita

Halaman `/admin` diberi tanda `"use client"` di baris pertama. Karena itu, halaman tersebut
**tidak bisa** memanggil `articleAdminRepo` — fungsi itu ada di server, dan sengaja dipagari
dengan `import "server-only"` supaya kalau ada yang mencoba memakainya di browser, prosesnya
langsung gagal dengan pesan yang jelas.

Akibatnya halaman admin menyimpan datanya di `localStorage` — kotak penyimpanan milik browser.
Artinya:

- Artikel yang ditambah **cuma terlihat di perangkat yang menambahkannya**
- Dibuka di HP: tidak ada
- Halaman depan situs: tidak berubah sama sekali
- Hapus riwayat browser: semua artikel yang ditambah hilang

**Ini bukan kesalahan ketik.** Ini konsekuensi dari satu baris `"use client"` di tempat yang salah.

### Cara membetulkannya

Yang perlu dipindah bukan fungsinya, tapi **batas antara bagian server dan bagian browser**:

- Halaman utamanya berjalan di server, supaya bisa mengambil data dari database
- Hanya form-nya yang `"use client"`, supaya tombolnya tetap bisa diklik
- Penyimpanan lewat **Server Action** — fitur Next.js yang membuat form bisa mengirim data ke
  server tanpa kita perlu membuat alamat URL sendiri

---

## 11. `async` dan `await`

Dua kata ini muncul di mana-mana. Ini penjelasan paling sederhananya.

### Kenapa harus menunggu

Sebagian pekerjaan selesai seketika:

```ts
const total = 5 + 3;   // langsung jadi
```

Sebagian lagi butuh waktu, karena harus menunggu pihak lain:

```ts
const artikel = await articleRepo.findBySlug("perkembangan-ai");
```

Baris kedua harus menunggu jawaban dari database di Singapura — sekitar 0,3 detik. Dalam ukuran
komputer, itu **sangat lama**.

### Analogi warung makan

Kamu memesan nasi goreng. Ada dua cara menunggunya:

| Cara | Yang terjadi |
|---|---|
| Berdiri diam di depan kasir | Antrean di belakangmu ikut macet |
| Duduk, dipanggil kalau sudah jadi | Kasir bisa melayani orang lain sementara itu |

`await` adalah cara kedua. Programnya berkata "aku tunggu ini, silakan kerjakan yang lain dulu".

### Aturannya

- `await` hanya boleh dipakai di dalam fungsi yang diberi tanda `async`
- Kalau `await` lupa ditulis, yang kamu dapat bukan datanya, melainkan "janji" bahwa datanya akan
  datang. Gejalanya khas: di layar muncul tulisan aneh seperti `[object Promise]`

```tsx
export default async function HomePage() {          // ← ada "async"
  const featured = await articleRepo.listFeatured(3); // ← ada "await"
  return <HeroFeatured articles={featured} />;
}
```

Itu saja perubahan yang dibutuhkan untuk memindahkan sebuah halaman dari data contoh ke fungsi
pengambil data: **tambah `async`, tambah `await`.**

---

## 12. Schema, migration, dan seed

Tiga kata yang sering tertukar. Analoginya: membangun lemari arsip.

| Istilah | Analoginya | Di proyek kita |
|---|---|---|
| **Schema** | Gambar denah lemari: ada berapa laci, tiap laci untuk apa | `prisma/schema.prisma` |
| **Migration** | Surat perintah ke tukang: "tambahkan satu laci di sebelah kanan" | `prisma/migrations/` |
| **Seed** | Mengisi lemari dengan beberapa berkas contoh | `prisma/seed.ts` |

### Kenapa migration disimpan sebagai riwayat

Karena databasenya ada lebih dari satu: punyamu, punya temanmu, dan nanti punya server produksi.
Riwayat perubahan yang tersimpan berurutan memastikan **semua database berakhir dengan bentuk yang
sama persis**, dijalankan dalam urutan yang sama.

### Perintahnya

```bash
npm run db:migrate   # terapkan perubahan denah ke database
npm run db:seed      # isi data contoh
npm run db:reset     # kosongkan lalu bangun ulang dari nol
npm run db:studio    # buka jendela untuk melihat isi database
```

> `npm run db:studio` sangat membantu untuk pemula. Dia membuka tampilan mirip Excel di browser,
> berisi isi database sungguhan. **Melihat datanya sendiri satu kali lebih berguna daripada membaca
> sepuluh penjelasan.**

---

## 13. Berkas rahasia `.env.local`

Ada informasi yang tidak boleh masuk ke dalam kode: alamat database beserta passwordnya, kunci
untuk menandatangani sesi login, token untuk mengunggah gambar.

Semua itu ditaruh di berkas bernama `.env.local`, dan berkas itu **tidak pernah ikut dikirim ke
GitHub**.

| Berkas | Ikut ke GitHub? | Isinya |
|---|---|---|
| `.env.example` | **Ya** | Cuma nama variabelnya, tanpa nilai rahasia |
| `.env.local` | **Tidak pernah** | Nilai sungguhan, punya masing-masing orang |

Cara memakainya saat pertama kali:

```bash
cp .env.example .env.local
```

Lalu isi nilainya sesuai punyamu. `.env.example` berfungsi sebagai **daftar belanja**: dia memberi
tahu variabel apa saja yang dibutuhkan, tanpa membocorkan isinya.

> Kalau sebuah rahasia sudah pernah masuk ke GitHub, menghapusnya saja tidak cukup — riwayat git
> masih menyimpannya. Rahasia itu harus dianggap bocor dan diganti dengan yang baru.

---
---

# Bagian 5 — Kerja sehari-hari

## 14. Menjalankan proyek di komputermu

```bash
git clone https://github.com/article-website/news-times.git
cd news-times
npm install
cp .env.example .env.local
npm run dev
```

Apa yang sebenarnya terjadi di tiap baris:

| Perintah | Yang dilakukan |
|---|---|
| `git clone` | Mengunduh seluruh proyek beserta riwayatnya |
| `cd news-times` | Masuk ke foldernya |
| `npm install` | Mengunduh semua pustaka yang dibutuhkan ke folder `node_modules/` |
| `cp .env.example .env.local` | Membuat berkas setelan pribadimu |
| `npm run dev` | Menjalankan situs di komputermu, di alamat `localhost:3000` |

**Kamu tidak butuh database untuk mulai.** Setelan bawaannya `DATA_SOURCE=memory`, jadi situs
langsung jalan dengan 5 artikel contoh.

### Kenapa `npm install` harus diulang setiap `git pull`

Karena daftar pustaka bisa bertambah. Kalau tidak diulang, akan muncul error "module not found"
yang membingungkan, padahal penyebabnya cuma itu.

### Beda `npm run dev` dan `npm run build`

| | `dev` | `build` |
|---|---|---|
| Untuk apa | Ngoding sehari-hari | Menyiapkan versi yang naik ke internet |
| Kecepatan | Lebih lambat | Dioptimalkan, jauh lebih cepat |
| Perubahan berkas | Langsung terlihat di browser | Harus di-build ulang |
| Pesan error | Lebih detail | Lebih ringkas |

Sebelum membuka pull request, **selalu jalankan `npm run build`**. Banyak kesalahan yang lolos di
mode `dev` tapi tertangkap di `build`.

---

## 15. Alur git untuk pemula

Git itu **mesin waktu untuk kode**. Dia menyimpan setiap versi, jadi kamu bisa kembali kapan saja.

### Empat istilah yang perlu kamu tahu

| Istilah | Artinya | Analoginya |
|---|---|---|
| **commit** | Menyimpan satu titik perubahan | Menyimpan draft skripsi dengan catatan "bab 2 selesai" |
| **branch** | Salinan terpisah untuk bereksperimen | Fotokopi naskah untuk dicoret-coret tanpa merusak aslinya |
| **push** | Mengirim hasil kerja ke GitHub | Mengunggah naskah ke Google Drive bersama |
| **pull request (PR)** | Mengusulkan agar hasil kerjamu digabung | "Ini usulanku, tolong dibaca dulu sebelum dipakai" |

### Alur yang dipakai tim ini

```bash
git checkout main               # pindah ke naskah utama
git pull                        # ambil versi terbaru dari GitHub
npm install                     # pustaka mungkin bertambah

git checkout -b feat/nama-kerjaanmu   # buat branch sendiri

# ... kerjakan perubahanmu ...

npm run typecheck && npm run lint && npm run build   # pastikan tidak rusak

git add .
git commit -m "feat: tambahkan halaman kategori"
git push -u origin feat/nama-kerjaanmu
```

Lalu buka GitHub, klik **"Compare & pull request"**, tulis apa yang kamu ubah dan kenapa, minta satu
orang membacanya.

### Kenapa tidak boleh langsung ke `main`

`main` adalah naskah utama yang dipakai semua orang. Kalau ada yang menulis langsung ke sana dan
kodenya rusak, **semua orang ikut rusak.** Branch membuat kerjaanmu terpisah sampai benar-benar
siap.

### Bentuk pesan commit

```
<jenis>: <apa yang berubah>
```

Jenisnya: `feat` (fitur baru) · `fix` (perbaikan bug) · `docs` (dokumentasi) · `refactor`
(merapikan tanpa mengubah perilaku) · `test` · `chore` (hal-hal teknis lain).

Tulis **kenapa**, bukan cuma **apa**. `fix: perbaiki bug` tidak membantu siapa pun. Bandingkan
dengan `fix(db): db:reset harus memanggil seed sendiri di Prisma 7` — itu langsung menjelaskan.

---

## 16. Kalau muncul error

Error itu **normal**, bahkan bagi yang sudah berpengalaman. Yang membedakan cuma cara membacanya.

### Tiga langkah membaca pesan error

1. **Baca baris paling atas.** Di situ inti masalahnya. Sisanya sering cuma jejak teknis.
2. **Cari nama berkas dan nomor barisnya.** Biasanya berbentuk `src/app/page.tsx:36`.
3. **Buka berkas itu di baris tersebut.** Jangan menebak sebelum melihat.

### Lima error yang paling mungkin kamu temui di proyek ini

| Pesannya | Artinya | Perbaikannya |
|---|---|---|
| `Cannot find module` | Ada pustaka yang belum terpasang | `npm install` |
| `[object Promise]` muncul di layar | Lupa menulis `await` | Tambahkan `await` |
| `server-only` / `You're importing a component that needs...` | Kode server dipakai di berkas `"use client"` | Pindahkan pengambilan data ke bagian server |
| `Environment variable not found: DATABASE_URL` | `.env.local` belum ada atau belum diisi | `cp .env.example .env.local` |
| `too many connections` | Terlalu banyak sambungan database menumpuk | Hentikan `npm run dev` lalu jalankan lagi |

### Kalau tetap buntu

Jalankan `npm run verify:repo`. Kalau 37 pengecekannya lulus, berarti fondasi datanya sehat dan
masalahnya ada di bagian lain. Itu sudah mempersempit pencarian dengan sangat cepat.

> **Satu hal yang perlu disadari:** program yang tidak error belum tentu benar. Pernah terjadi di
> proyek ini — sebuah skrip membaca sumber data yang salah tanpa memunculkan error sama sekali,
> gara-gara urutan `import`. Error hanya menangkap sebagian masalah.

---
---

# Bagian 6 — Di mana kita sekarang

## 17. Yang sudah jalan dan yang belum

Kondisi ini bisa berubah. Yang paling mutakhir selalu ada di [STATUS.md](../STATUS.md).

### Sudah jalan

- Lima tabel database beserta rancangan, riwayat perubahan, dan data awalnya
- Empat kumpulan fungsi pengambil data, masing-masing punya dua versi
- Halaman depan, daftar artikel, detail artikel, tentang kami, dan halaman redaksi
- 151 pengecekan otomatis, semuanya lulus

### Belum jalan

| Hal | Kondisinya |
|---|---|
| Halaman belum memakai database | Masih membaca 5 artikel dari dalam kode |
| Menu kategori | Keenam menunya belum mengarah ke mana-mana |
| Pencarian dan halaman kategori | Belum dibuat |
| Newsletter | Tombolnya cuma memunculkan pesan, emailnya tidak disimpan |
| Halaman redaksi | Menyimpan ke browser, bukan ke database |
| Login | Belum ada sama sekali |
| Situs online | Belum pernah di-deploy |

### Kalimat yang paling jujur untuk menggambarkan posisi sekarang

> Fondasinya sudah berdiri dan terbukti kuat. Yang tersisa adalah menyambungkannya ke tampilan.

---

## 18. Kalau kamu mau mulai berkontribusi

### Kalau kamu benar-benar baru

Mulai dari yang **kecil dan jelas**, bukan dari yang paling penting:

1. Jalankan proyeknya di komputermu sampai berhasil terbuka
2. Buka `npm run db:studio` dan lihat isi database dengan mata sendiri
3. Ubah satu tulisan kecil di sebuah halaman, lihat perubahannya di browser
4. Coba baca satu berkas di `src/server/repositories/` dari atas ke bawah
5. Baru setelah itu, ambil satu tugas kecil

### Pekerjaan kecil yang cocok untuk pemula di proyek ini

- Membetulkan tautan di `Footer.tsx` yang masih memakai `<a>`, seharusnya `<Link>`
- Menambahkan tampilan loading (`loading.tsx`) untuk satu halaman
- Membuat menu kategori di `Navbar.tsx` benar-benar mengarah ke suatu tempat

### Sembilan aturan yang harus kamu ikuti

Ada di [AGENTS.md](../AGENTS.md). Yang paling sering dilanggar pemula:

- Jangan `import` Prisma dari dalam `src/app/`
- Jangan mengubah `src/data/articles.ts`
- Jangan pernah commit `.env.local`
- Jangan push langsung ke `main`
- Jangan menulis "sudah dites" untuk sesuatu yang belum benar-benar dijalankan

### Aturan terakhir itu yang paling penting

Di proyek ini, status verifikasi hanya boleh **`PASS`**, **`FAIL`**, atau **`NOT_RUN`**.

Menulis "sudah jalan kok" untuk sesuatu yang belum dicoba adalah cara tercepat menghancurkan
kepercayaan tim. Menulis `NOT_RUN` beserta alasannya justru menunjukkan kamu bisa diandalkan.

---
---

## Kamus istilah

| Istilah | Artinya dengan bahasa sederhana |
|---|---|
| **API** | Cara satu program berbicara dengan program lain. Di web biasanya lewat alamat URL |
| **Backend** | Bagian yang bekerja di server: menyimpan data, mengecek login. Tidak terlihat pengunjung |
| **Branch** | Salinan kode terpisah untuk bekerja tanpa mengganggu yang lain |
| **Browser** | Program pembuka website: Chrome, Firefox, Safari |
| **Build** | Proses menyiapkan versi jadi yang siap naik ke internet |
| **Client / klien** | Sisi pengunjung — browsernya |
| **Commit** | Satu titik penyimpanan perubahan di git |
| **Component / komponen** | Potongan tampilan yang bisa dipakai berulang |
| **CI** | Program yang otomatis memeriksa tiap usulan perubahan. **Belum ada di proyek ini** |
| **Database** | Tempat menyimpan data secara permanen, terpisah dari kode |
| **Deploy** | Menaikkan situs ke internet supaya bisa dibuka siapa saja |
| **Draft** | Artikel yang belum diterbitkan |
| **Frontend** | Bagian yang terlihat di layar pengunjung |
| **Hash** | Hasil pengacakan satu arah. Dipakai untuk menyimpan password dengan aman |
| **Index** | Daftar isi database, supaya pencarian cepat |
| **localStorage** | Kotak penyimpanan milik browser. Isinya cuma ada di perangkat itu |
| **Migration** | Catatan perubahan rancangan database, tersimpan berurutan |
| **Monolith** | Satu aplikasi utuh, bukan dipecah jadi beberapa proyek terpisah |
| **npm** | Alat untuk memasang dan menjalankan pustaka JavaScript |
| **ORM** | Penerjemah antara kode dan database. Punya kita: Prisma |
| **Pull request (PR)** | Usulan perubahan yang dibaca dulu sebelum digabung |
| **Repository (git)** | Folder proyek beserta seluruh riwayatnya |
| **Repository (kode kita)** | Kumpulan fungsi pengambil data. Contoh: `articleRepo` |
| **Schema** | Rancangan tabel database |
| **Seed** | Mengisi database dengan data awal |
| **Server** | Komputer yang menyala terus dan melayani permintaan pengunjung |
| **Server Action** | Fitur Next.js: form bisa mengirim ke server tanpa membuat alamat URL |
| **Slug** | Bagian alamat yang menandai satu artikel. Contoh: `perkembangan-ai` |
| **SEO** | Upaya supaya artikel mudah ditemukan di Google |
| **TypeScript** | JavaScript dengan label jenis data, supaya kesalahan ketahuan lebih awal |

---

## Kalau kamu cuma sempat membaca empat bagian

- **[Bagian 2](#2-bagaimana-sebuah-website-bekerja)** — server dan browser itu dua tempat berbeda
- **[Bagian 6](#6-perjalanan-satu-klik)** — perjalanan satu klik, dari alamat sampai halaman muncul
- **[Bagian 9](#9-aturan-terpenting-halaman-tidak-boleh-menyentuh-database)** — kenapa halaman tidak boleh menyentuh database
- **[Bagian 10](#10-server-dan-browser-itu-dua-tempat-berbeda)** — apa yang terjadi kalau `"use client"` salah tempat

Empat itu yang paling sering jadi sumber kebingungan, dan paling banyak menjelaskan kenapa proyek
ini disusun seperti sekarang.

---

## Riwayat dokumen

| Tanggal | Perubahan |
|---|---|
| 10 September 2026 | Versi pertama. Disusun dari kondisi kode di commit `5a5cf46` |
