---
name: newstimes-perbarui-status
description: Memperbarui STATUS.md di proyek NewsTimes setelah pekerjaan selesai, supaya anggota tim dan agent berikutnya mendapat kondisi yang benar. Pakai setelah fitur jadi jalan, bug diperbaiki, hasil pengecekan berubah, atau PR digabung.
---

# Memperbarui STATUS.md

`STATUS.md` adalah hal pertama yang dibaca manusia maupun agent saat membuka repo ini. Kalau isinya
basi, semua orang bekerja berdasarkan kondisi yang salah.

## Kapan wajib diperbarui

- Sebuah bagian berpindah status — dari **Belum** ke **Sebagian**, atau dari **Sebagian** ke **Selesai**
- Sesuatu di tabel **Yang belum jalan** sudah jalan
- Hasil sebuah perintah pengecekan berubah
- Ada temuan baru yang perlu diketahui tim

**Tidak perlu** diperbarui untuk perubahan yang tidak mengubah kondisi apa pun, misalnya merapikan
kata-kata di dokumentasi.

## Langkah

1. **Baris paling atas** — ganti tanggal "Diperbarui". Kalau perubahanmu menyentuh `src/`, `prisma/`,
   atau `package.json`, ganti juga nomor commit "Kode aplikasi terakhir berubah di"

2. **Tabel "Kondisi per bagian"** — ubah statusnya, dan tulis buktinya di kolom catatan. Bukti yang
   baik menunjuk berkas atau perintah, bukan sekadar "sudah dikerjakan"

3. **"Yang sudah benar-benar jalan" dan "Yang belum jalan"** — pindahkan barisnya. Setiap baris di
   "Yang belum jalan" harus menyebut berkas dan barisnya

4. **Tabel "Perintah dan hasil terakhir"** — hanya diubah kalau perintahnya **benar-benar dijalankan
   ulang**. Tulis tanggal dijalankannya

5. **"Keputusan yang masih menggantung"** — hapus yang sudah diputuskan, tambahkan yang baru muncul

## Yang tidak boleh

- Menyalin hasil pengecekan lama seolah baru dijalankan
- Menulis `PASS` untuk perintah yang tidak dijalankan — pakai `NOT_RUN` beserta alasannya
- Menghapus baris di "Yang belum jalan" tanpa bukti bahwa hal itu sudah jalan
- Menambah penjelasan panjang. `STATUS.md` sengaja pendek; penjelasan panjang tempatnya di `docs/`

## Periksa setelah mengubah

Kalau kamu menambahkan tautan, pastikan berkas tujuannya ada. Kalau kamu mengubah status keamanan
atau pengujian, sesuaikan juga `docs/KEAMANAN.md` bagian 7 atau `docs/PENGUJIAN.md` bagian 5 — keduanya
punya tabel status sendiri yang harus tetap sejalan dengan `STATUS.md`.
