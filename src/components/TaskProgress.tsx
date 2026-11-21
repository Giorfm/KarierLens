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
    { id: "score", label: "Skor & Kata Kunci" },
    { id: "rewrite", label: "Revisi Pengalaman" },
    { id: "interview", label: "Wawancara STAR" },
  ];

  const isAnyActive = Object.values(taskStatus).some((s) => s !== "idle");
  if (!isAnyActive) return null;

  return (
    <div className="no-print bg-white border-2 border-[#1D1D1B] shadow-[4px_4px_0px_#1D1D1B] p-4 flex flex-wrap items-center justify-between gap-3">
      <span className="font-mono text-xs font-black uppercase tracking-wider text-[#1D1D1B] flex items-center gap-2">
        <span className="w-2.5 h-2.5 bg-[#EFE84A] border border-[#1D1D1B] animate-ping inline-block" />
        PIPELINE STATUS //
      </span>

      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        {tasks.map((task) => {
          const status = taskStatus[task.id];

          let icon = <Clock className="h-3.5 w-3.5 text-[#1D1D1B]" />;
          let statusText = "MENUNGGU";
          let chipClass = "bg-white border-2 border-[#1D1D1B] opacity-70 text-[#1D1D1B]";

          if (status === "loading") {
            icon = <Loader2 className="h-3.5 w-3.5 text-[#1D1D1B] animate-spin" />;
            statusText = "PROSES";
            chipClass = "bg-[#EFE84A] border-2 border-[#1D1D1B] shadow-[2px_2px_0px_#1D1D1B] animate-pulse text-[#1D1D1B]";
          } else if (status === "done") {
            icon = <CheckCircle2 className="h-3.5 w-3.5 text-[#1D1D1B]" />;
            statusText = "SELESAI";
            chipClass = "bg-[#2ED47A] border-2 border-[#1D1D1B] shadow-[2px_2px_0px_#1D1D1B] text-[#1D1D1B]";
          } else if (status === "error") {
            icon = <XCircle className="h-3.5 w-3.5 text-white" />;
            statusText = "GAGAL";
            chipClass = "bg-[#F34E34] text-white border-2 border-[#1D1D1B] shadow-[2px_2px_0px_#1D1D1B]";
          }

          return (
            <div
              key={task.id}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full font-mono text-xs font-bold transition ${chipClass}`}
            >
              {icon}
              <span className="uppercase">{task.label}:</span>
              <span>{statusText}</span>
              {status === "error" && onRetryTask && (
                <button
                  type="button"
                  onClick={() => onRetryTask(task.id)}
                  className="ml-1 underline font-black text-[#EFE84A] hover:text-white cursor-pointer uppercase"
                >
                  [ULANG]
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
