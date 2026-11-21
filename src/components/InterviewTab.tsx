"use client";

import React from "react";
import {
  MessageSquare,
  HelpCircle,
  RotateCcw,
  AlertCircle,
  Compass,
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
      <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-rose-200 p-8 text-center space-y-4 shadow-[0_8px_30px_rgb(15,23,42,0.04)]">
        <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-2xs">
          <AlertCircle className="h-6 w-6" />
        </div>
        <div className="max-w-md mx-auto space-y-1">
          <h3 className="font-bold text-slate-900 text-base">Gagal Menyiapkan Simulasi Wawancara</h3>
          <p className="text-sm text-slate-600">{error}</p>
        </div>
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            <RotateCcw className="h-4 w-4" />
            Coba Lagi
          </button>
          <button
            type="button"
            onClick={onActivateSimulation}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full text-xs font-semibold transition cursor-pointer"
          >
            Tampilkan Hasil Simulasi
          </button>
        </div>
      </div>
    );
  }

  // 2. Loading Skeleton state
  if (isLoading) {
    return (
      <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-white/90 p-8 space-y-6 animate-pulse shadow-[0_8px_30px_rgb(15,23,42,0.04)]">
        <div className="h-10 w-72 bg-slate-100 rounded-2xl"></div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="border border-slate-200/80 rounded-2xl p-5 space-y-4">
            <div className="h-6 w-3/4 bg-slate-100 rounded-md"></div>
            <div className="h-4 w-1/2 bg-slate-100 rounded-md"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
              {[1, 2, 3, 4].map((j) => (
                <div key={j} className="h-20 bg-slate-100 rounded-xl"></div>
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
      <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-dashed border-slate-300 p-12 text-center space-y-3 shadow-[0_8px_30px_rgb(15,23,42,0.04)]">
        <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-2xs">
          <HelpCircle className="h-6 w-6" />
        </div>
        <h3 className="font-semibold text-slate-900 text-sm">Belum Ada Simulasi Pertanyaan</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
          Klik tombol &quot;Audit CV & Terjemahkan Pengalaman&quot; untuk menyiapkan 5 pertanyaan wawancara behavioral yang membidik celah antara CV dan JD target.
        </p>
      </div>
    );
  }

  const renderWithPlaceholders = (text: string, contextKey?: string) => {
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

        return isFilled ? (
          <span
            key={idx}
            className="bg-emerald-100 text-emerald-950 font-bold px-2 py-0.5 rounded-md text-xs border border-emerald-300 shadow-2xs mx-0.5"
          >
            {filledVal}
          </span>
        ) : (
          <input
            key={idx}
            type="text"
            value={filledVal}
            onChange={(e) => {
              if (onPlaceholderChange) {
                onPlaceholderChange(specificKey || p.text, e.target.value, p.text);
              }
            }}
            placeholder={hint}
            title={`Ketik langsung data riil untuk: ${p.text}`}
            className="bg-amber-100 text-amber-950 font-semibold border-2 border-dashed border-amber-400 px-2 py-0.5 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white inline-block mx-0.5 font-sans"
            style={{
              width: `${Math.max(filledVal.length, hint.length, 3) + 2}ch`,
              minWidth: "65px",
            }}
          />
        );
      }
      return <span key={idx}>{p.text}</span>;
    });
  };

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-white/90 shadow-[0_8px_30px_rgb(15,23,42,0.04)] p-6 md:p-8 space-y-6 transition-all">
      {/* Intro Box */}
      <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-center gap-3.5">
          <span className="p-2.5 rounded-2xl bg-blue-100 text-blue-700 shadow-2xs shrink-0">
            <Compass className="h-5 w-5" />
          </span>
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Persiapan Wawancara Behavioral (Metode STAR)
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 mt-0.5 leading-relaxed">
              5 pertanyaan tajam yang paling mungkin ditanyakan rekruter mengenai kesenjangan pengalamanmu, lengkap dengan panduan jawaban jujur berbasis pengalaman nyata.
            </p>
          </div>
        </div>
      </div>

      {/* 5 Kartu Pertanyaan */}
      <div className="space-y-5">
        {interviewData.interviewQuestions.map((q, idx) => {
          return (
            <div
              key={q.id || idx}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4 hover:border-slate-300 hover:shadow-sm transition-all"
            >
              {/* Nomor & Pertanyaan */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-xs shadow-2xs">
                    {idx + 1}
                  </span>
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                    Pertanyaan Wawancara Rekruter
                  </span>
                </div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                  &quot;{q.question}&quot;
                </h3>
              </div>

              {/* Fokus HR */}
              <div className="bg-slate-50/80 border border-slate-200/60 rounded-xl px-4 py-2.5 text-xs flex items-start gap-2">
                <span className="font-bold text-slate-700 shrink-0 flex items-center gap-1.5">
                  <MessageSquare className="h-3.5 w-3.5 text-blue-600" />
                  Fokus Rekruter:
                </span>
                <span className="text-slate-600 leading-relaxed">{q.hrFocus}</span>
              </div>

              {/* 4 Kotak S/T/A/R */}
              <div className="space-y-2.5">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Struktur Jawaban Rekomendasi (STAR Framework):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                  {/* Situation */}
                  <div className="bg-slate-50/50 border border-slate-200/70 rounded-2xl p-4 space-y-1 shadow-2xs">
                    <span className="font-bold uppercase text-[10px] tracking-wider block text-blue-700">
                      1. Situation (Situasi)
                    </span>
                    <p className="text-slate-700 leading-relaxed">
                      {renderWithPlaceholders(q.starGuide.situation)}
                    </p>
                  </div>

                  {/* Task */}
                  <div className="bg-slate-50/50 border border-slate-200/70 rounded-2xl p-4 space-y-1 shadow-2xs">
                    <span className="font-bold uppercase text-[10px] tracking-wider block text-blue-700">
                      2. Task (Tantangan / Peran)
                    </span>
                    <p className="text-slate-700 leading-relaxed">
                      {renderWithPlaceholders(q.starGuide.task)}
                    </p>
                  </div>

                  {/* Action */}
                  <div className="bg-slate-50/50 border border-slate-200/70 rounded-2xl p-4 space-y-1 shadow-2xs">
                    <span className="font-bold uppercase text-[10px] tracking-wider block text-blue-700">
                      3. Action (Aksi Nyata & Metode)
                    </span>
                    <p className="text-slate-700 leading-relaxed">
                      {renderWithPlaceholders(q.starGuide.action)}
                    </p>
                  </div>

                  {/* Result */}
                  <div className="bg-slate-50/50 border border-slate-200/70 rounded-2xl p-4 space-y-1 shadow-2xs">
                    <span className="font-bold uppercase text-[10px] tracking-wider block text-emerald-700">
                      4. Result (Dampak Terukur & Pembelajaran)
                    </span>
                    <p className="text-slate-700 leading-relaxed">
                      {renderWithPlaceholders(q.starGuide.result)}
                    </p>
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
