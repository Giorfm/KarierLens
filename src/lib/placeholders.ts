export const PLACEHOLDER_REGEX = /\[(?:isi|fill in)[^\]]*\]/gi;

/**
 * Counts the total number of [isi ...] or [fill in ...] placeholders in a given string.
 */
export function countPlaceholders(text?: string | null): number {
  if (!text) return 0;
  const matches = text.match(PLACEHOLDER_REGEX);
  return matches ? matches.length : 0;
}

/**
 * Extracts a clean hint from a placeholder tag, e.g.:
 * "[fill in number of issues]" -> "number of issues"
 * "[isi jumlah peserta]" -> "jumlah peserta"
 */
export function getPlaceholderHint(rawPlaceholder: string): string {
  return rawPlaceholder
    .replace(/^\[(?:isi|fill in)\s*/i, "")
    .replace(/\]$/, "")
    .trim();
}

/**
 * Counts how many placeholders in a given string have NOT been filled by the user.
 */
export function countUnfilledPlaceholders(
  text?: string | null,
  placeholderValues?: Record<string, string>,
  contextId?: string
): number {
  if (!text) return 0;
  const parts = splitPlaceholders(text);
  let unfilled = 0;
  let phIdx = 0;

  for (const p of parts) {
    if (p.isPlaceholder) {
      const specificKey = contextId ? `${contextId}_${phIdx}` : "";
      const val =
        (specificKey && placeholderValues?.[specificKey]) ||
        placeholderValues?.[p.text];

      if (!val || val.trim().length === 0) {
        unfilled++;
      }
      phIdx++;
    }
  }

  return unfilled;
}

/**
 * Resolves a text by replacing all placeholders with user-entered values if available.
 */
export function resolveTextPlaceholders(
  text?: string | null,
  placeholderValues?: Record<string, string>,
  contextId?: string
): string {
  if (!text) return "";
  const parts = splitPlaceholders(text);
  let phIdx = 0;

  return parts
    .map((p) => {
      if (p.isPlaceholder) {
        const specificKey = contextId ? `${contextId}_${phIdx}` : "";
        const val =
          (specificKey && placeholderValues?.[specificKey]) ||
          placeholderValues?.[p.text];

        phIdx++;
        return val && val.trim().length > 0 ? val.trim() : p.text;
      }
      return p.text;
    })
    .join("");
}

export interface TextPart {
  text: string;
  isPlaceholder: boolean;
  placeholderIndex?: number;
  hint?: string;
}

/**
 * Splits text into normal text parts and placeholder parts for easy UI rendering & highlighting.
 */
export function splitPlaceholders(text?: string | null): TextPart[] {
  if (!text) return [];

  const parts: TextPart[] = [];
  let lastIndex = 0;
  const regex = new RegExp(PLACEHOLDER_REGEX.source, "gi");
  let match: RegExpExecArray | null;
  let phIndex = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({
        text: text.slice(lastIndex, match.index),
        isPlaceholder: false,
      });
    }
    parts.push({
      text: match[0],
      isPlaceholder: true,
      placeholderIndex: phIndex++,
      hint: getPlaceholderHint(match[0]),
    });
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push({
      text: text.slice(lastIndex),
      isPlaceholder: false,
    });
  }

  return parts;
}
