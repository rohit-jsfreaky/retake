import type { LineResult } from "./marks.ts";

// Script and marks only; audio stays in memory for this visit.
export type Saved = { script: string; take1: LineResult[] | null; take2: Record<number, LineResult> };

const KEY = "retake:v1";

// Storage can be missing or blocked (private window, previews); the app works without it.
export function load(): Saved | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function save(saved: Saved) {
  try {
    localStorage.setItem(KEY, JSON.stringify(saved));
  } catch {}
}
