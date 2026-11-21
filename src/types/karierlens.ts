export type TaskName = "score" | "rewrite" | "interview";
export type Lang = "id" | "en";
export type ReadinessStatus = "Perlu Banyak Perbaikan" | "Cukup Kompetitif" | "Sangat Siap";

/* ---------- Task: score ---------- */
export interface JdKeyword {
  keyword: string;            // 1–3 kata, mis. "user research"
  keywordAlt?: string;        // padanan Indonesia <-> Inggris
  importance: 1 | 2 | 3;      // 3 = wajib, 2 = penting, 1 = nilai tambah
  foundInCv: boolean;         // penilaian semantik LLM
}
export interface ScoreResult {
  targetRole: string;
  executiveVerdict: string;   // 2–3 kalimat objektif, tanpa angka skor
  jdKeywords: JdKeyword[];    // 10–14 item
}

/* ---------- Task: rewrite ---------- */
export type RewriteCategory =
  | "Organisasi / Kepanitiaan"
  | "Proyek Kuliah"
  | "Pengalaman Kerja / Magang"
  | "Lainnya";

export interface RewriteItem {
  id: string;                 // "r1", "r2", ...
  category: RewriteCategory;
  roleContext: string;        // mis. "Koordinator Divisi Acara — Seminar Tech HIMA SI"
  before: string;             // kalimat asli dari CV
  after: string;              // 1 bullet ≤ 30 kata, placeholder [isi ...] bila angka belum ada
  improvementReason: string;  // ≤ 20 kata
  translationNote?: string;   // Bahasa Indonesia, ≤ 20 kata, boleh kosong
  keywordsAdded: string[];    // kata kunci JD yang benar-benar tercermin
}
export interface CleanCvExperience {
  title: string;
  organization: string;
  period: string;             // dari CV, atau "[isi periode]"
  bullets: string[];          // ≤ 3
}
export interface CleanCvSection {
  fullName: string;           // dari CV, atau "[isi nama lengkap]"
  headline: string;
  summary: string;            // 2 kalimat
  skills: string[];           // ≤ 12, hanya yang ada/tersirat jelas di CV
  experiences: CleanCvExperience[];
  education: string;
}
export interface RewriteResult {
  rewrites: RewriteItem[];    // 3–4 item
  cleanCv: CleanCvSection;    // TIDAK memuat kontak; kontak diisi klien dari ekstraksi lokal
}

/* ---------- Task: interview ---------- */
export interface StarGuide {
  situation: string;
  task: string;
  action: string;
  result: string;
}
export interface InterviewQuestion {
  id: string;                 // "q1".."q5"
  question: string;
  hrFocus: string;
  starGuide: StarGuide;
}
export interface InterviewResult {
  interviewQuestions: InterviewQuestion[];
} // target tepat 5

/* ---------- Gabungan ---------- */
export interface AnalysisResult {
  score: ScoreResult;
  rewrite: RewriteResult;
  interview: InterviewResult;
}
export interface ComputedScores {
  initial: number;            // 0–100, dari kode
  projected: number | null;   // null sampai task rewrite selesai
  status: ReadinessStatus;    // diturunkan dari `initial`
  matched: string[];          // kata kunci yang sudah ada (awal)
  missing: string[];          // kata kunci yang belum ada (awal), urut importance desc
  newlyCovered: string[];     // kata kunci yang tertutup oleh revisi
}

/* ---------- API ---------- */
export type ApiErrorCode =
  | "VALIDATION" | "NO_API_KEY" | "RATE_LIMIT"
  | "UPSTREAM" | "TIMEOUT" | "BAD_JSON";
export interface AnalyzeRequest {
  task: TaskName;
  cvText: string;             // sudah dimasking oleh klien bila opsi aktif
  jobDescription: string;
  language: Lang;
}
export type AnalyzeResponse<T> =
  | { ok: true; data: T; meta: { model: string; ms: number; usage?: { prompt: number; completion: number } } }
  | { ok: false; code: ApiErrorCode; message: string };   // message dalam Bahasa Indonesia, ramah pengguna

/* ---------- Preset & sesi ---------- */
export interface PresetProfile {
  id: string;
  label: string;
  description: string;
  cvText: string;             // berisi data pribadi FIKTIF (email/telepon contoh) agar masking bisa didemokan
  jobDescription: string;
  fallbackResult: AnalysisResult;
}
export interface PersistedSession {
  v: 2;
  cvText: string;
  jobDescription: string;
  language: Lang;
  maskPii: boolean;
  activeTab: "score" | "rewrite" | "interview" | "print";
  liveResult: Partial<AnalysisResult>;   // hanya hasil dari AI sungguhan; hasil simulasi TIDAK disimpan
  placeholderValues?: Record<string, string>;
}
