---
description: Menjalankan pengecekan NewsTimes sebelum menyatakan selesai, lalu melaporkan hasilnya dengan status PASS, FAIL, atau NOT_RUN.
---

# Verifikasi

Versi ringkas. Langkah lengkap beserta alasannya ada di `.agents/skills/newstimes-verifikasi/SKILL.md` —
baca itu kalau ada langkah yang tidak jelas.

1. Jalankan `npm run typecheck`, `npm run lint`, `npm run build`, `npm run verify:repo`
2. Kalau mengubah `src/server/repositories/`, jalankan juga `npm run verify:compare` dan `npm run verify:all`
3. Bandingkan dengan kondisi awal di `STATUS.md` — 2 error lint sudah ada di `main` sebelumnya
4. Laporkan setiap perintah sebagai PASS, FAIL, atau NOT_RUN beserta alasannya. Jangan menulis PASS untuk yang tidak dijalankan
