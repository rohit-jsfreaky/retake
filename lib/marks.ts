import { align, type HeardWord, type Step } from "./align.ts";
import type { Line } from "./lines.ts";

export type WordMark = { script: string; kind: "ok" | "missed" | "unclear"; heard?: string; start?: number; end?: number };
export type Insert = { afterWord: number; text: string; kind: "filler" | "added" };
export type Pause = { afterWord: number; seconds: number };
export type LineResult = { words: WordMark[]; inserts: Insert[]; pauses: Pause[]; wpm: number | null; heard: HeardWord[] };
export type ReadyStatus = {
  ready: boolean;
  missed: number;
  unclear: number;
  fillers: number;
  added: number;
  pauses: number;
  wpm: number | null;
  left: string[];
};

// Starting values from spec.md > Marker; tune on real takes.
export const UNCLEAR_BELOW = 0.65;
export const LONG_PAUSE = 1.2;
export const TOO_SLOW = 110;
export const TOO_FAST = 165;

// Deepgram's filler set (filler_words=true) plus common spoken fillers. Only marked when not in the script.
const FILLERS = new Set(["uh", "um", "mhmm", "mm-mm", "uh-uh", "uh-huh", "nuh-uh", "basically", "actually", "like", "matlab"]);
const FILLER_PHRASES = new Set(["you know", "so basically"]);

export function speedLabel(wpm: number | null): "too fast" | "too slow" | null {
  if (wpm === null) return null;
  return wpm > TOO_FAST ? "too fast" : wpm < TOO_SLOW ? "too slow" : null;
}

function wordsPerMinute(heard: HeardWord[]): number | null {
  if (heard.length < 2) return null;
  const seconds = heard[heard.length - 1].end - heard[0].start;
  return seconds > 0 ? Math.round((heard.length / seconds) * 60) : null;
}

function inScript(line: Line, text: string): boolean {
  return ` ${line.words.join(" ")} `.includes(` ${text} `);
}

// steps use script indexes local to this line.
export function markLine(line: Line, steps: Step[]): LineResult {
  const words: WordMark[] = [];
  const added: { afterWord: number; words: string[] }[] = [];
  const pauses: Pause[] = [];
  const heard: HeardWord[] = [];
  let lastWord = -1; // last script word reached so far
  let prev: HeardWord | null = null;

  for (const step of steps) {
    if (step.kind !== "missed") {
      const gap = prev ? step.heard.start - prev.end : 0;
      // A long stop at a sentence end is natural; inside a sentence it breaks the flow.
      if (gap >= LONG_PAUSE && !(lastWord >= 0 && line.endsSentence[lastWord])) {
        pauses.push({ afterWord: lastWord, seconds: Math.round(gap * 10) / 10 });
      }
      prev = step.heard;
      heard.push(step.heard);
    }

    if (step.kind === "added") {
      const group = added.at(-1);
      if (group && group.afterWord === lastWord) group.words.push(step.heard.word);
      else added.push({ afterWord: lastWord, words: [step.heard.word] });
      continue;
    }
    const script = line.words[step.script];
    if (step.kind === "missed") words.push({ script, kind: "missed" });
    else {
      const { word, start, end, confidence } = step.heard;
      if (step.kind === "swap") words.push({ script, kind: "missed", heard: word, start, end });
      else words.push({ script, kind: confidence < UNCLEAR_BELOW ? "unclear" : "ok", start, end });
    }
    lastWord = step.script;
  }

  const inserts: Insert[] = [];
  for (const group of added) {
    for (let k = 0; k < group.words.length; k++) {
      const pair = `${group.words[k]} ${group.words[k + 1]}`;
      if (FILLER_PHRASES.has(pair) && !inScript(line, pair)) {
        inserts.push({ afterWord: group.afterWord, text: pair, kind: "filler" });
        k++;
        continue;
      }
      const w = group.words[k];
      inserts.push({ afterWord: group.afterWord, text: w, kind: FILLERS.has(w) && !inScript(line, w) ? "filler" : "added" });
    }
  }
  return { words, inserts, pauses, wpm: wordsPerMinute(heard), heard };
}

// Aligns a whole take against the whole script, then gives each step to the line of its script word.
// Added words go with the line of the next script word (an "um" before a sentence belongs to it), or the last line.
export function markTake(lines: Line[], heard: HeardWord[]): LineResult[] {
  if (!lines.length) return [];
  const offsets: number[] = [];
  let total = 0;
  for (const line of lines) {
    offsets.push(total);
    total += line.words.length;
  }
  const lineOf = (scriptIndex: number) => offsets.findLastIndex((o) => o <= scriptIndex);

  const perLine: Step[][] = lines.map(() => []);
  const waiting: Step[] = [];
  for (const step of align(lines.flatMap((l) => l.words), heard)) {
    if (step.kind === "added") {
      waiting.push(step);
      continue;
    }
    const li = lineOf(step.script);
    perLine[li].push(...waiting, { ...step, script: step.script - offsets[li] });
    waiting.length = 0;
  }
  perLine[lines.length - 1].push(...waiting);
  return lines.map((line, i) => markLine(line, perLine[i]));
}

export function isReady(results: LineResult[]): ReadyStatus {
  const count = (fn: (r: LineResult) => number) => results.reduce((sum, r) => sum + fn(r), 0);
  const missed = count((r) => r.words.filter((w) => w.kind === "missed").length);
  const unclear = count((r) => r.words.filter((w) => w.kind === "unclear").length);
  const fillers = count((r) => r.inserts.filter((x) => x.kind === "filler").length);
  const added = count((r) => r.inserts.filter((x) => x.kind === "added").length);
  const pauses = count((r) => r.pauses.length);
  // Overall speed over speaking time only (line by line), so it means the same for take 1 and take 2.
  const spoken = results.filter((r) => r.heard.length >= 2);
  const seconds = spoken.reduce((sum, r) => sum + (r.heard.at(-1)!.end - r.heard[0].start), 0);
  const wpm = seconds > 0 ? Math.round((spoken.reduce((sum, r) => sum + r.heard.length, 0) / seconds) * 60) : null;

  const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;
  const left: string[] = [];
  if (missed) left.push(plural(missed, "missed word"));
  if (fillers) left.push(plural(fillers, "filler"));
  if (pauses) left.push(plural(pauses, "long pause"));
  const speed = speedLabel(wpm);
  if (speed || wpm === null) left.push(speed ?? "no speed yet");
  return { ready: left.length === 0, missed, unclear, fillers, added, pauses, wpm, left };
}
