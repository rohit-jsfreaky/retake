export type Line = {
  index: number;
  text: string;
  words: string[]; // normalised words used for comparing
  shown: string[]; // what to display for each word; "" = part of the previous word ("200" -> "two hundred")
  endsSentence: boolean[];
};

export const MAX_WORDS = 600;

export function normalise(word: string): string {
  return word.toLowerCase().replace(/[’‘]/g, "'").replace(/[^a-z0-9']/g, "").replace(/^'+|'+$/g, "");
}

const ONES = "zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen".split(" ");
const TENS = "_ _ twenty thirty forty fifty sixty seventy eighty ninety".split(" ");

// Deepgram returns spoken numbers as words when smart_format is off, so "200" must compare as "two hundred".
// shortcut: years ("2026" said "twenty twenty six") and decimals still won't match, fine for the POC.
export function sayNumber(n: number): string[] {
  if (n < 20) return [ONES[n]];
  if (n < 100) return n % 10 ? [TENS[Math.floor(n / 10)], ONES[n % 10]] : [TENS[n / 10]];
  if (n < 1000) return [ONES[Math.floor(n / 100)], "hundred", ...(n % 100 ? sayNumber(n % 100) : [])];
  return [...sayNumber(Math.floor(n / 1000)), "thousand", ...(n % 1000 ? sayNumber(n % 1000) : [])];
}

function compareWords(token: string): string[] {
  const num = token.replace(/[.,!?;:"')\]]+$/, "").match(/^(\$?)(\d{1,3}(?:,\d{3})+|\d+)(%?)$/);
  if (num) {
    const n = Number(num[2].replace(/,/g, ""));
    if (n < 1_000_000) return [...sayNumber(n), ...(num[1] ? ["dollars"] : []), ...(num[3] ? ["percent"] : [])];
  }
  const word = normalise(token);
  return word ? [word] : [];
}

export function splitScript(text: string): Line[] {
  const sentences = text
    .split(/\n\s*\n/)
    .flatMap((para) => para.replace(/\s+/g, " ").match(/[^.!?]+[.!?]+["')\]]*|[^.!?]+$/g) ?? [])
    .map((s) => s.trim())
    .filter(Boolean);

  const lines: Line[] = [];
  for (const sentence of sentences) {
    const line: Line = { index: lines.length, text: sentence, words: [], shown: [], endsSentence: [] };
    for (const token of sentence.split(" ")) {
      const words = compareWords(token);
      words.forEach((w, i) => {
        line.words.push(w);
        line.shown.push(i === 0 ? token : "");
        line.endsSentence.push(false);
      });
      if (words.length && /[.!?]["')\]]*$/.test(token)) line.endsSentence[line.endsSentence.length - 1] = true;
    }
    if (!line.words.length) continue;
    line.endsSentence[line.endsSentence.length - 1] = true;
    lines.push(line);
  }
  return lines;
}

export function countWords(lines: Line[]): number {
  return lines.reduce((sum, l) => sum + l.words.length, 0);
}
