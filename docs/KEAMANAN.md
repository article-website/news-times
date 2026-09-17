# Keamanan NewsTimes

> **Hasil audit:** 11 September 2026 · kondisi `main` di commit `bdf88c4`
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
tampilan artikel, tidak ada satu pun rahasia yang pernah masuk ke riwayat git, dan kode database
dipagari supaya tidak bisa terbawa ke browser.

**Yang perlu diwaspadai:** risiko terbesar belum terjadi, tapi **tinggal satu langkah lagi**.

> Halaman `/admin` tidak punya login, dan tautannya sudah terpasang di footer setiap halaman.
> Sekarang dampaknya terbatas karena halaman itu hanya menulis ke browser masing-masing. **Begitu
> disambungkan ke database sebelum login dipasang, siapa pun yang membuka situs bisa mengubah dan
> menghapus artikel.**

Urutan yang aman: **login dulu, baru sambungkan ke database.** Tidak boleh terbalik.

---

## 2. Temuan, diurutkan dari yang paling berisiko

| # | Tingkat | Temuan | Bukti | Pemilik |
|---|---|---|---|---|
| **K-1** | **Tinggi** → jadi **kritis** kalau urutan kerja salah | Halaman redaksi tidak terkunci, dan tautannya publik | `src/app/admin/page.tsx` tanpa pemeriksaan sesi; tautan "Redaksi (Admin)" di `src/components/Footer.tsx`; tidak ada `proxy.ts` | Orang 3 |
| **K-2** | Sedang | Belum ada sistem login sama sekali | Tabel `User` ada, tapi tidak ada kode autentikasi di `src/` | Orang 3 |
| **K-3** | Sedang | Belum ada validasi input di batas sistem | Tidak ada Zod maupun `src/lib/validation/`. Halaman admin menerima isian form apa adanya | Orang 4 |
| **K-4** | Sedang | Newsletter tanpa pembatas spam | Belum ada pembatasan permintaan. Saat ini belum berdampak karena formnya belum menyimpan apa pun | Orang 4 |
| **K-9** | **Ditutup** | Aturan "draft tidak bocor" tidak punya pengujian — **sudah diuji sejak 11 Sep 2026** | 12 pengecekan di `verify:all`, lolos uji mutasi | Orang 1 |
| **K-5** | Rendah | 4 kerentanan **high** di dependensi | `npm audit --omit=dev` — lihat [rincian](#k-5--rincian-kerentanan-dependensi) | Orang 1 |
| **K-6** | Rendah | Belum ada header keamanan (CSP, perlindungan *clickjacking*) | `next.config.ts` hanya berisi `reactCompiler: true` | Orang 5 |
| **K-7** | Rendah | Proses kerja tanpa penjaga: `main` tidak dikunci, PR digabung tanpa review | PR #2 dan PR #3: 0 review. Tidak ada `.github/workflows/` | Orang 5 |
| **K-8** | Info | Jumlah dibaca akan bisa digelembungkan | `incrementViewCount()` belum dipanggil halaman mana pun; begitu disambungkan, refresh berulang menaikkan angkanya | Orang 1 |

### K-1 — kenapa ini yang paling penting

Ada tiga hal yang kalau digabungkan jadi berbahaya:

1. `/admin` bisa dibuka siapa saja
2. Semua orang tahu alamatnya, karena ada di footer
3. Rencana berikutnya adalah menyambungkan halaman itu ke database

Masing-masing sendiri belum berbahaya. **Ketiganya bersama-sama berarti siapa pun bisa menghapus
seluruh isi situs.**

**Cara mengamankannya yang benar di Next.js 16:**

- **`proxy.ts`** — nama baru untuk `middleware.ts` sejak Next.js 16 — untuk mengalihkan pengunjung
  yang belum login ke halaman login. Panduan resmi Next.js menyebut pemeriksaan di sini sebagai
  pemeriksaan **optimistis**: cepat, tapi bukan pengaman satu-satunya.
- **Pemeriksaan sesi di setiap Server Action yang mengubah data.** Ini pengaman yang sesungguhnya.
  Jangan hanya mengandalkan proxy.

Sumber: `node_modules/next/dist/docs/01-app/01-getting-started/16-proxy.md` dan
`node_modules/next/dist/docs/01-app/02-guides/authentication.md`.

**Langkah sementara yang murah**, kalau login masih lama: cabut dulu tautan "Redaksi (Admin)" dari
footer. Ini tidak mengamankan apa pun — alamatnya tetap bisa ditebak — tapi setidaknya tidak
mengiklankannya.

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
| Pengunjung iseng | Membuka `/admin` lalu menghapus artikel | Tidak ada | ❌ **K-1** |
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

| # | Syarat | Status per 11 Sep 2026 |
|---|---|---|
| 1 | Login berjalan, dan password disimpan sebagai hash | FAIL — belum ada |
| 2 | Semua halaman `/admin` mengalihkan pengunjung yang belum login | FAIL — belum ada |
| 3 | Setiap Server Action penulis data memeriksa sesi sendiri | FAIL — belum ada |
| 4 | Setiap input dari luar divalidasi | FAIL — belum ada |
| 4a | Aturan "draft tidak bocor" diuji otomatis | **PASS** — 12 pengecekan di `verify:all` |
| 5 | `DATA_SOURCE=prisma` di setelan produksi | NOT_RUN — belum deploy |
| 6 | Database produksi terpisah dari database pengembangan | NOT_RUN — belum deploy |
| 7 | Tidak ada rahasia di riwayat git | **PASS** |
| 8 | Tidak ada akun contoh di database produksi | NOT_RUN — belum deploy |
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
