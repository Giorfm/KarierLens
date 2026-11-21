"use client";

import React, { useMemo } from "react";
import {
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
    <div className="no-print space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Kolom 01: Input CV */}
        <div className="bg-white border-2 border-[#1D1D1B] shadow-[4px_4px_0px_#1D1D1B] rounded-none flex flex-col">
          {/* Header Strip CV: Acid Yellow */}
          <div className="bg-[#EFE84A] border-b-2 border-[#1D1D1B] px-4 py-3 flex items-center justify-between">
            <span className="font-mono text-xs sm:text-sm font-black text-[#1D1D1B] uppercase tracking-wider flex items-center gap-2">
              01 // DATA PENGALAMAN (CV)
            </span>
            <span
              className={`font-mono text-xs font-bold ${
                cvLength > 0 && (cvLength < 30 || cvLength > 12000)
                  ? "text-[#F34E34]"
                  : "text-[#1D1D1B]"
              }`}
            >
              {cvLength.toLocaleString()} / 12.000
            </span>
          </div>

          <div className="p-4 sm:p-5 flex-1 flex flex-col space-y-3">
            {/* PDF dropzone with thick dashed border */}
            {onPdfUpload && (
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                className="border-2 border-dashed border-[#1D1D1B] bg-[#F4F1EA] hover:bg-[#EFE84A]/25 p-3 text-center transition cursor-pointer relative group"
              >
                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handleFileChange}
                  disabled={isLoading || pdfParsing}
                  className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
                  title="Pilih file PDF"
                />
                <div className="flex items-center justify-center gap-2 font-mono text-xs font-bold text-[#1D1D1B]">
                  {pdfParsing ? (
                    <>
                      <Loader2 className="h-4 w-4 text-[#1D1D1B] animate-spin" />
                      <span>MENGEKSTRAK PDF...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 text-[#1D1D1B]" />
                      <span>
                        UNGGAH PDF CV{" "}
                        <span className="underline decoration-2 text-[#1E40AF]">(KLIK / TARIK FILE)</span> — MAKS. 5 MB
                      </span>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Textarea CV */}
            <div className="relative flex-1">
              <textarea
                rows={9}
                value={cvText}
                onChange={(e) => setCvText(e.target.value)}
                placeholder={`Tempel draf CV di sini (organisasi, kepanitiaan, asisten lab, proyek kuliah)...`}
                className="w-full min-h-[220px] rounded-none border-2 border-[#1D1D1B] bg-[#F4F1EA] p-4 text-sm font-sans text-[#1D1D1B] placeholder:text-[#1D1D1B]/50 focus:bg-white focus:outline-none focus:ring-0 focus:shadow-[3px_3px_0px_#1D1D1B] transition resize-y"
              />
            </div>

            {cvLength > 0 && cvLength < 30 && (
              <p className="font-mono text-xs text-[#F34E34] font-bold">
                [!] Minimal 30 karakter.
              </p>
            )}
            {cvLength > 12000 && (
              <p className="font-mono text-xs text-[#F34E34] font-bold">
                [!] Maksimal 12.000 karakter.
              </p>
            )}
          </div>
        </div>

        {/* Kolom 02: Input JD */}
        <div className="bg-white border-2 border-[#1D1D1B] shadow-[4px_4px_0px_#1D1D1B] rounded-none flex flex-col">
          {/* Header Strip JD: Cobalt Blue */}
          <div className="bg-[#1E40AF] text-[#F4F1EA] border-b-2 border-[#1D1D1B] px-4 py-3 flex items-center justify-between">
            <span className="font-mono text-xs sm:text-sm font-black text-[#F4F1EA] uppercase tracking-wider flex items-center gap-2">
              02 // TARGET LOWONGAN (JD)
            </span>
            <span
              className={`font-mono text-xs font-bold ${
                jdLength > 0 && (jdLength < 30 || jdLength > 8000)
                  ? "text-[#EFE84A]"
                  : "text-[#F4F1EA]"
              }`}
            >
              {jdLength.toLocaleString()} / 8.000
            </span>
          </div>

          <div className="p-4 sm:p-5 flex-1 flex flex-col space-y-3">
            {/* Opsi Bahasa */}
            <div className="flex items-center justify-between bg-[#F4F1EA] border-2 border-[#1D1D1B] p-2.5">
              <span className="font-mono text-xs font-bold text-[#1D1D1B] flex items-center gap-1.5 uppercase">
                <Globe className="h-3.5 w-3.5 text-[#1D1D1B]" />
                BAHASA:
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setLanguage("id")}
                  className={`px-3 py-1 font-mono text-xs font-bold border-2 border-[#1D1D1B] transition cursor-pointer ${
                    language === "id"
                      ? "bg-[#EFE84A] text-[#1D1D1B] shadow-[2px_2px_0px_#1D1D1B]"
                      : "bg-white text-[#1D1D1B] hover:bg-[#EFE84A]/30"
                  }`}
                >
                  INDONESIA
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage("en")}
                  className={`px-3 py-1 font-mono text-xs font-bold border-2 border-[#1D1D1B] transition cursor-pointer ${
                    language === "en"
                      ? "bg-[#EFE84A] text-[#1D1D1B] shadow-[2px_2px_0px_#1D1D1B]"
                      : "bg-white text-[#1D1D1B] hover:bg-[#EFE84A]/30"
                  }`}
                >
                  ENGLISH
                </button>
              </div>
            </div>

            {/* Textarea JD */}
            <div className="relative flex-1">
              <textarea
                rows={9}
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder={`Tempel kualifikasi atau Job Description lowongan kerja target di sini...`}
                className="w-full min-h-[220px] rounded-none border-2 border-[#1D1D1B] bg-[#F4F1EA] p-4 text-sm font-sans text-[#1D1D1B] placeholder:text-[#1D1D1B]/50 focus:bg-white focus:outline-none focus:ring-0 focus:shadow-[3px_3px_0px_#1D1D1B] transition resize-y"
              />
            </div>

            {jdLength > 0 && jdLength < 30 && (
              <p className="font-mono text-xs text-[#F34E34] font-bold">
                [!] Minimal 30 karakter.
              </p>
            )}
            {jdLength > 8000 && (
              <p className="font-mono text-xs text-[#F34E34] font-bold">
                [!] Maksimal 8.000 karakter.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Baris Privasi & Masking PII */}
      <div className="bg-white border-2 border-[#1D1D1B] shadow-[4px_4px_0px_#1D1D1B] p-4 sm:p-5 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={maskPiiEnabled}
              onChange={(e) => setMaskPiiEnabled(e.target.checked)}
              className="h-5 w-5 rounded-none border-2 border-[#1D1D1B] text-[#1E40AF] focus:ring-0 cursor-pointer accent-[#1E40AF]"
            />
            <span className="font-mono text-xs sm:text-sm font-bold text-[#1D1D1B] uppercase flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-[#2ED47A]" />
              Samarkan Data Pribadi (Privasi Klien)
            </span>
          </label>

          <span className="font-mono text-xs font-bold text-[#F34E34]">
            * Nama tidak disamarkan.
          </span>
        </div>

        {maskPiiEnabled && (
          <div className="space-y-3 pt-3 border-t-2 border-[#1D1D1B]">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-bold uppercase text-[#1D1D1B]">
                PRIVASI:
              </span>
              {totalMasked === 0 ? (
                <span className="font-mono text-xs text-[#1D1D1B]/60">
                  Kontak aman
                </span>
              ) : (
                <>
                  <span className="bg-[#2ED47A] text-[#1D1D1B] border-2 border-[#1D1D1B] font-mono text-xs font-bold px-2.5 py-0.5 rounded-full shadow-[1px_1px_0px_#1D1D1B]">
                    {totalMasked} DISAMARKAN
                  </span>
                  {piiData.counts.email > 0 && (
                    <span className="bg-white text-[#1D1D1B] border-2 border-[#1D1D1B] font-mono text-xs font-bold px-2 py-0.5 rounded-full shadow-[1px_1px_0px_#1D1D1B]">
                      email: {piiData.counts.email}
                    </span>
                  )}
                  {piiData.counts.phone > 0 && (
                    <span className="bg-white text-[#1D1D1B] border-2 border-[#1D1D1B] font-mono text-xs font-bold px-2 py-0.5 rounded-full shadow-[1px_1px_0px_#1D1D1B]">
                      telepon: {piiData.counts.phone}
                    </span>
                  )}
                  {piiData.counts.link > 0 && (
                    <span className="bg-white text-[#1D1D1B] border-2 border-[#1D1D1B] font-mono text-xs font-bold px-2 py-0.5 rounded-full shadow-[1px_1px_0px_#1D1D1B]">
                      link: {piiData.counts.link}
                    </span>
                  )}
                  {piiData.counts.nik > 0 && (
                    <span className="bg-white text-[#1D1D1B] border-2 border-[#1D1D1B] font-mono text-xs font-bold px-2 py-0.5 rounded-full shadow-[1px_1px_0px_#1D1D1B]">
                      nik: {piiData.counts.nik}
                    </span>
                  )}
                  {piiData.counts.nim > 0 && (
                    <span className="bg-white text-[#1D1D1B] border-2 border-[#1D1D1B] font-mono text-xs font-bold px-2 py-0.5 rounded-full shadow-[1px_1px_0px_#1D1D1B]">
                      nim: {piiData.counts.nim}
                    </span>
                  )}
                  {piiData.counts.address > 0 && (
                    <span className="bg-white text-[#1D1D1B] border-2 border-[#1D1D1B] font-mono text-xs font-bold px-2 py-0.5 rounded-full shadow-[1px_1px_0px_#1D1D1B]">
                      alamat: {piiData.counts.address}
                    </span>
                  )}
                </>
              )}
            </div>

            {totalMasked > 0 && (
              <details className="cursor-pointer pt-1">
                <summary className="font-mono text-xs font-bold text-[#1E40AF] hover:underline inline-flex items-center gap-1.5 uppercase select-none">
                  <Eye className="h-3.5 w-3.5" />
                  LIHAT HASIL MASKING
                </summary>
                <div className="mt-2 font-mono bg-[#1D1D1B] text-[#F4F1EA] p-4 border-2 border-[#1D1D1B] shadow-[2px_2px_0px_#1D1D1B] text-xs max-h-40 overflow-y-auto whitespace-pre-wrap">
                  {piiData.masked}
                </div>
              </details>
            )}
          </div>
        )}
      </div>

      {/* Primary CTA Button: Oversized Acid Yellow Tactile Button */}
      <div>
        <button
          type="button"
          onClick={onAudit}
          disabled={!canAudit}
          className="w-full py-4 px-6 bg-[#EFE84A] text-[#1D1D1B] font-black text-base uppercase tracking-wider border-2 border-[#1D1D1B] shadow-[4px_4px_0px_#1D1D1B] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#1D1D1B] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all duration-100 disabled:opacity-50 disabled:translate-x-0 disabled:translate-y-0 disabled:shadow-none disabled:cursor-not-allowed flex items-center justify-center gap-3 cursor-pointer"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin text-[#1D1D1B]" />
              <span>MENGANALISIS CV...</span>
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5 text-[#1D1D1B]" />
              <span>AUDIT CV SEKARANG</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
