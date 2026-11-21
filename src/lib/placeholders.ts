export const PLACEHOLDER_REGEX = /\[(?:isi|fill in)[^\]]*\]/gi;

/**
 * Counts the number of [isi ...] or [fill in ...] placeholders in a given string.
 */
export function countPlaceholders(text?: string | null): number {
  if (!text) return 0;
  const matches = text.match(PLACEHOLDER_REGEX);
  return matches ? matches.length : 0;
}

export interface TextPart {
  text: string;
  isPlaceholder: boolean;
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
