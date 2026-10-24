"use client";
import { MAX_WORDS, countWords, type Line } from "@/lib/lines";

export function ScriptStep({
  script,
  lines,
  onChange,
  onStart,
  onSample,
}: {
  script: string;
  lines: Line[];
  onChange: (s: string) => void;
  onStart: () => void;
  onSample: () => void;
}) {
  const words = countWords(lines);
  const tooLong = words > MAX_WORDS;
  return (
    <section className="flex flex-col gap-4">
      <h1 className="text-3xl font-semibold">Practise the exact words you have to say in English, before you say them.</h1>
      <p className="text-muted">
        For anyone recording a demo, an interview intro or a call opener in a language that isn&apos;t their first.
      </p>
      <textarea
        className="min-h-60 rounded-lg border border-line bg-panel p-4 text-lg"
        placeholder="Paste what you're going to say"
        value={script}
        onChange={(e) => onChange(e.target.value)}
      />
      <p className="text-sm text-muted">
        {lines.length} {lines.length === 1 ? "line" : "lines"} · {words} words
        {tooLong && ` — that's more than ${MAX_WORDS} words (about 4 minutes). Shorten it to start.`}
      </p>
      <button
        className="self-start rounded-lg bg-accent px-5 py-2.5 text-white disabled:opacity-40"
        disabled={!lines.length || tooLong}
        onClick={onStart}
      >
        Start reading
      </button>
      <button className="self-start text-accent underline" onClick={onSample}>
        Try the sample — a real marked take, no mic needed
      </button>
    </section>
  );
}
