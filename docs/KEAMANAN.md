# Keamanan NewsTimes

> **Hasil audit:** 11 September 2026 · kondisi `main` di commit `bdf88c4`
> **Diperbarui:** 18 September 2026 · kondisi `main` di commit `5a28131` (setelah PR #6) — K-1 naik
> menjadi **kritis**, K-3 dan K-8 diperbarui. Perintah di bagian 9 dijalankan ulang, hasilnya sama.
> **Diperbarui:** 25 September 2026 · kondisi `main` di commit `314f3c8` — temuan baru **K-10
> (kritis): connection string Neon tertanam di kode dan sudah terbit di repo publik.** Dua anggapan
> dasar audit lama ikut gugur: situs **sudah** di-deploy, dan riwayat git **sudah** memuat rahasia.
>
> Dokumen ini berisi **temuan dari pemeriksaan sungguhan**, bukan daftar saran umum. Setiap temuan
> menyebutkan buktinya dan cara mengulangi pemeriksaannya (lihat [bagian 9](#9-cara-mengulang-audit-ini)).
>
> Yang diperiksa: kode di `src/`, `prisma/`, dan `scripts/`; seluruh riwayat git; dependensi lewat
> `npm audit`; konfigurasi Next.js. Yang **tidak** diperiksa: situs yang sedang berjalan (belum pernah
> di-deploy), dan pengujian penetrasi.

---

## Daftar isi

1. [Ringkasan](#1-ringkasan)
2. [Temuan, diurutkan dari yang paling berisiko](#2-temuan-diurutkan-dari-yang-paling-berisiko)
3. [Yang sudah aman, beserta buktinya](#3-yang-sudah-aman-beserta-buktinya)
4. [Siapa bisa menyerang apa](#4-siapa-bisa-menyerang-apa)
5. [Aturan keamanan untuk setiap anggota](#5-aturan-keamanan-untuk-setiap-anggota)
6. [Keputusan keamanan yang masih terbuka](#6-keputusan-keamanan-yang-masih-terbuka)
7. [Wajib sebelum deploy produksi](#7-wajib-sebelum-deploy-produksi)
8. [Kalau ada rahasia yang bocor](#8-kalau-ada-rahasia-yang-bocor)
9. [Cara mengulang audit ini](#9-cara-mengulang-audit-ini)

---

## 1. Ringkasan

**Kabar baiknya:** fondasinya sudah benar. Tidak ada celah injeksi SQL, tidak ada celah XSS di
tampilan artikel, dan kode database dipagari supaya tidak bisa terbawa ke browser.

**Yang paling mendesak per 25 September 2026: K-10.** Connection string database Neon — lengkap
dengan password — tertanam di `src/server/db/client.ts` sebagai nilai cadangan sejak commit `1ad0cd9`
(21 Sep, masuk lewat PR #11). Repo `article-website/news-times` berstatus **publik**, jadi rahasia itu
terbaca siapa saja. Kalimat "tidak ada satu pun rahasia yang pernah masuk ke riwayat git" di audit
11 dan 18 September **sudah tidak berlaku.**

**Yang perlu diwaspadai:** risiko terbesar yang diperingatkan audit 11 September **sudah terjadi**.

> Audit sebelumnya menulis: "Begitu `/admin` disambungkan ke database sebelum login dipasang, siapa
> pun yang membuka situs bisa mengubah dan menghapus artikel." PR #6 (digabung 17 Sep 2026)
> menyambungkan `/admin` ke database, dan login belum ada. **Sekarang siapa pun yang bisa membuka
> situs bisa menulis, menerbitkan, dan menghapus artikel di database.**

K-1 itu sendiri sudah ditangani PR #11 (login admin, digabung 21 Sep 2026). Tetapi anggapan "situs
belum pernah di-deploy" yang dipakai audit sebelumnya juga sudah gugur: situs berjalan di Vercel.

---

## 2. Temuan, diurutkan dari yang paling berisiko

| # | Tingkat | Temuan | Bukti | Pemilik |
|---|---|---|---|---|
| **K-10** | **Kritis** (sejak PR #11) | Connection string Neon lengkap dengan password tertanam di kode, dan repo-nya publik | `src/server/db/client.ts` baris 49–51 di commit `1ad0cd9` (21 Sep 2026), ada di `main` sampai commit `314f3c8`. Terbukti dipakai produksi: `news-times-project.vercel.app` menampilkan artikel yang hanya ada di database pengembangan | Orang 1 |
| **K-1** | **Kritis** (sejak PR #6) | Halaman redaksi dan Server Action-nya tidak terkunci, sudah menulis ke database, dan tautannya publik | `src/app/admin/page.tsx` dan kelima fungsi di `src/app/admin/actions.ts` tanpa pemeriksaan sesi; tautan "Redaksi (Admin)" di `src/components/Footer.tsx`; tidak ada `proxy.ts` | Orang 3 |
| **K-2** | Sedang | Belum ada sistem login sama sekali | Tabel `User` ada, tapi tidak ada kode autentikasi di `src/` | Orang 3 |
| **K-3** | Sedang | Belum ada validasi input di batas sistem | Tidak ada Zod maupun `src/lib/validation/`. `src/app/admin/actions.ts` hanya memeriksa judul dan isi tidak kosong; panjang teks, kategori, penulis, status, dan alamat gambar diterima apa adanya | Orang 4 |
| **K-4** | Sedang | Newsletter tanpa pembatas spam | Belum ada pembatasan permintaan. Saat ini belum berdampak karena formnya belum menyimpan apa pun | Orang 4 |
| **K-9** | **Ditutup** | Aturan "draft tidak bocor" tidak punya pengujian — **sudah diuji sejak 11 Sep 2026** | 12 pengecekan di `verify:all`, lolos uji mutasi | Orang 1 |
| **K-5** | Rendah | 4 kerentanan **high** di dependensi | `npm audit --omit=dev` — lihat [rincian](#k-5--rincian-kerentanan-dependensi) | Orang 1 |
| **K-6** | Rendah | Belum ada header keamanan (CSP, perlindungan *clickjacking*) | `next.config.ts` hanya berisi `reactCompiler: true` | Orang 5 |
| **K-7** | Rendah | Proses kerja tanpa penjaga: `main` tidak dikunci, PR digabung tanpa review | PR #2, #3, dan #6: 0 review. PR #6 membuka K-1 tanpa ada yang menahan. Tidak ada `.github/workflows/` | Orang 5 |
| **K-8** | Info | Jumlah dibaca bisa digelembungkan | Sejak PR #6, `src/app/articles/[slug]/page.tsx` memanggil `incrementViewCount()` setiap kali dibuka; refresh berulang menaikkan angkanya | Orang 1 |

### K-10 — rahasia database terbit di repo publik

**Apa yang terjadi.** Commit `1ad0cd9` ("fix(db): sediakan connection string Neon fallback agar build
serverless sukses otomatis", 21 Sep 2026) mengganti pemeriksaan `DATABASE_URL` yang tadinya melempar
error menjadi nilai cadangan berisi connection string asli, lengkap dengan password. Commit itu masuk
`main` lewat PR #11.

**Kenapa kritis.**

1. Repo `article-website/news-times` **publik**. Password database terbaca siapa saja, dan sudah
   terbit sekitar empat hari sebelum ditemukan (21–25 Sep 2026).
2. Siapa pun yang menyalinnya bisa membaca, mengubah, dan **menghapus seluruh isi database** lewat
   koneksi langsung. Login admin dari PR #11 tidak menghalangi ini sama sekali — login menjaga pintu
   aplikasi, bukan pintu database.
3. Karena alamat database ada di kode, deploy mana pun menyambung sendiri ke database itu tanpa perlu
   mengisi setelan apa pun. Itulah yang membuat `news-times-project.vercel.app` memakai database
   pengembangan Orang 1, melanggar syarat nomor 6 di bagian 7.
4. Menghapus barisnya tidak menyelesaikan masalah. Riwayat git, *fork*, dan cache GitHub tetap
   menyimpannya. **String itu harus dianggap bocor selamanya.**

**Cara mencegah terulang.** `getPrisma()` sekarang berhenti dengan pesan yang menyebutkan di mana
`DATABASE_URL` seharusnya diisi. Kalau build serverless gagal karena variabel kosong, **isi
variabelnya di dashboard, jangan tanam nilainya di kode.**

**Penanganan:** ikuti urutan di [bagian 8](#8-kalau-ada-rahasia-yang-bocor) — ganti password Neon
dulu, isi `DATABASE_URL` baru di Vercel, baru bersihkan riwayat kalau perlu.

---

### K-1 — kenapa ini yang paling penting

Ada tiga hal yang kalau digabungkan jadi berbahaya:

1. `/admin` bisa dibuka siapa saja
2. Semua orang tahu alamatnya, karena ada di footer
3. ~~Rencana berikutnya adalah menyambungkan halaman itu ke database~~ — **sudah terjadi di PR #6**

Masing-masing sendiri belum berbahaya. **Ketiganya bersama-sama berarti siapa pun bisa menghapus
seluruh isi situs** — dan per 18 September 2026 ketiganya sudah terpenuhi.

**Kenapa mencabut tautan atau mengunci halaman saja tidak cukup:** Server Action seperti
`deleteArticleAction` adalah pintu HTTP tersendiri. Orang yang tahu caranya bisa memanggilnya
langsung tanpa pernah membuka `/admin`. Selain itu `getArticleDetailAction` mengembalikan isi
lengkap artikel **termasuk draft** kepada siapa pun yang memanggilnya.

**Cara mengamankannya yang benar di Next.js 16:**

- **`proxy.ts`** — nama baru untuk `middleware.ts` sejak Next.js 16 — untuk mengalihkan pengunjung
  yang belum login ke halaman login. Panduan resmi Next.js menyebut pemeriksaan di sini sebagai
  pemeriksaan **optimistis**: cepat, tapi bukan pengaman satu-satunya.
- **Pemeriksaan sesi di setiap Server Action yang mengubah data.** Ini pengaman yang sesungguhnya.
  Jangan hanya mengandalkan proxy.

Sumber: `node_modules/next/dist/docs/01-app/01-getting-started/16-proxy.md` dan
`node_modules/next/dist/docs/01-app/02-guides/authentication.md`.

**Langkah sementara**, kalau login masih lama — perlu diputuskan pemilik `/admin`:

- Cabut tautan "Redaksi (Admin)" dari footer. Ini tidak mengamankan apa pun — alamatnya tetap bisa
  ditebak dan Server Action tetap bisa dipanggil — tapi setidaknya tidak mengiklankannya
- Yang benar-benar menahan: di awal setiap fungsi `admin/actions.ts`, tolak permintaan kalau
  aplikasi tidak berjalan dalam mode pengembangan. Dengan begitu, deploy yang tidak sengaja pun
  tidak membuka penulisan data. Dicabut lagi begitu pemeriksaan sesi terpasang

### K-9 — aturan terpenting justru tidak teruji

> **Ditutup 11 September 2026.** `verify:all` sekarang punya 12 pengecekan dari sisi publik: empat
> kasus (draft, terjadwal besok, diarsipkan, sudah terbit) dikali tiga jalur (alamat, daftar,
> pencarian). Diuji balik dengan sengaja merusak `syaratTerbit()` — menghapus syarat tanggal atau
> syarat status masing-masing langsung menghasilkan 3 FAIL. Catatan di bawah dibiarkan sebagai riwayat.

Aturan "artikel hanya terlihat publik kalau `PUBLISHED` **dan** tanggal terbitnya sudah lewat"
memang ditegakkan di query Prisma:

```ts
status: "PUBLISHED" as const,
publishedAt: { not: null, lte: new Date() },
```

Tapi **tidak ada satu pun pengecekan otomatis yang memastikannya**. `verify:repo` menguji urutan dan
halaman, `verify:all` menguji perilaku draft di sisi **admin** — tidak ada yang memeriksa sisi
**publik**. Versi data contoh pun tidak pernah punya draft, jadi aturannya tidak pernah diuji di sana.

Akibatnya: kalau suatu hari dua baris di atas terhapus atau salah diubah, **seluruh 151 pengecekan
tetap lulus**, dan draft mulai bocor tanpa ada yang sadar.

**Perbaikannya** — tiga pengecekan tambahan di `scripts/verify-all-repositories.ts`, mode `prisma`:

1. Buat draft lewat `articleAdminRepo` → `articleRepo.findBySlug()` harus mengembalikan `null`
2. Terbitkan dengan tanggal besok → tetap harus `null`
3. Terbitkan dengan tanggal sekarang → harus terlihat

### K-5 — rincian kerentanan dependensi

| Paket | Tingkat | Masalahnya | Apakah menyentuh kita? |
|---|---|---|---|
| `mysql2` | high | Kebocoran kredensial dan DoS lewat protokol MySQL | **Tidak.** Hanya terpakai kalau tersambung ke MySQL. Kita PostgreSQL (`prisma/schema.prisma:16`) |
| `deepmerge-ts` | high | Kehabisan *stack* saat menggabungkan objek rekursif | Kecil. Dipakai `@prisma/config` saat membaca konfigurasi, bukan saat mengolah input pengunjung |
| `@prisma/config`, `prisma` | high | Mewarisi dua di atas | Sama seperti di atas |

**Jangan jalankan `npm audit fix --force`.** Perintah itu akan **menurunkan Prisma dari versi 7 ke
6.19.3** — perubahan besar yang merusak konfigurasi `prisma.config.ts` dan cara sambungan database
dibuat.

Yang sebaiknya dilakukan:

1. Pantau rilis Prisma berikutnya, lalu perbarui dengan cara biasa
2. Pertimbangkan memindahkan `prisma` dari `dependencies` ke `devDependencies`. CLI Prisma hanya
   dibutuhkan saat build dan migrasi, bukan saat aplikasi berjalan. **Perlu diuji dulu** bahwa build
   di Vercel tetap jalan — belum pernah dicoba

---

## 3. Yang sudah aman, beserta buktinya

| Area | Yang diperiksa | Hasil |
|---|---|---|
| **Injeksi SQL** | Pemakaian `$queryRaw` / `$executeRaw` di kode kita (di luar `src/generated/`) | **Tidak ada.** Semua query lewat Prisma, yang otomatis memisahkan perintah dan data |
| **XSS di artikel** | Pemakaian `dangerouslySetInnerHTML` atau `innerHTML` | **Tidak ada.** Isi artikel dirender sebagai `{article.content}`, dan React meng-*escape*-nya |
| **Rahasia di repo** | `.gitignore` | `.env*` diabaikan, kecuali `.env.example` |
| **Rahasia di riwayat git** | Seluruh riwayat, semua branch, dicari pola alamat database Neon, token, dan kunci | **Tidak ada satu pun.** Satu-satunya berkas `.env` yang pernah ter-commit adalah `.env.example` |
| **Kode database ke browser** | `import "server-only"` | Terpasang di `src/server/db/client.ts` dan keempat repository Prisma |
| **Halaman menyentuh database langsung** | Import Prisma atau `server/db` dari `src/app/` dan `src/components/` | **Tidak ada** |
| **Penyimpanan password** | `prisma/schema.prisma` | Hanya kolom `passwordHash`. Tidak ada kolom password asli |
| **Password ikut terbawa** | `src/server/repositories/user-repository.ts` | Pencarian yang membawa hash dipisah ke fungsi khusus `findByEmailWithSecret()`. Fungsi lain tidak membawanya |
| **Akun bawaan** | `prisma/seed.ts` | **Tidak ada** akun admin bawaan seperti `admin/admin123` |
| **Draft bocor** | Aturan tampil publik | **Ditegakkan** di query Prisma: `PUBLISHED` **dan** `publishedAt` sudah lewat. **Diuji** 12 pengecekan di `verify:all`, dan terbukti menangkap kerusakan |
| **Parameter halaman jahat** | `listPublished({ page: -5, perPage: 99999 })` | Dipaksa jadi halaman 1 dan maksimal 50 per halaman — **diuji** di `verify:repo`, jadi tidak bisa dipakai untuk menyedot seluruh isi database sekaligus |
| **Salah setelan di produksi** | `src/server/repositories/index.ts` | `DATA_SOURCE` yang salah ketik menghentikan aplikasi, bukan diam-diam memakai data contoh |
| **Database antar anggota** | `.env.example` | Setiap anggota diwajibkan memakai database Neon sendiri |

---

## 4. Siapa bisa menyerang apa

Model ancaman sederhana. Tujuannya bukan menakut-nakuti, tapi supaya jelas pertahanan mana yang
paling mendesak.

| Siapa | Yang dia coba | Pertahanan sekarang | Status |
|---|---|---|---|
| Pengunjung iseng | Menebak alamat artikel draft | Aturan tampil publik di lapisan data, sudah diuji | ✅ |
| Pengunjung iseng | Membuka `/admin` lalu menghapus artikel | Tidak ada — dan sejak PR #6 penghapusannya permanen di database | ❌ **K-1** |
| Penyerang | Memanggil Server Action admin langsung, tanpa membuka halaman | Tidak ada | ❌ **K-1** |
| Pengunjung iseng | Menyisipkan skrip lewat isi artikel | React meng-*escape* keluaran | ✅ |
| Penyerang | Injeksi SQL lewat kolom pencarian | Query lewat Prisma | ✅ |
| Bot spam | Membanjiri form newsletter | Tidak ada | ❌ **K-4** |
| Siapa saja | Mencuri alamat database dari repo GitHub | `.gitignore` + riwayat bersih | ✅ |
| Anggota tim yang keliru | Menggabungkan kode rusak ke `main` | Tidak ada | ❌ **K-7** |
| Anggota tim yang keliru | Menjalankan `db:reset` ke database produksi | Hanya disiplin — lihat [DEPLOY.md](./DEPLOY.md) | ⚠️ |

---

## 5. Aturan keamanan untuk setiap anggota

**Jangan pernah:**

- Commit `.env.local` atau menempelkan isinya di chat, issue, maupun screenshot
- Memakai database Neon milik anggota lain
- Menjalankan `npm run db:reset` atau `prisma migrate dev` ke database produksi
- Menulis query SQL mentah dengan menyambung teks dari input pengunjung
- Memakai `dangerouslySetInnerHTML` untuk isi yang ditulis orang
- Membuat akun contoh dengan password mudah ditebak, walaupun "cuma untuk tes"
- Menaruh pemeriksaan login **hanya** di `proxy.ts`
- Menjalankan `npm audit fix --force`

**Selalu:**

- Memeriksa sesi login di dalam setiap Server Action yang mengubah data
- Memvalidasi setiap isian dari luar sebelum disimpan
- Memakai `articleRepo` — bukan `articleAdminRepo` — di halaman publik
- Menambahkan variabel setelan baru ke `.env.example` tanpa nilainya

---

## 6. Keputusan keamanan yang masih terbuka

Semuanya bukan wewenang Orang 1, jadi sengaja tidak diputuskan di lapisan data. Lapisan data hanya
menyimpan hasilnya.

| Keputusan | Pemilik | Rekomendasi |
|---|---|---|
| Algoritma pengacak password | Orang 3 | Argon2id, atau bcrypt dengan *cost* minimal 12. Hindari MD5, SHA-1, dan SHA-256 polos — ketiganya terlalu cepat untuk password |
| Lama sesi login | Orang 3 | Sesi pendek untuk admin, misalnya 8 jam, dengan cookie `httpOnly`, `secure`, dan `sameSite` |
| Hak Editor vs Admin | Semua | Perannya sudah ada di database (`enum UserRole`) tapi belum berarti apa-apa. Usulan minimal: hanya Admin yang boleh menghapus artikel dan mengelola akun |
| Pembatas spam newsletter | Orang 4 | Batasi per alamat IP. Penolakan email ganda sudah ada di lapisan data |
| Header keamanan | Orang 5 | Panduannya tersedia di `node_modules/next/dist/docs/01-app/02-guides/content-security-policy.md` |

---

## 7. Wajib sebelum deploy produksi

Semua baris harus **PASS**. Yang belum dicek ditulis `NOT_RUN`, bukan dianggap lulus.

| # | Syarat | Status per 18 Sep 2026 |
|---|---|---|
| 1 | Login berjalan, dan password disimpan sebagai hash | FAIL — belum ada |
| 2 | Semua halaman `/admin` mengalihkan pengunjung yang belum login | FAIL — belum ada |
| 3 | Setiap Server Action penulis data memeriksa sesi sendiri | FAIL — `src/app/admin/actions.ts` punya 5 fungsi, tidak satu pun memeriksa sesi |
| 4 | Setiap input dari luar divalidasi | FAIL — hanya pemeriksaan "tidak kosong" untuk judul dan isi |
| 4a | Aturan "draft tidak bocor" diuji otomatis | **PASS** — 12 pengecekan di `verify:all` |
| 5 | `DATA_SOURCE=prisma` di setelan produksi | NOT_RUN — situs produksi membaca database, tapi setelan di dashboard Vercel belum diperiksa. Selama K-10 belum ditutup, sambungan bisa datang dari kode, bukan dari setelan |
| 6 | Database produksi terpisah dari database pengembangan | **FAIL** — produksi memakai database pengembangan milik Orang 1 (lihat K-10) |
| 7 | Tidak ada rahasia di riwayat git | **FAIL** sejak 21 Sep 2026 — lihat K-10 |
| 8 | Tidak ada akun contoh di database produksi | NOT_RUN |
| 9 | `npm audit` tidak punya temuan yang menyentuh jalur input pengunjung | **PASS** — keempat temuan di pohon CLI Prisma |
| 10 | Branch `main` dikunci, wajib review | FAIL — belum dikunci |

---

## 8. Kalau ada rahasia yang bocor

Misalnya `.env.local` tidak sengaja ter-commit, atau alamat database tertempel di chat grup.

1. **Anggap sudah bocor.** Menghapus commit-nya saja tidak cukup — riwayat git, *fork*, dan cache
   GitHub mungkin masih menyimpannya
2. **Ganti rahasianya sekarang juga**
   - Password database: Neon Console → proyekmu → *Roles* → reset password
   - `AUTH_SECRET`: buat yang baru dengan `npx auth secret`. Semua orang akan ter-*logout* — itu wajar
   - Token Vercel Blob: cabut di dashboard Vercel, buat yang baru
3. **Perbarui `.env.local`** di semua komputer yang memakainya, dan di setelan Vercel
4. **Beri tahu tim**, sebutkan rahasia apa yang bocor dan kapan diganti
5. **Baru setelah itu** bersihkan riwayat git kalau perlu

Urutannya penting: **ganti dulu, bersihkan kemudian.** Membersihkan riwayat tanpa mengganti rahasianya
hanya memberi rasa aman palsu.

---

## 9. Cara mengulang audit ini

Jalankan dari folder repo. Hasil yang diharapkan ditulis di sebelahnya.

```bash
# SQL mentah di kode kita — harapannya: kosong
grep -rn "queryRaw\|executeRaw" src scripts prisma --include=*.ts --exclude-dir=generated

# HTML mentah di tampilan — harapannya: kosong
grep -rn "dangerouslySetInnerHTML\|innerHTML" src

# Halaman menyentuh database — harapannya: kosong
grep -rn "generated/prisma\|server/db\|@prisma/client" src/app src/components

# Berkas .env yang pernah ter-commit — harapannya: hanya .env.example
git log --all --name-only --format="" | grep -E "^\.env" | sort -u

# Kerentanan dependensi — bandingkan dengan tabel K-5
npm audit --omit=dev
```

Audit ulang setiap kali ada fitur yang menyentuh login, input pengunjung, upload, atau data akun.

---

## Dokumen terkait

[ARSITEKTUR.md](./ARSITEKTUR.md) · [DEPLOY.md](./DEPLOY.md) · [PENGUJIAN.md](./PENGUJIAN.md) ·
[PRD.md](./PRD.md)
