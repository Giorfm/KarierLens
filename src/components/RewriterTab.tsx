"use client";

import React, { useState, useMemo } from "react";
import {
  Sparkles,
  ArrowRight,
  Copy,
  Check,
  RotateCcw,
  Tag,
  AlertTriangle,
  CheckCircle2,
  BookOpen,
} from "lucide-react";
import type { RewriteResult, Lang } from "@/types/karierlens";
import {
  countPlaceholders,
  countUnfilledPlaceholders,
  splitPlaceholders,
  resolveTextPlaceholders,
} from "@/lib/placeholders";
import { detectGlossary, checkGlossaryCompliance } from "@/lib/glossary";
import { detectTitleInflation } from "@/lib/title-guard";

interface RewriterTabProps {
  rewriteData?: RewriteResult;
  language?: Lang;
  cvText?: string;
  isLoading: boolean;
  error?: string | null;
  onRetry: () => void;
  onActivateSimulation: () => void;
  placeholderValues?: Record<string, string>;
  onPlaceholderChange?: (key: string, value: string, originalPlaceholder: string) => void;
}

export const RewriterTab: React.FC<RewriterTabProps> = ({
  rewriteData,
  language = "id",
  cvText = "",
  isLoading,
  error,
  onRetry,
  onActivateSimulation,
  placeholderValues = {},
  onPlaceholderChange,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Copy helper with fallback
  const handleCopy = (id: string, text: string) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
      });
    } else {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  // Glossary detection & compliance check (Section 3.5.2 & 3.6)
  const glossaryHits = useMemo(() => {
    return detectGlossary(cvText);
  }, [cvText]);

  const allOutputText = useMemo(() => {
    if (!rewriteData) return "";
    const afters = (rewriteData.rewrites || []).map((r) => r.after).join(" ");
    const cleanHeadline = rewriteData.cleanCv?.headline || "";
    const cleanSummary = rewriteData.cleanCv?.summary || "";
    const skills = (rewriteData.cleanCv?.skills || []).join(" ");
    const expBullets = (rewriteData.cleanCv?.experiences || [])
      .flatMap((e) => e.bullets || [])
      .join(" ");
    return `${afters} ${cleanHeadline} ${cleanSummary} ${skills} ${expBullets}`;
  }, [rewriteData]);

  const complianceList = useMemo(() => {
    return checkGlossaryCompliance(glossaryHits, allOutputText);
  }, [glossaryHits, allOutputText]);

  // 1. Error state
  if (error) {
    return (
      <div className="bg-[#F34E34] text-white border-2 border-[#1D1D1B] shadow-[4px_4px_0px_#1D1D1B] p-8 text-center space-y-4">
        <h3 className="font-mono text-base font-black uppercase tracking-wider">
          [!] GAGAL MENULIS ULANG
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

  // 2. Loading Skeleton state
  if (isLoading) {
    return (
      <div className="bg-white border-2 border-[#1D1D1B] shadow-[4px_4px_0px_#1D1D1B] p-8 space-y-6 animate-pulse">
        <div className="h-14 bg-[#F4F1EA] border-2 border-[#1D1D1B]"></div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="border-2 border-[#1D1D1B] p-6 space-y-4">
            <div className="h-6 w-1/3 bg-[#F4F1EA]"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="h-28 bg-[#F4F1EA] border border-[#1D1D1B]"></div>
              <div className="h-28 bg-[#F4F1EA] border border-[#1D1D1B]"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // 3. Empty state
  if (!rewriteData || !rewriteData.rewrites || rewriteData.rewrites.length === 0) {
    return (
      <div className="bg-white border-2 border-[#1D1D1B] shadow-[4px_4px_0px_#1D1D1B] p-8 sm:p-12 text-center space-y-6">
        <div className="inline-flex items-center justify-center p-4 bg-[#EFE84A] border-2 border-[#1D1D1B] shadow-[3px_3px_0px_#1D1D1B]">
          <Sparkles className="h-8 w-8 text-[#1D1D1B]" />
        </div>

        <div className="max-w-md mx-auto space-y-2">
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#1E40AF]">
            TASK 02 // REVISI PENGALAMAN
          </span>
          <h3 className="font-black text-2xl text-[#1D1D1B] tracking-tight">
            Revisi Pengalaman Kampus
          </h3>
          <p className="text-sm text-[#1D1D1B]/80 leading-relaxed font-sans">
            Ubah pengalaman pasif menjadi poin terukur dengan formula Tindakan + Metode + Dampak.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={onActivateSimulation}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#EFE84A] text-[#1D1D1B] font-mono text-xs font-bold uppercase border-2 border-[#1D1D1B] shadow-[3px_3px_0px_#1D1D1B] hover:translate-x-[1px] hover:translate-y-[1px] active:shadow-none transition-all cursor-pointer"
          >
            <Sparkles className="h-4 w-4" />
            <span>LIHAT CONTOH REVISI</span>
          </button>
        </div>
      </div>
    );
  }

  // 4. Hitung total dan unfilled placeholders
  let totalPlaceholders = 0;
  let unfilledPlaceholders = 0;

  rewriteData.rewrites.forEach((item, itemIdx) => {
    totalPlaceholders += countPlaceholders(item.after);
    unfilledPlaceholders += countUnfilledPlaceholders(
      item.after,
      placeholderValues,
      `rw_${item.id || itemIdx}`
    );
  });

  const renderInteractiveText = (text: string, contextId: string) => {
    const parts = splitPlaceholders(text);
    let phIdx = 0;

    return parts.map((part, idx) => {
      if (part.isPlaceholder) {
        const specificKey = `${contextId}_${phIdx}`;
        const currentVal =
          placeholderValues[specificKey] !== undefined
            ? placeholderValues[specificKey]
            : placeholderValues[part.text] || "";

        const hint = part.hint || part.text;
        phIdx++;

        return (
          <span key={idx} className="inline-flex items-baseline mx-1 align-baseline">
            <input
              type="text"
              value={currentVal}
              onChange={(e) => {
                if (onPlaceholderChange) {
                  onPlaceholderChange(specificKey, e.target.value, part.text);
                }
              }}
              placeholder={hint}
              title={`Isi data nyata: ${part.text}`}
              className="bg-[#EFE84A] text-[#1D1D1B] font-mono font-bold text-xs px-2 py-0.5 border-2 border-[#1D1D1B] shadow-[2px_2px_0px_#1D1D1B] placeholder:text-[#1D1D1B]/60 focus:bg-white focus:outline-none focus:ring-0 transition"
              style={{
                width: `${Math.max(currentVal.length, hint.length, 4) + 3}ch`,
                minWidth: "70px",
              }}
            />
          </span>
        );
      }
      return <span key={idx}>{part.text}</span>;
    });
  };

  return (
    <div className="space-y-6">
      {/* Panel Istilah Kampus Terdeteksi (Mode English - Spesifikasi 3.5.2 & 3.6) */}
      {language === "en" && complianceList.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-indigo-600" />
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Istilah Kampus Terdeteksi ({complianceList.length})
              </h4>
            </div>
            <span className="text-[11px] text-slate-500">
              Dipadankan dengan Glosarium Kampus Indonesia → Inggris
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50/70">
                  <th className="py-2 px-3">Istilah di CV</th>
                  <th className="py-2 px-3">Padanan Inggris</th>
                  <th className="py-2 px-3">Status Kepatuhan</th>
                  <th className="py-2 px-3">Catatan / Konteks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {complianceList.map((c, i) => (
                  <tr key={i} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{c.hit.matched}</td>
                    <td className="py-2.5 px-3 font-medium text-indigo-700">{c.hit.entry.en}</td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          c.status === "Dipakai"
                            ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                            : "bg-slate-100 text-slate-600 border-slate-200"
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-500 italic">
                      {c.hit.entry.note || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 1. Top Counter Banner */}
      <div className="bg-[#EFE84A] text-[#1D1D1B] border-2 border-[#1D1D1B] shadow-[4px_4px_0px_#1D1D1B] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="p-1.5 bg-[#1D1D1B] text-[#EFE84A] border border-[#1D1D1B]">
            {unfilledPlaceholders > 0 ? (
              <AlertTriangle className="h-5 w-5" />
            ) : (
              <CheckCircle2 className="h-5 w-5" />
            )}
          </span>
          <div>
            <span className="font-mono text-xs font-black uppercase tracking-wider block">
              STATUS PLACEHOLDER //
            </span>
            <p className="font-mono text-xs sm:text-sm font-bold">
              {unfilledPlaceholders > 0 ? (
                <>
                  <span className="underline decoration-2">{unfilledPlaceholders} DARI {totalPlaceholders}</span> PERLU DATA NYATA: Ketik langsung angka/data riil pada kotak kuning di bawah, dan nilainya otomatis berubah di CV Cetak!
                </>
              ) : (
                <>
                  SEMUA PLACEHOLDER TELAH TERISI ({totalPlaceholders})
                </>
              )}
            </p>
          </div>
        </div>

        <span className="font-mono text-xs font-bold text-[#1D1D1B]/70 sm:text-right">
          Ketik langsung di kotak kuning.
        </span>
      </div>

      {/* 2. Transformation Cards */}
      <div className="space-y-6">
        {rewriteData.rewrites.map((item, index) => {
          const contextId = `rw_${item.id || index}`;
          const resolvedSentence = resolveTextPlaceholders(
            item.after,
            placeholderValues,
            contextId
          );
          const isCopied = copiedId === (item.id || String(index));

          // Penjaga Kenaikan Jabatan (Spesifikasi 3.5.1)
          const unjustifiedTitles = detectTitleInflation(
            cvText,
            `${item.after} ${item.roleContext}`
          );

          return (
            <div
              key={item.id || index}
              className="bg-white border-2 border-[#1D1D1B] shadow-[4px_4px_0px_#1D1D1B] p-5 sm:p-6 space-y-4"
            >
              {/* Header Strip */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-[#1D1D1B] pb-3">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <span className="bg-[#1E40AF] text-[#F4F1EA] font-mono text-xs font-bold px-3 py-1 rounded-full border-2 border-[#1D1D1B] shadow-[2px_2px_0px_#1D1D1B] uppercase">
                    {item.category}
                  </span>
                  <span className="font-black text-sm sm:text-base text-[#1D1D1B]">
                    {item.roleContext}
                  </span>
                </div>

                {/* Tactile Copy Button */}
                <button
                  type="button"
                  onClick={() => handleCopy(item.id || String(index), resolvedSentence)}
                  className="bg-white hover:bg-[#EFE84A] text-[#1D1D1B] font-mono text-xs font-bold uppercase px-3.5 py-1.5 border-2 border-[#1D1D1B] shadow-[2px_2px_0px_#1D1D1B] hover:translate-x-[1px] hover:translate-y-[1px] active:shadow-none transition-all duration-100 flex items-center gap-1.5 cursor-pointer ml-auto"
                >
                  {isCopied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-[#2ED47A] stroke-[3]" />
                      <span>TERSALIN!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>SALIN</span>
                    </>
                  )}
                </button>
              </div>

              {/* Peringatan Penjaga Kenaikan Jabatan jika terdeteksi (3.5.1) */}
              {unjustifiedTitles.length > 0 && (
                <div className="bg-amber-50 border-b border-amber-200 px-5 py-2.5 text-xs text-amber-900 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                  <span>
                    Kata <strong>&quot;{unjustifiedTitles.join(", ")}&quot;</strong> tidak ada di CV aslimu. Periksa agar tidak terkesan menaikkan jabatan.
                  </span>
                </div>
              )}

              {/* Komparasi Sebelum & Sesudah */}
              <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Sebelum: Disalin apa adanya dari bahasa asli CV */}
                <div className="bg-rose-50/40 border border-rose-100 rounded-xl p-4 flex flex-col justify-between relative">
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider block">
                      Kalimat Asli di CV (Pasif / Kurang Terukur)
                    </span>
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic">
                      &quot;{item.before}&quot;
                    </p>
                  </div>
                  <div className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-6 h-6 rounded-full bg-white border border-slate-300 items-center justify-center text-slate-400 shadow-xs">
                    <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </div>

                {/* Sesudah dengan Interactive Inline Inputs */}
                <div className="bg-indigo-50/40 border border-indigo-100 rounded-xl p-4 flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-indigo-800 uppercase tracking-wider flex items-center gap-1">
                        <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
                        Rekomendasi Revisi {language === "en" ? "(CV Inggris)" : "(Bisa Diedit Langsung)"}
                      </span>
                    </div>

                    <div className="text-xs sm:text-sm text-slate-900 font-medium leading-relaxed">
                      {renderInteractiveText(item.after, item.id)}
                    </div>
                  </div>

                  {/* Kata Kunci yang Ditambahkan, Alasan, dan Catatan Terjemahan */}
                  <div className="pt-2 border-t border-indigo-100/70 space-y-1.5">
                    {item.keywordsAdded && item.keywordsAdded.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] font-semibold text-slate-500 uppercase flex items-center gap-1">
                          <Tag className="h-3 w-3" />
                          Kata Kunci JD:
                        </span>
                        {item.keywordsAdded.map((kw, kwIdx) => (
                          <span
                            key={kwIdx}
                            className="text-[11px] font-medium bg-indigo-100/80 text-indigo-800 px-2 py-0.5 rounded"
                          >
                            {kw}
                          </span>
                        ))}
                      </div>
                    )}
                    <p className="text-[11px] text-slate-600 leading-normal">
                      <strong className="text-slate-800">Kenapa lebih baik:</strong> {item.improvementReason}
                    </p>

                    {item.translationNote && (
                      <p className="text-[11px] text-slate-600 leading-normal bg-indigo-50/50 p-2 rounded-lg border border-indigo-100/60">
                        <strong className="text-indigo-900">Catatan terjemahan:</strong> {item.translationNote}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
