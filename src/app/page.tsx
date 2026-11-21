"use client";

import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import {
  Target,
  FileEdit,
  MessageSquare,
  Printer,
  Copy,
  Check,
  ShieldCheck,
  Sparkles,
  FileCheck,
} from "lucide-react";
import type {
  TaskName,
  Lang,
  AnalysisResult,
  AnalyzeRequest,
  AnalyzeResponse,
} from "@/types/karierlens";
import { PRESET_PROFILES } from "@/data/presets";
import { computeScores } from "@/lib/scoring";
import { maskPii } from "@/lib/pii";
import { loadSession, saveSession, clearSession } from "@/lib/storage";

import { Header } from "@/components/Header";
import { StatusBanner } from "@/components/StatusBanner";
import { TaskProgress } from "@/components/TaskProgress";
import { InputPanel } from "@/components/InputPanel";
import { AtsScoreTab } from "@/components/AtsScoreTab";
import { RewriterTab } from "@/components/RewriterTab";
import { InterviewTab } from "@/components/InterviewTab";
import { PrintCvTab } from "@/components/PrintCvTab";

export default function Home() {
  // Input states
  const [cvText, setCvText] = useState<string>("");
  const [jobDescription, setJobDescription] = useState<string>("");
  const [language, setLanguage] = useState<Lang>("id");
  const [maskPiiEnabled, setMaskPiiEnabled] = useState<boolean>(true);

  // App UI states
  const [activeTab, setActiveTab] = useState<"score" | "rewrite" | "interview" | "print">("score");
  const [mode, setMode] = useState<"live" | "simulation">("live");
  const [selectedPresetId, setSelectedPresetId] = useState<string>("raka-pm");

  // Analysis result states
  const [result, setResult] = useState<Partial<AnalysisResult>>({});
  const [placeholderValues, setPlaceholderValues] = useState<Record<string, string>>({});
  const [taskStatus, setTaskStatus] = useState<Record<TaskName, "idle" | "loading" | "done" | "error">>({
    score: "idle",
    rewrite: "idle",
    interview: "idle",
  });
  const [taskErrors, setTaskErrors] = useState<Record<TaskName, string | null>>({
    score: null,
    rewrite: null,
    interview: null,
  });
  const [globalError, setGlobalError] = useState<{ code: string; message: string } | null>(null);

  // PDF state
  const [pdfParsing, setPdfParsing] = useState<boolean>(false);
  const [copiedJson, setCopiedJson] = useState<boolean>(false);

  // Ref for aborting requests
  const abortControllerRef = useRef<AbortController | null>(null);

  // 1. Load session from localStorage on mount (client-only to avoid hydration mismatch)
  useEffect(() => {
    const saved = loadSession();
    if (saved) {
      setCvText(saved.cvText || "");
      setJobDescription(saved.jobDescription || "");
      setLanguage(saved.language || "id");
      setMaskPiiEnabled(saved.maskPii ?? true);
      setActiveTab(saved.activeTab || "score");
      if (saved.placeholderValues) {
        setPlaceholderValues(saved.placeholderValues);
      }
      if (saved.liveResult && Object.keys(saved.liveResult).length > 0) {
        setResult(saved.liveResult);
        setTaskStatus({
          score: saved.liveResult.score ? "done" : "idle",
          rewrite: saved.liveResult.rewrite ? "done" : "idle",
          interview: saved.liveResult.interview ? "done" : "idle",
        });
      }
    }
  }, []);

  // 2. Debounced save to localStorage (only live results, never simulation)
  useEffect(() => {
    if (mode === "simulation") return;

    const timer = setTimeout(() => {
      saveSession({
        cvText,
        jobDescription,
        language,
        maskPii: maskPiiEnabled,
        activeTab,
        liveResult: result,
        placeholderValues,
      });
    }, 500);

    return () => clearTimeout(timer);
  }, [cvText, jobDescription, language, maskPiiEnabled, activeTab, result, placeholderValues, mode]);

  // 3. Extract local contacts from original cvText (for PrintCvTab)
  const contacts = useMemo(() => {
    return maskPii(cvText).contacts;
  }, [cvText]);

  // 4. Compute deterministic score with lib/scoring.ts
  const computedScores = useMemo(() => {
    if (!result.score) {
      return {
        initial: 0,
        projected: null,
        status: "Perlu Banyak Perbaikan" as const,
        matched: [],
        missing: [],
        newlyCovered: [],
      };
    }
    return computeScores(result.score, cvText, result.rewrite);
  }, [result.score, result.rewrite, cvText]);

  // Helper to run a single task via API
  const runSingleTask = useCallback(
    async (task: TaskName, textToSend: string, jdToSend: string, signal: AbortSignal) => {
      setTaskStatus((prev) => ({ ...prev, [task]: "loading" }));
      setTaskErrors((prev) => ({ ...prev, [task]: null }));

      try {
        const payload: AnalyzeRequest = {
          task,
          cvText: textToSend,
          jobDescription: jdToSend,
          language,
        };

        const res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          signal,
        });

        const json = (await res.json()) as AnalyzeResponse<unknown>;

        if (!res.ok || !json.ok) {
          const errCode = !json.ok ? json.code : "UPSTREAM";
          const errMsg = !json.ok ? json.message : `Permintaan gagal (${res.status})`;

          setTaskStatus((prev) => ({ ...prev, [task]: "error" }));
          setTaskErrors((prev) => ({ ...prev, [task]: errMsg }));

          if (errCode === "NO_API_KEY" || errCode === "RATE_LIMIT") {
            setGlobalError({ code: errCode, message: errMsg });
          }
          return;
        }

        // Success: update task result
        setResult((prev) => ({
          ...prev,
          [task]: json.data,
        }));
        setTaskStatus((prev) => ({ ...prev, [task]: "done" }));
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") {
          return; // Request was aborted by user
        }
        const errMsg = err instanceof Error ? err.message : "Terjadi kesalahan jaringan.";
        setTaskStatus((prev) => ({ ...prev, [task]: "error" }));
        setTaskErrors((prev) => ({ ...prev, [task]: errMsg }));
      }
    },
    [language]
  );

  // 5. Run full analysis (3 parallel requests)
  const handleAudit = useCallback(async () => {
    if (!cvText || cvText.trim().length < 30 || !jobDescription || jobDescription.trim().length < 30) {
      return;
    }

    // Abort previous running requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setMode("live");
    setGlobalError(null);
    setResult({});
    setTaskErrors({ score: null, rewrite: null, interview: null });

    // Prepare text to send (masked if toggle is on)
    const textToSend = maskPiiEnabled ? maskPii(cvText).masked : cvText;
    const jdToSend = jobDescription;

    // Trigger all 3 tasks in parallel
    Promise.allSettled([
      runSingleTask("score", textToSend, jdToSend, controller.signal),
      runSingleTask("rewrite", textToSend, jdToSend, controller.signal),
      runSingleTask("interview", textToSend, jdToSend, controller.signal),
    ]);
  }, [cvText, jobDescription, maskPiiEnabled, runSingleTask]);

  // 6. Retry single task
  const handleRetryTask = (task: TaskName) => {
    const controller = new AbortController();
    abortControllerRef.current = controller;
    const textToSend = maskPiiEnabled ? maskPii(cvText).masked : cvText;
    runSingleTask(task, textToSend, jobDescription, controller.signal);
  };

  // 7. Preset selection
  const handleSelectPreset = (presetId: string) => {
    const found = PRESET_PROFILES.find((p) => p.id === presetId);
    if (!found) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    setSelectedPresetId(found.id);
    setCvText(found.cvText);
    setJobDescription(found.jobDescription);
    setMode("simulation");
    setGlobalError(null);
    setResult(found.fallbackResult);
    setTaskStatus({ score: "done", rewrite: "done", interview: "done" });
    setTaskErrors({ score: null, rewrite: null, interview: null });
    setActiveTab("score");
  };

  // 8. Activate Simulation Mode
  const handleActivateSimulation = () => {
    handleSelectPreset(selectedPresetId || "raka-pm");
  };

  // 9. Reset all
  const handleReset = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    clearSession();
    setCvText("");
    setJobDescription("");
    setMode("live");
    setResult({});
    setPlaceholderValues({});
    setTaskStatus({ score: "idle", rewrite: "idle", interview: "idle" });
    setTaskErrors({ score: null, rewrite: null, interview: null });
    setGlobalError(null);
    setActiveTab("score");
  };

  // 10. Handle placeholder change (interactive inline inputs)
  const handlePlaceholderChange = useCallback(
    (key: string, value: string, originalPlaceholder: string) => {
      setPlaceholderValues((prev) => ({
        ...prev,
        [key]: value,
        [originalPlaceholder]: value,
      }));
    },
    []
  );

  // 11. PDF parser handler (Tahap 6)
  const handlePdfUpload = async (file: File) => {
    setPdfParsing(true);
    try {
      const { extractTextFromPdf } = await import("@/lib/pdf-parser");
      const extracted = await extractTextFromPdf(file);
      setCvText(extracted);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal mengekstrak teks PDF.";
      alert(msg);
    } finally {
      setPdfParsing(false);
    }
  };

  // 12. Copy JSON result helper (Should Have)
  const handleCopyJson = () => {
    if (!result) return;
    const jsonStr = JSON.stringify(result, null, 2);
    navigator.clipboard?.writeText(jsonStr).then(() => {
      setCopiedJson(true);
      setTimeout(() => setCopiedJson(false), 2000);
    });
  };

  const isAnalysisLoading = Object.values(taskStatus).some((s) => s === "loading");

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFC] text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900 relative overflow-x-hidden">
      {/* Ambient Mesh Glow Orbs (Pure CSS, Daylight AI Aesthetic) */}
      <div className="absolute top-0 left-0 right-0 h-96 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-24 left-1/4 w-96 h-96 bg-sky-200/35 rounded-full blur-3xl" />
        <div className="absolute -top-32 right-1/4 w-[28rem] h-[28rem] bg-indigo-200/30 rounded-full blur-3xl" />
        <div className="absolute top-48 left-1/2 -translate-x-1/2 w-80 h-80 bg-amber-100/30 rounded-full blur-3xl" />
      </div>

      {/* Header Bar */}
      <Header
        onSelectPreset={handleSelectPreset}
        onReset={handleReset}
        isLoading={isAnalysisLoading}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 relative z-10">
        {/* Compact Hero Banner */}
        <section className="no-print text-center pt-2 pb-2 space-y-3 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50/80 border border-blue-200/60 text-blue-700 text-xs font-semibold shadow-2xs">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            <span>Campus-to-Corporate AI Career Translator</span>
          </div>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900">
            Ubah Pengalaman Kampus Jadi Bahasa Rekruter.
          </h1>

          <p className="text-slate-600 text-sm md:text-base leading-relaxed max-w-2xl mx-auto">
            Audit kecocokan CV terhadap Job Description, terjemahkan aktivitas BEM/kepanitiaan tanpa mengarang angka, dan siapkan jawaban wawancara STAR.
          </p>

          {/* Trust Badges */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-2.5 text-xs text-slate-600">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/70 border border-slate-200/80 shadow-2xs font-medium">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              100% Client-side Privacy
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/70 border border-slate-200/80 shadow-2xs font-medium">
              <Check className="h-3.5 w-3.5 text-blue-600" />
              Prinsip Anti-Halusinasi
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/70 border border-slate-200/80 shadow-2xs font-medium">
              <FileCheck className="h-3.5 w-3.5 text-indigo-600" />
              Format Standar Harvard/ATS
            </span>
          </div>
        </section>

        {/* Status & Simulation Banners */}
        <StatusBanner
          isSimulation={mode === "simulation"}
          globalError={globalError}
          onActivateSimulation={handleActivateSimulation}
        />

        {/* Input Form Panel (Frosted Glass Dual Card) */}
        <InputPanel
          cvText={cvText}
          setCvText={(val) => {
            setCvText(val);
            if (mode === "simulation") setMode("live");
          }}
          jobDescription={jobDescription}
          setJobDescription={(val) => {
            setJobDescription(val);
            if (mode === "simulation") setMode("live");
          }}
          language={language}
          setLanguage={setLanguage}
          maskPiiEnabled={maskPiiEnabled}
          setMaskPiiEnabled={setMaskPiiEnabled}
          onAudit={handleAudit}
          isLoading={isAnalysisLoading}
          onPdfUpload={handlePdfUpload}
          pdfParsing={pdfParsing}
        />

        {/* Task Progress Chips */}
        <TaskProgress taskStatus={taskStatus} onRetryTask={handleRetryTask} />

        {/* Tab Navigasi Panel Hasil (Segmented Pill Bar) */}
        <div className="no-print pt-2">
          <div className="flex justify-center sm:justify-start">
            <nav
              className="bg-slate-200/60 p-1.5 rounded-2xl sm:rounded-full border border-slate-200/80 inline-flex items-center gap-1 max-w-full overflow-x-auto shadow-inner/10"
              aria-label="Tabs"
            >
              <button
                type="button"
                onClick={() => setActiveTab("score")}
                className={`py-2 px-4 sm:px-5 font-semibold text-xs sm:text-sm flex items-center gap-2 rounded-full whitespace-nowrap transition cursor-pointer ${
                  activeTab === "score"
                    ? "bg-white text-blue-700 shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                }`}
              >
                <Target className="h-4 w-4" />
                <span>Skor Kecocokan CV</span>
                {computedScores.initial > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                    {computedScores.initial}%
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("rewrite")}
                className={`py-2 px-4 sm:px-5 font-semibold text-xs sm:text-sm flex items-center gap-2 rounded-full whitespace-nowrap transition cursor-pointer ${
                  activeTab === "rewrite"
                    ? "bg-white text-blue-700 shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                }`}
              >
                <FileEdit className="h-4 w-4" />
                <span>Penulisan Ulang Pengalaman</span>
                {result.rewrite?.rewrites && result.rewrite.rewrites.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                    {result.rewrite.rewrites.length}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("interview")}
                className={`py-2 px-4 sm:px-5 font-semibold text-xs sm:text-sm flex items-center gap-2 rounded-full whitespace-nowrap transition cursor-pointer ${
                  activeTab === "interview"
                    ? "bg-white text-blue-700 shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                }`}
              >
                <MessageSquare className="h-4 w-4" />
                <span>Simulasi Wawancara STAR</span>
                {result.interview?.interviewQuestions && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                    {result.interview.interviewQuestions.length}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("print")}
                className={`py-2 px-4 sm:px-5 font-semibold text-xs sm:text-sm flex items-center gap-2 rounded-full whitespace-nowrap transition cursor-pointer ${
                  activeTab === "print"
                    ? "bg-white text-blue-700 shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                }`}
              >
                <Printer className="h-4 w-4" />
                <span>Cetak CV 1 Kolom</span>
              </button>
            </nav>
          </div>
        </div>

        {/* Panel Konten Tab */}
        <div className="mt-2">
          {activeTab === "score" && (
            <AtsScoreTab
              scoreData={result.score}
              computedScores={computedScores}
              isLoading={taskStatus.score === "loading"}
              isRewriteLoading={taskStatus.rewrite === "loading"}
              error={taskErrors.score}
              onRetry={() => handleRetryTask("score")}
              onActivateSimulation={handleActivateSimulation}
            />
          )}

          {activeTab === "rewrite" && (
            <RewriterTab
              rewriteData={result.rewrite}
              isLoading={taskStatus.rewrite === "loading"}
              error={taskErrors.rewrite}
              onRetry={() => handleRetryTask("rewrite")}
              onActivateSimulation={handleActivateSimulation}
              placeholderValues={placeholderValues}
              onPlaceholderChange={handlePlaceholderChange}
            />
          )}

          {activeTab === "interview" && (
            <InterviewTab
              interviewData={result.interview}
              isLoading={taskStatus.interview === "loading"}
              error={taskErrors.interview}
              onRetry={() => handleRetryTask("interview")}
              onActivateSimulation={handleActivateSimulation}
              placeholderValues={placeholderValues}
              onPlaceholderChange={handlePlaceholderChange}
            />
          )}

          {activeTab === "print" && (
            <PrintCvTab
              cleanCv={result.rewrite?.cleanCv}
              contacts={contacts}
              isLoading={taskStatus.rewrite === "loading"}
              error={taskErrors.rewrite}
              onRetry={() => handleRetryTask("rewrite")}
              onActivateSimulation={handleActivateSimulation}
              placeholderValues={placeholderValues}
              onPlaceholderChange={handlePlaceholderChange}
            />
          )}
        </div>

        {/* Should Have: Tombol Salin JSON Hasil di Development */}
        {process.env.NODE_ENV !== "production" && result && Object.keys(result).length > 0 && (
          <div className="no-print pt-4 border-t border-slate-200/80 flex justify-end">
            <button
              type="button"
              onClick={handleCopyJson}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-slate-300 bg-white text-xs text-slate-600 hover:bg-slate-50 transition shadow-2xs cursor-pointer"
            >
              {copiedJson ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                  <span>JSON Hasil Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Salin JSON Hasil (Dev Mode)</span>
                </>
              )}
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="no-print border-t border-slate-200/80 bg-white/70 backdrop-blur-md mt-16 py-8 text-xs text-slate-500 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-2xs"></span>
            <span className="font-medium text-slate-700">Tersimpan di browser pengguna (Stateless & Safe)</span>
            <span className="text-slate-300">|</span>
            <button
              type="button"
              onClick={handleActivateSimulation}
              className="text-blue-600 hover:underline font-semibold cursor-pointer"
            >
              Aktifkan Mode Simulasi
            </button>
          </div>

          <p className="text-center sm:text-right max-w-xl text-[11px] text-slate-400">
            Data pribadi disamarkan di browser sebelum dikirim ke penyedia model AI; aplikasi ini tidak menyimpan CV di database/server.
          </p>
        </div>
      </footer>
    </div>
  );
}
