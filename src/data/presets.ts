import type { PresetProfile } from "@/types/karierlens";

export const PRESET_PROFILES: PresetProfile[] = [
  {
    id: "raka-pm",
    label: "Contoh 1: Tech/PM",
    description: "Raka Pratama — Mahasiswa Sistem Informasi semester 6, melamar Product Management Intern",
    cvText: `Raka Pratama
Email: raka.pratama@example.com | No HP: 0812-3456-7890 | Domisili: Bandung, Jawa Barat
LinkedIn: linkedin.com/in/raka-contoh | GitHub: github.com/rakapratama-contoh
NIM: 1202210045 | Universitas Cakrawala — S1 Sistem Informasi (2021 - 2025, Semester 6), IPK 3.68

RINGKASAN
Mahasiswa Sistem Informasi semester 6 yang memiliki minat kuat di bidang manajemen produk digital dan rekayasa perangkat lunak. Berpengalaman memimpin divisi acara seminar teknologi kampus dan berkolaborasi dalam tim proyek pengembangan web.

PENGALAMAN ORGANISASI & KEPANITIAAN
Koordinator Divisi Acara — Seminar Teknologi Nasional HIMA SI Cakrawala University (Okt 2023 - Des 2023)
- Bertugas menyusun rundown acara seminar teknologi dan menghubungi pembicara.
- Berkoordinasi dengan divisi logistik dan publikasi untuk kelancaran jalannya acara.

Anggota Divisi Pemasaran — UKM Kewirausahaan Kampus (Feb 2023 - Sekarang)
- Membantu promosi bazar kampus di Instagram.
- Berinteraksi dengan calon pengunjung bazar melalui direct message dan mengumpulkan masukan produk jualan.

PROYEK KULIAH
Pengembang Web & Analis Kebutuhan — Tugas Akhir Mata Kuliah Rekayasa Perangkat Lunak (Sep 2023 - Jan 2024)
- Membuat website sistem informasi perpustakaan kampus menggunakan React dan database MySQL.
- Menganalisis kebutuhan pengguna awal sistem perpustakaan dan menyusun use case sistem.
- Bekerja sama dalam tim 4 orang menggunakan Git untuk mengelola alur kerja kode.

KEMAMPUAN
Teknis: React, JavaScript, MySQL, Git, Pemodelan Use Case, Analisis Kebutuhan Sistem, Figma Dasar
Bahasa: Bahasa Indonesia (Asli), Bahasa Inggris (Menengah)
`,
    jobDescription: `Posisi: Product Management Intern
Perusahaan: PT Cakrawala Finansial Teknologi (Fintech Solutions)
Lokasi: Jakarta / Hybrid

Tentang Peran:
Kami mencari Product Management Intern yang antusias untuk membantu tim mengembangkan produk aplikasi keuangan bagi jutaan pengguna di Indonesia. Kamu akan belajar mengelola siklus pengembangan produk dari ideasi hingga peluncuran.

Tanggung Jawab:
- Melakukan user research dan wawancara pengguna untuk menggali pain point dan kebutuhan nyata.
- Membantu menyusun Product Requirement Document (PRD) yang terstruktur dan mudah dipahami engineer.
- Melakukan cross-functional collaboration antara tim engineering, desainer UI/UX, dan stakeholder bisnis.
- Melacak performa fitur menggunakan metrik produk dan KPI berbasis data (data-driven).
- Membantu pemetaan product roadmap serta memprioritaskan backlog fitur bersama Product Manager.
- Mengikuti ritme kerja Agile/Scrum, termasuk daily standup, sprint planning, dan sprint retrospective.

Kualifikasi:
- Mahasiswa aktif semester 5-8 atau fresh graduate dari Sistem Informasi, Ilmu Komputer, Teknik, atau jurusan terkait.
- Memiliki pemahaman dasar tentang metodologi Agile/Scrum dan siklus hidup produk.
- Kemampuan analisis kebutuhan pengguna yang baik dan berorientasi pada pemecahan masalah.
- Proaktif dalam stakeholder communication dan nyaman bekerja sama dalam tim kolaboratif.
- Memiliki keterampilan dasar analisis data dan pembuatan use case atau prototipe sistem.
`,
    fallbackResult: {
      score: {
        targetRole: "Product Management Intern",
        executiveVerdict:
          "Kandidat memiliki fondasi teknis yang relevan dari proyek RPL dan pengalaman kepanitiaan acara, namun narasi CV saat ini masih pasif dan belum menonjolkan metodologi manajemen produk seperti PRD, user research terstruktur, dan metrik produk.",
        jdKeywords: [
          { keyword: "user research", importance: 3, foundInCv: false },
          { keyword: "PRD", importance: 3, foundInCv: false },
          { keyword: "cross-functional collaboration", importance: 3, foundInCv: false },
          { keyword: "Agile/Scrum", importance: 2, foundInCv: false },
          { keyword: "analisis kebutuhan", importance: 2, foundInCv: true },
          { keyword: "React", importance: 2, foundInCv: true },
          { keyword: "database", importance: 2, foundInCv: true },
          { keyword: "use case", importance: 2, foundInCv: true },
          { keyword: "data-driven", importance: 2, foundInCv: false },
          { keyword: "KPI", importance: 2, foundInCv: false },
          { keyword: "prototipe", importance: 1, foundInCv: true },
          { keyword: "Git", importance: 1, foundInCv: true },
        ],
      },
      rewrite: {
        rewrites: [
          {
            id: "r1",
            category: "Organisasi / Kepanitiaan",
            roleContext: "Koordinator Acara — Seminar Teknologi Nasional HIMA SI",
            before: "Bertugas menyusun rundown acara seminar teknologi dan menghubungi pembicara.",
            after:
              "Memimpin penyusunan rundown acara seminar teknologi berskala [isi jumlah peserta] peserta serta mengelola komunikasi 5 pembicara industri hingga acara tuntas tepat waktu.",
            improvementReason:
              "Mengubah kata pasif 'bertugas' menjadi action verb kepemimpinan terukur dengan detail lingkup.",
            keywordsAdded: ["stakeholder communication"],
          },
          {
            id: "r2",
            category: "Organisasi / Kepanitiaan",
            roleContext: "Koordinator Acara — Seminar Teknologi Nasional HIMA SI",
            before: "Berkoordinasi dengan divisi logistik dan publikasi untuk kelancaran jalannya acara.",
            after:
              "Menjalankan cross-functional collaboration dengan divisi logistik dan publikasi serta memfasilitasi koordinasi lintas tim guna mencegah keterlambatan teknis acara.",
            improvementReason:
              "Menyelaraskan koordinasi lintas panitia dengan terminologi kolaborasi lintas fungsi yang dicari rekruter.",
            keywordsAdded: ["cross-functional collaboration"],
          },
          {
            id: "r3",
            category: "Proyek Kuliah",
            roleContext: "Tugas Akhir Mata Kuliah Rekayasa Perangkat Lunak",
            before:
              "Menganalisis kebutuhan pengguna awal sistem perpustakaan dan menyusun use case sistem.",
            after:
              "Melakukan user research terhadap [isi jumlah responden] mahasiswa dan merumuskan PRD awal berupa spesifikasi use case untuk pengembangan prototipe perpustakaan digital.",
            improvementReason:
              "Membingkai analisis kebutuhan mahasiswa ke dalam terminologi inti PM (user research dan PRD).",
            keywordsAdded: ["user research", "PRD"],
          },
          {
            id: "r4",
            category: "Organisasi / Kepanitiaan",
            roleContext: "Anggota Pemasaran — UKM Kewirausahaan Kampus",
            before: "Membantu promosi bazar kampus di Instagram.",
            after:
              "Mengeksekusi kampanye promosi digital bazar kampus di Instagram dengan pendekatan data-driven untuk menganalisis performa postingan dan menjangkau [isi jumlah akun] audiens.",
            improvementReason:
              "Menggantikan kata pasif 'membantu' dengan inisiatif kampanye berbasis data dan target capaian.",
            keywordsAdded: ["data-driven"],
          },
        ],
        cleanCv: {
          fullName: "Raka Pratama",
          headline: "Mahasiswa Sistem Informasi | Aspiran Product Management & Analis Produk",
          summary:
            "Mahasiswa Sistem Informasi semester 6 dengan pemahaman kuat siklus hidup produk, pemodelan use case, dan kolaborasi teknis. Terbiasa memimpin inisiatif acara kampus dan menerjemahkan kebutuhan pengguna menjadi rancangan solusi digital yang terstruktur.",
          skills: [
            "User Research",
            "PRD",
            "Cross-functional Collaboration",
            "Analisis Kebutuhan",
            "Use Case",
            "Data-driven",
            "React",
            "MySQL",
            "Git",
            "Figma Dasar",
          ],
          experiences: [
            {
              title: "Koordinator Divisi Acara",
              organization: "Seminar Teknologi Nasional HIMA SI Cakrawala University",
              period: "Okt 2023 - Des 2023",
              bullets: [
                "Memimpin penyusunan rundown acara seminar teknologi berskala [isi jumlah peserta] peserta serta mengelola komunikasi 5 pembicara industri hingga acara tuntas tepat waktu.",
                "Menjalankan cross-functional collaboration dengan divisi logistik dan publikasi serta memfasilitasi koordinasi lintas tim guna mencegah keterlambatan teknis acara.",
              ],
            },
            {
              title: "Pengembang Web & Analis Kebutuhan",
              organization: "Proyek Tugas Akhir Rekayasa Perangkat Lunak",
              period: "Sep 2023 - Jan 2024",
              bullets: [
                "Melakukan user research terhadap [isi jumlah responden] mahasiswa dan merumuskan PRD awal berupa spesifikasi use case untuk pengembangan prototipe perpustakaan digital.",
                "Membangun website perpustakaan menggunakan React dan MySQL bersama tim 4 orang dengan alur kerja Git kolaboratif.",
              ],
            },
            {
              title: "Anggota Divisi Pemasaran",
              organization: "UKM Kewirausahaan Cakrawala University",
              period: "Feb 2023 - Sekarang",
              bullets: [
                "Mengeksekusi kampanye promosi digital bazar kampus di Instagram dengan pendekatan data-driven untuk menganalisis performa postingan dan menjangkau [isi jumlah akun] audiens.",
                "Mengumpulkan masukan langsung dari [isi jumlah pembeli] calon pengunjung bazar untuk meningkatkan variasi produk jualan.",
              ],
            },
          ],
          education:
            "S1 Sistem Informasi — Universitas Cakrawala (2021 - 2025, Semester 6), IPK 3.68/4.00",
        },
      },
      interview: {
        interviewQuestions: [
          {
            id: "q1",
            question:
              "Dalam deskripsi lowongan kami membutuhkan kandidat yang menguasai user research dan PRD. Bagaimana kamu menerjemahkan pengalaman proyek perpustakaanmu menjadi bukti kemampuan ini?",
            hrFocus:
              "Menilai pemahaman kandidat mengenai metodologi pengumpulan kebutuhan pengguna dan kemampuannya mendokumentasikannya ke format standar produk teknologi.",
            starGuide: {
              situation:
                "Saat mengerjakan proyek mata kuliah Rekayasa Perangkat Lunak untuk membuat sistem informasi perpustakaan kampus.",
              task:
                "Mengidentifikasi alur peminjaman buku manual yang lambat dan merumuskan solusi fitur yang diinginkan pengguna perpustakaan.",
              action:
                "Mewawancarai [isi jumlah mahasiswa] pengguna perpustakaan dan menyusun use case sistem sebagai draf PRD teknis untuk tim pengembang.",
              result:
                "Menghasilkan dokumen spesifikasi fitur yang disetujui dosen pembimbing dan berhasil diimplementasikan menjadi prototipe web fungsional.",
            },
          },
          {
            id: "q2",
            question:
              "Ceritakan pengalamanmu saat harus menyelaraskan berbagai pihak yang memiliki kepentingan berbeda (cross-functional collaboration) dalam sebuah kepanitiaan.",
            hrFocus:
              "Menguji kemampuan resolusi konflik, komunikasi antar divisi, dan kepemimpinan tanpa otoritas formal.",
            starGuide: {
              situation:
                "Ketika menjadi Koordinator Acara Seminar Teknologi Nasional yang melibatkan divisi logistik, konsumsi, dan publikasi.",
              task:
                "Menjaga rundown acara tetap presisi meski ada keterbatasan alat proyektor dari logistik dan penyesuaian materi pembicara eksternal.",
              action:
                "Menginisiasi briefing koordinasi harian lintas divisi dan menetapkan kesepakatan timeline cadangan (buffer time) 15 menit.",
              result:
                "Acara berlangsung tepat waktu dengan tingkat kepuasan peserta mencapai [isi persentase]% tanpa insiden miskomunikasi teknis.",
            },
          },
          {
            id: "q3",
            question:
              "Posisi ini mensyaratkan keputusan berbasis data (data-driven) dan pelacakan KPI. Bagaimana kamu menerapkan pola pikir ini pada pengalaman yang pernah kamu jalani?",
            hrFocus:
              "Melihat apakah kandidat memiliki intuisi kuantitatif atau hanya berasumsi subjektif dalam menjalankan inisiatif.",
            starGuide: {
              situation:
                "Saat menjadi tim promosi media sosial untuk bazar kuliner UKM Kewirausahaan kampus.",
              task:
                "Meningkatkan kehadiran audiens ke stan bazar yang sebelumnya sepi pengunjung.",
              action:
                "Menganalisis jam tayang konten paling ramai di Instagram Insights dan menguji 2 variasi format postingan (A/B testing sederhana).",
              result:
                "Mencapai lonjakan impresi sebesar [isi persentase]% dan mendatangkan [isi jumlah pengunjung] pembeli ke area bazar.",
            },
          },
          {
            id: "q4",
            question:
              "Kamu belum memiliki pengalaman magang resmi di perusahaan produk teknologi sebelumnya. Bagaimana caramu membuktikan bahwa kamu siap beradaptasi dengan ritme kerja Agile/Scrum?",
            hrFocus:
              "Menguji *coachability*, kejujuran kandidat dalam mengakui keterbatasan, serta rencana konkret mempelajari metodologi kerja industri.",
            starGuide: {
              situation:
                "Meskipun belum pernah magang di startup teknologi dengan sprint resmi dua mingguan.",
              task:
                "Mempersiapkan diri agar tidak memerlukan adaptasi yang lama saat bergabung di tim produk.",
              action:
                "Menerapkan pembagian tugas berkala dan git-flow bersama tim proyek RPL serta menyelesaikan kursus dasar Agile di [isi nama platform online].",
              result:
                "Mampu memahami terminologi sprint, user story, dan siap berkontribusi langsung pada daily standup tim sejak minggu pertama.",
            },
          },
          {
            id: "q5",
            question:
              "Jika fitur perpustakaan yang kamu buat saat kuliah memiliki metrik retensi pengguna yang rendah, langkah produk apa yang akan kamu ambil?",
            hrFocus:
              "Menguji kerangka berpikir investigasi masalah produk (root cause analysis) dan prioritisasi solusi.",
            starGuide: {
              situation:
                "Kondisi hipotetis di mana pengguna mahasiswa berhenti mengakses website perpustakaan setelah kunjungan pertama.",
              task:
                "Menemukan akar masalah kenapa pengguna tidak kembali dan menentukan perbaikan dengan sumber daya terbatas.",
              action:
                "Menjalankan survei singkat atau sesi usability testing pada [isi jumlah pengguna] mahasiswa untuk mendeteksi friksi di antarmuka.",
              result:
                "Mengusulkan revisi alur pencarian buku menjadi 1-klik, diproyeksikan meningkatkan retensi pengguna hingga [isi persentase]%.",
            },
          },
        ],
      },
    },
  },
  {
    id: "nadia-growth",
    label: "Contoh 2: Bisnis/Growth",
    description: "Nadia Putri — Mahasiswa Bisnis Digital semester 7, melamar Business Development & Growth Intern",
    cvText: `Nadia Putri
Email: nadia.putri@example.com | No HP: 0813-9876-5432 | Domisili: Jakarta Selatan
LinkedIn: linkedin.com/in/nadia-putri-contoh
NIM: 1906321102 | Universitas Cakrawala — S1 Bisnis Digital (2021 - 2025, Semester 7), IPK 3.72

TENTANG SAYA
Mahasiswa Bisnis Digital semester 7 dengan keahlian dalam komunikasi kemitraan, analisis pasar, dan administrasi organisasi. Memiliki rekam jejak menggalang dana usaha kepanitiaan dan mendampingi UMKM lokal dalam optimasi kanal digital.

PENGALAMAN ORGANISASI
Sekretaris Umum — BEM Fakultas Ekonomi & Bisnis Cakrawala University (Des 2022 - Des 2023)
- Bertanggung jawab atas pengelolaan administrasi surat-menyurat dan proposal kemitraan organisasi.
- Mengatur agenda rapat koordinasi pimpinan dan menyusun notulensi keputusan strategis BEM.

Koordinator Divisi Dana Usaha (Danus) — Festival Seni & Budaya Kampus (Mei 2023 - Okt 2023)
- Mengkoordinir penjualan makanan dan merchandise kampus untuk modal acara festival.
- Menghubungi berbagai vendor sponsor lokal dan mengajukan proposal kerja sama sponsor.

PROYEK KULIAH & PENDAMPINGAN
Studi Kasus Analisis Pemasaran UMKM — Mata Kuliah Strategi Pertumbuhan Bisnis (Feb 2024 - Jun 2024)
- Melakukan survei langsung kepada 30 pelanggan UMKM kuliner sekitar kampus untuk memetakan kepuasan konsumen.
- Mengidentifikasi kelemahan promosi dan mengusulkan paket bundling produk di platform pesan antar.
- Membantu pemilik usaha mencatat alur pesanan harian secara digital.

KEAHLIAN
Keahlian: Analisis Pasar, Riset Konsumen, Komunikasi Bisnis, Penyusunan Proposal, Pitching Dasar, Spreadsheet (Excel/Google Sheets), Negosiasi Vendor
`,
    jobDescription: `Posisi: Business Development & Growth Intern
Perusahaan: PT Cakrawala Niaga Digital (E-Commerce & B2B Marketplace)
Lokasi: Jakarta Pusat

Deskripsi Pekerjaan:
Kami membuka kesempatan bagi mahasiswa berbakat untuk bergabung sebagai Business Development & Growth Intern. Peran ini berfokus pada perluasan jejaring merchant rekanan, akuisisi prospek mitra bisnis, serta analisis data pertumbuhan penjualan.

Tanggung Jawab Utama:
- Melakukan market research untuk mengidentifikasi potensi pasar dan kategori merchant baru.
- Melakukan lead generation dan memetakan prospek mitra B2B potensial di wilayah Jabodetabek.
- Menyiapkan bahan presentasi dan melakukan pitching proposal kemitraan kepada calon merchant.
- Berperan aktif dalam partnership outreach dan menjalin stakeholder management yang baik dengan calon rekanan.
- Melacak conversion rate dari tahap prospek hingga penandatanganan kerja sama (closing deal).
- Menganalisis metrik pertumbuhan (growth metrics) menggunakan spreadsheet untuk evaluasi mingguan tim sales.

Persyaratan:
- Mahasiswa tingkat akhir atau fresh graduate dari Manajemen Bisnis, Bisnis Digital, Ilmu Komunikasi, Ekonomi, atau relevan.
- Kemampuan interpersonal, negosiasi, dan pitching yang persuasif.
- Mahir mengolah data menggunakan Microsoft Excel atau Google Sheets (VLOOKUP, Pivot Table, analisis dasar).
- Memiliki ketertarikan tinggi pada industri startup digital, e-commerce, dan ekosistem B2B.
- Berpengalaman dalam organisasi kampus (khususnya sponsorship, danus, atau hubungan eksternal) menjadi nilai tambah signifikan.
`,
    fallbackResult: {
      score: {
        targetRole: "Business Development & Growth Intern",
        executiveVerdict:
          "Kandidat memiliki rekam jejak yang solid dalam pencarian sponsor dan pendampingan UMKM, namun poin CV masih memakai gaya kepanitiaan tradisional dan belum meminjam terminologi industri seperti lead generation, conversion rate, dan kemitraan B2B.",
        jdKeywords: [
          { keyword: "market research", importance: 3, foundInCv: false },
          { keyword: "partnership", importance: 3, foundInCv: true },
          { keyword: "lead generation", importance: 3, foundInCv: false },
          { keyword: "pitching", importance: 3, foundInCv: true },
          { keyword: "stakeholder management", importance: 2, foundInCv: false },
          { keyword: "conversion rate", importance: 2, foundInCv: false },
          { keyword: "analisis pasar", importance: 2, foundInCv: true },
          { keyword: "spreadsheet", importance: 2, foundInCv: true },
          { keyword: "growth metrics", importance: 2, foundInCv: false },
          { keyword: "prospek mitra", importance: 1, foundInCv: false },
          { keyword: "closing deal", importance: 1, foundInCv: false },
          { keyword: "negosiasi", importance: 1, foundInCv: true },
        ],
      },
      rewrite: {
        rewrites: [
          {
            id: "r1",
            category: "Organisasi / Kepanitiaan",
            roleContext: "Koordinator Dana Usaha — Festival Seni & Budaya Kampus",
            before: "Menghubungi berbagai vendor sponsor lokal dan mengajukan proposal kerja sama sponsor.",
            after:
              "Menjalankan partnership outreach kepada [isi jumlah prospek] calon sponsor lokal dan melakukan pitching proposal kemitraan hingga mengamankan dana sponsor Rp [isi nominal].",
            improvementReason:
              "Mengganti kata pasif 'menghubungi' menjadi aksi akuisisi kemitraan profesional dengan target nilai dana.",
            keywordsAdded: ["partnership", "pitching"],
          },
          {
            id: "r2",
            category: "Organisasi / Kepanitiaan",
            roleContext: "Koordinator Dana Usaha — Festival Seni & Budaya Kampus",
            before: "Mengkoordinir penjualan makanan dan merchandise kampus untuk modal acara festival.",
            after:
              "Mengorkestrasi strategi penjualan merchandise dan kuliner kampus yang menghasilkan total laba bersih Rp [isi nominal] untuk mendukung pendanaan utama festival seni.",
            improvementReason:
              "Menonjolkan kepemimpinan komersial dan pencapaian target profitabilitas daripada sekadar jualan.",
            keywordsAdded: ["growth metrics"],
          },
          {
            id: "r3",
            category: "Proyek Kuliah",
            roleContext: "Proyek Analisis Pemasaran UMKM — Strategi Pertumbuhan Bisnis",
            before:
              "Melakukan survei langsung kepada 30 pelanggan UMKM kuliner sekitar kampus untuk memetakan kepuasan konsumen.",
            after:
              "Mengeksekusi market research terhadap 30 konsumen UMKM dan menganalisis conversion rate pemesanan ulang untuk merekomendasikan strategi paket bundling produk.",
            improvementReason:
              "Mengubah survei kuliah biasa menjadi market research bisnis dengan metrik konversi industri.",
            keywordsAdded: ["market research", "conversion rate"],
          },
          {
            id: "r4",
            category: "Organisasi / Kepanitiaan",
            roleContext: "Sekretaris Umum — BEM Fakultas Ekonomi & Bisnis",
            before:
              "Bertanggung jawab atas pengelolaan administrasi surat-menyurat dan proposal kemitraan organisasi.",
            after:
              "Menerapkan stakeholder management dengan 12 birokrasi kampus dan mitra eksternal serta menertibkan administrasi [isi jumlah proposal] proposal kemitraan strategis.",
            improvementReason:
              "Menghubungkan pengelolaan surat menyurat dengan istilah stakeholder management hubungan mitra.",
            keywordsAdded: ["stakeholder management"],
          },
        ],
        cleanCv: {
          fullName: "Nadia Putri",
          headline: "Mahasiswa Bisnis Digital | Minat Business Development, Partnership & Growth",
          summary:
            "Mahasiswa Bisnis Digital tingkat akhir dengan rekam jejak sukses menggalang sponsor festival seni dan pendampingan pertumbuhan komersial UMKM. Terampil dalam riset pasar, negosiasi kemitraan B2B, dan pengolahan metrik bisnis menggunakan spreadsheet.",
          skills: [
            "Market Research",
            "Partnership Outreach",
            "Pitching & Negosiasi",
            "Stakeholder Management",
            "Conversion Rate",
            "Growth Metrics",
            "Microsoft Excel & Google Sheets",
            "Penyusunan Proposal B2B",
            "Riset Konsumen",
            "Komunikasi Bisnis",
          ],
          experiences: [
            {
              title: "Koordinator Divisi Dana Usaha",
              organization: "Festival Seni & Budaya Cakrawala University",
              period: "Mei 2023 - Okt 2023",
              bullets: [
                "Menjalankan partnership outreach kepada [isi jumlah prospek] calon sponsor lokal dan melakukan pitching proposal kemitraan hingga mengamankan dana sponsor Rp [isi nominal].",
                "Mengorkestrasi strategi penjualan merchandise dan kuliner kampus yang menghasilkan total laba bersih Rp [isi nominal] untuk mendukung pendanaan utama festival seni.",
              ],
            },
            {
              title: "Peneliti Pasar & Pendamping UMKM",
              organization: "Proyek Kuliah Strategi Pertumbuhan Bisnis",
              period: "Feb 2024 - Jun 2024",
              bullets: [
                "Mengeksekusi market research terhadap 30 konsumen UMKM dan menganalisis conversion rate pemesanan ulang untuk merekomendasikan strategi paket bundling produk.",
                "Membantu digitalisasi pencatatan alur pesanan harian pada spreadsheet, mengurangi potensi pesanan ganda hingga [isi persentase]%.",
              ],
            },
            {
              title: "Sekretaris Umum",
              organization: "BEM Fakultas Ekonomi & Bisnis Cakrawala University",
              period: "Des 2022 - Des 2023",
              bullets: [
                "Menerapkan stakeholder management dengan 12 birokrasi kampus dan mitra eksternal serta menertibkan administrasi [isi jumlah proposal] proposal kemitraan strategis.",
                "Memfasilitasi rapat koordinasi pimpinan berkala dan menyusun notulensi keputusan eksekutif organisasi secara terstruktur.",
              ],
            },
          ],
          education:
            "S1 Bisnis Digital — Universitas Cakrawala (2021 - 2025, Semester 7), IPK 3.72/4.00",
        },
      },
      interview: {
        interviewQuestions: [
          {
            id: "q1",
            question:
              "Bagaimana pengalamanmu memimpin penggalangan dana dan sponsor festival kampus relevan dengan proses lead generation dan closing deal di posisi Business Development ini?",
            hrFocus:
              "Menilai kemampuan kandidat mengonversi pengalaman kepanitiaan danus menjadi proses pipeline sales B2B yang sistematis.",
            starGuide: {
              situation:
                "Saat memimpin Divisi Dana Usaha Festival Seni & Budaya kampus dengan target penggalangan dana eksternal.",
              task:
                "Menjaring calon sponsor dan meyakinkan pemilik usaha lokal agar bersedia mendanai acara mahasiswa.",
              action:
                "Menyusun daftar 20 prospek merchant, merancang proposal kerja sama bertingkat, dan melakukan pertemuan pitching tatap muka.",
              result:
                "Berhasil mengamankan kesepakatan sponsorship dari [isi jumlah mitra] mitra dengan total nilai mencapai Rp [isi nominal].",
            },
          },
          {
            id: "q2",
            question:
              "Dalam lowongan ini kami sangat mengutamakan kemampuan market research. Ceritakan metodologi yang kamu gunakan saat menganalisis UMKM lokal pada proyek kuliahmu.",
            hrFocus:
              "Menguji ketelitian metodologi riset, pengambilan sampel, dan kemampuan menarik insight bisnis yang dapat ditindaklanjuti.",
            starGuide: {
              situation:
                "Saat menjalankan proyek mata kuliah Strategi Pertumbuhan Bisnis untuk mendampingi UMKM kuliner di sekitar kampus.",
              task:
                "Mencari tahu penyebab stagnansi omzet dan rendahnya repeat order dari pelanggan mahasiswa.",
              action:
                "Menyebarkan kuesioner terstruktur kepada 30 pelanggan, mengamati alur layanan kasir, dan menganalisis harga menu kompetitor.",
              result:
                "Menemukan fakta bahwa 70% pembeli menginginkan paket hemat bundling, yang setelah diimplementasikan menaikkan penjualan [isi persentase]%.",
            },
          },
          {
            id: "q3",
            question:
              "Ceritakan situasi ketika proposal kemitraan atau penawaran sponsor yang kamu ajukan ditolak oleh calon mitra. Bagaimana responmu?",
            hrFocus:
              "Mengukur resiliensi, kegigihan mental, dan kemampuan mengubah penolakan menjadi peluang penyesuaian penawaran.",
            starGuide: {
              situation:
                "Ketika salah satu calon sponsor utama menolak proposal festival kampus karena paket promosi dianggap terlalu mahal.",
              task:
                "Menyelamatkan potensi kemitraan tanpa merusak struktur harga sponsorship resmi kepanitiaan.",
              action:
                "Mendengarkan kebutuhan promosi riil mitra dan menawarkan paket kustomisasi berupa stan interaktif eksklusif pada hari puncak acara.",
              result:
                "Mitra menyetujui paket alternatif tersebut dan menyumbang dana sponsorship sebesar Rp [isi nominal].",
            },
          },
          {
            id: "q4",
            question:
              "Peran Business Development di perusahaan teknologi sangat bertumpu pada analisis metrik menggunakan spreadsheet. Sejauh mana keahlianmu menggunakan tools tersebut?",
            hrFocus:
              "Menguji keterampilan teknis pengolahan data spreadsheet (VLOOKUP, Pivot, formula logika) untuk pelacakan pipeline sales.",
            starGuide: {
              situation:
                "Saat bertugas sebagai Sekretaris Umum BEM dan analis pada proyek riset pemasaran UMKM.",
              task:
                "Mengintegrasikan data keuangan ratusan transaksi UMKM dan inventaris dokumen kepanitiaan secara rapi.",
              action:
                "Membangun dashboard spreadsheet sederhana menggunakan Pivot Table dan conditional formatting untuk memantau status prospek.",
              result:
                "Mempercepat waktu evaluasi mingguan tim dari [isi jumlah jam] jam menjadi kurang dari 30 menit dengan data yang akurat.",
            },
          },
          {
            id: "q5",
            question:
              "Jika di minggu pertama magang kamu diberikan target untuk menjaring 50 merchant baru di kategori kuliner, bagaimana strategi 5 hari pertamamu?",
            hrFocus:
              "Menilai inisiatif strategis, perencanaan terukur, dan pemahaman prioritas eksekusi peran Business Development.",
            starGuide: {
              situation:
                "Diberikan target lead generation 50 merchant baru dalam tempo singkat di awal masa magang.",
              task:
                "Menyusun daftar prospek tervalidasi dan mengeksekusi outreach awal secara efektif.",
              action:
                "Memetakan sentra kuliner potensial di hari 1-2, menyiapkan skrip pitching persuasif di hari 3, dan melakukan outreach intensif di hari 4-5.",
              result:
                "Mendapatkan setidaknya [isi jumlah respon] respon positif calon merchant yang siap dijadwalkan sesi demo produk.",
            },
          },
        ],
      },
    },
  },
];
