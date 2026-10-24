import { normalise } from "./lines.ts";

export type HeardWord = { word: string; start: number; end: number; confidence: number; punctuated_word?: string };

export type Step =
  | { kind: "match" | "swap"; script: number; heard: HeardWord }
  | { kind: "missed"; script: number }
  | { kind: "added"; heard: HeardWord };

// Word-level edit distance: cost[i][j] = cheapest way to turn the first i script words into the first j heard words.
export function align(scriptWords: string[], heard: HeardWord[]): Step[] {
  const said = heard.map((h) => normalise(h.word));
  const n = scriptWords.length;
  const m = said.length;
  const cost = Array.from({ length: n + 1 }, (_, i) => Array.from({ length: m + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)));
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      const same = scriptWords[i - 1] === said[j - 1] ? 0 : 1;
      cost[i][j] = Math.min(cost[i - 1][j - 1] + same, cost[i - 1][j] + 1, cost[i][j - 1] + 1);
    }
  }

  // Walk back from the bottom-right corner, preferring keep/swap, then missed, then added.
  const steps: Step[] = [];
  let i = n;
  let j = m;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && cost[i][j] === cost[i - 1][j - 1] + (scriptWords[i - 1] === said[j - 1] ? 0 : 1)) {
      steps.push({ kind: scriptWords[i - 1] === said[j - 1] ? "match" : "swap", script: i - 1, heard: heard[j - 1] });
      i--;
      j--;
    } else if (i > 0 && cost[i][j] === cost[i - 1][j] + 1) {
      steps.push({ kind: "missed", script: i - 1 });
      i--;
    } else {
      steps.push({ kind: "added", heard: heard[j - 1] });
      j--;
    }
  }
  return steps.reverse();
}
