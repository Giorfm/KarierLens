"use client";

import React from "react";
import { Sparkles, RotateCcw, Compass } from "lucide-react";
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
    <header className="no-print border-b border-slate-200 bg-white/90 backdrop-blur sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm shadow-indigo-200">
            <Compass className="h-6 w-6" />
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
              Penerjemah Pengalaman Kampus ke Bahasa Rekruter
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg text-xs">
            <span className="text-slate-500 px-2 flex items-center gap-1 font-medium">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              Coba Preset:
            </span>
            {PRESET_PROFILES.map((p) => (
              <button
                key={p.id}
                type="button"
                disabled={isLoading}
                onClick={() => onSelectPreset(p.id)}
                className="px-2.5 py-1.5 rounded-md font-medium text-slate-700 hover:bg-white hover:text-indigo-600 hover:shadow-xs transition disabled:opacity-50"
              >
                {p.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-rose-600 transition"
            title="Kosongkan data dan reset sesi"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>
    </header>
  );
};
