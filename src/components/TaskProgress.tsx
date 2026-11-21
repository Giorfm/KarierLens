"use client";

import React from "react";
import { Loader2, CheckCircle2, XCircle, Clock } from "lucide-react";
import type { TaskName } from "@/types/karierlens";

interface TaskProgressProps {
  taskStatus: Record<TaskName, "idle" | "loading" | "done" | "error">;
  onRetryTask?: (task: TaskName) => void;
}

export const TaskProgress: React.FC<TaskProgressProps> = ({
  taskStatus,
  onRetryTask,
}) => {
  const tasks: { id: TaskName; label: string }[] = [
    { id: "score", label: "Kata kunci & skor" },
    { id: "rewrite", label: "Penulisan ulang pengalaman" },
    { id: "interview", label: "Simulasi wawancara" },
  ];

  // Check if at least one task is active or done/error
  const isAnyActive = Object.values(taskStatus).some((s) => s !== "idle");
  if (!isAnyActive) return null;

  return (
    <div className="no-print bg-white/80 backdrop-blur-md p-3.5 px-5 rounded-2xl border border-white/90 shadow-[0_8px_30px_rgb(15,23,42,0.04)] flex flex-wrap items-center justify-between gap-3 transition-all">
      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping"></span>
        Status Pipeline AI:
      </span>
      <div className="flex flex-wrap items-center gap-2">
        {tasks.map((task) => {
          const status = taskStatus[task.id];

          let icon = <Clock className="h-3.5 w-3.5 text-slate-400" />;
          let statusText = "Menunggu";
          let badgeClass = "bg-slate-50 text-slate-600 border-slate-200/70";

          if (status === "loading") {
            icon = <Loader2 className="h-3.5 w-3.5 text-blue-600 animate-spin" />;
            statusText = "Menganalisis";
            badgeClass = "bg-blue-50 text-blue-700 border-blue-200 animate-pulse";
          } else if (status === "done") {
            icon = <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />;
            statusText = "Selesai";
            badgeClass = "bg-emerald-50 text-emerald-700 border-emerald-200";
          } else if (status === "error") {
            icon = <XCircle className="h-3.5 w-3.5 text-rose-600" />;
            statusText = "Gagal";
            badgeClass = "bg-rose-50 text-rose-700 border-rose-200";
          }

          return (
            <div
              key={task.id}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${badgeClass} shadow-2xs transition`}
            >
              {icon}
              <span className="text-slate-800 font-semibold">{task.label}:</span>
              <span>{statusText}</span>
              {status === "error" && onRetryTask && (
                <button
                  type="button"
                  onClick={() => onRetryTask(task.id)}
                  className="ml-1 underline text-rose-700 hover:text-rose-900 font-bold cursor-pointer"
                >
                  Ulang
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
