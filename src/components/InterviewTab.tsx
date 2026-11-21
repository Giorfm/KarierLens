"use client";

import React from "react";
import {
  MessageSquare,
  RotateCcw,
  Sparkles,
  HelpCircle,
} from "lucide-react";
import type { InterviewResult } from "@/types/karierlens";
import { splitPlaceholders } from "@/lib/placeholders";

interface InterviewTabProps {
  interviewData?: InterviewResult;
  isLoading: boolean;
  error?: string | null;
  onRetry: () => void;
  onActivateSimulation: () => void;
  placeholderValues?: Record<string, string>;
  onPlaceholderChange?: (key: string, value: string, originalPlaceholder: string) => void;
}

export const InterviewTab: React.FC<InterviewTabProps> = ({
  interviewData,
  isLoading,
  error,
  onRetry,
  onActivateSimulation,
  placeholderValues = {},
  onPlaceholderChange,
}) => {
  // 1. Error state
  if (error) {
    return (
      <div className="bg-[#F34E34] text-white border-2 border-[#1D1D1B] shadow-[4px_4px_0px_#1D1D1B] p-8 text-center space-y-4">
        <h3 className="font-mono text-base font-black uppercase tracking-wider">
          [!] GAGAL MEMUAT WAWANCARA
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
        <div className="h-8 w-64 bg-[#F4F1EA] border-2 border-[#1D1D1B]"></div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="border-2 border-[#1D1D1B] p-6 space-y-4">
            <div className="h-6 w-3/4 bg-[#F4F1EA]"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((j) => (
                <div key={j} className="h-24 bg-[#F4F1EA] border border-[#1D1D1B]"></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // 3. Empty state
  if (
    !interviewData ||
    !interviewData.interviewQuestions ||
    interviewData.interviewQuestions.length === 0
  ) {
    return (
      <div className="bg-white border-2 border-[#1D1D1B] shadow-[4px_4px_0px_#1D1D1B] p-8 sm:p-12 text-center space-y-6">
        <div className="inline-flex items-center justify-center p-4 bg-[#EFE84A] border-2 border-[#1D1D1B] shadow-[3px_3px_0px_#1D1D1B]">
          <MessageSquare className="h-8 w-8 text-[#1D1D1B]" />
        </div>

        <div className="max-w-md mx-auto space-y-2">
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#1E40AF]">
            TASK 03 // SIMULASI STAR
          </span>
          <h3 className="font-black text-2xl text-[#1D1D1B] tracking-tight">
            Simulasi Wawancara HRD
          </h3>
          <p className="text-sm text-[#1D1D1B]/80 leading-relaxed font-sans">
            Latihan menjawab 5 pertanyaan perilaku dengan kerangka STAR.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={onActivateSimulation}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#EFE84A] text-[#1D1D1B] font-mono text-xs font-bold uppercase border-2 border-[#1D1D1B] shadow-[3px_3px_0px_#1D1D1B] hover:translate-x-[1px] hover:translate-y-[1px] active:shadow-none transition-all cursor-pointer"
          >
            <Sparkles className="h-4 w-4" />
            <span>LIHAT CONTOH PERTANYAAN</span>
          </button>
        </div>
      </div>
    );
  }

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
              className="bg-[#EFE84A] text-[#1D1D1B] font-mono font-bold text-xs px-2 py-0.5 border-2 border-[#1D1D1B] shadow-[1px_1px_0px_#1D1D1B] placeholder:text-[#1D1D1B]/60 focus:bg-white focus:outline-none focus:ring-0 transition"
              style={{
                width: `${Math.max(currentVal.length, hint.length, 3) + 3}ch`,
                minWidth: "65px",
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
      {/* Header Info Banner */}
      <div className="bg-[#1E40AF] text-[#F4F1EA] border-2 border-[#1D1D1B] shadow-[4px_4px_0px_#1D1D1B] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="p-1.5 bg-[#EFE84A] text-[#1D1D1B] border border-[#1D1D1B]">
            <HelpCircle className="h-5 w-5" />
          </span>
          <div>
            <span className="font-mono text-xs font-black uppercase tracking-wider text-[#EFE84A] block">
              SIMULASI STAR //
            </span>
            <p className="font-mono text-xs sm:text-sm font-bold">
              5 PERTANYAAN UTAMA BERDASARKAN PENGALAMANMU
            </p>
          </div>
        </div>
        <span className="font-mono text-xs text-[#F4F1EA]/80">
          Gunakan metode STAR saat wawancara.
        </span>
      </div>

      {/* 5 Cards */}
      <div className="space-y-6">
        {interviewData.interviewQuestions.map((q, index) => {
          const qId = q.id || `q${index + 1}`;

          return (
            <div
              key={qId}
              className="bg-white border-2 border-[#1D1D1B] shadow-[4px_4px_0px_#1D1D1B] p-5 sm:p-6 space-y-5"
            >
              {/* Question Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-[#1D1D1B] pb-3">
                <div className="flex items-center gap-3">
                  <span className="bg-[#1D1D1B] text-[#EFE84A] font-mono font-black text-sm px-3 py-1 border-2 border-[#1D1D1B] shadow-[2px_2px_0px_#1D1D1B]">
                    Q{index + 1}
                  </span>
                  <span className="bg-[#1E40AF] text-[#F4F1EA] font-mono text-xs font-bold px-3 py-1 rounded-full border-2 border-[#1D1D1B] shadow-[2px_2px_0px_#1D1D1B] uppercase">
                    FOKUS: {q.hrFocus}
                  </span>
                </div>
              </div>

              {/* Main Question Text */}
              <h4 className="font-black text-base sm:text-lg text-[#1D1D1B] leading-snug">
                &quot;{q.question}&quot;
              </h4>

              {/* 2x2 Grid for S / T / A / R Boxes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
                {/* SITUATION */}
                <div className="border-2 border-[#1D1D1B] bg-[#F4F1EA] shadow-[2px_2px_0px_#1D1D1B] p-4 flex flex-col justify-between space-y-2">
                  <div className="flex items-center gap-2 border-b border-[#1D1D1B]/30 pb-1.5">
                    <span className="bg-[#1D1D1B] text-[#EFE84A] font-mono text-xs font-black px-2 py-0.5 border border-[#1D1D1B]">
                      S
                    </span>
                    <span className="font-mono text-xs font-black uppercase tracking-wider text-[#1D1D1B]">
                      SITUATION // KONTEKS
                    </span>
                  </div>
                  <p className="font-sans text-xs sm:text-sm text-[#1D1D1B] leading-relaxed">
                    {renderInteractiveText(q.starGuide.situation, `int_${qId}_s`)}
                  </p>
                </div>

                {/* TASK */}
                <div className="border-2 border-[#1D1D1B] bg-[#F4F1EA] shadow-[2px_2px_0px_#1D1D1B] p-4 flex flex-col justify-between space-y-2">
                  <div className="flex items-center gap-2 border-b border-[#1D1D1B]/30 pb-1.5">
                    <span className="bg-[#1E40AF] text-white font-mono text-xs font-black px-2 py-0.5 border border-[#1D1D1B]">
                      T
                    </span>
                    <span className="font-mono text-xs font-black uppercase tracking-wider text-[#1D1D1B]">
                      TASK // TUGAS
                    </span>
                  </div>
                  <p className="font-sans text-xs sm:text-sm text-[#1D1D1B] leading-relaxed">
                    {renderInteractiveText(q.starGuide.task, `int_${qId}_t`)}
                  </p>
                </div>

                {/* ACTION */}
                <div className="border-2 border-[#1D1D1B] bg-[#F4F1EA] shadow-[2px_2px_0px_#1D1D1B] p-4 flex flex-col justify-between space-y-2">
                  <div className="flex items-center gap-2 border-b border-[#1D1D1B]/30 pb-1.5">
                    <span className="bg-[#EFE84A] text-[#1D1D1B] font-mono text-xs font-black px-2 py-0.5 border border-[#1D1D1B]">
                      A
                    </span>
                    <span className="font-mono text-xs font-black uppercase tracking-wider text-[#1D1D1B]">
                      ACTION // AKSI
                    </span>
                  </div>
                  <p className="font-sans text-xs sm:text-sm text-[#1D1D1B] leading-relaxed">
                    {renderInteractiveText(q.starGuide.action, `int_${qId}_a`)}
                  </p>
                </div>

                {/* RESULT */}
                <div className="border-2 border-[#1D1D1B] bg-[#2ED47A]/20 shadow-[2px_2px_0px_#1D1D1B] p-4 flex flex-col justify-between space-y-2">
                  <div className="flex items-center gap-2 border-b border-[#1D1D1B]/30 pb-1.5">
                    <span className="bg-[#2ED47A] text-[#1D1D1B] font-mono text-xs font-black px-2 py-0.5 border border-[#1D1D1B]">
                      R
                    </span>
                    <span className="font-mono text-xs font-black uppercase tracking-wider text-[#1D1D1B]">
                      RESULT // HASIL
                    </span>
                  </div>
                  <p className="font-sans text-xs sm:text-sm text-[#1D1D1B] leading-relaxed">
                    {renderInteractiveText(q.starGuide.result, `int_${qId}_r`)}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
