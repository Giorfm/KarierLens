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
    <div className="no-print space-y-3">
      {/* Simulation Mode Banner: Acid Yellow Strip */}
      {isSimulation && (
        <div className="bg-[#EFE84A] text-[#1D1D1B] border-2 border-[#1D1D1B] shadow-[4px_4px_0px_#1D1D1B] p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="p-1 bg-[#1D1D1B] text-[#EFE84A] border border-[#1D1D1B]">
              <Sparkles className="h-4 w-4" />
            </span>
            <div className="font-mono text-xs sm:text-sm font-bold uppercase tracking-wide">
              MODE SIMULASI — Menampilkan profil demo tersimpan.
            </div>
          </div>
        </div>
      )}

      {/* Global Error Banner: Vermilion Coral */}
      {globalError && (
        <div className="bg-[#F34E34] text-white border-2 border-[#1D1D1B] shadow-[4px_4px_0px_#1D1D1B] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="p-1 bg-white text-[#F34E34] border border-[#1D1D1B] mt-0.5">
              {globalError.code === "RATE_LIMIT" ? (
                <AlertTriangle className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
            </span>
            <div>
              <p className="text-sm font-black uppercase tracking-wide">{globalError.message}</p>
              <p className="font-mono text-xs text-white/90 mt-0.5">
                KODE: <span className="bg-[#1D1D1B] text-[#EFE84A] px-1.5 py-0.5 font-bold">{globalError.code}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onActivateSimulation}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#EFE84A] text-[#1D1D1B] border-2 border-[#1D1D1B] shadow-[2px_2px_0px_#1D1D1B] hover:translate-x-[1px] hover:translate-y-[1px] font-mono text-xs font-bold uppercase transition cursor-pointer shrink-0"
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            LIHAT SIMULASI
          </button>
        </div>
      )}
    </div>
  );
};
