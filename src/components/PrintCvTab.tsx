"use client";

import React from "react";
import { Printer, AlertTriangle, FileText } from "lucide-react";
import type { CleanCvSection } from "@/types/karierlens";
import { countPlaceholders, splitPlaceholders } from "@/lib/placeholders";

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
}

export const PrintCvTab: React.FC<PrintCvTabProps> = ({
  cleanCv,
  contacts,
  isLoading,
  error,
  onRetry,
  onActivateSimulation,
}) => {
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

  // Count total placeholders in cleanCv
  let totalPlaceholders = 0;
  totalPlaceholders += countPlaceholders(cleanCv.fullName);
  totalPlaceholders += countPlaceholders(cleanCv.headline);
  totalPlaceholders += countPlaceholders(cleanCv.summary);
  totalPlaceholders += countPlaceholders(cleanCv.education);
  for (const sk of cleanCv.skills || []) {
    totalPlaceholders += countPlaceholders(sk);
  }
  for (const exp of cleanCv.experiences || []) {
    totalPlaceholders += countPlaceholders(exp.title);
    totalPlaceholders += countPlaceholders(exp.organization);
    totalPlaceholders += countPlaceholders(exp.period);
    for (const b of exp.bullets || []) {
      totalPlaceholders += countPlaceholders(b);
    }
  }

  const renderWithPlaceholders = (text?: string) => {
    if (!text) return null;
    const parts = splitPlaceholders(text);
    return parts.map((p, idx) =>
      p.isPlaceholder ? (
        <span
          key={idx}
          className="bg-amber-100 text-amber-900 font-mono font-medium px-1 rounded border border-amber-200 print:bg-transparent print:text-black print:p-0 print:border-0 print:font-sans"
        >
          {p.text}
        </span>
      ) : (
        <span key={idx}>{p.text}</span>
      )
    );
  };

  const contactItems: string[] = [];
  if (contacts.emails.length > 0) contactItems.push(contacts.emails[0]);
  if (contacts.phones.length > 0) contactItems.push(contacts.phones[0]);
  if (contacts.links.length > 0) contactItems.push(contacts.links.slice(0, 2).join(" | "));

  return (
    <div className="space-y-6">
      {/* Action & Warning Bar */}
      <div className="no-print bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="p-2 rounded-xl bg-amber-100 text-amber-800">
            <AlertTriangle className="h-5 w-5" />
          </span>
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase">
              Peringatan Sebelum Mencetak
            </h4>
            <p className="text-xs text-slate-600">
              {totalPlaceholders > 0 ? (
                <>
                  Lengkapi <strong className="text-amber-700">{totalPlaceholders} placeholder</strong> dengan data riil kamu sebelum mengirim CV ini.
                </>
              ) : (
                "Seluruh bagian sudah lengkap dan siap dicetak atau disimpan ke PDF."
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

      {/* Dokumen CV 1 Kolom Format Harvard/ATS */}
      <div
        id="print-area"
        className="bg-white border border-slate-200 rounded-2xl p-8 sm:p-12 shadow-sm font-sans text-slate-900 text-sm max-w-4xl mx-auto space-y-6"
      >
        {/* Header Nama & Kontak */}
        <div className="text-center border-b border-slate-300 pb-5 space-y-1.5">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 uppercase">
            {renderWithPlaceholders(cleanCv.fullName)}
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-slate-700">
            {renderWithPlaceholders(cleanCv.headline)}
          </p>

          {/* Kontak dari ekstraksi lokal di browser */}
          <div className="text-xs text-slate-600 pt-1 flex flex-wrap justify-center items-center gap-x-3 gap-y-1">
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
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-1">
              Ringkasan Profesional
            </h2>
            <p className="text-xs sm:text-sm leading-relaxed text-slate-800 pt-1">
              {renderWithPlaceholders(cleanCv.summary)}
            </p>
          </div>
        )}

        {/* Pendidikan */}
        {cleanCv.education && (
          <div className="space-y-1">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-1">
              Pendidikan
            </h2>
            <p className="text-xs sm:text-sm text-slate-800 pt-1 font-medium">
              {renderWithPlaceholders(cleanCv.education)}
            </p>
          </div>
        )}

        {/* Pengalaman */}
        {cleanCv.experiences && cleanCv.experiences.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-1">
              Pengalaman Organisasi & Proyek
            </h2>
            <div className="space-y-4 pt-1">
              {cleanCv.experiences.map((exp, expIdx) => (
                <div key={expIdx} className="space-y-1">
                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between text-xs sm:text-sm">
                    <span className="font-bold text-slate-900">
                      {renderWithPlaceholders(exp.title)}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      {renderWithPlaceholders(exp.period)}
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-slate-700">
                    {renderWithPlaceholders(exp.organization)}
                  </div>
                  <ul className="list-disc list-outside pl-4 space-y-1 pt-1 text-xs sm:text-sm text-slate-800">
                    {(exp.bullets || []).map((bullet, bIdx) => (
                      <li key={bIdx} className="leading-relaxed">
                        {renderWithPlaceholders(bullet)}
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
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-1">
              Keahlian & Kompetensi
            </h2>
            <p className="text-xs sm:text-sm text-slate-800 pt-1 leading-relaxed">
              {cleanCv.skills.map((sk, idx) => (
                <span key={idx}>
                  {renderWithPlaceholders(sk)}
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
