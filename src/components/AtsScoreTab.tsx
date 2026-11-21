"use client";

import React from "react";
import {
  CheckCircle,
  AlertCircle,
  RotateCcw,
  Sparkles,
  TrendingUp,
  Target,
  Info,
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
      <div className="bg-white rounded-2xl border border-rose-200 p-8 text-center space-y-4 shadow-xs">
        <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
          <AlertCircle className="h-6 w-6" />
        </div>
        <div className="max-w-md mx-auto space-y-1">
          <h3 className="font-bold text-slate-900 text-base">Gagal Menganalisis Skor & Kata Kunci</h3>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-32 bg-slate-100 rounded-xl"></div>
          <div className="h-32 bg-slate-100 rounded-xl"></div>
        </div>
        <div className="h-24 bg-slate-100 rounded-xl"></div>
        <div className="space-y-3">
          <div className="h-6 w-48 bg-slate-100 rounded"></div>
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-8 w-24 bg-slate-100 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 3. Empty state
  if (!scoreData) {
    return (
      <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-12 text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
          <Target className="h-6 w-6" />
        </div>
        <h3 className="font-semibold text-slate-800 text-sm">Belum Ada Analisis Skor</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Klik tombol &quot;Audit CV & Terjemahkan Pengalaman&quot; di atas untuk mengekstrak kata kunci JD dan menghitung skor kecocokan awal.
        </p>
      </div>
    );
  }

  const { initial, projected, status, matched, missing, newlyCovered } = computedScores;

  const statusColorMap = {
    "Perlu Banyak Perbaikan": {
      badge: "bg-rose-50 text-rose-700 border-rose-200",
      bar: "bg-rose-500",
    },
    "Cukup Kompetitif": {
      badge: "bg-amber-50 text-amber-700 border-amber-200",
      bar: "bg-amber-500",
    },
    "Sangat Siap": {
      badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
      bar: "bg-emerald-500",
    },
  };

  const statusTheme = statusColorMap[status] || statusColorMap["Perlu Banyak Perbaikan"];

  const importanceBadge = (imp: number) => {
    if (imp === 3) {
      return (
        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-200">
          Wajib
        </span>
      );
    }
    if (imp === 2) {
      return (
        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
          Penting
        </span>
      );
    }
    return (
      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
        Nilai Tambah
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Target Role & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
            Posisi Target dari Lowongan
          </span>
          <h2 className="text-lg font-bold text-slate-900">{scoreData.targetRole}</h2>
        </div>
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${statusTheme.badge}`}>
          {status}
        </span>
      </div>

      {/* Kartu Komparasi Skor Deterministik */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Skor Awal */}
        <div className="bg-slate-50/80 border border-slate-200 rounded-2xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
              <Target className="h-4 w-4 text-slate-500" />
              Skor Kecocokan CV Saat Ini
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
              {initial}
            </span>
            <span className="text-slate-400 font-semibold text-sm">/ 100</span>
          </div>
          <div className="w-full bg-slate-200 h-2 rounded-full mt-3 overflow-hidden">
            <div
              className={`h-full ${statusTheme.bar} rounded-full transition-all duration-700`}
              style={{ width: `${Math.min(100, Math.max(0, initial))}%` }}
            />
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Dihitung dari kata kunci dan terminologi JD yang telah terdeteksi di CV kamu.
          </p>
        </div>

        {/* Potensi Skor */}
        <div className="bg-linear-to-br from-indigo-50/70 to-emerald-50/70 border border-indigo-200/80 rounded-2xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-indigo-900 uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4 text-emerald-600" />
              Potensi Skor Setelah Revisi
            </span>
            {isRewriteLoading && (
              <span className="text-[11px] font-medium text-indigo-600 bg-white/80 px-2 py-0.5 rounded-full border border-indigo-200 animate-pulse">
                Menghitung efek revisi...
              </span>
            )}
          </div>

          <div className="flex items-baseline gap-2">
            {projected !== null ? (
              <>
                <span className="text-4xl sm:text-5xl font-black text-indigo-700 tracking-tight">
                  {projected}
                </span>
                <span className="text-indigo-400 font-semibold text-sm">/ 100</span>
                <span className="ml-2 text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  +{projected - initial} Poin
                </span>
              </>
            ) : (
              <div className="h-12 flex items-center">
                <span className="text-slate-400 text-sm italic">Menunggu task revisi selesai...</span>
              </div>
            )}
          </div>

          <div className="w-full bg-indigo-100 h-2 rounded-full mt-3 overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-700"
              style={{ width: `${Math.min(100, Math.max(0, projected || initial))}%` }}
            />
          </div>
          <p className="text-xs text-slate-600 mt-2">
            Mengasumsikan poin revisi diadopsi dan placeholder dilengkapi fakta nyata.
          </p>
        </div>
      </div>

      {/* Ringkasan Eksekutif */}
      {scoreData.executiveVerdict && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-2">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-indigo-600" />
            Catatan Evaluasi Rekruter
          </h4>
          <p className="text-sm text-slate-800 leading-relaxed font-normal">
            {scoreData.executiveVerdict}
          </p>
        </div>
      )}

      {/* Rincian Kata Kunci JD */}
      <div className="space-y-4">
        {/* Kata Kunci Sudah Ada */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle className="h-4 w-4 text-emerald-600" />
              Kata Kunci Terdeteksi di CV ({matched.length})
            </h4>
          </div>
          {matched.length === 0 ? (
            <p className="text-xs text-slate-400 italic">Belum ada kata kunci utama JD yang cocok di CV awal.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {matched.map((kw) => {
                const item = scoreData.jdKeywords.find((k) => k.keyword.toLowerCase() === kw.toLowerCase());
                return (
                  <span
                    key={kw}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200"
                  >
                    <span>{kw}</span>
                    {item && importanceBadge(item.importance)}
                  </span>
                );
              })}
            </div>
          )}
        </div>

        {/* Kata Kunci Belum Ada / Gap */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-rose-800 uppercase tracking-wider flex items-center gap-1.5">
              <AlertCircle className="h-4 w-4 text-rose-600" />
              Kata Kunci Belum Ada di CV ({missing.length})
            </h4>
            <span className="text-[11px] text-slate-400">Diurutkan berdasarkan tingkat urgensi</span>
          </div>

          {missing.length === 0 ? (
            <p className="text-xs text-emerald-600 font-medium">Luar biasa! Seluruh kata kunci utama JD sudah tercakup di CV kamu.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {missing.map((kw) => {
                const item = scoreData.jdKeywords.find((k) => k.keyword.toLowerCase() === kw.toLowerCase());
                const isCovered = newlyCovered.includes(kw);
                return (
                  <span
                    key={kw}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border ${
                      isCovered
                        ? "bg-indigo-50 text-indigo-900 border-indigo-200"
                        : "bg-slate-50 text-slate-800 border-slate-200"
                    }`}
                  >
                    <span>{kw}</span>
                    {item && importanceBadge(item.importance)}
                    {isCovered && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                        Tertutup Revisi ✓
                      </span>
                    )}
                  </span>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Disclaimer Resmi */}
      <div className="bg-slate-100/70 border border-slate-200 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-slate-600">
        <Info className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Catatan:</strong> Simulasi berbasis kecocokan kata kunci dan relevansi terhadap JD. Bukan skor resmi sistem rekrutmen perusahaan mana pun. &quot;Potensi skor&quot; mengasumsikan semua revisi diterapkan dan placeholder diisi dengan data nyata.
        </p>
      </div>
    </div>
  );
};
