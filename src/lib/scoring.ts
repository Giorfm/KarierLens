import type {
  ScoreResult,
  RewriteResult,
  ComputedScores,
  ReadinessStatus,
} from "@/types/karierlens";

export function normalizeText(s: string): string {
  return s.toLowerCase().replace(/\s+/g, " ").trim();
}

export function computeScores(
  score: ScoreResult,
  cvText: string,
  rewrite?: RewriteResult
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
    const afterTexts = (rewrite.rewrites || []).map((r) => r.after || "");
    const cleanCvTexts: string[] = [
      rewrite.cleanCv?.headline || "",
      rewrite.cleanCv?.summary || "",
      ...(rewrite.cleanCv?.skills || []),
      ...(rewrite.cleanCv?.experiences || []).flatMap((exp) => exp.bullets || []),
    ];

    const allRewriteText = normalizeText([...afterTexts, ...cleanCvTexts].join(" "));

    for (const item of missingKeywords) {
      const kwNorm = normalizeText(item.keyword);
      if (kwNorm.length > 0 && allRewriteText.includes(kwNorm)) {
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
