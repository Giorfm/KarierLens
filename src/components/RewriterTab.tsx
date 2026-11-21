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
} from "lucide-react";
import type { RewriteResult } from "@/types/karierlens";
import { countPlaceholders, splitPlaceholders } from "@/lib/placeholders";

interface RewriterTabProps {
  rewriteData?: RewriteResult;
  isLoading: boolean;
  error?: string | null;
  onRetry: () => void;
  onActivateSimulation: () => void;
}

export const RewriterTab: React.FC<RewriterTabProps> = ({
  rewriteData,
  isLoading,
  error,
  onRetry,
  onActivateSimulation,
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

  // Hitung total placeholder di seluruh rewrites
  const totalPlaceholders = rewriteData.rewrites.reduce(
    (sum, item) => sum + countPlaceholders(item.after),
    0
  );

  return (
    <div className="space-y-6">
      {/* Banner Rekap Placeholder */}
      <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="p-2 rounded-xl bg-amber-100 text-amber-800">
            <AlertTriangle className="h-5 w-5" />
          </span>
          <div>
            <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wide">
              Prinsip Anti-Halusinasi
            </h4>
            <p className="text-xs sm:text-sm text-amber-800">
              Ada{" "}
              <strong className="underline decoration-amber-400 underline-offset-2">
                {totalPlaceholders} placeholder [isi ...]
              </strong>{" "}
              yang perlu kamu ganti dengan angka riil dari pengalamanmu sebelum diserahkan ke rekruter.
            </p>
          </div>
        </div>
      </div>

      {/* Daftar Kartu Rewrite */}
      <div className="space-y-5">
        {rewriteData.rewrites.map((item, idx) => {
          const parts = splitPlaceholders(item.after);

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
                  onClick={() => handleCopy(item.id, item.after)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium border transition cursor-pointer ${
                    copiedId === item.id
                      ? "bg-emerald-600 text-white border-emerald-600"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                  }`}
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

                {/* Sesudah */}
                <div className="bg-indigo-50/40 border border-indigo-100 rounded-xl p-4 flex flex-col justify-between space-y-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-indigo-800 uppercase tracking-wider flex items-center gap-1">
                        <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
                        Rekomendasi Revisi (Action Verb + Metode + Dampak)
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-900 font-medium leading-relaxed">
                      {parts.map((p, pIdx) =>
                        p.isPlaceholder ? (
                          <span
                            key={pIdx}
                            className="bg-amber-100 text-amber-900 font-mono font-semibold px-1.5 py-0.5 rounded text-xs border border-amber-200 shadow-2xs mx-0.5"
                          >
                            {p.text}
                          </span>
                        ) : (
                          <span key={pIdx}>{p.text}</span>
                        )
                      )}
                    </p>
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
