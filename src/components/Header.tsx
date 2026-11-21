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
    <header className="no-print bg-white/75 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-30 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: 3D Mascot Lens + Wordmark + University Badge */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center shrink-0">
            {/* Custom 3D Glossy Blue Glass Lens Mascot Icon */}
            <svg
              className="w-9 h-9 drop-shadow-sm select-none"
              viewBox="0 0 44 44"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-label="KarierLens Mascot"
            >
              <defs>
                <linearGradient id="lensBody" x1="6" y1="4" x2="38" y2="40" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#60A5FA" />
                  <stop offset="0.45" stopColor="#3B82F6" />
                  <stop offset="1" stopColor="#1D4ED8" />
                </linearGradient>
                <radialGradient id="lensGloss" cx="16" cy="12" r="14" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#FFFFFF" stopOpacity="0.8" />
                  <stop offset="0.6" stopColor="#FFFFFF" stopOpacity="0.15" />
                  <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
                </radialGradient>
                <linearGradient id="rimGlow" x1="10" y1="6" x2="34" y2="38" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#93C5FD" stopOpacity="0.85" />
                  <stop offset="1" stopColor="#1E40AF" stopOpacity="0.25" />
                </linearGradient>
              </defs>
              {/* Outer Lens Sphere */}
              <circle cx="22" cy="22" r="19" fill="url(#lensBody)" />
              <circle cx="22" cy="22" r="18.5" stroke="url(#rimGlow)" strokeWidth="1.5" />
              {/* Gloss Highlight Arc */}
              <ellipse cx="20" cy="14" rx="13" ry="7" fill="url(#lensGloss)" />
              {/* Friendly Eyes with Catchlights */}
              <circle cx="16.5" cy="21.5" r="2.2" fill="#0F172A" />
              <circle cx="17.2" cy="20.7" r="0.8" fill="#FFFFFF" />
              <circle cx="27.5" cy="21.5" r="2.2" fill="#0F172A" />
              <circle cx="28.2" cy="20.7" r="0.8" fill="#FFFFFF" />
              {/* Subtle Smile */}
              <path
                d="M19.5 25.5C20.5 27 23.5 27 24.5 25.5"
                stroke="#0F172A"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
              {/* Warm Accent Sparkle */}
              <path
                d="M34 8.5L34.8 10.7L37 11.5L34.8 12.3L34 14.5L33.2 12.3L31 11.5L33.2 10.7L34 8.5Z"
                fill="#FDE047"
                opacity="0.95"
              />
            </svg>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="font-bold text-xl tracking-tight text-slate-900">
              Karier<span className="text-blue-600">Lens</span>
            </span>
            <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-blue-50/80 text-blue-700 border border-blue-200/60 shadow-2xs">
              Cakrawala University Hackathon
            </span>
          </div>
        </div>

        {/* Right: Presets & Reset */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden sm:flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-full border border-slate-200/50 text-xs">
            <span className="text-slate-500 pl-2.5 pr-1 flex items-center gap-1 font-medium select-none">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              Coba:
            </span>
            {PRESET_PROFILES.map((p) => (
              <button
                key={p.id}
                type="button"
                disabled={isLoading}
                onClick={() => onSelectPreset(p.id)}
                className="bg-blue-50/80 hover:bg-blue-100 text-blue-700 rounded-full px-3.5 py-1 text-xs font-medium border border-blue-200/40 shadow-2xs transition-all disabled:opacity-50 cursor-pointer"
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Mobile preset drop/buttons */}
          <div className="flex sm:hidden items-center gap-1">
            {PRESET_PROFILES.map((p, idx) => (
              <button
                key={p.id}
                type="button"
                disabled={isLoading}
                onClick={() => onSelectPreset(p.id)}
                className="bg-blue-50/80 hover:bg-blue-100 text-blue-700 rounded-full px-2.5 py-1 text-[11px] font-medium border border-blue-200/50 transition-all disabled:opacity-50"
              >
                P{idx + 1}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-rose-600 transition-all cursor-pointer shadow-2xs"
            title="Kosongkan data dan reset sesi"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span className="hidden md:inline">Reset</span>
          </button>
        </div>
      </div>
    </header>
  );
};
