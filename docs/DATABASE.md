# Database — Panduan Pakai

Dokumen ini untuk **Orang 2, 3, dan 4**. Isinya cara mengambil dan menyimpan
data, tanpa perlu tahu Prisma sama sekali.

Yang mengerjakan bagian ini: **Orang 1**. Ada yang kurang atau butuh fungsi
baru? Bilang saja, jangan bikin query sendiri.

---

## Aturan tunggal

> **Jangan pernah meng-import Prisma dari dalam folder `src/app/`.**
> Semua pengambilan data lewat `@/server/repositories`.

Kenapa? Karena kalau halaman langsung memanggil Prisma:

- Kalian tidak bisa mulai ngoding sebelum punya database.
- Kodenya jadi susah dites.
- Ganti teknologi database berarti bongkar semua halaman.

---

## Mulai cepat

Kalian **tidak perlu punya database sendiri** untuk mulai bekerja.

```bash
cp .env.example .env.local
npm install
npm run dev
```

Selesai. Sudah tersedia data contoh berisi 5 artikel, 6 kategori, dan 5 penulis.

Kenapa bisa begitu? Karena tiap fungsi punya **dua versi**: satu mengambil dari
data contoh yang tersimpan di kode, satu lagi mengambil dari database sungguhan.
Yang dipakai ditentukan satu baris di `.env.local`, dan **kode halaman kalian
tidak berubah sama sekali** saat berpindah.

---

## Empat kumpulan fungsi

```ts
import {
  articleRepo,       // artikel untuk halaman pengunjung  -> Orang 2
  articleAdminRepo,  // artikel untuk halaman admin       -> Orang 3
  userRepo,          // akun admin, buat login            -> Orang 3
  newsletterRepo,    // pendaftar newsletter              -> Orang 4
} from "@/server/repositories";
```

Semuanya `async`, jadi selalu pakai `await`.

> Kata **repository** artinya "tempat penyimpanan". Di kode kita, dia sekadar
> kumpulan fungsi untuk mengambil dan menyimpan data. Tidak ada yang rumit.

---

## Orang 2 — Halaman pengunjung

`articleRepo` **selalu** menyaring hanya artikel yang sudah terbit. Draft tidak
akan pernah bocor lewat sini, jadi kamu tidak perlu mengeceknya lagi.

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
| `findBySlug(slug)` | artikel lengkap, atau `null` kalau tidak ada |
| `listByCategory(categorySlug, { page, perPage })` | sama seperti `listPublished` |
| `search(kataKunci, { page, perPage })` | sama seperti `listPublished` |
| `listPopular(limit)` | array artikel |
| `listFeatured(limit)` | array artikel |
| `listCategories()` | array kategori + jumlah artikelnya |
| `incrementViewCount(slug)` | tidak mengembalikan apa-apa |

### Dua hal yang perlu diketahui

**1. `hasMore` itu jawaban untuk tombol "Muat Lebih Banyak".** Tidak perlu
dihitung sendiri — kalau isinya `true`, berarti masih ada artikel berikutnya.

**2. Daftar artikel tidak membawa isi lengkapnya.** Ini disengaja. Isi satu
artikel bisa ribuan huruf, dan mengirim 10 sekaligus itu boros padahal yang
ditampilkan di kartu cuma judul dan ringkasan. Kalau butuh isi lengkap, pakai
`findBySlug()` di halaman detail.

### Kategori dan menu navbar

`listCategories()` memberi 6 kategori sesuai urutan navbar, **termasuk yang
belum punya artikel** (Internasional dan Olahraga). Jadi navbar bisa dibuat
otomatis tanpa ada menu yang hilang.

```ts
const kategori = await articleRepo.listCategories();
// [{ slug: "nasional", name: "Nasional", order: 0, articleCount: 1 }, ...]
```

---

## Orang 3 — Halaman admin

### Artikel

`articleAdminRepo` menampilkan **semua** artikel termasuk draft, dan bisa
dipakai untuk menulis, mengubah, serta menghapus.

```ts
import { articleAdminRepo } from "@/server/repositories";

// Tabel daftar artikel
const { items, total, hasMore } = await articleAdminRepo.list({
  page: 1,
  perPage: 20,
  status: "DRAFT",       // boleh dikosongkan
  query: "ekonomi",      // boleh dikosongkan, mencari di judul
});

// Form sunting
const artikel = await articleAdminRepo.findById(id);

// Simpan artikel baru
const baru = await articleAdminRepo.create({
  slug: "judul-artikel-baru",
  title: "Judul Artikel Baru",
  excerpt: "Ringkasan singkat.",
  content: "Isi lengkap.",
  imageUrl: urlDariBlob,       // boleh null
  categorySlug: "teknologi",
  authorSlug: "bayu-saputra",
});                             // otomatis berstatus DRAFT

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

Parameter kedua penting waktu mengedit. Tanpa itu, menyimpan artikel tanpa
mengubah judul akan salah dianggap bentrok dengan dirinya sendiri.

**Perilaku terbit yang perlu diketahui:** kalau artikel pernah terbit, lalu
dijadikan draft lagi, lalu diterbitkan ulang — **tanggal terbit aslinya tetap
dipertahankan**. Ini disengaja, supaya urutan artikel di halaman depan tidak
tiba-tiba berubah cuma gara-gara artikel lama disunting sedikit.

### Login

```ts
import { userRepo } from "@/server/repositories";

// Saat login
const user = await userRepo.findByEmailWithSecret(email);
if (!user) return null;
const cocok = await cekPassword(password, user.passwordHash);
if (!cocok) return null;

// Saat memulihkan sesi
const aman = await userRepo.findById(idDariSesi);   // tanpa password
```

**Yang BUKAN urusan bagian ini** — semuanya keputusanmu di `src/server/auth/`:

- cara mengacak password (bcrypt? argon2?) — di sini cuma disimpan apa adanya
- berapa lama sesi login berlaku
- aturan panjang dan kekuatan password

**Tidak ada akun bawaan.** Ini disengaja: akun dengan password yang gampang
ditebak itu pintu belakang kalau sampai ikut terpasang di server sungguhan.
Cara mendeteksi bahwa belum ada admin sama sekali:

```ts
if (await userRepo.count() === 0) {
  // tampilkan halaman "buat admin pertama"
}
```

**Satu saran keamanan:** untuk "email tidak terdaftar" dan "password salah",
tampilkan pesan yang **sama**. Kalau dibedakan, orang bisa menebak-nebak email
mana yang punya akun.

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

Sudah diurus di sini:

- Email dirapikan dulu — `"Budi@Mail.com "` dan `"budi@mail.com"` dianggap orang
  yang sama.
- Mendaftar berkali-kali tidak bikin data dobel dan tidak error.
- Berhenti langganan **tidak menghapus datanya**, cuma menandai waktu berhentinya.

Masih tugasmu: mengecek format email (Zod), membatasi spam, dan mengirim email.

Untuk API yang dipakai publik, pakai `articleRepo` yang sama dengan Orang 2 —
jangan `articleAdminRepo`, nanti draft ikut bocor ke pengunjung.

---

## Kalau nanti butuh database sungguhan

Selama Sprint 1 kalian **tidak perlu** ini. Kalau nanti perlu:

1. Daftar di [neon.tech](https://neon.tech), bikin project, pilih lokasi
   **Singapore** (paling dekat dari Indonesia).
2. Isi `DATABASE_URL` di `.env.local` dengan alamat sambungan versi **Pooled**.
3. Jalankan:

```bash
npm run db:migrate
npm run db:seed
```

4. Ubah `DATA_SOURCE=prisma` di `.env.local`.

> **Bikin database sendiri, jangan pakai punya orang lain.** Neon memberi 100
> project gratis per akun. Kalau satu database dipakai berempat, orang yang
> sedang menguji tombol hapus artikel akan menghapus data semua orang.

---

## Daftar perintah

```bash
npm run db:migrate      # bikin / ubah tabel
npm run db:seed         # isi data awal (aman diulang berkali-kali)
npm run db:studio       # lihat isi database lewat browser
npm run db:reset        # HAPUS SEMUA, bikin ulang, isi ulang

npm run verify:repo     # 37 pengecekan, tidak butuh database
npm run verify:compare  # membandingkan data contoh vs database
npm run verify:all      # 106 pengecekan: admin, login, newsletter, aturan tampil publik
```

`npm run db:reset` menghapus seluruh isi database secara permanen. Jangan pernah
dijalankan ke database yang dipakai sungguhan.

> **Catatan Prisma 7:** perintah `prisma migrate reset` sudah **tidak lagi**
> mengisi data otomatis seperti versi sebelumnya. Kalau kamu menjalankan
> perintah Prisma-nya langsung (bukan lewat `npm run db:reset`), databasemu
> akan kosong melompong dan harus diisi manual. Script `db:reset` di
> `package.json` sudah menyambungnya sendiri.

---

## Beda kecil antara data contoh dan database

Sudah diuji: **20 dari 20** pengecekan artikel hasilnya sama persis, dan **94
dari 94** pengecekan admin, login, serta newsletter lulus di kedua versi. Ditambah 12 pengecekan
aturan tampil publik yang khusus dijalankan ke database.

Ada dua kolom yang sengaja tidak dibandingkan, dan keduanya bukan kesalahan:

| Kolom | Kenapa beda |
|---|---|
| `viewCount` | Angkanya naik sendiri tiap artikel dibaca. |
| `updatedAt` | Database mencatat kapan data benar-benar diubah. Data contoh tidak punya catatan itu, jadi memakai tanggal terbit. |

Kalau nanti ada tulisan "diperbarui pada", ambil datanya dari database, jangan
dari data contoh.

Batasan lain data contoh, semuanya wajar:

- Datanya hilang tiap server dijalankan ulang.
- Pencariannya sederhana, cuma mencocokkan huruf.
- `id`-nya berbentuk `mem-art-1`, bukan kode acak seperti di database. Jangan
  menyimpan id itu ke tempat lain dan menganggapnya permanen.

---

## Mau menambah tabel atau kolom?

Jangan mengedit `prisma/schema.prisma` sendiri. Bilang dulu ke Orang 1.

Alasannya bukan birokrasi. Mengubah rancangan tabel menghasilkan file migration
yang harus dijalankan semua orang. Kalau dua orang mengubahnya bersamaan,
file-nya bentrok dan database semua orang bisa rusak.

Sesuai aturan main no. 3 di [RENCANA-KERJA.md](./RENCANA-KERJA.md).
