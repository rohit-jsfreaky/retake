"use client";
import { ArrowRight } from "@untitledui/icons";
import { MAX_WORDS, countWords, type Line } from "@/lib/lines";
import { PaneHeader, Pill } from "./ui";

export function ScriptStep({ script, lines, onChange, onStart }: { script: string; lines: Line[]; onChange: (s: string) => void; onStart: () => void }) {
  const words = countWords(lines);
  const tooLong = words > MAX_WORDS;
  return (
    <section className="flex h-full flex-col gap-6 p-6 md:p-8">
      <PaneHeader title="Paste what you're going to say" sub="The exact words for your demo video, interview intro or call opener." />
      <textarea
        className="min-h-[280px] w-full flex-1 resize-none rounded-2xl border border-line bg-[#FCFCFD] p-6 font-read text-xl leading-relaxed outline-none placeholder:text-subtle focus:border-black/20"
        placeholder="Paste what you're going to say"
        value={script}
        onChange={(e) => onChange(e.target.value)}
      />
      <div className="flex flex-wrap items-center gap-4">
        <p className="text-sm text-muted">
          <span className="font-mono">
            {lines.length} {lines.length === 1 ? "line" : "lines"} · {words} words
          </span>
          {tooLong && <span className="ml-2 text-[#B42318]">More than {MAX_WORDS} words (about 4 minutes). Shorten it to start.</span>}
        </p>
        <Pill className="ml-auto" disabled={!lines.length || tooLong} onClick={onStart}>
          Start reading <ArrowRight size={18} />
        </Pill>
      </div>
    </section>
  );
}
