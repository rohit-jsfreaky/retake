"use client";
import { ArrowRight, PlayCircle } from "@untitledui/icons";
import { MAX_WORDS, countWords, type Line } from "@/lib/lines";
import { AppWindow, Pill, StepHeader } from "./ui";

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
    <section className="flex flex-col gap-12">
      <StepHeader
        step="Script"
        title="Paste what you're going to say"
        sub="The exact words for your demo video, interview intro or call opener. Retake splits them into lines."
      />
      <div className="paper rounded-[32px] bg-card-blue p-6 shadow-[var(--shadow-float)] md:p-10">
        <AppWindow title="Your script">
          <textarea
            className="block min-h-[320px] w-full resize-y rounded-2xl bg-transparent p-6 font-read text-xl leading-relaxed outline-none placeholder:text-subtle"
            placeholder="Paste what you're going to say"
            value={script}
            onChange={(e) => onChange(e.target.value)}
          />
        </AppWindow>
        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center">
          <p className="text-muted">
            <span className="font-mono text-sm">
              {lines.length} {lines.length === 1 ? "line" : "lines"} · {words} words
            </span>
            {tooLong && <span className="block text-[#B42318]">That&apos;s more than {MAX_WORDS} words (about 4 minutes). Shorten it to start.</span>}
            {!lines.length && <span className="block text-sm">Paste what you&apos;re going to say to start.</span>}
          </p>
          <div className="flex gap-3 sm:ml-auto">
            <Pill variant="glass" onClick={onSample}>
              <PlayCircle size={18} /> Try the sample
            </Pill>
            <Pill disabled={!lines.length || tooLong} onClick={onStart}>
              Start reading <ArrowRight size={18} />
            </Pill>
          </div>
        </div>
      </div>
    </section>
  );
}
