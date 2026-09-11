---
name: newstimes-akses-data
description: Cara benar mengambil dan menyimpan data di NewsTimes lewat repository di src/server/repositories. Pakai saat menyambungkan halaman ke data, menambah fungsi pengambil data baru, membuat Server Action yang menyimpan data, atau mengubah apa pun di src/server/.
---

# Akses data di NewsTimes

## Aturan tunggal

**Halaman dan komponen tidak pernah menyentuh database secara langsung.** Semua akses lewat empat
kumpulan fungsi yang di-import dari `@/server/repositories`.

Pemeriksaan cepat — hasilnya harus **kosong**:

```bash
grep -rn "generated/prisma\|server/db\|@prisma/client" src/app src/components
```

## Pilih repository yang benar

| Repository | Untuk | Catatan |
|---|---|---|
| `articleRepo` | Halaman **publik** | Otomatis hanya artikel `PUBLISHED` yang tanggal terbitnya sudah lewat |
| `articleAdminRepo` | Halaman **redaksi** | Termasuk draft. **Jangan pernah dipakai di halaman publik** — draft akan bocor |
| `userRepo` | Proses login | `findByEmailWithSecret()` membawa hash password — pakai **hanya** saat memeriksa login |
| `newsletterRepo` | Pendaftar newsletter | Sudah menolak email ganda |

Daftar fungsi lengkap beserta contohnya: `docs/DATABASE.md`.

## Pola 1 — Menyambungkan halaman ke data

Halaman di Next.js berjalan di server secara bawaan, jadi bisa langsung memanggil repository:

```tsx
import { articleRepo } from "@/server/repositories";

export default async function HomePage() {           // tambah async
  const featured = await articleRepo.listFeatured(3); // tambah await
  return <HeroFeatured articles={featured} />;
}
```

Dua hal yang wajib: `async` di fungsi halaman, `await` di setiap pemanggilan. Kalau `await` lupa,
yang muncul di layar adalah `[object Promise]`.

Data diberikan ke komponen lewat *props*. Komponen tidak mengambil data sendiri.

## Pola 2 — Berkas bertanda `"use client"`

Berkas yang baris pertamanya `"use client"` berjalan di browser dan **tidak bisa** memanggil
repository. Pagar `import "server-only"` akan menggagalkan build kalau dicoba.

Susunan yang benar:

```
page.tsx (server)               ← ambil data di sini lewat repository
  └─ <Form /> "use client"      ← hanya bagian yang butuh interaksi
        └─ Server Action        ← simpan data di sini
              ├─ periksa sesi login   (setelah login tersedia)
              ├─ validasi input
              └─ panggil repository
```

**Server Action yang mengubah data wajib memeriksa sesi login sendiri.** Pemeriksaan di `proxy.ts`
hanya pemeriksaan cepat, bukan pengaman satu-satunya. Lihat `docs/KEAMANAN.md` temuan K-1.

## Pola 3 — Menambah fungsi pengambil data baru

Setiap repository punya **dua implementasi** yang harus tetap setara. Menambah fungsi berarti
mengubah tiga tempat:

1. **Kontraknya** — `src/server/repositories/<nama>-repository.ts`
2. **Versi data contoh** — `src/server/repositories/in-memory-<nama>-repository.ts`
3. **Versi Prisma** — `src/server/repositories/prisma-<nama>-repository.ts`

Lalu:

4. Tambahkan perbandingannya di `scripts/compare-repositories.ts`
5. Jalankan `npm run verify:repo`, `npm run verify:compare`, dan `npm run verify:all`

Folder `src/server/` adalah wilayah Orang 1. PR yang mengubahnya perlu direview Orang 1.

## Yang tidak boleh

- `import` dari `@/generated/prisma` atau `@/server/db` di luar `src/server/`
- Mengubah bentuk `src/data/articles.ts` — berstatus beku
- Mengubah `prisma/schema.prisma` tanpa dibahas tim
- Menulis query SQL mentah (`$queryRaw`, `$executeRaw`) dengan menyambung teks dari input pengunjung
- Menambah fungsi hanya di satu implementasi

## Sebelum menyatakan selesai

Pakai skill `newstimes-verifikasi`.
