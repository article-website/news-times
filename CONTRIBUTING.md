# Cara Berkontribusi ke NewsTimes

Panduan singkat dari mulai bekerja sampai perubahanmu digabung. Kalau kamu masih baru dengan git
atau Next.js, baca [docs/PENJELASAN-UNTUK-PEMULA.md](./docs/PENJELASAN-UNTUK-PEMULA.md) lebih dulu —
bagian 15 membahas alur git dari nol.

---

## 1. Sebelum mulai

```bash
git checkout main
git pull
npm install          # wajib setiap habis pull — pustaka sering bertambah
```

Lalu baca [STATUS.md](./STATUS.md). Isinya kondisi terkini: apa yang sudah jalan, apa yang sedang
dikerjakan orang lain, dan keputusan yang masih menggantung. Membacanya dua menit bisa mencegah kamu
mengerjakan hal yang sama dengan anggota lain.

---

## 2. Buat branch sendiri

**Jangan pernah bekerja langsung di `main`.**

```bash
git checkout -b <jenis>/<nama-singkat>
```

| Jenis | Untuk | Contoh |
|---|---|---|
| `feat/` | Fitur baru | `feat/halaman-kategori` |
| `fix/` | Perbaikan bug | `fix/link-footer` |
| `docs/` | Dokumentasi | `docs/panduan-login` |
| `chore/` | Hal teknis lain | `chore/pasang-vitest` |

Pakai huruf kecil dan tanda hubung. Satu branch untuk satu pekerjaan.

---

## 3. Kenali wilayahmu

Setiap folder punya pemilik. Boleh mengubah folder orang lain, tapi **PR-nya harus direview
pemiliknya**.

| Wilayah | Folder | Pemilik |
|---|---|---|
| Database | `prisma/`, `src/server/` | Orang 1 — `@kvnlhm` |
| Tampilan publik | `src/components/`, halaman publik | Orang 2 — `@azridalimunthe7` |
| Admin & login | `src/app/admin/`, `src/server/auth/` | Orang 3 — `@fikarnugraha18` |
| Validasi & SEO | `src/lib/validation/`, `src/server/services/` | Orang 4 — belum ada |
| Deploy & testing | `.github/`, `tests/`, `README.md` | Orang 5 — belum ada |

Untuk wilayah yang pemiliknya belum ada, minta review siapa pun di tim.

---

## 4. Tulis commit yang menjelaskan

```
<jenis>: <apa yang berubah>
```

Jenisnya sama dengan nama branch: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`. Untuk
perubahan di wilayah database boleh ditambah keterangan: `fix(db): ...`.

**Tulis kenapa, bukan cuma apa.** Kalau perlu penjelasan, tambahkan baris kosong lalu paragrafnya.

| ❌ Tidak membantu | ✅ Menjelaskan |
|---|---|
| `fix: perbaiki bug` | `fix(db): db:reset harus memanggil seed sendiri di Prisma 7` |
| `update page` | `feat: halaman kategori memakai articleRepo.listByCategory` |

Contoh commit yang baik ada di riwayat repo ini: `git log --oneline`.

---

## 5. Periksa sebelum membuka PR

```bash
npm run typecheck
npm run lint
npm run build
npm run verify:repo
```

Pengecekan tambahan sesuai jenis perubahan ada di
[docs/PENGUJIAN.md bagian 7](./docs/PENGUJIAN.md#7-sebelum-membuka-pull-request).

> **Catatan per 18 September 2026:** `npm run lint` di `main` masih 1 error yang bukan dari
> perubahanmu (`Footer.tsx:21`). Pastikan perubahanmu **tidak menambah** error baru. Tulis di PR
> kalau error lama itu masih ada.

---

## 6. Buka pull request

```bash
git push -u origin <nama-branch>
```

Lalu buka GitHub, klik **Compare & pull request**. Templatenya muncul otomatis — isi semua bagiannya.

**Ukuran:** usahakan di bawah **400 baris**. PR 2.000 baris hampir pasti hanya disetujui tanpa
dibaca. Kalau pekerjaanmu besar, pecah jadi beberapa PR, atau setidaknya beberapa commit yang bisa
dibaca satu per satu.

**Reviewer:** pemilik wilayah yang kamu sentuh. Tulis nama GitHub-nya dengan `@` supaya dia dapat
notifikasi.

---

## 7. Saat mereview PR orang lain

Periksa dengan urutan ini:

1. **Apakah ada yang melanggar sembilan aturan** di [AGENTS.md](./AGENTS.md)? Paling sering: import
   Prisma di `src/app/`, perubahan `src/data/articles.ts`, perubahan `schema.prisma` tanpa dibahas
2. **Apakah hasil pengecekannya dilaporkan jujur?** PASS tanpa bukti patut ditanyakan
3. **Apakah menyentuh login, input pengunjung, atau data akun?** Kalau ya, cocokkan dengan
   [docs/KEAMANAN.md bagian 5](./docs/KEAMANAN.md#5-aturan-keamanan-untuk-setiap-anggota)
4. **Apakah perubahannya bisa dipahami?** Kalau kamu tidak paham, kemungkinan orang lain juga tidak

Kalau menemukan masalah, tulis **apa** masalahnya dan **kenapa** itu masalah. "Ini salah" tanpa
alasan tidak membantu siapa pun belajar.

---

## 8. Setelah digabung

- Kalau perubahanmu mengubah status sesuatu — fitur jadi jalan, bug hilang, hasil pengecekan berubah
  — **perbarui [STATUS.md](./STATUS.md)**. Caranya ada di bagian paling bawah berkas itu
- Kalau ada migrasi database baru, beri tahu tim supaya semua orang menjalankan `npm run db:migrate`
- Hapus branch-mu di GitHub, lalu kembali ke `main` dan `git pull`

---

## Dokumen yang perlu kamu tahu

| Kalau kamu perlu | Baca |
|---|---|
| Kondisi terkini | [STATUS.md](./STATUS.md) |
| Penjelasan dari nol | [docs/PENJELASAN-UNTUK-PEMULA.md](./docs/PENJELASAN-UNTUK-PEMULA.md) |
| Menaruh kode baru di mana | [docs/ARSITEKTUR.md bagian 9](./docs/ARSITEKTUR.md#9-mau-menambah-sesuatu-taruh-di-sini) |
| Mengambil atau menyimpan data | [docs/DATABASE.md](./docs/DATABASE.md) |
| Aturan keamanan | [docs/KEAMANAN.md](./docs/KEAMANAN.md) |
| Cara menguji | [docs/PENGUJIAN.md](./docs/PENGUJIAN.md) |
| Menaikkan ke internet | [docs/DEPLOY.md](./docs/DEPLOY.md) |
