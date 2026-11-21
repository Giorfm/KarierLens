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
      <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-rose-200 p-8 text-center space-y-4 shadow-[0_8px_30px_rgb(15,23,42,0.04)]">
        <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-2xs">
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-36 bg-slate-100 rounded-2xl"></div>
          <div className="h-36 bg-slate-100 rounded-2xl"></div>
        </div>
        <div className="h-28 bg-slate-100 rounded-2xl"></div>
        <div className="space-y-3">
          <div className="h-6 w-48 bg-slate-100 rounded-md"></div>
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-9 w-28 bg-slate-100 rounded-full"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 3. Empty state
  if (!scoreData) {
    return (
      <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-dashed border-slate-300 p-12 text-center space-y-3 shadow-[0_8px_30px_rgb(15,23,42,0.04)]">
        <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-2xs">
          <Target className="h-6 w-6" />
        </div>
        <h3 className="font-semibold text-slate-900 text-sm">Belum Ada Analisis Skor</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
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
      badge: "bg-amber-50 text-amber-800 border-amber-200",
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
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
          Wajib
        </span>
      );
    }
    if (imp === 2) {
      return (
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
          Penting
        </span>
      );
    }
    return (
      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
        Nilai Tambah
      </span>
    );
  };

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-white/90 shadow-[0_8px_30px_rgb(15,23,42,0.04)] p-6 md:p-8 space-y-7 transition-all">
      {/* Target Role & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100/80 pb-4">
        <div>
          <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider block">
            Posisi Target dari Lowongan
          </span>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 mt-0.5">
            {scoreData.targetRole}
          </h2>
        </div>
        <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-semibold border ${statusTheme.badge} shadow-2xs self-start sm:self-auto`}>
          {status}
        </span>
      </div>

      {/* Kartu Komparasi Skor Deterministik */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Skor Awal */}
        <div className="bg-slate-50/80 border border-slate-200/80 rounded-3xl p-6 relative overflow-hidden shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
              <span className="p-1 rounded-md bg-white border border-slate-200 text-slate-500">
                <Target className="h-3.5 w-3.5" />
              </span>
              Skor Kecocokan CV Saat Ini
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl sm:text-6xl font-black text-slate-900 tracking-tight">
              {initial}
            </span>
            <span className="text-slate-400 font-semibold text-base">/ 100</span>
          </div>
          <div className="w-full bg-slate-200/80 h-2.5 rounded-full mt-4 overflow-hidden">
            <div
              className={`h-full ${statusTheme.bar} rounded-full transition-all duration-700`}
              style={{ width: `${Math.min(100, Math.max(0, initial))}%` }}
            />
          </div>
          <p className="text-xs text-slate-500 mt-3 leading-relaxed">
            Dihitung dari kata kunci dan terminologi JD yang telah terdeteksi di CV kamu saat ini.
          </p>
        </div>

        {/* Potensi Skor */}
        <div className="bg-linear-to-br from-blue-50/80 via-indigo-50/50 to-emerald-50/60 border border-blue-200/80 rounded-3xl p-6 relative overflow-hidden shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
              <span className="p-1 rounded-md bg-white border border-blue-200 text-blue-600">
                <TrendingUp className="h-3.5 w-3.5" />
              </span>
              Potensi Skor Setelah Revisi
            </span>
            {isRewriteLoading && (
              <span className="text-[11px] font-medium text-blue-700 bg-white/90 px-2.5 py-0.5 rounded-full border border-blue-200 animate-pulse">
                Menghitung efek...
              </span>
            )}
          </div>

          <div className="flex items-baseline gap-2">
            {projected !== null ? (
              <>
                <span className="text-5xl sm:text-6xl font-black text-blue-700 tracking-tight">
                  {projected}
                </span>
                <span className="text-blue-400 font-semibold text-base">/ 100</span>
                <span className="ml-2 text-xs font-bold text-emerald-800 bg-emerald-100/90 border border-emerald-300 px-3 py-1 rounded-full shadow-2xs">
                  +{projected - initial} Poin
                </span>
              </>
            ) : (
              <div className="h-14 flex items-center">
                <span className="text-slate-400 text-sm italic">Menunggu task revisi selesai...</span>
              </div>
            )}
          </div>

          <div className="w-full bg-blue-100/80 h-2.5 rounded-full mt-4 overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-700"
              style={{ width: `${Math.min(100, Math.max(0, projected || initial))}%` }}
            />
          </div>
          <p className="text-xs text-slate-600 mt-3 leading-relaxed">
            Mengasumsikan poin revisi diadopsi dan placeholder <code className="font-semibold text-blue-800 bg-white/80 px-1 py-0.5 rounded text-[11px]">[isi ...]</code> dilengkapi fakta nyata.
          </p>
        </div>
      </div>

      {/* Ringkasan Eksekutif */}
      {scoreData.executiveVerdict && (
        <div className="bg-blue-50/40 border border-blue-100 rounded-2xl p-5 sm:p-6 space-y-2">
          <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-blue-600" />
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
        <div className="bg-slate-50/60 border border-slate-200/70 rounded-2xl p-5 sm:p-6 space-y-3">
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
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs"
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
        <div className="bg-slate-50/60 border border-slate-200/70 rounded-2xl p-5 sm:p-6 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-rose-800 uppercase tracking-wider flex items-center gap-1.5">
              <AlertCircle className="h-4 w-4 text-rose-600" />
              Kata Kunci Belum Ada di CV ({missing.length})
            </h4>
            <span className="text-[11px] text-slate-400">Diurutkan berdasarkan urgensi</span>
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
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border shadow-2xs transition ${
                      isCovered
                        ? "bg-blue-50 text-blue-900 border-blue-200"
                        : "bg-white text-slate-800 border-slate-200"
                    }`}
                  >
                    <span>{kw}</span>
                    {item && importanceBadge(item.importance)}
                    {isCovered && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
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
      <div className="bg-slate-100/60 border border-slate-200/60 rounded-2xl p-4 flex items-start gap-2.5 text-xs text-slate-600">
        <Info className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Catatan:</strong> Simulasi berbasis kecocokan kata kunci dan relevansi semantik terhadap JD target. Bukan skor resmi sistem rekrutmen perusahaan mana pun. &quot;Potensi skor&quot; mengasumsikan semua poin revisi diadopsi dan placeholder dilengkapi dengan data nyata.
        </p>
      </div>
    </div>
  );
};
