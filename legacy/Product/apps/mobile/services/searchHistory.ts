const HISTORY_KEY = 'english_study_mate_search_history_v1';
const MAX_ITEMS = 100;

let inMemoryHistory: string[] = [];

function normalizeExpression(expression: string): string {
  return expression.trim().toLowerCase().replace(/\s+/g, ' ');
}

function hasWebStorage(): boolean {
  return typeof globalThis !== 'undefined' && typeof globalThis.localStorage !== 'undefined';
}

function readWebHistory(): string[] {
  if (!hasWebStorage()) return [];
  try {
    const raw = globalThis.localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((v) => typeof v === 'string') : [];
  } catch {
    return [];
  }
}

function writeWebHistory(list: string[]) {
  if (!hasWebStorage()) return;
  try {
    globalThis.localStorage.setItem(HISTORY_KEY, JSON.stringify(list));
  } catch {
    // Ignore write errors; UI can still use in-memory fallback.
  }
}

export async function getSearchHistory(): Promise<string[]> {
  if (hasWebStorage()) return readWebHistory();
  return inMemoryHistory;
}

export async function addSearchHistory(expression: string): Promise<void> {
  const normalized = normalizeExpression(expression);
  if (!normalized) return;

  const current = hasWebStorage() ? readWebHistory() : inMemoryHistory;
  const deduped = [normalized, ...current.filter((item) => item !== normalized)].slice(0, MAX_ITEMS);

  if (hasWebStorage()) {
    writeWebHistory(deduped);
  } else {
    inMemoryHistory = deduped;
  }
}
