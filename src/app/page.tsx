"use client";

import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import {
  Target,
  FileEdit,
  MessageSquare,
  Printer,
  Copy,
  Check,
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
      });
    }, 500);

    return () => clearTimeout(timer);
  }, [cvText, jobDescription, language, maskPiiEnabled, activeTab, result, mode]);

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
    setTaskStatus({ score: "idle", rewrite: "idle", interview: "idle" });
    setTaskErrors({ score: null, rewrite: null, interview: null });
    setGlobalError(null);
    setActiveTab("score");
  };

  // 10. PDF parser handler (Tahap 6)
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

  // 11. Copy JSON result helper (Should Have)
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
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Header */}
      <Header
        onSelectPreset={handleSelectPreset}
        onReset={handleReset}
        isLoading={isAnalysisLoading}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Status & Simulation Banners */}
        <StatusBanner
          isSimulation={mode === "simulation"}
          globalError={globalError}
          onActivateSimulation={handleActivateSimulation}
        />

        {/* Input Form Panel */}
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

        {/* Tab Navigasi Panel Hasil */}
        <div className="no-print border-b border-slate-200">
          <nav className="flex space-x-2 sm:space-x-6 overflow-x-auto" aria-label="Tabs">
            <button
              type="button"
              onClick={() => setActiveTab("score")}
              className={`py-3 px-3 sm:px-1 border-b-2 font-semibold text-xs sm:text-sm flex items-center gap-2 whitespace-nowrap transition cursor-pointer ${
                activeTab === "score"
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
              }`}
            >
              <Target className="h-4 w-4" />
              <span>Skor Kecocokan CV</span>
              {computedScores.initial > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700">
                  {computedScores.initial}%
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("rewrite")}
              className={`py-3 px-3 sm:px-1 border-b-2 font-semibold text-xs sm:text-sm flex items-center gap-2 whitespace-nowrap transition cursor-pointer ${
                activeTab === "rewrite"
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
              }`}
            >
              <FileEdit className="h-4 w-4" />
              <span>Penulisan Ulang Pengalaman</span>
              {result.rewrite?.rewrites && result.rewrite.rewrites.length > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700">
                  {result.rewrite.rewrites.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("interview")}
              className={`py-3 px-3 sm:px-1 border-b-2 font-semibold text-xs sm:text-sm flex items-center gap-2 whitespace-nowrap transition cursor-pointer ${
                activeTab === "interview"
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
              }`}
            >
              <MessageSquare className="h-4 w-4" />
              <span>Simulasi Wawancara STAR</span>
              {result.interview?.interviewQuestions && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700">
                  {result.interview.interviewQuestions.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("print")}
              className={`py-3 px-3 sm:px-1 border-b-2 font-semibold text-xs sm:text-sm flex items-center gap-2 whitespace-nowrap transition cursor-pointer ${
                activeTab === "print"
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
              }`}
            >
              <Printer className="h-4 w-4" />
              <span>Cetak CV 1 Kolom</span>
            </button>
          </nav>
        </div>

        {/* Panel Konten Tab */}
        <div className="mt-4">
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
            />
          )}

          {activeTab === "interview" && (
            <InterviewTab
              interviewData={result.interview}
              isLoading={taskStatus.interview === "loading"}
              error={taskErrors.interview}
              onRetry={() => handleRetryTask("interview")}
              onActivateSimulation={handleActivateSimulation}
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
            />
          )}
        </div>

        {/* Should Have: Tombol Salin JSON Hasil di Development */}
        {process.env.NODE_ENV !== "production" && result && Object.keys(result).length > 0 && (
          <div className="no-print pt-6 border-t border-slate-200 flex justify-end">
            <button
              type="button"
              onClick={handleCopyJson}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs text-slate-600 hover:bg-slate-50 transition shadow-2xs"
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
      <footer className="no-print border-t border-slate-200 bg-white mt-12 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Tersimpan di browser pengguna</span>
            <span className="text-slate-300">|</span>
            <button
              type="button"
              onClick={handleActivateSimulation}
              className="text-indigo-600 hover:underline font-medium cursor-pointer"
            >
              Aktifkan Mode Simulasi
            </button>
          </div>

          <p className="text-center sm:text-right max-w-xl text-[11px] text-slate-400">
            Data pribadi disamarkan di browser sebelum dikirim ke penyedia model AI; aplikasi ini tidak menyimpan CV di server.
          </p>
        </div>
      </footer>
    </div>
  );
}
