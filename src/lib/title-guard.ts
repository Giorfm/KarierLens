function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function hasTerm(text: string, term: string): boolean {
  if (!text || !term) return false;
  const escaped = escapeRegex(term);
  const regex = new RegExp(`(?<![\\p{L}\\p{N}])${escaped}(?![\\p{L}\\p{N}])`, "iu");
  return regex.test(text);
}

interface TitleRule {
  targetTerms: string[];
  sourceAllowed: string[];
}

const TITLE_INFLATION_RULES: TitleRule[] = [
  {
    targetTerms: ["manager", "manajer"],
    sourceAllowed: ["manajer", "manager"],
  },
  {
    targetTerms: ["director", "direktur"],
    sourceAllowed: ["direktur", "director"],
  },
  {
    targetTerms: ["head of"],
    sourceAllowed: ["kepala", "head"],
  },
  {
    targetTerms: ["vice president", "vp"],
    sourceAllowed: ["wakil presiden", "vice president", "vp"],
  },
  {
    targetTerms: ["chief", "ceo", "cto", "coo"],
    sourceAllowed: ["chief", "ceo", "cto", "coo", "kepala eksekutif"],
  },
  {
    targetTerms: ["founder", "co-founder"],
    sourceAllowed: ["pendiri", "pendiri bersama", "founder", "co-founder", "mendirikan", "merintis"],
  },
  {
    targetTerms: ["senior"],
    sourceAllowed: ["senior"],
  },
];

/**
 * Checks if outputText contains inflated leadership titles not present/justified in sourceCv.
 * Returns a list of risky terms detected in outputText that lack justification in sourceCv.
 */
export function detectTitleInflation(sourceCv: string, outputText: string): string[] {
  if (!outputText || typeof outputText !== "string") return [];
  const safeSource = sourceCv || "";

  const flaggedTerms: string[] = [];

  for (const rule of TITLE_INFLATION_RULES) {
    // Check if any target term is present in outputText
    const matchedTarget = rule.targetTerms.find((term) => hasTerm(outputText, term));
    if (!matchedTarget) continue;

    // Check if any sourceAllowed term is present in sourceCv
    const isJustified = rule.sourceAllowed.some((sourceTerm) => hasTerm(safeSource, sourceTerm));

    if (!isJustified) {
      flaggedTerms.push(matchedTarget.toLowerCase());
    }
  }

  return flaggedTerms;
}
