import { CAMPUS_GLOSSARY, type GlossaryEntry, type GlossaryHit } from "@/data/glossary";

interface PatternItem {
  pattern: string;
  entry: GlossaryEntry;
  isCaseSensitive: boolean;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Builds sorted flat list of patterns (longest first to avoid greedy collision)
 */
function getSortedPatterns(): PatternItem[] {
  const items: PatternItem[] = [];

  for (const entry of CAMPUS_GLOSSARY) {
    for (const pat of entry.patterns) {
      // Special rule for "LO": only match capital "LO" exactly
      const isCaseSensitive = pat === "LO";
      items.push({
        pattern: pat,
        entry,
        isCaseSensitive,
      });
    }
  }

  // Sort by pattern length descending
  items.sort((a, b) => b.pattern.length - a.pattern.length);
  return items;
}

const SORTED_PATTERNS = getSortedPatterns();

export function detectGlossary(text: string): GlossaryHit[] {
  if (!text || typeof text !== "string") return [];

  // Track matched intervals to prevent sub-string overlap (e.g. "BEM Fakultas" matching "BEM")
  const occupiedIntervals: Array<{ start: number; end: number }> = [];

  const isOccupied = (start: number, end: number) => {
    return occupiedIntervals.some(
      (int) => (start >= int.start && start < int.end) || (end > int.start && end <= int.end)
    );
  };

  const hitsMap = new Map<
    string,
    { entry: GlossaryEntry; matched: string; count: number; firstPos: number }
  >();

  for (const { pattern, entry, isCaseSensitive } of SORTED_PATTERNS) {
    const escaped = escapeRegex(pattern);
    // Unicode-aware word boundary
    const regex = new RegExp(`(?<![\\p{L}\\p{N}])${escaped}(?![\\p{L}\\p{N}])`, isCaseSensitive ? "u" : "iu");

    let match: RegExpExecArray | null;
    const globalRegex = new RegExp(regex.source, regex.flags.includes("g") ? regex.flags : regex.flags + "g");

    while ((match = globalRegex.exec(text)) !== null) {
      const start = match.index;
      const end = start + match[0].length;

      if (!isOccupied(start, end)) {
        occupiedIntervals.push({ start, end });

        const existing = hitsMap.get(entry.id);
        if (existing) {
          existing.count++;
        } else {
          hitsMap.set(entry.id, {
            entry,
            matched: match[0],
            count: 1,
            firstPos: start,
          });
        }
      }
    }
  }

  // Sort by first position in text and limit to 20 hits
  const results = Array.from(hitsMap.values())
    .sort((a, b) => a.firstPos - b.firstPos)
    .slice(0, 20)
    .map(({ entry, matched, count }) => ({ entry, matched, count }));

  return results;
}

export interface GlossaryComplianceResult {
  hit: GlossaryHit;
  status: "Dipakai" | "Belum terlihat di hasil";
}

/**
 * Checks whether detected glossary hits appear in the English rewrites/cleanCv output text.
 * (Section 3.5.2)
 */
export function checkGlossaryCompliance(
  hits: GlossaryHit[],
  outputText: string
): GlossaryComplianceResult[] {
  if (!outputText) {
    return hits.map((hit) => ({ hit, status: "Belum terlihat di hasil" }));
  }

  const lowerOutput = outputText.toLowerCase();

  return hits.map((hit) => {
    const candidates = [hit.entry.en, ...(hit.entry.enAlternatives || [])];
    const isUsed = candidates.some((cand) => {
      const escaped = escapeRegex(cand.toLowerCase());
      const regex = new RegExp(`(?<![\\p{L}\\p{N}])${escaped}(?![\\p{L}\\p{N}])`, "iu");
      return regex.test(lowerOutput);
    });

    return {
      hit,
      status: isUsed ? "Dipakai" : "Belum terlihat di hasil",
    };
  });
}
