# `.agents/` — konteks proyek untuk AI agent selain Claude

Folder ini berisi aturan, skill, dan alur kerja proyek NewsTimes dalam format yang dipakai AI agent
di luar Claude Code. Tujuannya: **agent apa pun yang membuka repo ini mendapat konteks dan aturan yang
sama**, apa pun alatnya.

Claude Code tidak memakai folder ini — ia sudah mendapat konteks yang sama lewat `CLAUDE.md`, yang
memuat `AGENTS.md` dan `STATUS.md`.

---

## Isi

```
.agents/
├── README.md                          ← berkas ini
├── rules/
│   └── newstimes.md                   ← sembilan aturan proyek
├── skills/
│   ├── newstimes-konteks/             ← orientasi: kondisi proyek, peta, aturan
│   ├── newstimes-akses-data/          ← cara benar mengambil dan menyimpan data
│   ├── newstimes-verifikasi/          ← menjalankan pengecekan, melaporkan PASS/FAIL/NOT_RUN
│   └── newstimes-perbarui-status/     ← memperbarui STATUS.md setelah bekerja
└── workflows/
    ├── newstimes-mulai-sesi.md        ← versi alur kerja dari keempat skill di atas
    ├── newstimes-akses-data.md
    ├── newstimes-verifikasi.md
    └── newstimes-perbarui-status.md
```

Setiap skill terdiri dari `SKILL.md` (frontmatter `name` dan `description`, lalu langkah-langkahnya)
dan `agents/openai.yaml` (metadata tampilan untuk Codex).

---

## Siapa membaca apa

Hanya yang **terverifikasi** ditulis di sini. Sumber verifikasinya disebutkan.

| Berkas | Dibaca oleh | Dasar klaim |
|---|---|---|
| `AGENTS.md` di root repo | Agent yang mengikuti konvensi `AGENTS.md`, termasuk Codex | Next.js sendiri menulis berkas ini untuk agent (`node_modules/next/dist/server/lib/generate-agent-files.js`) |
| `.agents/skills/<nama>/SKILL.md` + `agents/openai.yaml` | Codex | Struktur dan format ini persis yang dikirim ECC untuk Codex — lihat `.claude/.agents/skills/` |
| `.agents/rules/`, `.agents/workflows/`, `.agents/skills/` | Google Antigravity | Installer ECC: *"antigravity — Install rules, workflows, skills, and agents to ./.agents/"* |

**Belum pernah diuji dengan agent sungguhan.** Codex, Antigravity, Gemini CLI, maupun Cursor tidak
terpasang di komputer tempat folder ini dibuat — status verifikasinya **NOT_RUN**. Kalau kamu memakai
salah satunya, coba panggil skill-nya dan catat hasilnya di sini.

### Agent yang tidak membaca folder ini secara otomatis

Arahkan secara manual di awal sesi:

> Baca `AGENTS.md`, lalu `STATUS.md`, lalu `.agents/README.md`. Ikuti skill yang relevan di
> `.agents/skills/` sebelum mengubah apa pun.

---

## Hubungan dengan berkas lain

| Berkas | Perannya | Kalau bertentangan |
|---|---|---|
| `AGENTS.md` | **Sumber kebenaran** aturan proyek | **Selalu menang** |
| `STATUS.md` | Kondisi terkini proyek | Kondisi di sini yang benar, bukan asumsi agent |
| `.agents/` | Aturan dan prosedur dalam format agent | Harus disesuaikan dengan `AGENTS.md` |
| `.claude/` | Konfigurasi Claude Code dan ECC | Aturan ECC kalah dari `AGENTS.md` |

> `.claude/.agents/skills/` berisi 39 skill bawaan ECC dalam format yang sama. Karena letaknya di
> dalam `.claude/`, Codex **tidak** menemukannya secara otomatis. Skill di folder ini sengaja dibuat
> khusus untuk proyek NewsTimes, bukan salinan skill ECC.

---

## Menjaga folder ini tetap benar

**`rules/newstimes.md` adalah salinan dari `AGENTS.md`.** Setiap kali sembilan aturan di `AGENTS.md`
berubah, ubah juga di sini dalam PR yang sama. Salinan yang basi lebih berbahaya daripada tidak ada
salinan sama sekali.

Skill dan workflow sengaja **menunjuk** ke dokumen di `docs/` alih-alih menyalin isinya, supaya tidak
ada dua versi kebenaran.

### Menambah skill baru

1. Buat folder `skills/newstimes-<nama>/`, dengan nama huruf kecil dan tanda hubung
2. Tulis `SKILL.md`:
   ```markdown
   ---
   name: newstimes-<nama>
   description: <apa yang dilakukan>. Pakai saat <kapan dipakai>.
   ---
   ```
   Nilai `name` **harus sama** dengan nama foldernya. `description` itulah yang dibaca agent untuk
   memutuskan kapan skill dipakai — tulis spesifik
3. Salin `agents/openai.yaml` dari skill lain, lalu sesuaikan
4. Kalau perlu, tambahkan versi alur kerjanya di `workflows/`
5. Catat di tabel **Isi** di atas
