"use client";

import React, { useMemo } from "react";
import { Printer, AlertTriangle, FileText, CheckCircle2, Info } from "lucide-react";
import type { CleanCvSection, Lang } from "@/types/karierlens";
import {
  countPlaceholders,
  countUnfilledPlaceholders,
  splitPlaceholders,
} from "@/lib/placeholders";
import { detectTitleInflation } from "@/lib/title-guard";

interface PrintCvTabProps {
  cleanCv?: CleanCvSection;
  language?: Lang;
  cvText?: string;
  contacts: {
    emails: string[];
    phones: string[];
    links: string[];
  };
  isLoading: boolean;
  error?: string | null;
  onRetry: () => void;
  onActivateSimulation: () => void;
  placeholderValues?: Record<string, string>;
  onPlaceholderChange?: (key: string, value: string, originalPlaceholder: string) => void;
}

export const PrintCvTab: React.FC<PrintCvTabProps> = ({
  cleanCv,
  language = "id",
  cvText = "",
  contacts,
  isLoading,
  error,
  onRetry,
  onActivateSimulation,
  placeholderValues = {},
  onPlaceholderChange,
}) => {
  const isEn = language === "en";

  // Title inflation check on cleanCv (Section 3.5.1)
  const unjustifiedTitles = useMemo(() => {
    if (!cleanCv) return [];
    const allCleanTitles = [
      cleanCv.headline,
      cleanCv.summary,
      ...(cleanCv.experiences || []).map((e) => e.title),
    ].join(" ");
    return detectTitleInflation(cvText, allCleanTitles);
  }, [cleanCv, cvText]);

  if (error) {
    return (
      <div className="bg-[#F34E34] text-white border-2 border-[#1D1D1B] shadow-[4px_4px_0px_#1D1D1B] p-8 text-center space-y-4">
        <h3 className="font-mono text-base font-black uppercase tracking-wider">
          [!] GAGAL MEMFORMAT CV
        </h3>
        <p className="font-sans text-sm max-w-lg mx-auto">{error}</p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#EFE84A] text-[#1D1D1B] font-mono text-xs font-bold uppercase border-2 border-[#1D1D1B] shadow-[2px_2px_0px_#1D1D1B] hover:translate-x-[1px] hover:translate-y-[1px] active:shadow-none transition-all cursor-pointer"
          >
            <RotateCcw className="h-4 w-4" />
            COBA LAGI
          </button>
          <button
            type="button"
            onClick={onActivateSimulation}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-white text-[#1D1D1B] font-mono text-xs font-bold uppercase border-2 border-[#1D1D1B] shadow-[2px_2px_0px_#1D1D1B] hover:translate-x-[1px] hover:translate-y-[1px] active:shadow-none transition-all cursor-pointer"
          >
            LIHAT SIMULASI
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-white border-2 border-[#1D1D1B] shadow-[4px_4px_0px_#1D1D1B] p-8 space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-[#F4F1EA] mx-auto border border-[#1D1D1B]"></div>
        <div className="h-4 w-64 bg-[#F4F1EA] mx-auto border border-[#1D1D1B]"></div>
        <div className="h-24 bg-[#F4F1EA] border border-[#1D1D1B]"></div>
        <div className="h-36 bg-[#F4F1EA] border border-[#1D1D1B]"></div>
      </div>
    );
  }

  if (!cleanCv) {
    return (
      <div className="bg-white border-2 border-[#1D1D1B] shadow-[4px_4px_0px_#1D1D1B] p-8 sm:p-12 text-center space-y-6">
        <div className="inline-flex items-center justify-center p-4 bg-[#EFE84A] border-2 border-[#1D1D1B] shadow-[3px_3px_0px_#1D1D1B]">
          <Printer className="h-8 w-8 text-[#1D1D1B]" />
        </div>

        <div className="max-w-md mx-auto space-y-2">
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#1E40AF]">
            OUTPUT // FORMAT ATS
          </span>
          <h3 className="font-black text-2xl text-[#1D1D1B] tracking-tight">
            Draf CV Standar ATS
          </h3>
          <p className="text-sm text-[#1D1D1B]/80 leading-relaxed font-sans">
            CV 1 kolom siap cetak yang sinkron dengan data revisi.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={onActivateSimulation}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#EFE84A] text-[#1D1D1B] font-mono text-xs font-bold uppercase border-2 border-[#1D1D1B] shadow-[3px_3px_0px_#1D1D1B] hover:translate-x-[1px] hover:translate-y-[1px] active:shadow-none transition-all cursor-pointer"
          >
            <Printer className="h-4 w-4" />
            <span>LIHAT CONTOH CV</span>
          </button>
        </div>
      </div>
    );
  }

  // Hitung placeholder pada seluruh bagian cleanCv
  let totalPlaceholders = 0;
  let unfilledCount = 0;

  const countSection = (text?: string | null, contextId?: string) => {
    if (!text) return;
    totalPlaceholders += countPlaceholders(text);
    unfilledCount += countUnfilledPlaceholders(text, placeholderValues, contextId);
  };

  countSection(cleanCv.fullName, "cv_name");
  countSection(cleanCv.headline, "cv_headline");
  countSection(cleanCv.summary, "cv_summary");
  countSection(cleanCv.education, "cv_education");
  cleanCv.skills?.forEach((s, idx) => countSection(s, `cv_skill_${idx}`));
  cleanCv.experiences?.forEach((exp, expIdx) => {
    countSection(exp.title, `cv_exp_${expIdx}_title`);
    countSection(exp.organization, `cv_exp_${expIdx}_org`);
    countSection(exp.period, `cv_exp_${expIdx}_period`);
    exp.bullets?.forEach((b, bIdx) => countSection(b, `cv_exp_${expIdx}_b_${bIdx}`));
  });

  const renderWithPlaceholders = (text?: string | null, contextId?: string) => {
    if (!text) return null;
    const parts = splitPlaceholders(text);
    let phIdx = 0;

    return parts.map((p, idx) => {
      if (p.isPlaceholder) {
        const specificKey = contextId ? `${contextId}_${phIdx}` : "";
        const filledVal =
          (specificKey && placeholderValues[specificKey]) ||
          placeholderValues[p.text] ||
          "";

        const isFilled = filledVal.trim().length > 0;
        const hint = p.hint || (isEn ? "fill" : "isi");

        return (
          <span key={idx} className="inline align-baseline">
            {/* Screen View */}
            <span className="print:hidden inline-flex items-baseline mx-0.5">
              <input
                type="text"
                value={filledVal}
                onChange={(e) => {
                  if (onPlaceholderChange) {
                    onPlaceholderChange(specificKey || p.text, e.target.value, p.text);
                  }
                }}
                placeholder={hint}
                title={`Ketik data riil: ${p.text}`}
                className="bg-[#EFE84A] text-[#1D1D1B] font-mono font-bold text-xs px-1.5 py-0.5 border border-[#1D1D1B] shadow-[1px_1px_0px_#1D1D1B] placeholder:text-[#1D1D1B]/60 focus:bg-white focus:outline-none focus:ring-0 transition"
                style={{
                  width: `${Math.max(filledVal.length, hint.length, 3) + 2}ch`,
                  minWidth: "60px",
                }}
              />
            </span>

            {/* Print View */}
            <span className="hidden print:inline font-normal text-black">
              {isFilled ? filledVal : p.text}
            </span>
          </span>
        );
      }
      return <span key={idx}>{p.text}</span>;
    });
  };

  const contactItems: string[] = [];
  if (contacts.emails.length > 0) contactItems.push(contacts.emails[0]);
  if (contacts.phones.length > 0) contactItems.push(contacts.phones[0]);
  if (contacts.links.length > 0) contactItems.push(contacts.links.slice(0, 2).join(" | "));

  return (
    <div className="space-y-6">
      {/* Banner Non-Cetak Mode Inggris (Spesifikasi 3.6) */}
      {isEn && (
        <div className="no-print bg-indigo-50 border border-indigo-200 rounded-2xl p-4 flex items-start gap-3 text-xs text-indigo-900">
          <Info className="h-5 w-5 text-indigo-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold uppercase tracking-wider text-indigo-950">
              Dokumen CV Bahasa Inggris
            </h4>
            <p className="mt-0.5 leading-relaxed">
              Terjemahan dibantu AI dan glosarium. Periksa kembali, dan pastikan kamu bisa menjelaskan setiap kalimat dalam bahasa Inggris saat wawancara.
            </p>
          </div>
        </div>
      )}

      {/* Peringatan Penjaga Kenaikan Jabatan jika terdeteksi (3.5.1) */}
      {unjustifiedTitles.length > 0 && (
        <div className="no-print bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3 text-xs text-amber-900">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
          <span>
            <strong>Peringatan Kenaikan Jabatan:</strong> Kata <strong>&quot;{unjustifiedTitles.join(", ")}&quot;</strong> tidak ada di CV aslimu. Periksa agar tidak terkesan menaikkan jabatan.
          </span>
        </div>
      )}

      {/* Action & Warning Bar */}
      <div className="no-print bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span
            className={`p-2 border-2 border-[#1D1D1B] shadow-[2px_2px_0px_#1D1D1B] ${
              unfilledCount === 0 && totalPlaceholders > 0
                ? "bg-[#2ED47A] text-[#1D1D1B]"
                : "bg-[#EFE84A] text-[#1D1D1B]"
            }`}
          >
            {unfilledCount === 0 && totalPlaceholders > 0 ? (
              <CheckCircle2 className="h-5 w-5" />
            ) : (
              <AlertTriangle className="h-5 w-5" />
            )}
          </span>
          <div>
            <h4 className="font-mono text-xs font-black uppercase tracking-wider text-[#1D1D1B]">
              {unfilledCount === 0 && totalPlaceholders > 0
                ? "SIAP DICETAK"
                : "PERIKSA PLACEHOLDER //"}
            </h4>
            <p className="font-sans text-xs text-[#1D1D1B]/80 mt-0.5 leading-relaxed">
              {unfilledCount > 0 ? (
                <>
                  Tersisa <strong className="font-mono font-bold text-[#F34E34]">{unfilledCount} placeholder</strong> kosong.
                </>
              ) : (
                "Semua data lengkap dan siap dicetak."
              )}
            </p>
          </div>
        </div>

        {/* CTA Button */}
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#EFE84A] text-[#1D1D1B] font-mono text-xs font-black uppercase tracking-wider border-2 border-[#1D1D1B] shadow-[4px_4px_0px_#1D1D1B] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#1D1D1B] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all duration-100 cursor-pointer shrink-0"
        >
          <Printer className="h-4 w-4" />
          <span>CETAK PDF</span>
        </button>
      </div>

      {/* Dokumen CV 1 Kolom Format Harvard/ATS dengan atribut lang */}
      <div
        id="print-area"
        lang={language || "id"}
        className="bg-white border border-slate-200 rounded-2xl p-8 sm:p-12 shadow-sm font-sans text-slate-900 text-sm max-w-4xl mx-auto space-y-6 print:border-none print:shadow-none print:p-0"
      >
        {/* Header Nama & Kontak */}
        <div className="text-center border-b border-slate-300 pb-5 space-y-1.5 print:border-black">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 uppercase print:text-black">
            {renderWithPlaceholders(cleanCv.fullName, "name")}
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-slate-700 print:text-black">
            {renderWithPlaceholders(cleanCv.headline, "headline")}
          </p>

            {/* Kontak */}
            <div className="text-xs text-black pt-1 flex flex-wrap justify-center items-center gap-x-3 gap-y-1">
              {contactItems.length > 0 ? (
                contactItems.map((c, i) => (
                  <span key={i} className="inline-block">
                    {c} {i < contactItems.length - 1 && "•"}
                  </span>
                ))
              ) : (
                <span className="italic text-gray-500">[kontak dari draf awal]</span>
              )}
            </div>
          </div>

        {/* Ringkasan Profil / Summary */}
        {cleanCv.summary && (
          <div className="space-y-1">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-1 print:border-black print:text-black">
              {isEn ? "Summary" : "Ringkasan Profesional"}
            </h2>
            <p className="text-xs sm:text-sm leading-relaxed text-slate-800 pt-1 print:text-black">
              {renderWithPlaceholders(cleanCv.summary, "summary")}
            </p>
          </div>
        )}

        {/* Pendidikan / Education */}
        {cleanCv.education && (
          <div className="space-y-1">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-1 print:border-black print:text-black">
              {isEn ? "Education" : "Pendidikan"}
            </h2>
            <p className="text-xs sm:text-sm text-slate-800 pt-1 font-medium print:text-black">
              {renderWithPlaceholders(cleanCv.education, "education")}
            </p>
          </div>
        )}

        {/* Pengalaman / Experience */}
        {cleanCv.experiences && cleanCv.experiences.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-1 print:border-black print:text-black">
              {isEn ? "Experience" : "Pengalaman Organisasi & Proyek"}
            </h2>
            <div className="space-y-4 pt-1">
              {cleanCv.experiences.map((exp, expIdx) => (
                <div key={expIdx} className="space-y-1">
                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between text-xs sm:text-sm">
                    <span className="font-bold text-slate-900 print:text-black">
                      {renderWithPlaceholders(exp.title, `exp_${expIdx}_title`)}
                    </span>
                    <span className="text-xs text-slate-500 font-medium print:text-black">
                      {renderWithPlaceholders(exp.period, `exp_${expIdx}_period`)}
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-slate-700 print:text-black">
                    {renderWithPlaceholders(exp.organization, `exp_${expIdx}_org`)}
                  </div>
                ))}
              </div>
            </div>
          )}

        {/* Keahlian & Keterampilan / Skills */}
        {cleanCv.skills && cleanCv.skills.length > 0 && (
          <div className="space-y-1.5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-1 print:border-black print:text-black">
              {isEn ? "Skills" : "Keahlian & Kompetensi"}
            </h2>
            <p className="text-xs sm:text-sm text-slate-800 pt-1 leading-relaxed print:text-black">
              {cleanCv.skills.map((sk, idx) => (
                <span key={idx}>
                  {renderWithPlaceholders(sk, `skill_${idx}`)}
                  {idx < cleanCv.skills.length - 1 ? ", " : ""}
                </span>
              ))}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
