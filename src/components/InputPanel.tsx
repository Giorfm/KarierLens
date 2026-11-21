"use client";

import React, { useMemo } from "react";
import {
  FileText,
  Briefcase,
  ShieldCheck,
  Upload,
  Globe,
  Eye,
  Sparkles,
  Loader2,
} from "lucide-react";
import type { Lang } from "@/types/karierlens";
import { maskPii } from "@/lib/pii";

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
              placeholder="Tempel draf CV kamu di sini. Jangan khawatir jika bahasanya masih pasif atau berupa poin organisasi kampus biasa...

Contoh:
Raka Pratama - raka@example.com - 081234567890
- Koordinator Divisi Acara Seminar Teknologi HIMA SI (bertugas membuat rundown dan kontak pembicara)
- Proyek Tugas Akhir: Bikin sistem perpustakaan pakai React dan MySQL
- Anggota UKM Kewirausahaan membantu jualan bazar kampus..."
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

          {/* Opsi Bahasa */}
          <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs">
            <span className="text-slate-600 font-medium flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5 text-slate-500" />
              Bahasa Output Rekomendasi:
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setLanguage("id")}
                className={`px-2.5 py-1 rounded-md font-medium transition ${
                  language === "id"
                    ? "bg-white text-indigo-600 shadow-xs border border-slate-200"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Bahasa Indonesia
              </button>
              <button
                type="button"
                onClick={() => setLanguage("en")}
                className={`px-2.5 py-1 rounded-md font-medium transition ${
                  language === "en"
                    ? "bg-white text-indigo-600 shadow-xs border border-slate-200"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                English
              </button>
            </div>
          </div>

          <div className="relative">
            <textarea
              rows={9}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Tempel rincian lowongan kerja, kualifikasi magang (MSIB/mandiri), atau Job Description target di sini...

Contoh:
Product Management Intern - Cakrawala Fintech
Tanggung Jawab:
- Melakukan user research dan merumuskan Product Requirement Document (PRD)
- Berkolaborasi lintas divisi (cross-functional) dengan tim engineering dan UI/UX
- Mengikuti ritme kerja Agile/Scrum dan menganalisis KPI produk..."
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
