# NewsTimes

Portal berita berbahasa Indonesia dengan ruang redaksi sendiri. Pengunjung membaca tanpa perlu akun;
redaksi menulis dan menerbitkan artikel lewat halaman admin, tanpa menyentuh kode.

Dikerjakan lima orang sebagai proyek magang. Satu aplikasi Next.js — tidak ada backend terpisah.

> **Kondisi terkini ada di [STATUS.md](./STATUS.md).** Baca itu dulu sebelum mengubah apa pun.
>
> Ringkasnya per 10 September 2026: lapisan datanya sudah selesai dan teruji, tapi **belum ada satu
> halaman pun yang memakainya** — semua halaman masih membaca 5 artikel yang ditulis tangan di
> `src/data/articles.ts`.

---

## Cara menjalankan

**Kamu tidak butuh database untuk mulai bekerja.** Setelan bawaannya memakai data contoh yang sudah
menempel di kode.

```bash
git clone https://github.com/article-website/news-times.git
cd news-times
npm install
cp .env.example .env.local
npm run dev
```

Buka <http://localhost:3000>. Situsnya langsung jalan dengan 5 artikel, 6 kategori, dan 5 penulis.

Butuh Node.js 18 atau lebih baru. Setelah setiap `git pull`, jalankan `npm install` lagi — paket
sering bertambah.

### Kalau ingin memakai database sungguhan

Bikin database sendiri di [Neon](https://neon.tech) (gratis). **Jangan memakai punya orang lain** —
kalau satu database dipakai berlima, yang sedang menguji fitur hapus artikel akan menghapus data
semua orang.

```bash
# di .env.local: isi DATABASE_URL, lalu ganti DATA_SOURCE=prisma
npm run db:migrate
npm run db:seed
npm run dev
```

Kode halaman tidak perlu diubah sama sekali saat berpindah. Penjelasannya ada di
[docs/DATABASE.md](./docs/DATABASE.md).

---

## Perintah yang tersedia

| Perintah | Kegunaan |
|---|---|
| `npm run dev` | Menjalankan di komputer sendiri |
| `npm run build` | Membangun versi produksi |
| `npm run typecheck` | Memeriksa tipe data |
| `npm run lint` | Memeriksa gaya kode |
| `npm run db:migrate` | Membuat atau memperbarui tabel database |
| `npm run db:seed` | Mengisi data awal |
| `npm run db:reset` | Mengosongkan database lalu mengisinya ulang |
| `npm run db:studio` | Membuka Prisma Studio untuk melihat isi database |
| `npm run verify:repo` | 37 pengecekan fungsi akses data — **tidak butuh database** |
| `npm run verify:compare` | Membandingkan hasil data contoh vs database, kolom per kolom |
| `npm run verify:all` | 94 pengecekan admin, login, dan newsletter — butuh database |
| `npm run coba` | Mencoba fungsi akses data langsung, tanpa membuka tampilan |

Hasil terakhir semua perintah ini, lengkap dengan tanggalnya, ada di [STATUS.md](./STATUS.md).

> Catatan jujur: `npm run lint` saat ini masih **2 error** (`src/components/Footer.tsx:21` dan
> `src/app/admin/page.tsx:23`). Selama belum dibereskan, pengecekan otomatis belum bisa dinyalakan —
> begitu dinyalakan, semua pull request akan langsung merah.

---

## Struktur folder

```
prisma/                   schema, migration, seed
src/
  app/                    halaman
    admin/                halaman redaksi
    articles/             daftar dan detail artikel
  components/             komponen tampilan
  data/articles.ts        data contoh — BEKU, jangan diubah
  server/
    db/                   sambungan database
    domain/               bentuk data
    repositories/         fungsi akses data (4 kumpulan)
scripts/                  skrip verifikasi
docs/                     dokumentasi tim
```

---

## Dokumentasi

| Berkas | Isinya |
|---|---|
| [STATUS.md](./STATUS.md) | Progres terkini, hasil pengujian terakhir, keputusan yang masih menggantung |
| [docs/PENJELASAN-UNTUK-PEMULA.md](./docs/PENJELASAN-UNTUK-PEMULA.md) | **Mulai dari sini kalau kamu baru.** Penjelasan proyek dari nol, tanpa istilah yang tidak dijelaskan |
| [docs/PRD.md](./docs/PRD.md) | Apa yang dibangun dan kenapa: pengguna, lingkup, daftar kebutuhan beserta statusnya |
| [docs/RENCANA-KERJA.md](./docs/RENCANA-KERJA.md) | Siapa mengerjakan apa dan kapan: pembagian peran, jadwal, aturan tim |
| [docs/DATABASE.md](./docs/DATABASE.md) | Cara mengambil dan menyimpan data, lengkap dengan contoh kode per peran |
| [docs/LAPORAN-DATABASE.md](./docs/LAPORAN-DATABASE.md) | Laporan bagian database: tiap keputusan beserta alasannya dan bukti pengujiannya |
| [docs/ARSITEKTUR.md](./docs/ARSITEKTUR.md) | Lapisan sistem, arah ketergantungan, keputusan arsitektur, dan di mana kode baru diletakkan |
| [docs/KEAMANAN.md](./docs/KEAMANAN.md) | Hasil audit keamanan: temuan beserta buktinya, syarat wajib sebelum deploy |
| [docs/PENGUJIAN.md](./docs/PENGUJIAN.md) | Apa yang sudah diuji, celah terbesar, dan yang harus diuji lebih dulu |
| [docs/DEPLOY.md](./docs/DEPLOY.md) | Rencana dan daftar periksa menaikkan situs ke internet |
| [CONTRIBUTING.md](./CONTRIBUTING.md) | Alur kerja dari membuat branch sampai PR digabung |
| [docs/presentasi/](./docs/presentasi/) | Slide laporan progres, 14 slide siap presentasi, plus skrip pembuatnya |

---

## Aturan kerja

Sembilan aturan, selengkapnya di [AGENTS.md](./AGENTS.md). Berlaku untuk anggota tim maupun AI agent.

1. Halaman tidak boleh menyentuh database langsung — semua lewat `@/server/repositories`
2. `src/data/articles.ts` berstatus beku
3. `prisma/schema.prisma` tidak boleh diubah sendirian
4. `.env.local` tidak boleh di-commit; yang ikut hanya `.env.example`
5. Jangan push langsung ke `main` — buat branch, buka PR, minta satu orang review
6. Satu orang satu wilayah; jangan memperbaiki kerjaan orang lain tanpa sepengetahuannya
7. Gambar tidak masuk git
8. Usahakan PR di bawah 400 baris
9. Status verifikasi hanya boleh `PASS`, `FAIL`, atau `NOT_RUN` — jangan pernah menulis `PASS`
   untuk perintah yang belum dijalankan

---

## Teknologi

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Prisma 7 ·
PostgreSQL di [Neon](https://neon.tech) · rencana hosting di Vercel.

Folder `.claude/` berisi konfigurasi agent AI ([ECC](https://github.com/affaan-m/ecc), profil
minimal, tanpa hook runtime). Itu bukan bagian dari aplikasi — tidak ada skrip yang berjalan
otomatis, dan boleh diabaikan kalau kamu tidak memakai agent.

---

## Tim

| Peran | Orang | Wilayah |
|---|---|---|
| Orang 1 — Database | [@kvnlhm](https://github.com/kvnlhm) | `prisma/`, `src/server/` |
| Orang 2 — Tampilan Publik | [@azridalimunthe7](https://github.com/azridalimunthe7) | `src/components/`, halaman publik |
| Orang 3 — Admin & Login | [@fikarnugraha18](https://github.com/fikarnugraha18) | `src/app/admin/` |
| Orang 4 — Validasi & SEO | belum ada | `src/lib/validation/`, `src/server/services/` |
| Orang 5 — Deploy & Testing | belum ada | `.github/workflows/`, `tests/`, `README.md` |

---

## Deploy

**Belum dilakukan.** Belum ada bukti deploy di dalam repo, belum ada `.github/workflows/`, dan
branch `main` belum dikunci. Ketiganya bagian dari peran Orang 5 yang masih kosong.
