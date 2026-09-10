# Presentasi NewsTimes

Slide laporan progres proyek — 14 slide, format 16:9, siap dibuka di PowerPoint,
Google Slides, atau Keynote.

| Berkas | Isinya |
|---|---|
| `NewsTimes.pptx` | Slide yang siap dipresentasikan |
| `buat-slide.py` | **Sumber kebenaran isi slide.** Ubah di sini, bukan di `.pptx` |

## Isi slide

| # | Slide | Inti |
|---|---|---|
| 1 | Sampul | NewsTimes, laporan progres, tanggal dan nomor commit |
| 2 | Ringkasan | Empat kalimat yang wajib tersampaikan kalau waktunya mepet |
| 3 | Masalah | Kondisi awal: tampilan jadi, isinya mati |
| 4 | Temuan bug tanggal | `"28 Juni"` dianggap lebih kecil dari `"3 Mei"` |
| 5 | Arsitektur | Satu aplikasi, bukan backend terpisah |
| 6 | Model data | Lima tabel |
| 7 | Keputusan: dua versi | Supaya tim tidak saling menunggu |
| 8 | Keputusan: draft tidak bocor | Dua syarat sebelum artikel terlihat publik |
| 9 | Bukti | 151 pengecekan otomatis, termasuk yang masih `NOT_RUN` |
| 10 | Kondisi sekarang | Status per bagian, apa adanya |
| 11 | Risiko | Empat hal yang perlu diputuskan tim |
| 12 | Langkah berikutnya | Tujuh langkah, sudah diurutkan |
| 13 | Pembagian tim | Siapa pegang apa, termasuk dua peran yang kosong |
| 14 | Penutup | Arahkan ke dokumentasi di repo |

Tiap slide punya **catatan bicara** yang tertanam sebagai speaker notes. Buka
lewat menu View → Notes di PowerPoint, atau Speaker Notes di Google Slides.

## Cara mengubah isinya

Jangan mengedit `.pptx` langsung kalau ingin perubahannya bertahan — akan
tertimpa saat slide dibuat ulang.

```bash
pip install python-pptx
python docs/presentasi/buat-slide.py
```

Kalau cuma perlu menyesuaikan tampilan sekali pakai untuk presentasi besok,
mengedit `.pptx` langsung tentu boleh — simpan saja dengan nama lain.

## Aturan isi

Angka dan status di slide **harus cocok dengan [STATUS.md](../../STATUS.md)**.
Kalau status di sana berubah, perbarui juga `buat-slide.py`, khususnya slide 9,
10, dan 13.

Berlaku juga aturan tim nomor 9: yang belum dijalankan ditulis `NOT_RUN`, bukan
dianggap lulus. Slide 9 sengaja menampilkan dua baris kuning karena memang itu
kondisinya.
