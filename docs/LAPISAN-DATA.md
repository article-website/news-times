# Lapisan Data — Panduan Pakai

Dokumen ini untuk **Orang 2, 3, dan 4**. Isinya cara mengambil dan menyimpan
data tanpa perlu tahu Prisma sama sekali.

Pemilik lapisan ini: **Orang 1 (Database)**. Ada yang kurang atau perlu fungsi
baru? Bilang, jangan bikin query sendiri.

---

## Aturan tunggal

> **Jangan pernah meng-import Prisma dari dalam `src/app/`.**
> Semua akses data lewat `@/server/repositories`.

Kenapa? Karena kalau halaman langsung memanggil Prisma:

- Kamu tidak bisa ngoding sebelum punya database.
- Kode jadi susah dites.
- Ganti teknologi database berarti bongkar semua halaman.

---

## Mulai cepat

Kamu **tidak perlu database** untuk mulai bekerja.

```bash
cp .env.example .env.local     # DATA_SOURCE=memory sudah jadi default
npm install
npm run dev
```

Selesai. Data palsu berisi 5 artikel, 6 kategori, dan 5 penulis sudah tersedia.

---

## Empat pintu yang tersedia

```ts
import {
  articleRepo,       // artikel untuk halaman publik   -> Orang 2
  articleAdminRepo,  // artikel untuk halaman admin    -> Orang 3
  userRepo,          // akun admin, untuk login        -> Orang 3
  newsletterRepo,    // pendaftar newsletter           -> Orang 4
} from "@/server/repositories";
```

Semuanya `async`, jadi selalu pakai `await`.

---

## Orang 2 — Halaman publik

`articleRepo` **selalu** menyaring hanya artikel yang sudah terbit. Draft tidak
akan pernah bocor lewat pintu ini, jadi kamu tidak perlu mengeceknya lagi.

```tsx
import { articleRepo } from "@/server/repositories";

export default async function HomePage() {
  const sorotan = await articleRepo.listFeatured(3);
  const { items, hasMore } = await articleRepo.listPublished({ perPage: 10 });
  const populer = await articleRepo.listPopular(5);

  return (
    <>
      <HeroFeatured articles={sorotan} />
      {items.map((a) => <ArticleCard key={a.slug} article={a} />)}
      {hasMore && <TombolMuatLagi />}
      <Sidebar popularArticles={populer} />
    </>
  );
}
```

Fungsi yang tersedia:

| Fungsi | Balikannya |
|---|---|
| `listPublished({ page, perPage })` | `{ items, page, perPage, total, hasMore }` |
| `findBySlug(slug)` | artikel lengkap, atau `null` |
| `listByCategory(categorySlug, { page, perPage })` | sama seperti `listPublished` |
| `search(kataKunci, { page, perPage })` | sama seperti `listPublished` |
| `listPopular(limit)` | array artikel |
| `listFeatured(limit)` | array artikel |
| `listCategories()` | array kategori + jumlah artikelnya |
| `incrementViewCount(slug)` | `void` |

### Dua hal yang perlu kamu tahu

**1. `hasMore` itu jawaban untuk tombol "Muat Lebih Banyak".** Tidak perlu
hitung sendiri.

**2. Daftar artikel TIDAK membawa `content`.** Ini disengaja: isi artikel bisa
ribuan karakter, dan mengirim 10 sekaligus itu pemborosan besar padahal yang
ditampilkan cuma judul dan ringkasan. Kalau butuh isi lengkap, pakai
`findBySlug()` di halaman detail.

### Kategori dan menu navbar

`listCategories()` mengembalikan 6 kategori sesuai urutan di navbar, **termasuk
yang belum punya artikel** (Internasional dan Olahraga). Jadi navbar bisa dibuat
dinamis tanpa menu yang hilang.

```ts
const kategori = await articleRepo.listCategories();
// [{ slug: "nasional", name: "Nasional", order: 0, articleCount: 1 }, ...]
```

---

## Orang 3 — Halaman admin

### Artikel

`articleAdminRepo` menampilkan **semua** artikel termasuk draft, dan bisa
menulis.

```ts
import { articleAdminRepo } from "@/server/repositories";

// Tabel daftar
const { items, total, hasMore } = await articleAdminRepo.list({
  page: 1,
  perPage: 20,
  status: "DRAFT",       // opsional
  query: "ekonomi",      // opsional, cari di judul
});

// Form sunting
const artikel = await articleAdminRepo.findById(id);

// Simpan baru
const baru = await articleAdminRepo.create({
  slug: "judul-artikel-baru",
  title: "Judul Artikel Baru",
  excerpt: "Ringkasan singkat.",
  content: "Isi lengkap.",
  imageUrl: urlDariBlob,       // boleh null
  categorySlug: "teknologi",
  authorSlug: "bayu-saputra",
});                             // statusnya DRAFT

await articleAdminRepo.publish(baru.id);
await articleAdminRepo.unpublish(baru.id);
await articleAdminRepo.remove(baru.id);

// Untuk kartu ringkasan di dasbor
const jumlah = await articleAdminRepo.countByStatus();
// { DRAFT: 3, PUBLISHED: 12, ARCHIVED: 0 }
```

**Cek slug bentrok sebelum menyimpan:**

```ts
if (await articleAdminRepo.slugDipakai(slug, idYangSedangDiedit)) {
  return { error: "Slug ini sudah dipakai artikel lain." };
}
```

Parameter kedua penting waktu mengedit — tanpa itu, menyimpan artikel tanpa
mengubah judul akan salah dianggap bentrok dengan dirinya sendiri.

**Perilaku terbit yang perlu diketahui:** kalau artikel pernah terbit, lalu
dijadikan draft lagi, lalu diterbitkan ulang — **tanggal terbit aslinya
dipertahankan**. Ini disengaja supaya urutan artikel di halaman depan tidak
tiba-tiba berubah cuma karena artikel lama disunting sedikit.

### Login

```ts
import { userRepo } from "@/server/repositories";

// Saat login
const user = await userRepo.findByEmailWithSecret(email);
if (!user) return null;
const cocok = await verifikasiPassword(password, user.passwordHash);
if (!cocok) return null;

// Saat memulihkan sesi
const aman = await userRepo.findById(idDariSesi);   // tanpa passwordHash
```

**Yang BUKAN tugas lapisan ini** — semuanya keputusanmu di `src/server/auth/`:

- algoritma hash (bcrypt? argon2?) — repository cuma menyimpan string
- lama sesi berlaku
- aturan kekuatan password

**Tidak ada akun bawaan.** Ini disengaja: akun dengan password yang bisa ditebak
itu pintu belakang kalau sampai ikut ke produksi. Deteksi instalasi baru begini:

```ts
if (await userRepo.count() === 0) {
  // tampilkan halaman "buat admin pertama"
}
```

**Satu saran keamanan:** untuk "email tidak terdaftar" dan "password salah",
balas dengan pesan yang **sama**. Kalau dibedakan, orang bisa menebak email mana
yang punya akun.

---

## Orang 4 — API & newsletter

```ts
import { newsletterRepo } from "@/server/repositories";

const hasil = await newsletterRepo.subscribe(email);

switch (hasil) {
  case "baru":            return "Terima kasih, kamu sudah terdaftar.";
  case "diaktifkan-lagi": return "Selamat datang kembali.";
  case "sudah-terdaftar": return "Email ini sudah terdaftar sebelumnya.";
}
```

Sudah diurus lapisan ini:

- Email dinormalkan — `"Budi@Mail.com "` dan `"budi@mail.com"` orang yang sama.
- Daftar berkali-kali tidak bikin baris dobel dan tidak error.
- Berhenti langganan **tidak menghapus baris**, cuma menandai waktunya.

Masih tugasmu: validasi format email (Zod), pembatasan laju anti-spam, dan
pengiriman email.

Untuk API publik, pakai `articleRepo` yang sama dengan Orang 2 — jangan
`articleAdminRepo`, nanti draft bocor ke publik.

---

## Kalau butuh database sungguhan

Selama Sprint 1 kamu **tidak perlu** ini. Kalau nanti perlu:

1. Daftar di [neon.tech](https://neon.tech), bikin project, pilih region
   **Singapore**.
2. Isi `DATABASE_URL` di `.env.local` dengan connection string **Pooled**.
3. Jalankan:

```bash
npm run db:migrate
npm run db:seed
```

4. Ubah `DATA_SOURCE=prisma` di `.env.local`.

> **Bikin database sendiri, jangan pakai punya orang lain.** Neon gratis memberi
> 100 project per akun. Kalau satu database dipakai berlima, orang yang sedang
> menguji fitur hapus artikel akan menghapus data semua orang.

---

## Perintah yang tersedia

```bash
npm run db:migrate      # bikin / terapkan perubahan tabel
npm run db:seed         # isi data awal (aman diulang berkali-kali)
npm run db:studio       # lihat isi database lewat browser
npm run db:reset        # HAPUS SEMUA, migrate ulang, seed ulang

npm run verify:repo     # 37 cek pada data palsu, tidak butuh database
npm run verify:compare  # bandingkan data palsu vs database
npm run verify:all      # 94 cek pada user, newsletter, admin artikel
```

`npm run db:reset` menghapus seluruh isi database secara permanen. Jangan
pernah dijalankan ke database produksi.

> **Catatan Prisma 7:** `prisma migrate reset` tidak lagi menjalankan seed
> otomatis seperti versi sebelumnya. Kalau kamu menjalankan perintah Prisma-nya
> langsung (bukan lewat `npm run db:reset`), databasemu akan kosong melompong
> dan harus di-seed manual. Script `db:reset` di `package.json` sudah
> menyambungnya: `prisma migrate reset && prisma db seed`.

---

## Perbedaan yang diketahui antara data palsu dan database

Sudah diuji: **20 dari 20** pengecekan artikel identik, dan **94 dari 94**
pengecekan user, newsletter, serta admin lulus di kedua implementasi.

Dua field sengaja tidak dibandingkan, dan ini bukan bug:

| Field | Kenapa beda |
|---|---|
| `viewCount` | Berubah sendiri tiap artikel dibaca. |
| `updatedAt` | Database mencatat kapan baris benar-benar diedit. Data palsu tidak punya informasi itu, jadi memakai tanggal terbit. |

Kalau nanti ada label "diperbarui pada", ambil datanya dari database, jangan
dari data palsu.

Batasan lain data palsu, semuanya wajar:

- Data hilang tiap server di-restart.
- Pencarian memakai pencocokan teks biasa, bukan full-text search.
- `id` berbentuk `mem-art-1`, bukan cuid seperti di database. Jangan pernah
  menyimpan id ke tempat lain dan menganggapnya tetap.

---

## Mau menambah tabel atau field?

Jangan edit `prisma/schema.prisma` sendiri. Bilang ke Orang 1 dulu.

Alasannya bukan birokrasi: perubahan schema butuh file migration yang harus
dijalankan semua orang. Kalau dua orang mengubah schema bersamaan, migration-nya
bentrok dan database semua orang rusak.

Sesuai aturan main no. 3 di [RENCANA-KERJA.md](./RENCANA-KERJA.md): perubahan
kontrak dibahas bersama.
