const ID_STOPWORDS = new Set([
  "yang", "dan", "di", "untuk", "dengan", "dalam", "pada", "dari", "adalah", "akan",
  "ini", "itu", "atau", "kami", "saya", "sebagai", "oleh", "serta", "juga", "memiliki",
  "mampu", "telah", "dapat", "sedang", "ke", "bisa", "lebih", "bagi", "tersebut", "saat",
  "mengembangkan", "melakukan", "bertugas", "proyek", "kegiatan"
]);

const EN_STOPWORDS = new Set([
  "the", "and", "of", "to", "in", "for", "with", "on", "is", "are",
  "as", "will", "our", "you", "we", "experience", "ability", "skills", "team", "work",
  "this", "that", "from", "at", "by", "have", "has", "can", "responsible", "about",
  "development", "manage", "lead", "building", "deliver"
]);

export function detectLanguage(text: string): "id" | "en" | "mixed" | "unknown" {
  if (!text || typeof text !== "string") return "unknown";

  // Tokenize into lowercase words (letters only)
  const tokens = text.toLowerCase().match(/[\p{L}]+/gu) || [];

  if (tokens.length < 20) {
    return "unknown";
  }

  let idCount = 0;
  let enCount = 0;

  for (const token of tokens) {
    if (ID_STOPWORDS.has(token)) idCount++;
    if (EN_STOPWORDS.has(token)) enCount++;
  }

  const totalMatches = idCount + enCount;
  if (totalMatches < 4) {
    return "unknown";
  }

  const idRatio = idCount / totalMatches;

  if (idRatio > 0.65) {
    return "id";
  }
  if (idRatio < 0.35) {
    return "en";
  }
  return "mixed";
}
