import type {
  ScoreResult,
  RewriteResult,
  ComputedScores,
  ReadinessStatus,
} from "@/types/karierlens";
import { resolveTextPlaceholders } from "@/lib/placeholders";

export function normalizeText(s: string): string {
  return s
    .toLowerCase()
    .replace(/[/\\_-]+/g, " ")
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function computeScores(
  score: ScoreResult,
  cvText: string,
  rewrite?: RewriteResult,
  placeholderValues?: Record<string, string>
): ComputedScores {
  const keywords = score?.jdKeywords ?? [];

  if (keywords.length === 0) {
    return {
      initial: 0,
      projected: null,
      status: "Perlu Banyak Perbaikan",
      matched: [],
      missing: [],
      newlyCovered: [],
    };
  }

  const normalizedCv = normalizeText(cvText || "");

  // 1. Hitung total bobot
  const totalWeight = keywords.reduce((sum, item) => sum + (item.importance || 1), 0);

  // 2. Evaluasi kata kunci awal di CV
  const matchedKeywords: string[] = [];
  const missingKeywords: { keyword: string; importance: 1 | 2 | 3 }[] = [];

  for (const item of keywords) {
    const kwNorm = normalizeText(item.keyword);
    const isPresent =
      item.foundInCv === true || (kwNorm.length > 0 && normalizedCv.includes(kwNorm));

    if (isPresent) {
      matchedKeywords.push(item.keyword);
    } else {
      missingKeywords.push({ keyword: item.keyword, importance: item.importance });
    }
  }

  // Missing keywords sorted by importance desc
  missingKeywords.sort((a, b) => b.importance - a.importance);
  const missing = missingKeywords.map((m) => m.keyword);

  // Initial score
  const matchedWeight = keywords
    .filter((item) => matchedKeywords.includes(item.keyword))
    .reduce((sum, item) => sum + item.importance, 0);

  const initial = totalWeight > 0 ? Math.round((100 * matchedWeight) / totalWeight) : 0;

  // Status berdasarkan initial
  let status: ReadinessStatus = "Perlu Banyak Perbaikan";
  if (initial >= 75) {
    status = "Sangat Siap";
  } else if (initial >= 50) {
    status = "Cukup Kompetitif";
  }

  // 3. Evaluasi revisi (jika ada)
  let projected: number | null = null;
  const newlyCovered: string[] = [];

  if (rewrite) {
    const afterTexts = (rewrite.rewrites || []).map((r) =>
      resolveTextPlaceholders(r.after || "", placeholderValues, r.id)
    );
    const addedKeywords = (rewrite.rewrites || []).flatMap((r) => r.keywordsAdded || []);
    const cleanCvTexts: string[] = [
      resolveTextPlaceholders(rewrite.cleanCv?.headline || "", placeholderValues, "headline"),
      resolveTextPlaceholders(rewrite.cleanCv?.summary || "", placeholderValues, "summary"),
      ...(rewrite.cleanCv?.skills || []).map((sk) =>
        resolveTextPlaceholders(sk, placeholderValues)
      ),
      ...(rewrite.cleanCv?.experiences || []).flatMap((exp) =>
        (exp.bullets || []).map((b) => resolveTextPlaceholders(b, placeholderValues))
      ),
    ];

    const allRewriteText = normalizeText(
      [...afterTexts, ...addedKeywords, ...cleanCvTexts].join(" ")
    );
    const normalizedAddedKeywords = addedKeywords.map((k) => normalizeText(k));

    for (const item of missingKeywords) {
      const kwNorm = normalizeText(item.keyword);
      if (!kwNorm) continue;

      // a. Cocok exact/substring di teks revisi atau array keywordsAdded
      const inText = allRewriteText.includes(kwNorm);
      const inAdded = normalizedAddedKeywords.some(
        (ak) =>
          ak === kwNorm ||
          (ak.length > 3 && (ak.includes(kwNorm) || kwNorm.includes(ak)))
      );

      // b. Multi-word stem matching (misal: "bug identification" -> "bug" & "identif" di teks)
      const words = kwNorm.split(" ").filter((w) => w.length >= 3);
      const wordsMatch =
        words.length >= 2 &&
        words.every((w) => {
          const root = w.slice(0, Math.min(w.length, 6));
          return allRewriteText.includes(root);
        });

      if (inText || inAdded || wordsMatch) {
        newlyCovered.push(item.keyword);
      }
    }

    const totalCoveredWeight = keywords
      .filter(
        (item) => matchedKeywords.includes(item.keyword) || newlyCovered.includes(item.keyword)
      )
      .reduce((sum, item) => sum + item.importance, 0);

    const calculatedProjected =
      totalWeight > 0 ? Math.round((100 * totalCoveredWeight) / totalWeight) : initial;

    projected = Math.min(95, Math.max(initial, calculatedProjected));
  }

  return {
    initial,
    projected,
    status,
    matched: matchedKeywords,
    missing,
    newlyCovered,
  };
}
