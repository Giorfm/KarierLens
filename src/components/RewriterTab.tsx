"use client";

import React, { useState } from "react";
import {
  Sparkles,
  ArrowRight,
  Copy,
  Check,
  RotateCcw,
  AlertCircle,
  FileEdit,
  Tag,
  AlertTriangle,
  CheckCircle2,
  Edit3,
} from "lucide-react";
import type { RewriteResult } from "@/types/karierlens";
import {
  countPlaceholders,
  countUnfilledPlaceholders,
  splitPlaceholders,
  resolveTextPlaceholders,
} from "@/lib/placeholders";

interface RewriterTabProps {
  rewriteData?: RewriteResult;
  isLoading: boolean;
  error?: string | null;
  onRetry: () => void;
  onActivateSimulation: () => void;
  placeholderValues?: Record<string, string>;
  onPlaceholderChange?: (key: string, value: string, originalPlaceholder: string) => void;
}

export const RewriterTab: React.FC<RewriterTabProps> = ({
  rewriteData,
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

  // 1. Error state
  if (error) {
    return (
      <div className="bg-white rounded-2xl border border-rose-200 p-8 text-center space-y-4 shadow-xs">
        <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
          <AlertCircle className="h-6 w-6" />
        </div>
        <div className="max-w-md mx-auto space-y-1">
          <h3 className="font-bold text-slate-900 text-base">Gagal Menulis Ulang Pengalaman</h3>
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
        <div className="h-10 w-64 bg-slate-100 rounded-lg"></div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="border border-slate-200 rounded-xl p-5 space-y-4">
            <div className="h-6 w-48 bg-slate-100 rounded"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="h-24 bg-slate-100 rounded-lg"></div>
              <div className="h-24 bg-slate-100 rounded-lg"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // 3. Empty state
  if (!rewriteData || !rewriteData.rewrites || rewriteData.rewrites.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-12 text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
          <FileEdit className="h-6 w-6" />
        </div>
        <h3 className="font-semibold text-slate-800 text-sm">Belum Ada Rekomendasi Revisi</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Klik tombol &quot;Audit CV & Terjemahkan Pengalaman&quot; untuk mengubah pengalaman organisasi dan proyek kuliahmu menjadi poin pencapaian profesional.
        </p>
      </div>
    );
  }

  // Hitung total dan sisa placeholder di seluruh rewrites
  const totalPlaceholders = rewriteData.rewrites.reduce(
    (sum, item) => sum + countPlaceholders(item.after),
    0
  );

  const totalUnfilled = rewriteData.rewrites.reduce(
    (sum, item) => sum + countUnfilledPlaceholders(item.after, placeholderValues, item.id),
    0
  );

  return (
    <div className="space-y-6">
      {/* Banner Rekap & Interaktif Placeholder */}
      <div
        className={`border rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
          totalUnfilled === 0 && totalPlaceholders > 0
            ? "bg-emerald-50/90 border-emerald-200"
            : "bg-amber-50/90 border-amber-200"
        }`}
      >
        <div className="flex items-center gap-3">
          <span
            className={`p-2 rounded-xl ${
              totalUnfilled === 0 && totalPlaceholders > 0
                ? "bg-emerald-100 text-emerald-800"
                : "bg-amber-100 text-amber-800"
            }`}
          >
            {totalUnfilled === 0 && totalPlaceholders > 0 ? (
              <CheckCircle2 className="h-5 w-5" />
            ) : (
              <AlertTriangle className="h-5 w-5" />
            )}
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h4
                className={`text-xs font-bold uppercase tracking-wide ${
                  totalUnfilled === 0 && totalPlaceholders > 0
                    ? "text-emerald-900"
                    : "text-amber-900"
                }`}
              >
                Prinsip Anti-Halusinasi & Input Langsung
              </h4>
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-white/80 px-2 py-0.5 rounded-full border border-slate-200 text-indigo-700">
                <Edit3 className="h-3 w-3" /> Bisa Diisi Langsung
              </span>
            </div>
            <p
              className={`text-xs sm:text-sm mt-0.5 ${
                totalUnfilled === 0 && totalPlaceholders > 0
                  ? "text-emerald-800"
                  : "text-amber-800"
              }`}
            >
              {totalUnfilled === 0 && totalPlaceholders > 0 ? (
                <>
                  Semua <strong className="font-bold">{totalPlaceholders} placeholder</strong> telah terisi data riil! Angka otomatis tersinkronisasi ke tab Cetak CV.
                </>
              ) : (
                <>
                  Tersisa{" "}
                  <strong className="underline decoration-amber-400 underline-offset-2">
                    {totalUnfilled} placeholder [isi ...]
                  </strong>
                  . Kamu dapat <strong>mengetik langsung angka/data riil</strong> pada kotak kuning di bawah, dan nilainya otomatis berubah di CV Cetak!
                </>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Daftar Kartu Rewrite */}
      <div className="space-y-5">
        {rewriteData.rewrites.map((item, idx) => {
          const parts = splitPlaceholders(item.after);
          const resolvedSentence = resolveTextPlaceholders(item.after, placeholderValues, item.id);

          return (
            <div
              key={item.id || idx}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition overflow-hidden"
            >
              {/* Header Kartu */}
              <div className="bg-slate-50/80 px-5 py-3 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-white border border-slate-200 text-indigo-700 shadow-2xs">
                    {item.category}
                  </span>
                  <span className="text-xs font-semibold text-slate-700">
                    {item.roleContext}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(item.id, resolvedSentence)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium border transition cursor-pointer ${
                    copiedId === item.id
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                  }`}
                  title="Salin kalimat lengkap dengan data yang sudah kamu isi"
                >
                  {copiedId === item.id ? (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      <span>Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Salin Kalimat</span>
                    </>
                  )}
                </button>
              </div>

              {/* Komparasi Sebelum & Sesudah */}
              <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Sebelum */}
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
                        Rekomendasi Revisi (Bisa Diedit Langsung)
                      </span>
                    </div>

                    <div className="text-xs sm:text-sm text-slate-900 font-medium leading-relaxed">
                      {parts.map((p, pIdx) => {
                        if (p.isPlaceholder) {
                          const specificKey = `${item.id}_${p.placeholderIndex ?? 0}`;
                          const currentVal =
                            placeholderValues[specificKey] ??
                            placeholderValues[p.text] ??
                            "";
                          const isFilled = currentVal.trim().length > 0;
                          const hintText = p.hint || "isi angka";

                          return (
                            <span
                              key={pIdx}
                              className="inline-flex items-center align-baseline mx-0.5 relative group"
                            >
                              <input
                                type="text"
                                value={currentVal}
                                onChange={(e) => {
                                  if (onPlaceholderChange) {
                                    onPlaceholderChange(specificKey, e.target.value, p.text);
                                  }
                                }}
                                placeholder={hintText}
                                title={`Ketik data riil untuk: ${p.text}`}
                                className={`px-2 py-0.5 rounded text-xs transition-all outline-none font-sans ${
                                  isFilled
                                    ? "bg-emerald-100 text-emerald-950 font-bold border border-emerald-400 shadow-2xs focus:ring-2 focus:ring-emerald-400 focus:bg-white"
                                    : "bg-amber-100 text-amber-950 font-semibold border-2 border-dashed border-amber-400 placeholder:text-amber-800/60 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-200"
                                }`}
                                style={{
                                  width: `${Math.max(currentVal.length, hintText.length, 3) + 2.5}ch`,
                                  minWidth: "70px",
                                }}
                              />
                            </span>
                          );
                        }
                        return <span key={pIdx}>{p.text}</span>;
                      })}
                    </div>
                  </div>

                  {/* Kata Kunci yang Ditambahkan & Alasan */}
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
