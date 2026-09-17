## Apa yang berubah

<!-- Satu atau dua kalimat. -->

## Kenapa

<!-- Masalah apa yang diselesaikan. Kalau terkait kebutuhan di docs/PRD.md, sebutkan ID-nya (mis. P-04). -->

## Wilayah yang disentuh

- [ ] Hanya wilayah saya sendiri
- [ ] Menyentuh wilayah orang lain → reviewer: @

## Hasil pengecekan

<!-- Status yang sah hanya PASS, FAIL, atau NOT_RUN. NOT_RUN wajib disertai alasan.
     Jangan menulis PASS untuk perintah yang tidak kamu jalankan. -->

```
npm run typecheck      
npm run lint           
npm run build          
npm run verify:repo    
```

Pengecekan tambahan (lihat docs/PENGUJIAN.md bagian 7):

```

```

## Daftar periksa

- [ ] Tidak ada `import` Prisma atau `@/server/db` dari dalam `src/app/` maupun `src/components/`
- [ ] `src/data/articles.ts` tidak diubah
- [ ] `prisma/schema.prisma` tidak diubah — atau sudah dibahas tim di: <!-- tautan -->
- [ ] Tidak ada `.env.local`, alamat database, token, atau rahasia lain
- [ ] Tidak ada gambar baru di `public/`
- [ ] Perubahan di bawah 400 baris — atau alasannya ditulis di atas
- [ ] Kalau menyentuh login, input pengunjung, atau data akun: sudah dicocokkan dengan docs/KEAMANAN.md bagian 5
- [ ] Kalau status sesuatu berubah: STATUS.md sudah diperbarui

## Catatan untuk reviewer

<!-- Bagian yang paling perlu diperiksa, keputusan yang kamu ragukan, atau hal yang sengaja tidak dikerjakan. -->
