# Strategi Pengujian

> **Diperbarui:** 18 September 2026 · kondisi `main` di commit `5a28131` (setelah PR #6)
>
> Dokumen ini menjawab tiga pertanyaan: **apa yang sudah diuji, apa yang belum, dan apa yang harus
> diuji lebih dulu.** Semua angka di sini berasal dari perintah yang benar-benar dijalankan.

---

## Daftar isi

1. [Kondisi sekarang, apa adanya](#1-kondisi-sekarang-apa-adanya)
2. [Pengecekan yang sudah ada](#2-pengecekan-yang-sudah-ada)
3. [Celah terbesar](#3-celah-terbesar)
4. [Soal target cakupan 80%](#4-soal-target-cakupan-80)
5. [Yang harus diuji, diurutkan dari paling berharga](#5-yang-harus-diuji-diurutkan-dari-paling-berharga)
6. [Rencana alat](#6-rencana-alat)
7. [Sebelum membuka pull request](#7-sebelum-membuka-pull-request)
8. [Cara melaporkan hasil pengujian](#8-cara-melaporkan-hasil-pengujian)

---

## 1. Kondisi sekarang, apa adanya

| | Ada? |
|---|---|
| Kerangka pengujian (Vitest, Jest, Playwright) | **Tidak** — belum terpasang di `package.json` |
| Folder `tests/` | **Tidak** |
| Pengecekan otomatis saat membuka PR | **Tidak** — belum ada `.github/workflows/` |
| Skrip verifikasi yang dijalankan manual | **Ya**, tiga skrip, total 163 pengecekan |

Jadi proyek ini **punya pengujian, tapi belum punya sistem pengujian.** Pengecekan yang ada sungguhan
dan berguna, tapi hanya berjalan kalau seseorang ingat menjalankannya.

---

## 2. Pengecekan yang sudah ada

Semuanya di folder `scripts/`, dijalankan lewat `npm run`.

| Perintah | Menguji apa | Butuh database? | Hasil terakhir |
|---|---|---|---|
| `npm run verify:repo` | `articleRepo` versi data contoh: penerjemah tanggal (termasuk menolak 31 Februari), pembuat slug, urutan dan pembagian halaman, daftar tidak membawa isi artikel, **penolakan parameter jahat** (halaman negatif, 99.999 per halaman), cari per alamat, per kategori, pencarian, populer, unggulan | **Tidak** | PASS — 37 |
| `npm run verify:compare` | Hasil versi data contoh vs versi database, dibandingkan kolom per kolom | Ya | PASS — 20 sama, 0 beda |
| `npm run verify:all` | `userRepo`, `newsletterRepo`, dan `articleAdminRepo` — rangkaian uji yang **sama** dijalankan ke kedua versi — ditambah **aturan tampil publik** dari sisi `articleRepo` (12 pengecekan, hanya Prisma) | Ya | PASS — 106 |

Hasil terakhir dari 18 September 2026, di commit `5a28131`. Ada juga `npm run coba` — bukan pengujian, melainkan ruang
percobaan untuk memanggil fungsi secara langsung.

### Pengecekan dasar yang juga dijalankan

| Perintah | Yang diperiksa | Hasil terakhir |
|---|---|---|
| `npm run typecheck` | Kesalahan tipe data di seluruh kode | PASS |
| `npm run lint` | Gaya kode dan pola yang berisiko | **FAIL — 1 error, 1 warning**, keduanya di `src/components/Footer.tsx` |
| `npm run build` | Seluruh situs bisa dibangun untuk produksi | PASS — 6 halaman |
| Uji asap HTTP ke build produksi (`next start`) | Setiap halaman menjawab, alamat salah menjawab 404 | PASS — 5 halaman `200`, alamat salah `404` (dijalankan manual dengan `curl`, belum jadi skrip) |

---

## 3. Celah terbesar

### 3.1 Aturan "draft tidak bocor" — sudah ditutup 11 September 2026

Sebelumnya ini celah terbesar: aturannya ditegakkan di query Prisma, tapi tidak ada pengecekan dari
sisi publik. Sekarang `verify:all` menguji empat kasus — draft, terjadwal besok, diarsipkan, dan
sudah terbit — lewat tiga jalur: alamat, daftar, dan pencarian.

**Terbukti bisa menangkap kerusakan.** Syarat tanggal dan syarat status di `syaratTerbit()` dihapus
bergantian dengan sengaja; masing-masing langsung menghasilkan 3 FAIL. Kasus "sudah terbit" menjadi
kontrol positif — tanpa itu, fungsi yang rusak dan selalu mengembalikan kosong juga akan lulus.

Riwayat lengkapnya di [KEAMANAN.md temuan K-9](./KEAMANAN.md#k-9--aturan-terpenting-justru-tidak-teruji).

### 3.2 Tampilan dan Server Action tidak diuji otomatis

Tidak ada pengujian yang membuka halaman lalu memeriksa isinya. Semua pengecekan di atas menguji
lapisan data. Artinya kerusakan di halaman — tautan buntu, tampilan error, tombol tidak berfungsi —
hanya ketahuan kalau dibuka manual.

Sejak PR #6 celah ini lebih berarti, karena ada logika baru **di luar** lapisan data yang tidak
diuji siapa pun:

- `src/app/admin/actions.ts` — pembuatan slug (`toSlug`), penanganan slug bentrok, nilai bawaan
  kategori dan penulis, peralihan draft ↔ terbit saat edit
- `src/components/ArticleFeed.tsx` — "Muat Lebih Banyak" menambah halaman dengan benar dan tombolnya
  hilang saat habis

Alur admin (tulis → terbit → muncul di depan → hapus) juga belum pernah diklik di browser: **NOT_RUN**.

### 3.3 Tidak ada yang memaksa pengecekan dijalankan

Tanpa pengecekan otomatis di GitHub, sebuah PR bisa digabung tanpa satu pun perintah di atas
dijalankan. Itu yang terjadi pada error lint yang sekarang ada di `main`, dan pada PR #6 yang
digabung tanpa review.

---

## 4. Soal target cakupan 80%

Aturan bawaan ECC di `.claude/rules/ecc/` menyebut *"minimum test coverage 80%, MANDATORY"*.

**Aturan itu tidak berlaku untuk proyek ini**, sesuai [AGENTS.md](../AGENTS.md): sembilan aturan tim
selalu menang atas aturan ECC. Alasannya:

- Proyek ini belum punya kerangka pengujian sama sekali — angka 80% tidak bisa diukur
- Mengejar angka cakupan mendorong pengujian yang mudah ditulis, bukan yang penting
- Satu pengujian untuk aturan draft (K-9) lebih berharga daripada puluhan pengujian komponen tampilan

**Kebijakan yang dipakai:** yang diuji adalah **perilaku yang kalau rusak merugikan pengguna atau
membocorkan data** — urutannya di bagian berikut. Angka cakupan tidak dijadikan target.

---

## 5. Yang harus diuji, diurutkan dari paling berharga

| Prioritas | Yang diuji | Kenapa | Jenis | Status |
|---|---|---|---|---|
| **1** | Draft dan artikel terjadwal tidak terlihat publik | Kalau rusak, isi yang belum boleh terbit bocor | Pengecekan lapisan data | ✅ `verify:all` — 12 pengecekan, lolos uji mutasi |
| **2** | Halaman redaksi menolak yang belum login, dan Server Action menolak tanpa sesi | Sejak PR #6 ini **bukan lagi kemungkinan**: tanpa login, siapa pun bisa menghapus artikel di database | Pengecekan sisi server | ❌ Login belum ada — **paling mendesak** |
| **3** | Validasi input menolak isian yang tidak sah | Batas pertama sebelum data masuk database | Pengujian unit — murah dan cepat | ❌ Validasi belum ada |
| **4** | Alur utuh: login → tulis → terbitkan → muncul di halaman depan | Ini kriteria selesai nomor 1 di [PRD](./PRD.md#10-kriteria-selesai) | Pengujian alur di browser | ❌ Bagian "tulis → terbitkan → muncul" sudah bisa diuji sejak PR #6, tapi belum pernah |
| **4a** | Pembuatan slug di `admin/actions.ts`: huruf beraksen, judul tanpa huruf, slug bentrok | Kalau rusak, alamat artikel bentrok atau kosong | Pengujian unit — murah | ❌ Belum ada. Sebaiknya dipindah ke `src/server/services/` dulu supaya mudah diuji |
| **5** | Urutan, pembagian halaman, pencarian | Kalau rusak, artikel hilang atau ganda | Pengecekan lapisan data | ✅ `verify:repo` |
| **6** | Kedua versi repository berperilaku sama | Kalau berbeda, halaman rusak saat pindah ke database | Perbandingan | ✅ `verify:compare`, `verify:all` |
| **7** | Tampilan loading, error, dan kosong | Pengalaman pengguna saat ada masalah | Pemeriksaan manual dulu | ❌ Berkasnya belum ada |

**Prioritas 1 sudah selesai.** Prioritas 2 sekarang yang paling mendesak. Prioritas 2 dan 3 baru bisa
dikerjakan setelah login dan validasi input dibuat — keduanya sebaiknya ditulis bersamaan dengan fiturnya, bukan belakangan.

---

## 6. Rencana alat

Sesuai [RENCANA-KERJA.md](./RENCANA-KERJA.md), dipasang oleh Orang 5:

| Alat | Untuk apa | Kapan |
|---|---|---|
| **Vitest** | Pengujian logika: validasi, aturan bisnis, repository | Sprint 1 |
| **Playwright** | Pengujian alur di browser sungguhan | Sprint 2 |
| **GitHub Actions** | Menjalankan pengecekan otomatis di setiap PR | Sprint 1 |

### Urutan menyalakan pengecekan otomatis

1. **Bereskan error lint dulu** — tinggal satu, di `src/components/Footer.tsx:21` (error di
   `admin/page.tsx` hilang saat berkas itu ditulis ulang di PR #6).
   Kalau belum, semua PR langsung merah, termasuk yang isinya benar
2. Nyalakan pengecekan: `npm ci && npm run typecheck && npm run lint && npm run build && npm run verify:repo`
3. Kunci branch `main`: wajib PR, wajib satu review, wajib pengecekan hijau

`verify:repo` sengaja dipilih untuk pengecekan otomatis karena **tidak butuh database** — tidak perlu
menaruh alamat database di GitHub.

### Skrip yang ada tidak perlu dibuang

Saat Vitest terpasang, ketiga skrip verifikasi bisa dipindahkan menjadi berkas pengujian satu per
satu. Isinya — pemanggilan fungsi dan pengecekan hasilnya — sudah berbentuk pengujian, hanya belum
memakai kerangkanya.

---

## 7. Sebelum membuka pull request

Jalankan ini di komputermu. Semuanya harus berhasil sebelum meminta review.

```bash
npm run typecheck
npm run lint
npm run build
npm run verify:repo
```

Tambahan sesuai jenis perubahan:

| Kalau kamu mengubah | Jalankan juga |
|---|---|
| Berkas di `src/server/repositories/` | `npm run verify:compare` dan `npm run verify:all` (butuh database) |
| `prisma/schema.prisma` | `npm run db:migrate`, lalu `npm run verify:all` |
| Halaman atau komponen | Buka halamannya di browser: di laptop, dan di HP |
| Server Action (`src/app/**/actions.ts`) | Coba alurnya di browser dengan `DATA_SOURCE=prisma`, lalu pastikan hasilnya muncul di halaman publik |
| Apa pun yang menyentuh login atau input | Baca [KEAMANAN.md bagian 5](./KEAMANAN.md#5-aturan-keamanan-untuk-setiap-anggota) |

---

## 8. Cara melaporkan hasil pengujian

Status yang sah hanya tiga:

| Status | Artinya |
|---|---|
| **PASS** | Sudah dijalankan, dan berhasil |
| **FAIL** | Sudah dijalankan, dan gagal |
| **NOT_RUN** | Belum dijalankan — **sertakan alasannya** |

Contoh yang benar di deskripsi PR:

```
npm run typecheck      PASS
npm run lint           PASS
npm run build          PASS
npm run verify:repo    PASS — 37
npm run verify:all     NOT_RUN — belum punya database Neon sendiri
```

**Jangan pernah menulis PASS untuk perintah yang tidak kamu jalankan.** Menulis `NOT_RUN` dengan jujur
menunjukkan kamu bisa diandalkan. Menulis PASS palsu, begitu ketahuan, membuat semua laporanmu yang
lain ikut diragukan.

---

## Dokumen terkait

[KEAMANAN.md](./KEAMANAN.md) · [ARSITEKTUR.md](./ARSITEKTUR.md) · [DEPLOY.md](./DEPLOY.md) ·
[../CONTRIBUTING.md](../CONTRIBUTING.md)
