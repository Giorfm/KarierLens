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
      <div className="bg-white rounded-2xl border border-rose-200 p-8 text-center space-y-4 shadow-xs">
        <h3 className="font-bold text-slate-900 text-base">Gagal Memformat CV Bersih</h3>
        <p className="text-sm text-slate-600">{error}</p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={onRetry}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold"
          >
            Coba Lagi
          </button>
          <button
            type="button"
            onClick={onActivateSimulation}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
          >
            Tampilkan Hasil Simulasi
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-slate-100 rounded mx-auto"></div>
        <div className="h-4 w-64 bg-slate-100 rounded mx-auto"></div>
        <div className="h-20 bg-slate-100 rounded"></div>
        <div className="h-32 bg-slate-100 rounded"></div>
      </div>
    );
  }

  if (!cleanCv) {
    return (
      <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-12 text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
          <FileText className="h-6 w-6" />
        </div>
        <h3 className="font-semibold text-slate-800 text-sm">Belum Ada Draf CV Bersih</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
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
        const hint = p.hint || (isEn ? "fill" : "isi");

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
                  className="font-bold text-slate-900 bg-emerald-100/70 hover:bg-emerald-200 border border-emerald-300 px-1.5 py-0.5 rounded cursor-pointer transition"
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
                  className="bg-amber-100 text-amber-950 font-semibold border-2 border-dashed border-amber-400 px-1.5 py-0.5 rounded text-xs outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white"
                  style={{
                    width: `${Math.max(filledVal.length, hint.length, 3) + 2}ch`,
                    minWidth: "60px",
                  }}
                />
              )}
            </span>

            {/* Print View: 100% Clean plain text (no borders, no backgrounds) */}
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
            className={`p-2 rounded-xl ${
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
            <h4 className="text-xs font-bold text-slate-900 uppercase">
              {unfilledCount === 0 && totalPlaceholders > 0
                ? "Dokumen CV Siap Dicetak"
                : "Peringatan Sebelum Mencetak"}
            </h4>
            <p className="text-xs text-slate-600">
              {unfilledCount > 0 ? (
                <>
                  Tersisa <strong className="text-amber-700">{unfilledCount} placeholder</strong>. Angka yang kamu isi di tab Penulisan Ulang otomatis masuk ke sini, atau kamu bisa mengisinya langsung pada kotak kuning di bawah.
                </>
              ) : (
                "Seluruh bagian sudah lengkap dengan data riil dan siap dicetak atau disimpan ke PDF."
              )}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer shrink-0"
        >
          <Printer className="h-4 w-4" />
          Cetak / Simpan PDF
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
