# Rencana Kerja Tim — NewsTimes

Panduan pembagian tugas **5 orang** untuk membuat backend NewsTimes, sampai websitenya online
**tanpa bayar sepeser pun**.

Dokumen ini dibuat supaya semua orang bisa kerja bareng tanpa saling tabrakan dan tanpa saling
menunggu.

> **Catatan:** rencana ini disusun untuk 5 peran, tapi anggota di organisasi GitHub ternyata
> ada **4 orang**. Jadi pembagiannya perlu disesuaikan — entah dua peran digabung, atau ada
> anggota yang belum diundang. Bahas ini dulu sebelum mulai.

## Kondisi repo sekarang

| | |
|---|---|
| Teknologi | Next.js 16.3.3, React 19.2.8, TypeScript, Tailwind CSS v4 |
| Jumlah file | 16 file di folder `src/` — 4 halaman, 8 komponen, 1 file data |
| Sumber data | Masih hardcode di `src/data/articles.ts` — cuma 5 artikel |
| Backend | **Belum ada sama sekali** — belum ada API, database, maupun login |

Artinya: yang sudah jadi baru tampilan depannya. Semua data artikel masih ditulis tangan di dalam
kode, jadi belum bisa ditambah lewat website.

---

## 0. Kamus istilah (baca ini dulu)

Kalau ada istilah yang belum familiar, balik ke sini.

| Istilah | Artinya dengan bahasa sederhana |
|---|---|
| **Backend** | Bagian program yang kerja di server: nyimpan data, ngecek login, ngatur siapa boleh apa. Nggak kelihatan sama pengunjung. |
| **Frontend** | Bagian yang kelihatan di layar pengunjung: halaman, tombol, gambar. |
| **Database** | Tempat menyimpan data secara permanen. Kita pakai PostgreSQL. |
| **Schema** | Rancangan tabel database: ada tabel apa aja, isinya kolom apa aja. |
| **Migration** | File yang isinya perintah "bikin tabel ini" atau "tambah kolom itu". Dijalankan supaya database berubah sesuai schema. |
| **Seed** | Mengisi database dengan data awal, biar nggak kosong pas dites. |
| **ORM (Prisma)** | Alat supaya kita bisa ambil data pakai kode JavaScript biasa, nggak perlu nulis SQL manual. |
| **Repository** | Fungsi pembungkus buat ambil data, misalnya `articleRepo.findBySlug()`. Halaman cukup panggil ini, nggak perlu tahu caranya ngambil dari mana. |
| **Data contoh (mock)** | Data sementara yang nempel di kode, dipakai buat ngoding sambil nunggu database jadi. |
| **API** | "Pintu" berupa alamat URL buat ngambil atau ngirim data, misal `/api/newsletter`. Dipakai kalau yang manggil ada DI LUAR server kita (browser pengunjung, robot Google). Kalau pemanggilnya sesama kode server, cukup panggil fungsi langsung. |
| **Route Handler** | Cara bikin alamat API di Next.js. Filenya `route.ts` di dalam folder `src/app/api/`. |
| **Server Action** | Cara ngirim data dari form ke server TANPA bikin alamat API sendiri. Next.js yang bikinin diam-diam. |
| **Zod** | Library buat ngecek data kiriman user bener atau nggak (misal: email formatnya valid). |
| **Auth** | Singkatan authentication — sistem login. |
| **Middleware** | Kode yang jalan duluan sebelum halaman dibuka. Dipakai buat nolak orang yang belum login. |
| **Deploy** | Naikin website ke internet biar bisa dibuka orang lain. |
| **PR (Pull Request)** | Cara ngusulin perubahan kode di GitHub. Diperiksa dulu teman satu tim, baru digabung. |
| **CI** | Robot GitHub yang otomatis ngecek kode tiap ada PR. Kalau error, PR-nya nggak boleh digabung. |
| **SEO** | Usaha supaya website gampang ditemukan di Google. |
| **Sitemap / RSS** | File khusus berisi daftar artikel, dibaca sama Google dan aplikasi pembaca berita. |
| **Free tier** | Jatah gratis dari sebuah layanan. Kalau lewat batas, baru bayar. |

---

## 1. Tiga keputusan penting sebelum mulai

Tiga hal ini harus disepakati dulu. Kalau nggak, pembagian tugas di bawah jadi kacau.

### Keputusan 1: Backend digabung di repo yang sama

Kita **tidak** bikin repo terpisah buat API. Next.js sudah bisa jalan sebagai backend juga.

Alasannya:

- Repo ini cuma 16 file. Bikin proyek terpisah malah nambah kerjaan (dua deploy, dua setting,
  dan harus ngurus CORS).
- Tipe data bisa dipakai bareng frontend dan backend, nggak perlu ditulis dua kali.
- Website berita butuh cepat dibuka biar bagus di Google. Kalau backend terpisah, tiap buka
  halaman harus "mampir" dulu ke server lain — jadi lebih lambat.
- Di `src/app/layout.tsx` sudah tertulis proyek ini memang direncanakan sebagai *monolith*
  (satu kesatuan).

Tapi ada satu aturan yang wajib dipegang: **kode halaman jangan pernah ngobrol langsung ke
database.** Semua lewat folder `src/server/`. Jadi kalau nanti mau dipisah, tinggal angkat
folder itu, nggak perlu bongkar semuanya.

#### Jangan salah paham: monolith BUKAN berarti nggak ada API

Kata "API" dipakai untuk dua hal yang berbeda, dan gampang ketuker:

| | Maksudnya | Kita pakai? |
|---|---|---|
| API sebagai **proyek terpisah** | Backend jadi repo sendiri, deploy sendiri, alamat sendiri | **Tidak** — ini yang dihindari monolith |
| API sebagai **alamat URL** | `/api/newsletter` di dalam proyek yang sama | **Ya**, seperlunya |

Kenapa masih perlu alamat URL? Karena ada satu batas yang nggak bisa dilompati: **kode yang
jalan di browser pengunjung nggak bisa manggil fungsi yang ada di server.**

Waktu pengunjung ngetik email di form lalu klik kirim, itu terjadi di HP dia. HP itu nggak
punya akses ke `newsletterRepo` — fungsi itu ada di server kita. Jadi harus ada alamat buat
ngirim datanya. Sama juga `rss.xml` dan `sitemap.xml`: yang baca itu robot Google dan aplikasi
pembaca berita di luar sana, mereka cuma bisa buka URL.

Jadi monolith itu menghapus lompatan yang **nggak perlu** (server ke server sendiri), bukan
lompatan yang **memang perlu** (browser ke server).

**Tapi porsinya lebih kecil dari yang ditulis di rencana awal.** Next.js punya fitur *Server
Action* yang bikin form bisa ngirim data ke server tanpa kita nulis alamat API sama sekali.
Yang beneran wajib ditulis tangan cuma yang dibaca mesin dari luar:

| Kebutuhan | Wajib alamat URL? | Kenapa |
|---|---|---|
| `sitemap.xml` | **Ya** | Dibaca robot Google |
| `rss.xml` | **Ya** | Dibaca aplikasi pembaca berita |
| `robots.txt` | **Ya** | Dibaca robot |
| Form newsletter | Tidak | Bisa pakai Server Action |
| Tombol "Muat Lebih Banyak" | Tidak | Bisa pakai Server Action |
| Halaman admin | Tidak | Panggil fungsi langsung |

### Keputusan 2: Deploy di hari pertama, bukan minggu terakhir

Repo ini sudah bisa di-deploy sekarang juga karena datanya masih hardcode. Jadi naikin ke Vercel
di **hari pertama**.

Kenapa penting: kalau deploy ditunda sampai akhir, biasanya bakal ketemu error aneh pas
deadline mepet. Kalau dari awal sudah online, tiap PR otomatis dapat link preview sendiri, jadi
teman satu tim bisa lihat hasilnya tanpa install apa-apa.

### Keputusan 3: Sepakati bentuk data dulu, database belakangan

Hari pertama, tentukan dulu: tabelnya apa aja, kolomnya apa aja, nama fungsinya apa.

Habis itu, ubah array di `src/data/articles.ts` jadi **data contoh (mock)**. Dengan begitu 4 orang
lain bisa langsung nulis kode minggu pertama, walaupun databasenya belum jadi. Nanti tinggal
diganti yang asli.

Ini trik penting supaya nggak ada yang nganggur nungguin orang lain.

---

## 2. Struktur folder yang mau dituju

```
src/
├── app/
│   ├── (public)/          # halaman untuk pengunjung          → Orang 2
│   ├── admin/             # halaman admin: login, tulis artikel → Orang 3
│   └── api/               # alamat URL, seperlunya saja       → Orang 4
│
├── server/                # ← BATAS. Semua kode backend di sini.
│   ├── db/                # koneksi database + schema Prisma   → Orang 1
│   ├── repositories/      # fungsi ambil data                  → Orang 1
│   ├── services/          # aturan bisnis (terbit, slug, dll)  → Orang 4
│   └── auth/              # sistem login admin                 → Orang 3
│
├── lib/validation/        # aturan Zod, dipakai bareng-bareng  → Orang 4
└── components/            # komponen tampilan                  → Orang 2
```

---

## 3. Pembagian 5 orang

Satu orang pegang satu bagian beserta foldernya. Boleh kok ngedit folder orang lain, tapi
**PR-nya harus diperiksa dulu sama yang punya folder.** Ini yang bikin 5 orang nggak tabrakan.

| | Bagian | Folder yang dipegang | Partner cadangan |
|---|---|---|---|
| **Orang 1** | Database | `prisma/`, `src/server/db/`, `src/server/repositories/` | Orang 4 |
| **Orang 2** | Tampilan Publik | `src/app/(public)/`, `src/components/` | Orang 3 |
| **Orang 3** | Halaman Admin & Login | `src/app/admin/`, `src/server/auth/` | Orang 2 |
| **Orang 4** | Validasi & SEO | `src/lib/validation/`, `src/server/services/`, `src/app/api/` | Orang 1 |
| **Orang 5** | Deploy & Testing | `.github/workflows/`, `.env.example`, `tests/`, `README.md` | Orang 1 |

> **Kenapa ada partner cadangan?** Biar kalau satu orang sakit atau sibuk, ada satu orang lagi
> yang ngerti bagian itu. Jangan sampai proyek macet gara-gara satu orang nggak masuk.

---

### Orang 1 — Database

**Perannya:** yang paling dibutuhkan di awal. Semua orang ambil data lewat kode buatan dia.

Tugas:

- Rancang tabel: `articles` (artikel), `categories` (kategori), `authors` (penulis),
  `users` (akun admin), `newsletter_subscribers` (pendaftar newsletter)
- Daftar akun Neon (database gratis), pasang Prisma, bikin migration pertama
- Isi database dengan 5 artikel yang sudah ada di `src/data/articles.ts`
- Perbaiki format tanggal: sekarang masih teks `"28 Juni 2025"` yang **nggak bisa diurutkan**.
  Ganti jadi kolom tanggal beneran (`publishedAt`), biar artikel bisa diurutkan dari yang terbaru
- Bikin fungsi ambil data + versi palsunya buat dipakai teman-teman

**Dianggap selesai kalau:** orang lain bisa panggil `articleRepo.findBySlug()` tanpa perlu tahu
Prisma sama sekali, dan perintah `npm run db:seed` bisa ngisi ulang database dari nol.

> ### ✅ Bagian ini SUDAH SELESAI
>
> Cara memakainya ada di **[DATABASE.md](./DATABASE.md)** — baca itu sebelum
> mulai ngoding bagianmu.
>
> Ringkasnya: **kamu tidak perlu punya database sendiri untuk mulai bekerja.**
> Cukup `cp .env.example .env.local` lalu `npm run dev`, dan data contohnya
> sudah jalan.
>
> Empat kumpulan fungsi yang tersedia: `articleRepo` (Orang 2),
> `articleAdminRepo` dan `userRepo` (Orang 3), `newsletterRepo` (Orang 4).

---

### Orang 2 — Tampilan Publik

**Perannya:** ngerapiin halaman yang dilihat pengunjung. Ini kerja di kode yang sudah ada.

Tugas:

- Ubah halaman biar ambil data dari database, bukan dari file `articles.ts`
- Betulkan link yang masih kosong. Di `Navbar.tsx` dan `CategoryList.tsx` semua menu masih
  `href="#"` alias nggak ke mana-mana
- Bikin halaman kategori dan halaman pencarian
- Bikin tombol **"Muat Lebih Banyak"** beneran jalan — sekarang tombolnya ada tapi diklik nggak
  ngapa-ngapain
- Ganti `<img>` di halaman detail artikel pakai `next/image` biar gambarnya lebih ringan
- Tambahkan tampilan saat loading, saat error, dan saat halaman nggak ketemu
  (`loading.tsx`, `error.tsx`, `not-found.tsx`)
- Pastikan tampilan rapi di HP maupun laptop

**Dianggap selesai kalau:** nggak ada lagi link yang buntu, tiap halaman punya tampilan loading
dan error, dan layoutnya nggak berantakan dari layar 360px sampai desktop.

---

### Orang 3 — Halaman Admin & Login

**Perannya:** bikin CMS, tempat admin nulis artikel. Ini bikin folder baru dari nol, jadi paling
aman dari tabrakan kode.

Tugas:

- Sistem login pakai Auth.js. Password harus di-*hash* (diacak), **jangan disimpan apa adanya**
- Middleware buat ngunci semua halaman `/admin` dari orang yang belum login
- Tabel daftar artikel: bisa dicari, disaring, diurutkan
- Form buat nulis dan ngedit artikel, plus status draft / terbit
- Upload gambar ke Vercel Blob — **jangan ke folder `public/`**, karena file di server nggak bisa
  ditulis pas sudah online

**Dianggap selesai kalau:** admin bisa login, nulis artikel baru lengkap sama gambarnya,
menerbitkannya, lalu artikel itu langsung muncul di halaman depan — tanpa perlu ngoding lagi.

---

### Orang 4 — Validasi & SEO

> **Catatan revisi:** peran ini awalnya ditulis "API & SEO". Namanya diganti karena
> menyesatkan. Di monolith, sebagian besar hal yang dulu butuh API sekarang bisa pakai
> Server Action tanpa nulis alamat URL sama sekali. Yang tersisa dan beneran wajib itu
> pengecekan data, aturan bisnis, dan SEO. Penjelasan lengkapnya ada di Keputusan 1.

**Perannya:** jadi penjaga gerbang data yang masuk, dan memastikan artikel gampang ketemu
di Google.

Tugas:

- Bikin aturan Zod buat ngecek semua data yang masuk dari luar — ini yang paling penting,
  dipakai semua orang
- Aturan bisnis di `src/server/services/`: bikin alamat artikel dari judul, aturan boleh
  terbit atau nggak
- Newsletter: cek format email, tolak yang sudah pernah daftar, batasi biar nggak di-spam.
  Sekarang tombolnya cuma munculin `alert()`, datanya nggak disimpan ke mana-mana.
  *Boleh pakai Server Action, nggak wajib bikin `/api/newsletter`.*
- Bikin `sitemap.xml`, `rss.xml`, `robots.txt` — ini yang **wajib** berupa alamat URL,
  karena yang baca robot Google dan aplikasi pembaca berita di luar sana
- Atur preview link kalau artikel dibagikan ke WhatsApp / Facebook (metadata OG)

**Dianggap selesai kalau:** semua data dari luar dicek dulu pakai Zod, dan begitu satu artikel
diterbitkan, sitemap sama RSS-nya ikut ter-update otomatis.

---

### Orang 5 — Deploy & Testing

**Perannya:** yang paling awal gerak dan paling akhir selesai. Dia yang jagain kualitas.

Tugas:

- **Hari 1:** daftar Vercel, naikin repo apa adanya, dapatkan link online
- Setting GitHub Actions biar tiap PR otomatis dicek (lint, cek tipe, build)
- Kelola variabel rahasia (`.env.local`) buat preview dan produksi
- Pasang Vitest buat tes logika, Playwright buat tes alur (misal: buka artikel, login, terbitkan)
- Cek kecepatan pakai Lighthouse, cek aksesibilitas, cek error di console
- Nyalakan proteksi branch `main`, tulis README dan panduan cara rilis

**Dianggap selesai kalau:** PR nggak bisa digabung kalau CI-nya merah, dan siapa pun di tim bisa
deploy ke produksi cuma dengan baca panduan.

---

## 4. Jadwal 4 minggu

Boleh dipanjangin atau dipendekin sesuai jam magang. Yang penting **urutannya**: sepakati dulu,
gabungkan di tengah, rapikan di akhir.

### Sprint 0 — Sepakati bareng (hari 1–2)

Semua orang kumpul. Hari ini belum nulis fitur, yang dikerjain cuma nentuin kesepakatan.

| Siapa | Kerja |
|---|---|
| Semua | Gambar rancangan tabel database bareng-bareng, sepakati nama tipe data dan daftar alamat URL yang perlu |
| Semua | Tulis struktur folder dan siapa pegang apa di file `CLAUDE.md` |
| Orang 5 | Naikin repo apa adanya ke Vercel → hari pertama sudah punya link online |
| Orang 5 | Nyalakan proteksi branch `main`: wajib PR, wajib 1 approval, wajib CI hijau |
| Orang 1 | Ubah `src/data/articles.ts` jadi data contoh, terus **jangan diutak-atik lagi** |

### Sprint 1 — Kerja paralel (minggu 1)

4 orang nulis kode pakai data contoh, sementara Orang 1 bikin database aslinya. Nggak ada yang
nunggu.

| Siapa | Kerja |
|---|---|
| Orang 1 | Daftar Neon, pasang Prisma, jalankan migration dan seed pertama |
| Orang 2 | Pindahkan halaman dari `import articles` ke pemanggilan fungsi repository |
| Orang 3 | Bikin kerangka `/admin`, pasang Auth.js, bikin middleware |
| Orang 4 | Bikin aturan Zod dan aturan bisnis pertama, dites pakai data contoh |
| Orang 5 | Setting CI, `.env.example`, preview per PR, kerangka Vitest |

### Sprint 2 — Gabungkan (minggu 2)

Data palsu diganti database asli. Kalau kesepakatan di Sprint 0 benar, ini cuma ganti satu baris.

| Siapa | Kerja |
|---|---|
| Orang 1 | Ganti data contoh jadi Prisma asli, tambah index di `slug`, `categoryId`, `publishedAt` biar query cepat |
| Orang 2 | Halaman kategori, pencarian, dan tombol "Muat Lebih Banyak" yang beneran jalan |
| Orang 3 | Fitur tambah/edit/hapus artikel lengkap, plus upload gambar |
| Orang 4 | Newsletter, sitemap, RSS, metadata OG |
| Orang 5 | Migration dan seed masuk CI, tes Playwright pertama |

### Sprint 3 — Isi konten & cek kualitas (minggu 3)

Website berita isinya cuma 5 artikel nggak bisa dinilai. Isi dulu, baru dites.

| Siapa | Kerja |
|---|---|
| Semua | Isi 30–50 artikel di semua kategori. Sengaja masukin kasus aneh: judul kepanjangan, artikel tanpa gambar |
| Orang 5 | Jalankan semua pengecekan: lint, cek tipe, tes, build, Lighthouse, aksesibilitas |
| Semua | Perbaiki temuan di bagian masing-masing, mulai dari yang paling parah |
| Orang 2 | Coba buka di HP beneran, jangan cuma di mode responsive browser |

### Sprint 4 — Rilis (minggu 4)

Naik ke produksi, tulis dokumentasi, latihan presentasi. **Minggu ini jangan nambah fitur baru.**

| Siapa | Kerja |
|---|---|
| Orang 5 | Setting env produksi, deploy, cek ulang setelah deploy |
| Orang 1 | Jalankan migration di produksi, backup data |
| Orang 3 | Bikin akun admin beneran, hapus akun contoh/percobaan |
| Orang 4 | Daftarkan sitemap, cek preview link pakai validator OG |
| Semua | README, catatan arsitektur, latihan demo |

> **Sisakan 2 hari kosong di akhir.** Di proyek rame-rame, yang biasanya molor itu bukan bikin
> fiturnya — tapi pas nyatuin kerjaan semua orang.

---

## 5. Layanan gratis yang dipakai

Angka di bawah dicek **September 2026** dan bisa berubah. Orang 5 tolong cek ulang pas bikin akun.

| Kebutuhan | Pakai apa | Jatah gratisnya | Yang perlu diingat |
|---|---|---|---|
| Hosting website | **Vercel Hobby** | 100 GB bandwidth · 100 ribu pemanggilan fungsi · maks 10 detik per fungsi | Cuma boleh buat proyek non-komersial. Kalau jatah habis, website dimatikan sampai bulan depan — nggak bisa nambah dengan bayar. |
| Database | **Neon Free** | 0,5 GB · 100 jam komputasi/bulan | Otomatis "tidur" kalau 5 menit nggak dipakai, bangun lagi sekitar 1 detik. Cocok buat web yang dibuka sesekali. |
| Simpan gambar | **Vercel Blob** | 1 GB penyimpanan · 10 GB transfer/bulan | Paling gampang dipakai di Next.js. |
| Login | **Auth.js** | tanpa batas | Jalan di aplikasi sendiri, nggak perlu daftar layanan lain. |
| CI | **GitHub Actions** | gratis buat repo public | Repo private ada batas menit per bulan. Kalau repo ini private, jaga build tetap cepat. |
| *(alternatif DB)* | Supabase Free | 500 MB · 2 proyek aktif | **Dimatikan total kalau 7 hari nggak dipakai**, dan harus dinyalakan manual lewat dashboard. Karena itu kita pilih Neon. |

> **Kenapa Neon, bukan Supabase?** Bayangkan pembimbing buka website kalian setelah libur
> seminggu. Kalau pakai Supabase, databasenya sudah dimatikan dan website error. Neon cuma
> "tidur" sebentar, sekali di-refresh langsung nyala lagi.

Sumber: [batas gratis Vercel](https://deploywise.dev/blog/vercel-free-tier-limits-2026) ·
[Neon vs Supabase](https://agentdeals.dev/neon-vs-supabase) ·
[Vercel Blob](https://infrafree.dev/en-us/provider/vercel)

---

## 6. Aturan main tim

Delapan aturan ini yang bikin 5 orang muat kerja di repo sekecil ini. Sepakati di Sprint 0, tempel
di README.

1. **Satu orang, satu wilayah.** Mau ngedit folder orang lain? Boleh, tapi minta dia review PR-nya.
2. **Jangan push langsung ke `main`.** Harus lewat PR, harus ada 1 orang yang approve, CI harus hijau.
3. **Perubahan tipe data harus dibahas bareng.** Jangan diam-diam diganti di tengah PR fitur,
   nanti kode orang lain rusak.
4. **PR jangan kegedean.** Usahakan di bawah 400 baris. PR 2000 baris pasti cuma di-approve
   tanpa dibaca.
5. **File `.env.local` jangan pernah di-commit.** Isinya password dan kunci rahasia. Yang
   di-commit cuma `.env.example` (isinya nama variabelnya doang, tanpa nilainya).
6. **Gambar jangan masuk git.** Folder `public/` sudah 18 MB. Semua upload baru ke Vercel Blob.
7. **Tiap orang punya partner cadangan** (lihat tabel bagian 3), biar nggak macet kalau ada yang
   berhalangan.
8. **Standup 15 menit tiap hari.** Cukup jawab 3 hal: kemarin ngerjain apa, hari ini mau apa,
   lagi stuck di mana.

---

## 7. Hal-hal yang berpotensi jadi masalah

Diurutkan dari yang paling bahaya.

### ⚠️ BAHAYA — Vercel gratis nggak boleh dipakai komersial

Paket Hobby cuma buat proyek non-komersial. Kalau website ini nantinya dipakai perusahaan atau
menghasilkan uang, pakai paket gratis itu melanggar aturan Vercel.

**Solusinya:** pastikan statusnya di Sprint 0. Kalau ini buat portofolio dan penilaian magang,
aman. Kalau ternyata mau dipakai perusahaan beneran, bahas anggaran hosting dari sekarang —
jangan seminggu sebelum deadline.

### Sedang — 5 orang di 16 file gampang tabrakan

Repo sekecil ini rawan konflik saat merge.
**Solusinya:** bagi kepemilikan folder, PR kecil-kecil, dan `articles.ts` dibekukan setelah
Sprint 0 (file itu yang paling rawan diedit banyak orang sekaligus).

### Sedang — Orang 1 bisa bikin yang lain nunggu

Kalau database belum jadi, 4 orang nganggur.
**Solusinya:** data contoh di Sprint 0. Ini alasan utama kenapa langkah itu penting.

### Sedang — Database "tidur" pas lagi demo

Neon mati otomatis setelah 5 menit nggak dipakai. Request pertama jadi lambat ~1 detik.
**Solusinya:** buka websitenya 1 menit sebelum presentasi biar databasenya sudah bangun.

### Ringan — Jatah database cuma 0,5 GB

Sebenarnya cukup buat puluhan ribu artikel, **asal gambar nggak disimpan di database.**
Simpan link gambarnya aja, filenya di Vercel Blob.

### Ringan — Batasan server gratis

Tiap fungsi maks jalan 10 detik, dan nggak bisa nyimpan file di server.
**Solusinya:** jangan bikin proses yang lama, dan upload gambar langsung dari browser ke Blob.

---

## 8. Status verifikasi

Biar jelas mana yang sudah dicek dan mana yang belum:

| Status | Keterangan |
|---|---|
| ✅ **PASS** | Repo sudah di-clone dan dibaca langsung: 16 file `src/`, Next.js 16.3.3, belum ada API/database/login |
| ✅ **PASS** | Batas paket gratis Vercel, Neon, Vercel Blob, Supabase sudah dicek September 2026 |
| ⏳ **NOT_RUN** | `npm install`, `npm run build`, `npm run lint` **belum dijalankan** (`node_modules` belum diinstall) |
| ⏳ **NOT_RUN** | Belum ada pengecekan lewat browser terhadap website yang jalan |
| ⏳ **NOT_RUN** | Akun Vercel dan Neon belum dibuat. Angka di tabel bagian 5 diambil dari dokumentasi publik, bukan dari akun tim ini |
