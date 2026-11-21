"use client";

import React from "react";
import { Printer, AlertTriangle, CheckCircle2, RotateCcw } from "lucide-react";
import type { CleanCvSection } from "@/types/karierlens";
import {
  countPlaceholders,
  countUnfilledPlaceholders,
  splitPlaceholders,
} from "@/lib/placeholders";

interface PrintCvTabProps {
  cleanCv?: CleanCvSection;
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
  contacts,
  isLoading,
  error,
  onRetry,
  onActivateSimulation,
  placeholderValues = {},
  onPlaceholderChange,
}) => {
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
        const hint = p.hint || p.text;
        phIdx++;

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
      {/* Action & Warning Bar on Screen */}
      <div className="no-print bg-white border-2 border-[#1D1D1B] shadow-[4px_4px_0px_#1D1D1B] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
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

      {/* Preview Frame with Hard Border on Screen */}
      <div className="border-2 border-[#1D1D1B] shadow-[6px_6px_0px_#1D1D1B] bg-white p-6 sm:p-12 max-w-4xl mx-auto print:border-none print:shadow-none print:p-0 print:m-0 print:bg-white">
        {/* Dokumen CV 1 Kolom Standar Harvard / ATS */}
        <div
          id="print-area"
          className="space-y-6 font-sans text-black text-sm"
        >
          {/* Header Nama & Kontak */}
          <div className="text-center border-b border-black pb-4 space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-black uppercase">
              {renderWithPlaceholders(cleanCv.fullName, "cv_name")}
            </h1>
            <p className="text-xs sm:text-sm font-semibold text-black">
              {renderWithPlaceholders(cleanCv.headline, "cv_headline")}
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

          {/* Ringkasan Profil */}
          {cleanCv.summary && (
            <div className="space-y-1">
              <h2 className="text-xs font-bold uppercase tracking-wider text-black border-b border-black pb-1">
                Ringkasan Profesional
              </h2>
              <p className="text-xs sm:text-sm leading-relaxed text-black pt-1">
                {renderWithPlaceholders(cleanCv.summary, "cv_summary")}
              </p>
            </div>
          )}

          {/* Pendidikan */}
          {cleanCv.education && (
            <div className="space-y-1">
              <h2 className="text-xs font-bold uppercase tracking-wider text-black border-b border-black pb-1">
                Pendidikan
              </h2>
              <p className="text-xs sm:text-sm text-black pt-1 font-medium">
                {renderWithPlaceholders(cleanCv.education, "cv_education")}
              </p>
            </div>
          )}

          {/* Pengalaman Organisasi & Proyek */}
          {cleanCv.experiences && cleanCv.experiences.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-black border-b border-black pb-1">
                Pengalaman Organisasi & Proyek
              </h2>
              <div className="space-y-4 pt-1">
                {cleanCv.experiences.map((exp, expIdx) => (
                  <div key={expIdx} className="space-y-1">
                    <div className="flex flex-col sm:flex-row sm:items-baseline justify-between text-xs sm:text-sm">
                      <span className="font-bold text-black">
                        {renderWithPlaceholders(exp.title, `cv_exp_${expIdx}_title`)}
                      </span>
                      <span className="font-mono text-xs text-black/80 font-semibold">
                        {renderWithPlaceholders(exp.period, `cv_exp_${expIdx}_period`)}
                      </span>
                    </div>

                    <div className="text-xs font-semibold text-black/90">
                      {renderWithPlaceholders(exp.organization, `cv_exp_${expIdx}_org`)}
                    </div>

                    {exp.bullets && exp.bullets.length > 0 && (
                      <ul className="list-disc list-outside ml-5 text-xs sm:text-sm space-y-1 pt-1 text-black">
                        {exp.bullets.map((bullet, bulletIdx) => (
                          <li key={bulletIdx} className="leading-relaxed">
                            {renderWithPlaceholders(
                              bullet,
                              `cv_exp_${expIdx}_b_${bulletIdx}`
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Kemampuan (Skills) */}
          {cleanCv.skills && cleanCv.skills.length > 0 && (
            <div className="space-y-1">
              <h2 className="text-xs font-bold uppercase tracking-wider text-black border-b border-black pb-1">
                Kemampuan Teknis & Non-Teknis
              </h2>
              <p className="text-xs sm:text-sm leading-relaxed text-black pt-1">
                {cleanCv.skills.map((skill, sIdx) => (
                  <span key={sIdx}>
                    {renderWithPlaceholders(skill, `cv_skill_${sIdx}`)}
                    {sIdx < cleanCv.skills.length - 1 && " • "}
                  </span>
                ))}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
