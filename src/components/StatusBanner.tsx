"use client";

import React from "react";
import { AlertCircle, AlertTriangle, Play, Sparkles } from "lucide-react";

interface StatusBannerProps {
  isSimulation: boolean;
  globalError: { code: string; message: string } | null;
  onActivateSimulation: () => void;
  onDismissError?: () => void;
}

export const StatusBanner: React.FC<StatusBannerProps> = ({
  isSimulation,
  globalError,
  onActivateSimulation,
}) => {
  return (
    <div className="no-print space-y-2">
      {/* Simulation Banner */}
      {isSimulation && (
        <div className="bg-amber-50/90 border border-amber-200/80 text-amber-900 px-5 py-3.5 rounded-2xl flex items-center justify-between shadow-xs backdrop-blur-xs transition-all">
          <div className="flex items-center gap-3">
            <span className="p-1.5 rounded-xl bg-amber-100 text-amber-800 border border-amber-200/60 shadow-2xs">
              <Sparkles className="h-4 w-4" />
            </span>
            <div className="text-sm">
              <span className="font-bold tracking-wide uppercase text-amber-800 mr-2 text-[11px] bg-amber-100/90 px-2.5 py-0.5 rounded-full border border-amber-300">
                Mode Simulasi
              </span>
              <span className="text-amber-900 text-xs sm:text-sm">
                Menampilkan profil demo tersimpan, bukan analisis langsung dari input Anda.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Global Error Banner */}
      {globalError && (
        <div className="bg-rose-50/95 border border-rose-200 text-rose-900 px-5 py-3.5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs transition-all">
          <div className="flex items-start gap-3">
            <span className="p-1.5 rounded-xl bg-rose-100 text-rose-800 border border-rose-200/60 mt-0.5 sm:mt-0 shadow-2xs">
              {globalError.code === "RATE_LIMIT" ? (
                <AlertTriangle className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
            </span>
            <div>
              <p className="text-sm font-semibold text-rose-900">{globalError.message}</p>
              <p className="text-xs text-rose-700 mt-0.5">
                Kode Kendala: <code className="font-mono bg-rose-100/80 px-1 py-0.5 rounded text-[11px] font-semibold">{globalError.code}</code>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onActivateSimulation}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-full text-xs font-semibold shadow-xs transition cursor-pointer shrink-0"
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            Tampilkan Hasil Simulasi
          </button>
        </div>
      )}
    </div>
  );
};
