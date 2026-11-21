"use client";

import React, { useState, useMemo } from "react";
import {
  Sparkles,
  ArrowRight,
  ArrowDown,
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
      {/* Panel Istilah Kampus Terdeteksi: Neo-Brutalist Table */}
      {language === "en" && complianceList.length > 0 && (
        <div className="bg-white border-2 border-[#1D1D1B] shadow-[4px_4px_0px_#1D1D1B] p-4 sm:p-5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-[#1D1D1B] pb-2.5">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-[#1E40AF]" />
              <h4 className="font-mono text-xs sm:text-sm font-black text-[#1D1D1B] uppercase tracking-wider">
                ISTILAH KAMPUS TERDETEKSI ({complianceList.length})
              </h4>
            </div>
            <span className="font-mono text-[11px] text-[#1D1D1B]/70 font-bold uppercase">
              Dipadankan dengan Glosarium Kampus Indonesia → Inggris
            </span>
          </div>

          <div className="overflow-x-auto border-2 border-[#1D1D1B]">
            <table className="w-full text-left font-mono text-xs border-collapse">
              <thead>
                <tr className="bg-[#EFE84A] text-[#1D1D1B] border-b-2 border-[#1D1D1B] font-black uppercase">
                  <th className="py-2.5 px-3">ISTILAH DI CV</th>
                  <th className="py-2.5 px-3">PADANAN INGGRIS</th>
                  <th className="py-2.5 px-3">STATUS</th>
                  <th className="py-2.5 px-3">CATATAN / KONTEKS</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-[#1D1D1B] text-[#1D1D1B] bg-white">
                {complianceList.map((c, i) => (
                  <tr key={i} className="hover:bg-[#F4F1EA]">
                    <td className="py-2.5 px-3 font-black text-[#1D1D1B]">{c.hit.matched}</td>
                    <td className="py-2.5 px-3 font-bold text-[#1E40AF]">{c.hit.entry.en}</td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full font-mono text-[10px] font-black uppercase border border-[#1D1D1B] ${
                          c.status === "Dipakai"
                            ? "bg-[#2ED47A] text-[#1D1D1B] shadow-[1px_1px_0px_#1D1D1B]"
                            : "bg-[#F4F1EA] text-[#1D1D1B]/70"
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-[#1D1D1B]/80 font-sans text-xs">
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
                <div className="bg-[#F4F1EA] border-2 border-[#1D1D1B] shadow-[2px_2px_0px_#1D1D1B] p-3 text-xs text-[#1D1D1B] font-mono flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-[#F34E34] shrink-0" />
                  <span>
                    PERINGATAN // Kata <strong>&quot;{unjustifiedTitles.join(", ")}&quot;</strong> tidak ada di CV aslimu. Periksa agar tidak terkesan menaikkan jabatan.
                  </span>
                </div>
              )}

              {/* Split Comparison Neo-Brutalist */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch">
                {/* SEBELUM */}
                <div className="lg:col-span-5 bg-[#F4F1EA] border-2 border-[#1D1D1B] p-4 flex flex-col justify-between space-y-2">
                  <span className="font-mono text-xs font-black uppercase tracking-wider text-[#F34E34]">
                    SEBELUM (ASLI CV)
                  </span>
                  <p className="font-mono text-xs text-[#1D1D1B] leading-relaxed italic">
                    &quot;{item.before}&quot;
                  </p>
                  <span className="font-mono text-[10px] text-[#1D1D1B]/60 uppercase">
                    Narasi pasif / tanpa metrik
                  </span>
                </div>

                {/* Divider */}
                <div className="lg:col-span-2 flex items-center justify-center py-1 lg:py-0">
                  <div className="bg-[#1D1D1B] text-[#EFE84A] p-2 border-2 border-[#1D1D1B] shadow-[2px_2px_0px_#1D1D1B] font-black">
                    <ArrowDown className="h-4 w-4 lg:hidden" />
                    <ArrowRight className="h-4 w-4 hidden lg:block" />
                  </div>
                </div>

                {/* SESUDAH */}
                <div className="lg:col-span-5 bg-[#2ED47A]/15 border-2 border-[#1D1D1B] p-4 flex flex-col justify-between space-y-2">
                  <span className="font-mono text-xs font-black uppercase tracking-wider text-[#1E40AF]">
                    SESUDAH ({language === "en" ? "CV INGGRIS" : "REVISI"})
                  </span>
                  <div className="font-sans text-sm text-[#1D1D1B] font-medium leading-relaxed">
                    • {renderInteractiveText(item.after, contextId)}
                  </div>
                  <span className="font-mono text-[10px] text-[#1E40AF] font-bold uppercase">
                    Format Tindakan + Metode + Dampak
                  </span>
                </div>
              </div>

              {/* Footer Info */}
              <div className="space-y-2 pt-2 border-t-2 border-[#1D1D1B]">
                {item.keywordsAdded && item.keywordsAdded.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold uppercase text-[#1D1D1B] flex items-center gap-1">
                      <Tag className="h-3.5 w-3.5 text-[#1D1D1B]" />
                      KATA KUNCI JD:
                    </span>
                    {item.keywordsAdded.map((kw, kwIdx) => (
                      <span
                        key={kwIdx}
                        className="bg-[#2ED47A] text-[#1D1D1B] border-2 border-[#1D1D1B] font-mono text-xs font-bold px-2.5 py-0.5 rounded-full shadow-[1px_1px_0px_#1D1D1B]"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                )}

                {item.improvementReason && (
                  <div className="bg-[#F4F1EA] border border-[#1D1D1B] p-2.5 font-mono text-xs text-[#1D1D1B]">
                    <span className="font-bold uppercase text-[#1E40AF] mr-1.5">
                      ALASAN:
                    </span>
                    {item.improvementReason}
                  </div>
                )}

                {item.translationNote && (
                  <div className="bg-[#F4F1EA] border border-[#1D1D1B] p-2.5 font-mono text-xs text-[#1D1D1B]">
                    <span className="font-bold uppercase text-[#1E40AF] mr-1.5">
                      CATATAN TERJEMAHAN:
                    </span>
                    {item.translationNote}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
