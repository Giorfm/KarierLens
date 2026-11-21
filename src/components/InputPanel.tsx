"use client";

import React, { useMemo } from "react";
import {
  FileText,
  Briefcase,
  ShieldCheck,
  Upload,
  Eye,
  Sparkles,
  Loader2,
  Info,
  ArrowRight,
  AlertTriangle,
} from "lucide-react";
import type { Lang } from "@/types/karierlens";
import { maskPii } from "@/lib/pii";
import { detectLanguage } from "@/lib/language";

interface InputPanelProps {
  cvText: string;
  setCvText: (val: string) => void;
  jobDescription: string;
  setJobDescription: (val: string) => void;
  language: Lang;
  setLanguage: (val: Lang) => void;
  maskPiiEnabled: boolean;
  setMaskPiiEnabled: (val: boolean) => void;
  onAudit: () => void;
  isLoading: boolean;
  onPdfUpload?: (file: File) => void;
  pdfParsing?: boolean;
}

export const InputPanel: React.FC<InputPanelProps> = ({
  cvText,
  setCvText,
  jobDescription,
  setJobDescription,
  language,
  setLanguage,
  maskPiiEnabled,
  setMaskPiiEnabled,
  onAudit,
  isLoading,
  onPdfUpload,
  pdfParsing,
}) => {
  // PII calculation for preview
  const piiData = useMemo(() => {
    return maskPii(cvText);
  }, [cvText]);

  // Language detection on Job Description
  const jdDetectedLang = useMemo(() => {
    return detectLanguage(jobDescription);
  }, [jobDescription]);

  const totalMasked = Object.values(piiData.counts).reduce((a, b) => a + b, 0);

  const cvLength = cvText.length;
  const jdLength = jobDescription.length;

  const isCvValid = cvLength >= 30 && cvLength <= 12000;
  const isJdValid = jdLength >= 30 && jdLength <= 8000;
  const canAudit = isCvValid && isJdValid && !isLoading && !pdfParsing;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onPdfUpload) {
      onPdfUpload(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && onPdfUpload) {
      onPdfUpload(file);
    }
  };

  return (
    <div className="no-print bg-white rounded-2xl border border-slate-200 shadow-xs p-5 md:p-6 space-y-6">
      {/* Pilihan Bahasa Hasil CV: Segmented Control Dua Kartu (Spesifikasi 3.2) */}
      <div className="space-y-3">
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
          Pilihan Format Dokumen Hasil CV
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Kartu 1: CV Bahasa Indonesia */}
          <button
            type="button"
            onClick={() => setLanguage("id")}
            className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer relative ${
              language === "id"
                ? "bg-indigo-50/70 border-indigo-500 ring-2 ring-indigo-200 shadow-xs"
                : "bg-slate-50/60 border-slate-200 hover:bg-slate-100 hover:border-slate-300"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-slate-900">CV Bahasa Indonesia</span>
              {language === "id" && (
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Hasil CV, poin revisi, dan simulasi wawancara dalam Bahasa Indonesia profesional.
            </p>
          </button>

          {/* Kartu 2: CV Bahasa Inggris (Niche Feature) */}
          <button
            type="button"
            onClick={() => setLanguage("en")}
            className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer relative ${
              language === "en"
                ? "bg-indigo-50/70 border-indigo-500 ring-2 ring-indigo-200 shadow-xs"
                : "bg-slate-50/60 border-slate-200 hover:bg-slate-100 hover:border-slate-300"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-slate-900">CV Bahasa Inggris</span>
                <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full border border-amber-300 shadow-2xs">
                  Khas KarierLens
                </span>
              </div>
              {language === "en" && (
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
              )}
            </div>
            <p className="text-xs text-slate-600 mt-1">
              <em>Tulis dalam Bahasa Indonesia, hasil dalam Bahasa Inggris</em> — dibantu glosarium kampus tanpa menaikkan jabatan.
            </p>
          </button>
        </div>

        {/* Saran Otomatis Berdasarkan Deteksi Bahasa JD */}
        {jdDetectedLang === "en" && language === "id" && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-indigo-900">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-indigo-600 shrink-0" />
              <span>
                <strong>Saran:</strong> JD terdeteksi berbahasa Inggris. Mau hasil CV dalam Bahasa Inggris?
              </span>
            </div>
            <button
              type="button"
              onClick={() => setLanguage("en")}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold shadow-2xs transition cursor-pointer shrink-0"
            >
              <span>Pakai mode Inggris</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {language === "en" && jdDetectedLang === "id" && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2.5 text-xs text-amber-900">
            <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <p>
              <strong>Catatan:</strong> JD berbahasa Indonesia, sedangkan CV hasil berbahasa Inggris. Pencocokan kata kunci tetap berjalan dua arah, tetapi pastikan perusahaan target memang menerima CV Inggris.
            </p>
          </div>
        )}

        {/* Kartu Tips Statis untuk Mode Inggris */}
        {language === "en" && (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-start gap-2.5 text-xs text-slate-600">
            <Info className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
            <p>
              <strong>Tips CV Global:</strong> CV untuk perusahaan multinasional / regional umumnya tidak mencantumkan foto, agama, status pernikahan, atau tanggal lahir. Periksa persyaratan tiap lowongan.
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Kolom Kiri: Input CV */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 font-semibold text-slate-900 text-sm">
              <FileText className="h-4 w-4 text-indigo-600" />
              Teks Pengalaman CV Kamu
            </label>
            <span
              className={`text-xs ${
                cvLength < 30 || cvLength > 12000
                  ? "text-rose-500 font-medium"
                  : "text-slate-400"
              }`}
            >
              {cvLength.toLocaleString()} / 12.000 karakter
            </span>
          </div>

          {/* Upload PDF Area */}
          {onPdfUpload && (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className="border-2 border-dashed border-slate-200 hover:border-indigo-400 bg-slate-50/70 hover:bg-indigo-50/30 rounded-xl p-3 text-center transition cursor-pointer relative"
            >
              <input
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileChange}
                disabled={isLoading || pdfParsing}
                className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
                title="Pilih file PDF"
              />
              <div className="flex items-center justify-center gap-2 text-xs text-slate-600 font-medium">
                {pdfParsing ? (
                  <>
                    <Loader2 className="h-4 w-4 text-indigo-600 animate-spin" />
                    <span>Mengekstrak teks PDF...</span>
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 text-indigo-600" />
                    <span>
                      Tarik file PDF CV ke sini atau{" "}
                      <span className="text-indigo-600 underline">klik untuk unggah</span> (Maks. 5 MB)
                    </span>
                  </>
                )}
              </div>
            </div>
          )}

          <div className="relative">
            <textarea
              rows={9}
              value={cvText}
              onChange={(e) => setCvText(e.target.value)}
              placeholder="Tempel draf CV kamu di sini dalam Bahasa Indonesia. Tulis pengalaman organisasi (BEM/HIMA), kepanitiaan, asisten lab, atau proyek kuliahmu apa adanya...

Contoh:
Raka Pratama - raka@example.com - 081234567890
- Koordinator Divisi Acara Seminar Teknologi HIMA SI (bertugas membuat rundown dan kontak pembicara)
- Koordinator Danus Bazar: mengumpulkan dana Rp12.500.000 melalui sponsor dan penjualan merchandise
- Proyek Tugas Besar: Bikin sistem inventaris pakai React dan MySQL
- Asisten Praktikum Basis Data: membimbing 45 mahasiswa..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/40 p-3.5 text-sm font-normal text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition resize-y font-sans"
            />
          </div>

          {cvLength > 0 && cvLength < 30 && (
            <p className="text-xs text-rose-500">
              * Teks CV terlalu pendek. Masukkan minimal 30 karakter.
            </p>
          )}
          {cvLength > 12000 && (
            <p className="text-xs text-rose-500">
              * Teks CV melebihi batas maksimal 12.000 karakter.
            </p>
          )}
        </div>

        {/* Kolom Kanan: Input JD */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 font-semibold text-slate-900 text-sm">
              <Briefcase className="h-4 w-4 text-indigo-600" />
              Target Lowongan / Job Description (JD)
            </label>
            <div className="flex items-center gap-2">
              <span
                className={`text-xs ${
                  jdLength < 30 || jdLength > 8000
                    ? "text-rose-500 font-medium"
                    : "text-slate-400"
                }`}
              >
                {jdLength.toLocaleString()} / 8.000 karakter
              </span>
            </div>
          </div>

          <div className="relative">
            <textarea
              rows={9}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Tempel rincian lowongan kerja, kualifikasi magang (MSIB/mandiri), atau Job Description target di sini... (Bahasa Indonesia atau Bahasa Inggris)

Contoh:
Product Operations Intern - Southeast Asia Tech
Responsibilities:
- Conduct user research and assist in operational workflow mapping
- Coordinate cross-functional requirements with engineering and design
- Track project milestones and resolve process bottlenecks..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/40 p-3.5 text-sm font-normal text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition resize-y font-sans"
            />
          </div>

          {jdLength > 0 && jdLength < 30 && (
            <p className="text-xs text-rose-500">
              * Teks lowongan terlalu pendek. Masukkan minimal 30 karakter.
            </p>
          )}
          {jdLength > 8000 && (
            <p className="text-xs text-rose-500">
              * Teks lowongan melebihi batas maksimal 8.000 karakter.
            </p>
          )}
        </div>
      </div>

      {/* Baris Privasi & Masking PII */}
      <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={maskPiiEnabled}
              onChange={(e) => setMaskPiiEnabled(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
            />
            <span className="text-xs sm:text-sm font-semibold text-slate-800 flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              Samarkan data pribadi di browser sebelum dikirim ke AI
            </span>
          </label>

          <span className="text-[11px] text-slate-500 italic">
            * Nama lengkap tidak disamarkan
          </span>
        </div>

        {maskPiiEnabled && (
          <div className="space-y-2 pt-1 border-t border-slate-200/60 text-xs">
            <div className="flex flex-wrap items-center gap-2 text-slate-600">
              <span className="font-medium text-slate-700">Ringkasan Privasi:</span>
              {totalMasked === 0 ? (
                <span className="text-slate-400">Tidak ada kontak sensitif terdeteksi di CV</span>
              ) : (
                <>
                  <span className="bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full">
                    {totalMasked} entri disamarkan
                  </span>
                  {piiData.counts.email > 0 && (
                    <span className="bg-slate-200/80 px-2 py-0.5 rounded text-slate-700">
                      Email: {piiData.counts.email}
                    </span>
                  )}
                  {piiData.counts.phone > 0 && (
                    <span className="bg-slate-200/80 px-2 py-0.5 rounded text-slate-700">
                      Telepon: {piiData.counts.phone}
                    </span>
                  )}
                  {piiData.counts.link > 0 && (
                    <span className="bg-slate-200/80 px-2 py-0.5 rounded text-slate-700">
                      Link: {piiData.counts.link}
                    </span>
                  )}
                  {piiData.counts.nik > 0 && (
                    <span className="bg-slate-200/80 px-2 py-0.5 rounded text-slate-700">
                      NIK: {piiData.counts.nik}
                    </span>
                  )}
                  {piiData.counts.nim > 0 && (
                    <span className="bg-slate-200/80 px-2 py-0.5 rounded text-slate-700">
                      NIM: {piiData.counts.nim}
                    </span>
                  )}
                  {piiData.counts.address > 0 && (
                    <span className="bg-slate-200/80 px-2 py-0.5 rounded text-slate-700">
                      Alamat: {piiData.counts.address}
                    </span>
                  )}
                </>
              )}
            </div>

            {totalMasked > 0 && (
              <details className="text-[11px] text-slate-500 cursor-pointer pt-1">
                <summary className="hover:text-indigo-600 inline-flex items-center gap-1 font-medium select-none">
                  <Eye className="h-3 w-3" />
                  Lihat teks CV yang dikirim ke AI
                </summary>
                <div className="mt-2 p-3 bg-slate-900 text-slate-100 rounded-lg font-mono text-[11px] max-h-40 overflow-y-auto whitespace-pre-wrap">
                  {piiData.masked}
                </div>
              </details>
            )}
          </div>
        )}
      </div>

      {/* Tombol Eksekusi Audit */}
      <div>
        <button
          type="button"
          onClick={onAudit}
          disabled={!canAudit}
          className="w-full py-3.5 px-6 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed shadow-md shadow-indigo-100 transition flex items-center justify-center gap-2 text-sm sm:text-base cursor-pointer"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Menganalisis Kata Kunci, Menulis Ulang & Menyiapkan Wawancara...</span>
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5" />
              <span>Audit CV & Terjemahkan Pengalaman ke Bahasa Rekruter</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
