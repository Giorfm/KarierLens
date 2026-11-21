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
import { extractTextFromPdf } from "@/lib/pdf-parser";

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

  // User-completed placeholder values synchronized across tabs
  const [placeholderValues, setPlaceholderValues] = useState<Record<string, string>>({});

  // PDF parsing state
  const [pdfParsing, setPdfParsing] = useState<boolean>(false);
  const [copiedJson, setCopiedJson] = useState<boolean>(false);

  // Ref for aborting requests
  const abortControllerRef = useRef<AbortController | null>(null);
  const resultsRef = useRef<HTMLDivElement | null>(null);

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
    return computeScores(result.score, cvText, result.rewrite, placeholderValues);
  }, [result.score, result.rewrite, cvText, placeholderValues]);

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

        const data: AnalyzeResponse<unknown> = await res.json();

        if (!data.ok) {
          setTaskStatus((prev) => ({ ...prev, [task]: "error" }));
          setTaskErrors((prev) => ({ ...prev, [task]: data.message }));
          if (data.code === "RATE_LIMIT" || data.code === "NO_API_KEY") {
            setGlobalError({ code: data.code, message: data.message });
          }
          return;
        }

        // Success: update partial result immediately (progressive rendering)
        setResult((prev) => ({
          ...prev,
          [task]: data.data,
        }));
        setTaskStatus((prev) => ({ ...prev, [task]: "done" }));
      } catch (err: unknown) {
        if ((err as Error)?.name === "AbortError") {
          return;
        }
        const errorMsg = (err as Error)?.message || "Terjadi kesalahan jaringan atau server.";
        setTaskStatus((prev) => ({ ...prev, [task]: "error" }));
        setTaskErrors((prev) => ({ ...prev, [task]: errorMsg }));
      }
    },
    [language]
  );

  // 5. Run full analysis (3 parallel requests via Promise.allSettled)
  const handleAudit = useCallback(async () => {
    if (!cvText || cvText.trim().length < 30 || !jobDescription || jobDescription.trim().length < 30) {
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setMode("live");
    setGlobalError(null);
    setResult({});
    setTaskErrors({ score: null, rewrite: null, interview: null });

    const textToSend = maskPiiEnabled ? maskPii(cvText).masked : cvText;
    const jdToSend = jobDescription;

    Promise.allSettled([
      runSingleTask("score", textToSend, jdToSend, controller.signal),
      runSingleTask("rewrite", textToSend, jdToSend, controller.signal),
      runSingleTask("interview", textToSend, jdToSend, controller.signal),
    ]);

    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  }, [cvText, jobDescription, maskPiiEnabled, runSingleTask]);

  // 6. Retry single task
  const handleRetryTask = (task: TaskName) => {
    const textToSend = maskPiiEnabled ? maskPii(cvText).masked : cvText;
    const controller = new AbortController();
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
    if (found.defaultLanguage) {
      setLanguage(found.defaultLanguage);
    } else {
      setLanguage("id");
    }
    setMode("simulation");
    setResult(found.fallbackResult);
    setTaskStatus({ score: "done", rewrite: "done", interview: "done" });
    setTaskErrors({ score: null, rewrite: null, interview: null });
    setActiveTab("score");

    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  // 8. Activate Simulation Mode manually
  const handleActivateSimulation = () => {
    handleSelectPreset(selectedPresetId || "raka-pm");
  };

  // 9. Reset session
  const handleReset = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    clearSession();
    setCvText("");
    setJobDescription("");
    setLanguage("id");
    setMaskPiiEnabled(true);
    setMode("live");
    setResult({});
    setPlaceholderValues({});
    setTaskStatus({ score: "idle", rewrite: "idle", interview: "idle" });
    setTaskErrors({ score: null, rewrite: null, interview: null });
    setGlobalError(null);
    setActiveTab("score");
  };

  // 10. Handle placeholder change (interactive synchronized updates)
  const handlePlaceholderChange = (key: string, value: string, originalPlaceholder: string) => {
    setPlaceholderValues((prev) => ({
      ...prev,
      [key]: value,
      [originalPlaceholder]: value,
    }));
  };

  // 11. PDF Upload Handler
  const handlePdfUpload = async (file: File) => {
    setPdfParsing(true);
    try {
      const extracted = await extractTextFromPdf(file);
      setCvText(extracted);
    } catch (err: unknown) {
      alert((err as Error)?.message || "Gagal mengekstrak teks dari PDF.");
    } finally {
      setPdfParsing(false);
    }
  };

  // 12. Copy JSON for Dev Mode
  const handleCopyJson = () => {
    const jsonStr = JSON.stringify(result, null, 2);
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(jsonStr).then(() => {
        setCopiedJson(true);
        setTimeout(() => setCopiedJson(false), 2000);
      });
    }
  };

  const isAnyLoading = Object.values(taskStatus).some((s) => s === "loading");
  const hasResults = Boolean(result.score || result.rewrite || result.interview);

  return (
    <div className="min-h-screen bg-[#F4F1EA] text-[#1D1D1B] flex flex-col font-sans selection:bg-[#EFE84A] selection:text-[#1D1D1B]">
      {/* Header */}
      <Header
        onSelectPreset={handleSelectPreset}
        onReset={handleReset}
        isLoading={isAnyLoading}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 flex-1 w-full">
        {/* Status Banner */}
        <StatusBanner
          isSimulation={mode === "simulation"}
          globalError={globalError}
          onActivateSimulation={handleActivateSimulation}
        />

        {/* Two-column Input Panel */}
        <InputPanel
          cvText={cvText}
          setCvText={setCvText}
          jobDescription={jobDescription}
          setJobDescription={setJobDescription}
          language={language}
          setLanguage={setLanguage}
          maskPiiEnabled={maskPiiEnabled}
          setMaskPiiEnabled={setMaskPiiEnabled}
          onAudit={handleAudit}
          isLoading={isAnyLoading}
          onPdfUpload={handlePdfUpload}
          pdfParsing={pdfParsing}
        />

        {/* Task Progress Tracker */}
        <TaskProgress
          taskStatus={taskStatus}
          onRetryTask={handleRetryTask}
        />

        {/* Workspace Result Tabs Section */}
        <div ref={resultsRef} className="no-print pt-4 space-y-4">
          {/* Folder-tab style navigation bar with hard offset shadow */}
          <div className="border-b-4 border-[#1D1D1B] flex flex-wrap gap-2">
            {/* Tab 01: Score */}
            <button
              type="button"
              onClick={() => setActiveTab("score")}
              className={`font-mono text-xs sm:text-sm font-black uppercase tracking-wider py-3 px-4 sm:px-5 flex items-center gap-2 border-2 border-[#1D1D1B] transition-all cursor-pointer ${
                activeTab === "score"
                  ? "bg-[#EFE84A] text-[#1D1D1B] shadow-[3px_3px_0px_#1D1D1B] -mb-[4px] border-b-2"
                  : "bg-white text-[#1D1D1B] hover:bg-[#F4F1EA] shadow-[2px_2px_0px_#1D1D1B]"
              }`}
            >
              <Target className="h-4 w-4" />
              <span>01 // AUDIT SKOR</span>
              {result.score && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#1D1D1B] text-[#EFE84A]">
                  {computedScores.initial}/100
                </span>
              )}
            </button>

            {/* Tab 02: Rewrite */}
            <button
              type="button"
              onClick={() => setActiveTab("rewrite")}
              className={`font-mono text-xs sm:text-sm font-black uppercase tracking-wider py-3 px-4 sm:px-5 flex items-center gap-2 border-2 border-[#1D1D1B] transition-all cursor-pointer ${
                activeTab === "rewrite"
                  ? "bg-[#EFE84A] text-[#1D1D1B] shadow-[3px_3px_0px_#1D1D1B] -mb-[4px] border-b-2"
                  : "bg-white text-[#1D1D1B] hover:bg-[#F4F1EA] shadow-[2px_2px_0px_#1D1D1B]"
              }`}
            >
              <FileEdit className="h-4 w-4" />
              <span>02 // REVISI PENGALAMAN</span>
              {result.rewrite?.rewrites && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#2ED47A] text-[#1D1D1B]">
                  {result.rewrite.rewrites.length}
                </span>
              )}
            </button>

            {/* Tab 03: Interview */}
            <button
              type="button"
              onClick={() => setActiveTab("interview")}
              className={`font-mono text-xs sm:text-sm font-black uppercase tracking-wider py-3 px-4 sm:px-5 flex items-center gap-2 border-2 border-[#1D1D1B] transition-all cursor-pointer ${
                activeTab === "interview"
                  ? "bg-[#EFE84A] text-[#1D1D1B] shadow-[3px_3px_0px_#1D1D1B] -mb-[4px] border-b-2"
                  : "bg-white text-[#1D1D1B] hover:bg-[#F4F1EA] shadow-[2px_2px_0px_#1D1D1B]"
              }`}
            >
              <MessageSquare className="h-4 w-4" />
              <span>03 // SIMULASI STAR</span>
              {result.interview?.interviewQuestions && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#1E40AF] text-[#F4F1EA]">
                  {result.interview.interviewQuestions.length}
                </span>
              )}
            </button>

            {/* Tab 04: Print */}
            <button
              type="button"
              onClick={() => setActiveTab("print")}
              className={`font-mono text-xs sm:text-sm font-black uppercase tracking-wider py-3 px-4 sm:px-5 flex items-center gap-2 border-2 border-[#1D1D1B] transition-all cursor-pointer ${
                activeTab === "print"
                  ? "bg-[#EFE84A] text-[#1D1D1B] shadow-[3px_3px_0px_#1D1D1B] -mb-[4px] border-b-2"
                  : "bg-white text-[#1D1D1B] hover:bg-[#F4F1EA] shadow-[2px_2px_0px_#1D1D1B]"
              }`}
            >
              <Printer className="h-4 w-4" />
              <span>04 // CETAK CV ATS</span>
            </button>
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
              language={language}
              cvText={cvText}
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
              language={language}
              cvText={cvText}
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
      </div>

        {/* Development Copy JSON Helper */}
        {hasResults && (
          <div className="no-print pt-6 border-t-2 border-[#1D1D1B] flex justify-end">
            <button
              type="button"
              onClick={handleCopyJson}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-[#1D1D1B] font-mono text-xs font-bold uppercase border-2 border-[#1D1D1B] shadow-[2px_2px_0px_#1D1D1B] hover:translate-x-[1px] hover:translate-y-[1px] active:shadow-none transition-all cursor-pointer"
            >
              {copiedJson ? (
                <>
                  <Check className="h-3.5 w-3.5 text-[#2ED47A] stroke-[3]" />
                  <span>JSON TERSALIN!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>SALIN JSON</span>
                </>
              )}
            </button>
          </div>
        )}
      </main>

      {/* Neo-Brutalist Footer */}
      <footer className="no-print border-t-4 border-[#1D1D1B] bg-[#F4F1EA] py-8 text-xs text-[#1D1D1B] font-mono">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-block w-3 h-3 bg-[#2ED47A] border border-[#1D1D1B]"></span>
            <span className="font-bold uppercase tracking-wide">
              LOCALSTORAGE AKTIF
            </span>
            <span>|</span>
            <button
              type="button"
              onClick={handleActivateSimulation}
              className="text-[#1E40AF] underline font-black hover:text-[#1D1D1B] cursor-pointer uppercase"
            >
              MODE SIMULASI
            </button>
          </div>

          <p className="text-center md:text-right max-w-xl text-[11px] text-[#1D1D1B]/80 leading-relaxed">
            Privasi aman: data disamarkan di browser sebelum diproses AI.
          </p>
        </div>
      </footer>
    </div>
  );
}
