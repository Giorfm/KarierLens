# KarierLens 🧭

> **Penerjemah Pengalaman Kampus ke Bahasa Rekruter**  
> *"Tulis pengalaman kampusmu dalam Bahasa Indonesia. Dapatkan CV Inggris yang siap dilamar."*

KarierLens adalah aplikasi web cerdas yang dirancang khusus untuk mahasiswa dan *fresh graduates* Indonesia. KarierLens membantu menerjemahkan pengalaman kepanitiaan, organisasi kampus (BEM, HIMA, UKM), asisten laboratorium, dan proyek tugas akhir menjadi CV profesional yang siap lolos penapisan sistem ATS dan dibaca rekruter industri maupun perusahaan multinasional/regional.

---

## 🌟 Pembeda Niche: "Tulis Indonesia → CV Inggris" + Glosarium Kampus

Berbeda dari pemeriksa CV umum (seperti Resume Worded) yang mewajibkan input teks bahasa Inggris dan tidak memahami konteks organisasi kemahasiswaan di Indonesia, KarierLens memiliki keunggulan utama:

1. **Input Bahasa Indonesia → Output CV Bahasa Inggris**: Mahasiswa cukup menuliskan draf pengalaman kampusnya apa adanya dalam Bahasa Indonesia. KarierLens menghasilkan CV bahasa Inggris yang terstruktur, natural, dan siap pakai.
2. **Glosarium Istilah Kampus Indonesia**: Mendeteksi secara otomatis dan memadankan istilah khas kampus (*BEM, HIMA, danus, rundown, LPJ, tugas besar, asisten praktikum, PKM, KKN, dsb.*) ke padanan profesional standar global.
3. **Penjaga Kenaikan Jabatan (*Title Inflation Guard*)**: Mencegah halusinasi atau klaim palsu agar peran mahasiswa tidak terkesan menaikkan jabatan (mis. melarang penambahan sepihak kata *Manager, Director, Head of, Senior, Chief, Founder* bila tidak terjustifikasi di draf asli CV).
4. **Prinsip Anti-Halusinasi & Input Langsung**: Jika suatu dampak atau capaian belum memiliki angka kuantitatif, AI dilarang mengarang angka dan wajib menyisipkan placeholder `[fill in ...]` atau `[isi ...]`. Mahasiswa dapat mengetik angka/data riil langsung di antarmuka perbaikan dan nilainya seketika tersinkronisasi ke tab Cetak CV.

---

## ✨ Fitur Utama

- **Skor Kecocokan Deterministik (0–100)**: Dihitung secara matematis berdasarkan pemenuhan kata kunci wajib (*importance* 3), penting (*importance* 2), dan nilai tambah (*importance* 1), termasuk pencocokan semantik lintas bahasa (*cross-lingual*).
- **Rekomendasi Revisi Bullet Point**: Mengubah kalimat pasif menjadi format *Action Verb + Metode/Alat + Dampak Terukur* sesuai standar rekrutmen modern.
- **Simulasi Wawancara STAR**: Menghasilkan tepat 5 pertanyaan wawancara spesifik dan menantang berdasarkan celah (*gap*) antara CV dan lowongan pekerjaan, dilengkapi fokus HR dan panduan kerangka jawaban STAR (*Situation, Task, Action, Result*).
- **Format Cetak CV 1 Kolom**: Desain dokumen standar Harvard/ATS yang bersih, rapi, dan langsung siap dicetak atau disimpan ke PDF (`Ctrl+P` / tombol Cetak).
- **Privasi & Masking PII di Sisi Klien**: Menyaring dan menyamarkan email, nomor telepon, tautan, NIK, NIM, dan alamat di browser pengguna sebelum dikirim ke API model AI.
- **Mode Simulasi 100% Offline**: Dapat langsung diuji coba tanpa memerlukan API key menggunakan 3 profil preset lengkap (Tech/PM, Bisnis/Growth, dan Tulis ID → CV EN).

---

## 🚀 Cara Menjalankan

### 1. Prasyarat
- Node.js versi 18 ke atas (disarankan Node.js 20+).
- Paket manajer `npm`.

### 2. Instalasi Dependensi
```bash
npm install
```

### 3. Konfigurasi Lingkungan (Opsional untuk Mode Live AI)
Salin contoh berkas konfigurasi lingkungan:
```bash
cp .env.local.example .env.local
# atau pada Windows PowerShell:
Copy-Item .env.local.example .env.local
```

Buka `.env.local` dan isi kredensial gateway/API AI Anda:
```env
DEEPSEEK_API_KEY=kunci_api_tokengateway_anda
DEEPSEEK_BASE_URL=https://tokengateway.dev/v1
DEEPSEEK_MODEL=deepseek-flash
DEEPSEEK_DISABLE_THINKING=true
```

Jalankan skrip pra-uji konektivitas AI:
```bash
npm run check:ai
```

*(Jika tidak mengisi API key, aplikasi tetap berfungsi penuh melalui **Mode Simulasi** dengan 3 contoh preset yang tersedia).*

### 4. Menjalankan Server Pengembangan
```bash
npm run dev
```
Buka peramban Anda di [http://localhost:3000](http://localhost:3000).

---

## 🏗️ Arsitektur Ringkas

```
src/
├── app/
│   ├── api/analyze/route.ts  # Endpoint serverless LLM dengan rate limit & injeksi glosarium
│   ├── layout.tsx            # Root layout & styling
│   ├── page.tsx              # Halaman utama & state management
│   └── not-found.tsx         # Fallback 404
├── components/
│   ├── Header.tsx            # Navigasi atas, preset selector, tagline
│   ├── InputPanel.tsx        # Panel input CV, JD, PDF dropzone, & segmented language cards
│   ├── AtsScoreTab.tsx       # Kartu komparasi skor awal & potensi skor deterministik
│   ├── RewriterTab.tsx       # Perbandingan sebelum-sesudah, glosarium, title guard & edit inline
│   ├── InterviewTab.tsx      # Panduan wawancara STAR & fokus pertanyaan HR
│   ├── PrintCvTab.tsx        # Template CV 1 kolom siap cetak/PDF
│   ├── StatusBanner.tsx      # Indikator mode simulasi & error handler
│   └── TaskProgress.tsx      # Status pengerjaan task asinkron
├── data/
│   ├── glossary.ts           # Database seed istilah kampus Indonesia & padanan Inggris
│   └── presets.ts            # Data profil simulasi (Preset 1, 2, dan 3)
├── lib/
│   ├── glossary.ts           # Deteksi glosarium (Unicode word boundaries) & evaluasi kepatuhan
│   ├── language.ts           # Heuristik deteksi bahasa fungsional (ID/EN/Mixed/Unknown)
│   ├── title-guard.ts        # Penjaga kenaikan jabatan (Title Inflation Guard)
│   ├── scoring.ts            # Algoritma hitung skor deterministik & cross-lingual matching
│   ├── placeholders.ts       # Parser dan resolver placeholder interaktif
│   ├── pii.ts                # Regex masking data pribadi di browser
│   ├── prompts.ts            # Pembangun prompt AI per task & aturan bahasa
│   ├── llm.ts                # Klien HTTP AI dengan fallback & sanitasi JSON
│   ├── pdf-parser.ts         # Ekstraktor teks PDF lokal berbasis pdfjs-dist
│   └── rate-limit.ts         # In-memory IP rate limiter
└── types/
    └── karierlens.ts         # Kontrak data TypeScript untuk seluruh modul
```

---

## ⚠️ Batasan & Penafian

1. **Skor Kecocokan adalah Simulasi**: Angka skor (0–100) merupakan representasi matematis dari kecocokan kata kunci dan terminologi terhadap deskripsi pekerjaan yang dimasukkan. Angka ini **bukan** skor resmi dari sistem ATS tertentu atau jaminan penerimaan kerja dari perusahaan mana pun.
2. **Keterlibatan Manusia (*Human-in-the-loop*)**: Seluruh saran revisi dan terjemahan kalimat dibuat dengan bantuan kecerdasan buatan (*AI*) dan glosarium kampus. Pengguna wajib memeriksa kembali kebenaran setiap poin dan memastikan mampu mempertanggungjawabkan kalimat tersebut saat wawancara kerja.
3. **Privasi Data**: Seluruh pemrosesan teks CV yang dikirimkan ke model AI melalui jalur aman. Nomor telepon, email, link profil, NIK, NIM, dan alamat disamarkan secara lokal di peramban pengguna sebelum data meninggalkan perangkat (nama lengkap dan riwayat pengalaman tidak disamarkan agar AI dapat menyusun narasi konteks). Aplikasi ini tidak menyimpan data CV ke basis data (*zero-database*).
