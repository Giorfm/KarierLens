import { z } from "zod";
import type {
  ScoreResult,
  RewriteResult,
  InterviewResult,
  RewriteCategory,
} from "@/types/karierlens";

/* Helper for safe strings */
const safeString = (fallback = "") =>
  z
    .unknown()
    .transform((val) => (typeof val === "string" ? val.trim() : typeof val === "number" ? String(val) : fallback));

/* Helper for importance: 1 | 2 | 3 */
const safeImportance = z
  .unknown()
  .transform((val): 1 | 2 | 3 => {
    const num = Number(val);
    if (num >= 3) return 3;
    if (num <= 1) return 1;
    return 2;
  });

/* Score Schema */
export const scoreResultSchema: z.ZodType<ScoreResult> = z
  .object({
    targetRole: safeString("Target Role"),
    executiveVerdict: safeString(""),
    jdKeywords: z
      .array(
        z.object({
          keyword: safeString(),
          keywordAlt: safeString().optional(),
          importance: safeImportance,
          foundInCv: z
            .unknown()
            .transform((val) => Boolean(val)),
        })
      )
      .default([])
      .transform((arr) =>
        arr
          .filter((item) => item.keyword.length > 0)
          .slice(0, 14)
      ),
  })
  .transform((val) => ({
    targetRole: val.targetRole || "Target Role",
    executiveVerdict: val.executiveVerdict || "",
    jdKeywords: val.jdKeywords,
  }));

/* Rewrite Category */
const validCategories: RewriteCategory[] = [
  "Organisasi / Kepanitiaan",
  "Proyek Kuliah",
  "Pengalaman Kerja / Magang",
  "Lainnya",
];

const safeCategory = z
  .unknown()
  .transform((val): RewriteCategory => {
    if (typeof val === "string") {
      const match = validCategories.find(
        (c) => c.toLowerCase() === val.toLowerCase() || val.toLowerCase().includes(c.toLowerCase())
      );
      if (match) return match;
    }
    return "Lainnya";
  });

/* Rewrite Schema */
export const rewriteResultSchema: z.ZodType<RewriteResult> = z
  .object({
    rewrites: z
      .array(
        z.object({
          id: safeString("r1"),
          category: safeCategory,
          roleContext: safeString(""),
          before: safeString(""),
          after: safeString(""),
          improvementReason: safeString(""),
          translationNote: safeString().optional(),
          keywordsAdded: z
            .array(safeString())
            .default([])
            .transform((arr) => arr.filter((s) => s.length > 0)),
        })
      )
      .default([])
      .transform((arr) =>
        arr
          .slice(0, 4)
          .map((item, idx) => ({
            ...item,
            id: item.id || `r${idx + 1}`,
          }))
      ),
    cleanCv: z
      .object({
        fullName: safeString("[isi nama lengkap]"),
        headline: safeString(""),
        summary: safeString(""),
        skills: z
          .array(safeString())
          .default([])
          .transform((arr) => arr.filter((s) => s.length > 0).slice(0, 12)),
        experiences: z
          .array(
            z.object({
              title: safeString(""),
              organization: safeString(""),
              period: safeString("[isi periode]"),
              bullets: z
                .array(safeString())
                .default([])
                .transform((arr) => arr.filter((s) => s.length > 0).slice(0, 3)),
            })
          )
          .default([]),
        education: safeString(""),
      })
      .default({
        fullName: "[isi nama lengkap]",
        headline: "",
        summary: "",
        skills: [],
        experiences: [],
        education: "",
      }),
  });

/* Interview Schema */
export const interviewResultSchema: z.ZodType<InterviewResult> = z
  .object({
    interviewQuestions: z
      .array(
        z.object({
          id: safeString("q1"),
          question: safeString(""),
          hrFocus: safeString(""),
          starGuide: z
            .object({
              situation: safeString(""),
              task: safeString(""),
              action: safeString(""),
              result: safeString(""),
            })
            .default({
              situation: "",
              task: "",
              action: "",
              result: "",
            }),
        })
      )
      .default([])
      .transform((arr) =>
        arr
          .slice(0, 5)
          .map((item, idx) => ({
            ...item,
            id: item.id || `q${idx + 1}`,
          }))
      ),
  });
