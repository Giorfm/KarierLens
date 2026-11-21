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
}

export const InterviewTab: React.FC<InterviewTabProps> = ({
  interviewData,
  isLoading,
  error,
  onRetry,
  onActivateSimulation,
}) => {
  // 1. Error state
  if (error) {
    return (
      <div className="bg-white rounded-2xl border border-rose-200 p-8 text-center space-y-4 shadow-xs">
        <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
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
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition"
          >
            <RotateCcw className="h-4 w-4" />
            Coba Lagi
          </button>
          <button
            type="button"
            onClick={onActivateSimulation}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
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
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 animate-pulse">
        <div className="h-6 w-60 bg-slate-100 rounded"></div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="border border-slate-200 rounded-xl p-5 space-y-3">
            <div className="h-6 w-3/4 bg-slate-100 rounded"></div>
            <div className="h-4 w-1/2 bg-slate-100 rounded"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
              {[1, 2, 3, 4].map((j) => (
                <div key={j} className="h-16 bg-slate-100 rounded-lg"></div>
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
      <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-12 text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
          <HelpCircle className="h-6 w-6" />
        </div>
        <h3 className="font-semibold text-slate-800 text-sm">Belum Ada Simulasi Pertanyaan</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Klik tombol &quot;Audit CV & Terjemahkan Pengalaman&quot; untuk menyiapkan 5 pertanyaan wawancara behavioral yang membidik celah antara CV dan JD.
        </p>
      </div>
    );
  }

  const renderWithPlaceholders = (text: string) => {
    const parts = splitPlaceholders(text);
    return parts.map((p, idx) =>
      p.isPlaceholder ? (
        <span
          key={idx}
          className="bg-amber-100 text-amber-900 font-mono font-semibold px-1 py-0.5 rounded text-xs border border-amber-200 shadow-2xs mx-0.5"
        >
          {p.text}
        </span>
      ) : (
        <span key={idx}>{p.text}</span>
      )
    );
  };

  return (
    <div className="space-y-6">
      {/* Intro Box */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="p-2 rounded-xl bg-indigo-100 text-indigo-700">
            <Compass className="h-5 w-5" />
          </span>
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
              Persiapan Wawancara Behavioral (Metode STAR)
            </h4>
            <p className="text-xs text-slate-600">
              5 pertanyaan yang paling mungkin ditanyakan rekruter mengenai kesenjangan pengalamanmu, lengkap dengan panduan jawaban jujur berbasis pengalaman nyata.
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
              className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4 hover:border-slate-300 transition"
            >
              {/* Nomor & Pertanyaan */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs">
                    {idx + 1}
                  </span>
                  <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                    Pertanyaan Wawancara
                  </span>
                </div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                  &quot;{q.question}&quot;
                </h3>
              </div>

              {/* Fokus HR */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl px-3.5 py-2.5 text-xs flex items-start gap-2">
                <span className="font-bold text-slate-700 shrink-0 flex items-center gap-1">
                  <MessageSquare className="h-3.5 w-3.5 text-indigo-500" />
                  Fokus Rekruter:
                </span>
                <span className="text-slate-600">{q.hrFocus}</span>
              </div>

              {/* 4 Kotak S/T/A/R */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Struktur Jawaban Rekomendasi (STAR Framework):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {/* Situation */}
                  <div className="bg-white border border-slate-200 rounded-xl p-3 space-y-1">
                    <span className="font-bold text-slate-800 uppercase text-[10px] tracking-wider block text-indigo-700">
                      1. Situation (Situasi)
                    </span>
                    <p className="text-slate-700 leading-relaxed">
                      {renderWithPlaceholders(q.starGuide.situation)}
                    </p>
                  </div>

                  {/* Task */}
                  <div className="bg-white border border-slate-200 rounded-xl p-3 space-y-1">
                    <span className="font-bold text-slate-800 uppercase text-[10px] tracking-wider block text-indigo-700">
                      2. Task (Tantangan / Peran)
                    </span>
                    <p className="text-slate-700 leading-relaxed">
                      {renderWithPlaceholders(q.starGuide.task)}
                    </p>
                  </div>

                  {/* Action */}
                  <div className="bg-white border border-slate-200 rounded-xl p-3 space-y-1">
                    <span className="font-bold text-slate-800 uppercase text-[10px] tracking-wider block text-indigo-700">
                      3. Action (Aksi Nyata & Metode)
                    </span>
                    <p className="text-slate-700 leading-relaxed">
                      {renderWithPlaceholders(q.starGuide.action)}
                    </p>
                  </div>

                  {/* Result */}
                  <div className="bg-white border border-slate-200 rounded-xl p-3 space-y-1">
                    <span className="font-bold text-slate-800 uppercase text-[10px] tracking-wider block text-emerald-700">
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
