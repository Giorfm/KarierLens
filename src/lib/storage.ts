import type { PersistedSession } from "@/types/karierlens";

const STORAGE_KEY = "karierlens:v2";

export function loadSession(): PersistedSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.v === 2) {
      return parsed as PersistedSession;
    }
    // Schema mismatch, remove legacy
    localStorage.removeItem(STORAGE_KEY);
    return null;
  } catch (err) {
    console.error("Gagal membaca session dari localStorage:", err);
    return null;
  }
}

export function saveSession(session: Omit<PersistedSession, "v">): void {
  if (typeof window === "undefined") return;
  try {
    const data: PersistedSession = {
      v: 2,
      ...session,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error("Gagal menyimpan session ke localStorage:", err);
  }
}

export function clearSession(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error("Gagal menghapus session dari localStorage:", err);
  }
}
