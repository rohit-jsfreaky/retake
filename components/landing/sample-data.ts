import { readFileSync } from "node:fs";
import path from "node:path";
import { splitScript } from "@/lib/lines";
import { currentTake, isReady, type LineResult } from "@/lib/marks";
import { sessionFromSample, type Sample } from "@/lib/sample";

// Every example on the landing page is the real sample session (the maker's own voice), run through the same marking code.
const sample: Sample = JSON.parse(readFileSync(path.join(process.cwd(), "public/sample/sample.json"), "utf8"));

export const lines = splitScript(sample.script);
export const { take1, take2 } = sessionFromSample(sample);
export const take2Full = currentTake(take1, take2);
export const status1 = isReady(take1);
export const status2 = isReady(take2Full);
export const takeSeconds = Math.round(sample.take1.words.at(-1)?.end ?? 0);

const marked = (r: LineResult) => r.words.some((w) => w.kind !== "ok") || r.inserts.length > 0;
export const markedLines = take1.map((_, i) => i).filter((i) => marked(take1[i]));
export const retakenLine = Number(Object.keys(take2).find((i) => marked(take1[Number(i)])) ?? Object.keys(take2)[0]);
export const missedExample = take1.flatMap((r) => r.words).find((w) => w.kind === "missed" && w.heard);
export const unclearExample = take1.flatMap((r) => r.words).find((w) => w.kind === "unclear");
export const clock = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
