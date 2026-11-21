"use client";

import React from "react";
import {
  RotateCcw,
  Sparkles,
  Target,
  Info,
  Check,
  X,
} from "lucide-react";
import type { ScoreResult, ComputedScores } from "@/types/karierlens";

interface AtsScoreTabProps {
  scoreData?: ScoreResult;
  computedScores: ComputedScores;
  isLoading: boolean;
  isRewriteLoading: boolean;
  error?: string | null;
  onRetry: () => void;
  onActivateSimulation: () => void;
}

export const AtsScoreTab: React.FC<AtsScoreTabProps> = ({
  scoreData,
  computedScores,
  isLoading,
  isRewriteLoading,
  error,
  onRetry,
  onActivateSimulation,
}) => {
  // 1. Error state
  if (error) {
    return (
      <div className="bg-[#F34E34] text-white border-2 border-[#1D1D1B] shadow-[4px_4px_0px_#1D1D1B] p-8 text-center space-y-4">
        <h3 className="font-mono text-base font-black uppercase tracking-wider">
          [!] GAGAL MEMUAT SKOR
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-40 bg-[#F4F1EA] border-2 border-[#1D1D1B]"></div>
          <div className="h-40 bg-[#F4F1EA] border-2 border-[#1D1D1B]"></div>
        </div>
        <div className="h-32 bg-[#F4F1EA] border-2 border-[#1D1D1B]"></div>
        <div className="space-y-3">
          <div className="h-6 w-48 bg-[#F4F1EA] border-2 border-[#1D1D1B]"></div>
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-8 w-28 bg-[#F4F1EA] rounded-full border-2 border-[#1D1D1B]"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 3. Empty state
  if (!scoreData) {
    return (
      <div className="bg-white border-2 border-[#1D1D1B] shadow-[4px_4px_0px_#1D1D1B] p-8 sm:p-12 text-center space-y-6">
        <div className="inline-flex items-center justify-center p-4 bg-[#EFE84A] border-2 border-[#1D1D1B] shadow-[3px_3px_0px_#1D1D1B]">
          <Target className="h-8 w-8 text-[#1D1D1B]" />
        </div>

        <div className="max-w-md mx-auto space-y-2">
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#1E40AF]">
            TASK 01 // AUDIT SKOR
          </span>
          <h3 className="font-black text-2xl text-[#1D1D1B] tracking-tight">
            Audit Relevansi CV
          </h3>
          <p className="text-sm text-[#1D1D1B]/80 leading-relaxed font-sans">
            Evaluasi kecocokan pengalaman CV terhadap kualifikasi lowongan target.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={onActivateSimulation}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#EFE84A] text-[#1D1D1B] font-mono text-xs font-bold uppercase border-2 border-[#1D1D1B] shadow-[3px_3px_0px_#1D1D1B] hover:translate-x-[1px] hover:translate-y-[1px] active:shadow-none transition-all cursor-pointer"
          >
            <Sparkles className="h-4 w-4" />
            <span>LIHAT CONTOH SIMULASI</span>
          </button>
        </div>
      </div>
    );
  }

  // 4. Content Display
  const { initial, projected, status, matched, missing, newlyCovered } = computedScores;

  let statusBadgeColor = "bg-[#F34E34] text-white";
  if (status === "Cukup Kompetitif") {
    statusBadgeColor = "bg-[#EFE84A] text-[#1D1D1B]";
  } else if (status === "Sangat Siap") {
    statusBadgeColor = "bg-[#2ED47A] text-[#1D1D1B]";
  }

  const keywordMap = new Map<string, 1 | 2 | 3>();
  scoreData.jdKeywords.forEach((kw) => {
    keywordMap.set(kw.keyword.toLowerCase().trim(), kw.importance);
  });

  return (
    <div className="space-y-6">
      {/* 1. Score Comparison Blocks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Skor Saat Ini (initial) */}
        <div className="bg-white border-2 border-[#1D1D1B] shadow-[4px_4px_0px_#1D1D1B] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-black uppercase tracking-wider text-[#1D1D1B]">
              SKOR SAAT INI //
            </span>
            <span
              className={`font-mono text-xs font-bold uppercase px-3 py-1 rounded-full border-2 border-[#1D1D1B] shadow-[2px_2px_0px_#1D1D1B] ${statusBadgeColor}`}
            >
              {status}
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-6xl font-black font-mono tracking-tight text-[#1D1D1B]">
              {initial}
            </span>
            <span className="font-mono text-xl font-bold text-[#1D1D1B]/50">/ 100</span>
          </div>

          <p className="font-sans text-xs sm:text-sm text-[#1D1D1B]/80 leading-relaxed">
            Dihitung dari <strong className="text-[#1D1D1B] font-bold">{matched.length} kata kunci</strong> terdeteksi di CV.
          </p>
        </div>

        {/* Potensi Skor (projected) */}
        {isRewriteLoading ? (
          <div className="bg-[#EFE84A]/30 border-2 border-[#1D1D1B] shadow-[4px_4px_0px_#1D1D1B] p-6 space-y-4 animate-pulse">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-black uppercase tracking-wider text-[#1D1D1B]">
                POTENSI SKOR //
              </span>
              <span className="font-mono text-xs font-bold uppercase px-2.5 py-0.5 rounded-full border border-[#1D1D1B] bg-white text-[#1D1D1B]">
                MENGHITUNG...
              </span>
            </div>
            <div className="h-14 bg-white/60 border border-[#1D1D1B]"></div>
            <p className="font-mono text-xs text-[#1D1D1B]/70">
              Menghitung potensi skor revisi...
            </p>
          </div>
        ) : projected !== null ? (
          <div className="bg-[#2ED47A]/20 border-2 border-[#1D1D1B] shadow-[4px_4px_0px_#1D1D1B] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-black uppercase tracking-wider text-[#1D1D1B]">
                POTENSI SKOR //
              </span>
              {projected > initial && (
                <span className="font-mono text-xs font-bold uppercase px-3 py-1 rounded-full border-2 border-[#1D1D1B] bg-[#2ED47A] text-[#1D1D1B] shadow-[2px_2px_0px_#1D1D1B]">
                  +{projected - initial} POIN
                </span>
              )}
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-6xl font-black font-mono tracking-tight text-[#1D1D1B]">
                {projected}
              </span>
              <span className="font-mono text-xl font-bold text-[#1D1D1B]/50">/ 100</span>
            </div>

            <p className="font-sans text-xs sm:text-sm text-[#1D1D1B]/80 leading-relaxed">
              Proyeksi nilai setelah revisi narasi diterapkan (maksimal 95).
            </p>
          </div>
        ) : (
          <div className="bg-[#F4F1EA] border-2 border-[#1D1D1B] shadow-[4px_4px_0px_#1D1D1B] p-6 space-y-4 flex flex-col justify-center">
            <span className="font-mono text-xs font-black uppercase tracking-wider text-[#1D1D1B]">
              POTENSI SKOR //
            </span>
            <p className="font-sans text-xs text-[#1D1D1B]/70">
              Buka tab Revisi Pengalaman untuk melihat potensi skor.
            </p>
          </div>
        )}
      </div>

      {/* 2. Executive Verdict */}
      <div className="border-l-8 border-[#1E40AF] bg-white border-2 border-[#1D1D1B] shadow-[4px_4px_0px_#1D1D1B] p-5 sm:p-6 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="font-mono text-xs font-black uppercase tracking-wider text-[#1E40AF]">
            CATATAN REKRUTER //
          </span>
          <span className="bg-[#1E40AF] text-[#F4F1EA] font-mono text-xs font-bold px-2.5 py-1 border border-[#1D1D1B] uppercase">
            TARGET: {scoreData.targetRole}
          </span>
        </div>

        <p className="text-sm sm:text-base font-medium text-[#1D1D1B] leading-relaxed font-sans">
          {scoreData.executiveVerdict}
        </p>
      </div>

      {/* 3. Dua Bagian Kata Kunci */}
      <div className="space-y-6">
        {/* Section: Kata Kunci Terdeteksi */}
        <div className="bg-white border-2 border-[#1D1D1B] shadow-[4px_4px_0px_#1D1D1B] p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between border-b-2 border-[#1D1D1B] pb-3">
            <span className="font-mono text-xs sm:text-sm font-black uppercase tracking-wider text-[#1D1D1B] flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-[#2ED47A] border border-[#1D1D1B] inline-block" />
              KATA KUNCI COCOK ({matched.length + newlyCovered.length})
            </span>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {matched.map((kw, idx) => (
              <span
                key={`matched-${idx}`}
                className="bg-[#2ED47A] text-[#1D1D1B] border-2 border-[#1D1D1B] font-mono text-xs font-bold px-3 py-1.5 rounded-full shadow-[2px_2px_0px_#1D1D1B] inline-flex items-center gap-1.5"
              >
                <Check className="h-3.5 w-3.5 stroke-[3]" />
                {kw}
              </span>
            ))}

            {newlyCovered.map((kw, idx) => (
              <span
                key={`new-${idx}`}
                className="bg-[#2ED47A] text-[#1D1D1B] border-2 border-[#1D1D1B] font-mono text-xs font-bold px-3 py-1.5 rounded-full shadow-[2px_2px_0px_#1D1D1B] inline-flex items-center gap-1.5"
              >
                <Check className="h-3.5 w-3.5 stroke-[3]" />
                {kw}
                <span className="bg-[#EFE84A] text-[#1D1D1B] border border-[#1D1D1B] text-[10px] font-black px-1.5 py-0.2 rounded-full uppercase ml-1">
                  TERTUTUP REVISI
                </span>
              </span>
            ))}

            {matched.length === 0 && newlyCovered.length === 0 && (
              <span className="font-mono text-xs text-[#1D1D1B]/60 italic">
                Belum ada kata kunci cocok.
              </span>
            )}
          </div>
        </div>

        {/* Section: Belum Ada di CV */}
        <div className="bg-white border-2 border-[#1D1D1B] shadow-[4px_4px_0px_#1D1D1B] p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between border-b-2 border-[#1D1D1B] pb-3">
            <span className="font-mono text-xs sm:text-sm font-black uppercase tracking-wider text-[#F34E34] flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-[#F34E34] border border-[#1D1D1B] inline-block" />
              KATA KUNCI KURANG ({missing.length})
            </span>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {missing.map((kw, idx) => {
              const imp = keywordMap.get(kw.toLowerCase().trim()) || 2;
              let impLabel = "PENTING";
              if (imp === 3) impLabel = "WAJIB";
              if (imp === 1) impLabel = "TAMBAHAN";

              return (
                <span
                  key={`missing-${idx}`}
                  className="bg-[#F34E34] text-white border-2 border-[#1D1D1B] font-mono text-xs font-bold px-3 py-1.5 rounded-full shadow-[2px_2px_0px_#1D1D1B] inline-flex items-center gap-2"
                >
                  <X className="h-3.5 w-3.5 stroke-[3]" />
                  <span>{kw}</span>
                  <span className="bg-[#1D1D1B] text-[#EFE84A] text-[10px] font-mono font-black px-1.5 py-0.5 rounded-full uppercase">
                    [{impLabel}]
                  </span>
                </span>
              );
            })}

            {missing.length === 0 && (
              <span className="font-mono text-xs text-[#2ED47A] font-bold">
                Semua kata kunci utama telah terpenuhi.
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 4. Disclaimer Box */}
      <div className="bg-[#F4F1EA] border-2 border-[#1D1D1B] shadow-[2px_2px_0px_#1D1D1B] p-3 text-[#1D1D1B] flex items-start gap-2.5">
        <Info className="h-4 w-4 mt-0.5 shrink-0 text-[#1D1D1B]" />
        <p className="font-mono text-xs leading-relaxed font-semibold">
          DISCLAIMER // Skor dihitung berbasis pembobotan kata kunci JD, bukan sistem ATS resmi.
        </p>
      </div>
    </div>
  );
};
