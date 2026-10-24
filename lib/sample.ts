import { align, type HeardWord } from "./align.ts";
import { splitScript } from "./lines.ts";
import { markLine, markTake, type LineResult } from "./marks.ts";

// A real recorded session: Deepgram's words + the audio, so the sample runs through the same align + marks code.
type Clip = { words: HeardWord[]; audio: string }; // audio = data URL
export type Sample = { script: string; take1: Clip; retakes: Record<number, Clip> };

export function sessionFromSample(sample: Sample) {
  const lines = splitScript(sample.script);
  const take1 = markTake(lines, sample.take1.words);
  const take2: Record<number, LineResult> = {};
  const take2Audio: Record<number, string> = {};
  for (const [key, clip] of Object.entries(sample.retakes)) {
    const i = Number(key);
    take2[i] = markLine(lines[i], align(lines[i].words, clip.words), take1[i].restAfter);
    take2Audio[i] = clip.audio;
  }
  return { take1, take2, take1Audio: sample.take1.audio, take2Audio };
}

async function dataUrl(url: string): Promise<string> {
  const blob = await (await fetch(url)).blob();
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
  });
}

// Dev only: saves the current session as sample.json, to be placed at public/sample/sample.json.
export async function exportSample(
  script: string,
  take1: LineResult[],
  take2: Record<number, LineResult>,
  take1Audio: string,
  take2Audio: Record<number, string>,
) {
  const sample: Sample = { script, take1: { words: take1.flatMap((r) => r.heard), audio: await dataUrl(take1Audio) }, retakes: {} };
  for (const [key, result] of Object.entries(take2)) {
    sample.retakes[Number(key)] = { words: result.heard, audio: await dataUrl(take2Audio[Number(key)]) };
  }
  const link = document.createElement("a");
  link.href = URL.createObjectURL(new Blob([JSON.stringify(sample)], { type: "application/json" }));
  link.download = "sample.json";
  link.click();
}
