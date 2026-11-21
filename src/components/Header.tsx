"use client";

import React from "react";
import { Sparkles, RotateCcw } from "lucide-react";
import { PRESET_PROFILES } from "@/data/presets";

interface HeaderProps {
  onSelectPreset: (presetId: string) => void;
  onReset: () => void;
  isLoading: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onSelectPreset,
  onReset,
  isLoading,
}) => {
  return (
    <header className="no-print bg-[#F4F1EA] border-b-4 border-[#1D1D1B] sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Left: Brand Wordmark + Hackathon Edition Badge */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex items-baseline">
            <span className="font-black text-2xl sm:text-3xl tracking-tight text-[#1D1D1B] lowercase">
              karierlens<span className="text-[#F34E34]">.</span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xl tracking-tight text-slate-900">
                Karier<span className="text-indigo-600">Lens</span>
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
                Cakrawala University Hackathon
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              Tulis pengalaman kampusmu dalam Bahasa Indonesia. Dapatkan CV Inggris yang siap dilamar.
            </p>
          </div>
        </div>

        {/* Right: Preset Pills & Reset Button */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Preset Buttons Desktop */}
          <div className="hidden md:flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-[#1D1D1B] uppercase tracking-wider flex items-center gap-1 select-none mr-1">
              <Sparkles className="h-3.5 w-3.5 text-[#1D1D1B]" />
              CONTOH:
            </span>
            {PRESET_PROFILES.map((p) => (
              <button
                key={p.id}
                type="button"
                disabled={isLoading}
                onClick={() => onSelectPreset(p.id)}
                className="bg-white hover:bg-[#EFE84A] text-[#1D1D1B] font-mono text-xs font-bold px-3.5 py-1.5 rounded-full border-2 border-[#1D1D1B] shadow-[2px_2px_0px_#1D1D1B] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#1D1D1B] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all duration-100 disabled:opacity-50 cursor-pointer"
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Preset Buttons Mobile */}
          <div className="flex md:hidden items-center gap-1.5">
            {PRESET_PROFILES.map((p, idx) => (
              <button
                key={p.id}
                type="button"
                disabled={isLoading}
                onClick={() => onSelectPreset(p.id)}
                className="bg-white hover:bg-[#EFE84A] text-[#1D1D1B] font-mono text-[11px] font-bold px-2.5 py-1 rounded-full border-2 border-[#1D1D1B] shadow-[2px_2px_0px_#1D1D1B] active:shadow-none transition-all disabled:opacity-50"
              >
                P{idx + 1}
              </button>
            ))}
          </div>

          {/* Reset Button */}
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F34E34] text-white font-mono text-xs font-bold uppercase rounded-sm border-2 border-[#1D1D1B] shadow-[2px_2px_0px_#1D1D1B] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#1D1D1B] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all duration-100 cursor-pointer"
            title="Kosongkan data"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">RESET</span>
          </button>
        </div>
      </div>
    </header>
  );
};
