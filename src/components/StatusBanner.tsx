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
        <div className="bg-amber-50 border border-amber-200 text-amber-900 px-4 py-3 rounded-xl flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <span className="p-1 rounded-lg bg-amber-200 text-amber-800">
              <Sparkles className="h-4 w-4" />
            </span>
            <div className="text-sm">
              <span className="font-bold tracking-wide uppercase text-amber-800 mr-2 text-xs bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                Mode Simulasi
              </span>
              <span>
                Menampilkan hasil contoh tersimpan, bukan analisis dari input Anda.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Global Error Banner */}
      {globalError && (
        <div className="bg-rose-50 border border-rose-200 text-rose-900 px-4 py-3 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-start gap-3">
            <span className="p-1 rounded-lg bg-rose-200 text-rose-800 mt-0.5 sm:mt-0">
              {globalError.code === "RATE_LIMIT" ? (
                <AlertTriangle className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
            </span>
            <div>
              <p className="text-sm font-medium">{globalError.message}</p>
              <p className="text-xs text-rose-700 mt-0.5">
                Kode Kendala: <code className="font-mono">{globalError.code}</code>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onActivateSimulation}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-medium shadow-xs transition shrink-0"
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            Tampilkan Hasil Simulasi
          </button>
        </div>
      )}
    </div>
  );
};
