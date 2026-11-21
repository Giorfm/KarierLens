"use client";

import React from "react";
import { Printer, AlertTriangle, FileText, CheckCircle2 } from "lucide-react";
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
      <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-rose-200 p-8 text-center space-y-4 shadow-[0_8px_30px_rgb(15,23,42,0.04)]">
        <h3 className="font-bold text-slate-900 text-base">Gagal Memformat CV Bersih</h3>
        <p className="text-sm text-slate-600">{error}</p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={onRetry}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-xs font-semibold cursor-pointer shadow-xs transition"
          >
            Coba Lagi
          </button>
          <button
            type="button"
            onClick={onActivateSimulation}
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full text-xs font-semibold cursor-pointer transition"
          >
            Tampilkan Hasil Simulasi
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-white/90 p-8 space-y-6 animate-pulse shadow-[0_8px_30px_rgb(15,23,42,0.04)]">
        <div className="h-8 w-48 bg-slate-100 rounded-md mx-auto"></div>
        <div className="h-4 w-64 bg-slate-100 rounded-md mx-auto"></div>
        <div className="h-24 bg-slate-100 rounded-xl"></div>
        <div className="h-36 bg-slate-100 rounded-xl"></div>
      </div>
    );
  }

  if (!cleanCv) {
    return (
      <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-dashed border-slate-300 p-12 text-center space-y-3 shadow-[0_8px_30px_rgb(15,23,42,0.04)]">
        <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-2xs">
          <FileText className="h-6 w-6" />
        </div>
        <h3 className="font-semibold text-slate-900 text-sm">Belum Ada Draf CV Bersih</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
          CV terstruktur 1 kolom standar Harvard/ATS akan dibuat secara otomatis begitu task penulisan ulang selesai.
        </p>
      </div>
    );
  }

  // Count remaining unfilled placeholders in cleanCv
  let totalPlaceholders = 0;
  let unfilledCount = 0;

  const countSection = (text?: string, contextKey?: string) => {
    if (!text) return;
    totalPlaceholders += countPlaceholders(text);
    unfilledCount += countUnfilledPlaceholders(text, placeholderValues, contextKey);
  };

  countSection(cleanCv.fullName, "name");
  countSection(cleanCv.headline, "headline");
  countSection(cleanCv.summary, "summary");
  countSection(cleanCv.education, "education");
  cleanCv.skills?.forEach((sk, i) => countSection(sk, `skill_${i}`));
  cleanCv.experiences?.forEach((exp, expIdx) => {
    countSection(exp.title, `exp_${expIdx}_title`);
    countSection(exp.organization, `exp_${expIdx}_org`);
    countSection(exp.period, `exp_${expIdx}_period`);
    exp.bullets?.forEach((b, bIdx) => countSection(b, `exp_${expIdx}_b_${bIdx}`));
  });

  const renderWithPlaceholders = (text?: string, contextKey?: string) => {
    if (!text) return null;
    const parts = splitPlaceholders(text);

    return parts.map((p, idx) => {
      if (p.isPlaceholder) {
        const specificKey = contextKey ? `${contextKey}_${p.placeholderIndex ?? 0}` : "";
        const filledVal =
          (specificKey && placeholderValues[specificKey]) ||
          placeholderValues[p.text] ||
          "";
        const isFilled = filledVal.trim().length > 0;
        const hint = p.hint || "isi";

        return (
          <span key={idx} className="inline-block">
            {/* Screen View: Interactive or styled span */}
            <span className="no-print">
              {isFilled ? (
                <span
                  title="Klik untuk mengubah nilai"
                  onClick={() => {
                    const newVal = prompt(`Ubah nilai untuk ${p.text}:`, filledVal);
                    if (newVal !== null && onPlaceholderChange) {
                      onPlaceholderChange(specificKey || p.text, newVal, p.text);
                    }
                  }}
                  className="font-bold text-slate-900 bg-emerald-100/80 hover:bg-emerald-200 border border-emerald-300 px-1.5 py-0.5 rounded cursor-pointer transition shadow-2xs"
                >
                  {filledVal}
                </span>
              ) : (
                <input
                  type="text"
                  value={filledVal}
                  onChange={(e) => {
                    if (onPlaceholderChange) {
                      onPlaceholderChange(specificKey || p.text, e.target.value, p.text);
                    }
                  }}
                  placeholder={hint}
                  title={`Ketik langsung data riil untuk: ${p.text}`}
                  className="bg-amber-100 text-amber-950 font-semibold border-2 border-dashed border-amber-400 px-1.5 py-0.5 rounded text-xs outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white"
                  style={{
                    width: `${Math.max(filledVal.length, hint.length, 3) + 2}ch`,
                    minWidth: "60px",
                  }}
                />
              )}
            </span>

            {/* Print View: 100% Clean plain text (no borders, no backgrounds, strict print safe) */}
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
      {/* Action & Warning Bar */}
      <div className="no-print bg-white/80 backdrop-blur-md p-4 sm:p-5 rounded-3xl border border-white/90 shadow-[0_8px_30px_rgb(15,23,42,0.04)] flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all">
        <div className="flex items-center gap-3.5">
          <span
            className={`p-2.5 rounded-2xl shadow-2xs ${
              unfilledCount === 0 && totalPlaceholders > 0
                ? "bg-emerald-100 text-emerald-800"
                : "bg-amber-100 text-amber-800"
            }`}
          >
            {unfilledCount === 0 && totalPlaceholders > 0 ? (
              <CheckCircle2 className="h-5 w-5" />
            ) : (
              <AlertTriangle className="h-5 w-5" />
            )}
          </span>
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              {unfilledCount === 0 && totalPlaceholders > 0
                ? "Dokumen CV Siap Dicetak"
                : "Peringatan Sebelum Mencetak"}
            </h4>
            <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
              {unfilledCount > 0 ? (
                <>
                  Tersisa <strong className="text-amber-800 font-semibold">{unfilledCount} placeholder</strong>. Data yang kamu ketik di tab Penulisan Ulang otomatis masuk ke sini, atau kamu bisa melengkapinya langsung pada kotak kuning di bawah.
                </>
              ) : (
                "Seluruh bagian sudah lengkap dengan data riil dan siap dicetak atau disimpan ke file PDF."
              )}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-full text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer shrink-0"
        >
          <Printer className="h-4 w-4" />
          Cetak / Simpan PDF
        </button>
      </div>

      {/* Dokumen CV 1 Kolom Format Harvard/ATS (STRICT PRINT SAFETY) */}
      <div
        id="print-area"
        className="bg-white border border-slate-200/90 rounded-3xl p-8 sm:p-12 shadow-[0_8px_30px_rgb(15,23,42,0.04)] font-sans text-slate-900 text-sm max-w-4xl mx-auto space-y-6 print:border-none print:shadow-none print:p-0 print:m-0 print:rounded-none print:bg-white"
      >
        {/* Header Nama & Kontak */}
        <div className="text-center border-b border-slate-300 pb-5 space-y-1.5 print:border-black">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 uppercase print:text-black">
            {renderWithPlaceholders(cleanCv.fullName, "name")}
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-slate-700 print:text-black">
            {renderWithPlaceholders(cleanCv.headline, "headline")}
          </p>

          {/* Kontak dari ekstraksi lokal di browser */}
          <div className="text-xs text-slate-600 pt-1 flex flex-wrap justify-center items-center gap-x-3 gap-y-1 print:text-black">
            {contactItems.length > 0 ? (
              contactItems.map((c, i) => (
                <span key={i} className="inline-block">
                  {c} {i < contactItems.length - 1 && "•"}
                </span>
              ))
            ) : (
              <span className="italic text-slate-400">[kontak dari draf awal]</span>
            )}
          </div>
        </div>

        {/* Ringkasan Profil */}
        {cleanCv.summary && (
          <div className="space-y-1">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-1 print:border-black print:text-black">
              Ringkasan Profesional
            </h2>
            <p className="text-xs sm:text-sm leading-relaxed text-slate-800 pt-1 print:text-black">
              {renderWithPlaceholders(cleanCv.summary, "summary")}
            </p>
          </div>
        )}

        {/* Pendidikan */}
        {cleanCv.education && (
          <div className="space-y-1">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-1 print:border-black print:text-black">
              Pendidikan
            </h2>
            <p className="text-xs sm:text-sm text-slate-800 pt-1 font-medium print:text-black">
              {renderWithPlaceholders(cleanCv.education, "education")}
            </p>
          </div>
        )}

        {/* Pengalaman */}
        {cleanCv.experiences && cleanCv.experiences.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-1 print:border-black print:text-black">
              Pengalaman Organisasi & Proyek
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
                  <ul className="list-disc list-outside pl-4 space-y-1 pt-1 text-xs sm:text-sm text-slate-800 print:text-black">
                    {(exp.bullets || []).map((bullet, bIdx) => (
                      <li key={bIdx} className="leading-relaxed">
                        {renderWithPlaceholders(bullet, `exp_${expIdx}_b_${bIdx}`)}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Keahlian & Keterampilan */}
        {cleanCv.skills && cleanCv.skills.length > 0 && (
          <div className="space-y-1.5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-1 print:border-black print:text-black">
              Keahlian & Kompetensi
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
