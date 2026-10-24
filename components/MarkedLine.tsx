"use client";
import type { Line } from "@/lib/lines";
import { lineSpeedLabel, type LineResult, type WordMark } from "@/lib/marks";
import { playClip } from "@/lib/play";
import { useRecorder } from "./useRecorder";

const WORD_STYLE: Record<WordMark["kind"], string> = {
  ok: "",
  missed: "rounded bg-[#FEE4E2] px-0.5 text-[#D92D20] underline decoration-[#D92D20] decoration-2 underline-offset-4",
  unclear: "rounded bg-[#FEF0C7] px-0.5 underline decoration-[#B54708] decoration-dotted decoration-2 underline-offset-4",
};

function wordTitle(marks: WordMark[]): string | undefined {
  const missed = marks.filter((m) => m.kind === "missed");
  if (missed.length) {
    const heard = missed.map((m) => m.heard).filter(Boolean);
    return heard.length ? `Heard: ${heard.join(" ")}` : "Not heard";
  }
  return marks.some((m) => m.kind === "unclear") ? "Heard, but not clearly" : undefined;
}

export function MarkedLine({
  line,
  result,
  audioUrl,
  wholeClip,
  label,
  busy,
  onRetake,
}: {
  line: Line;
  result: LineResult;
  audioUrl: string | null; // the take this line's word times point into
  wholeClip: boolean; // a retake clip holds only this line
  label?: string;
  busy?: boolean;
  onRetake?: (audio: Blob) => void;
}) {
  const recorder = useRecorder();
  // One shown word can stand for several compared words ("$200" -> "two hundred dollars").
  const groups: number[][] = [];
  line.shown.forEach((s, i) => (s || !groups.length ? groups.push([i]) : groups.at(-1)!.push(i)));

  const between = (k: number) => [
    ...result.pauses
      .filter((p) => p.afterWord === k)
      .map((p) => (
        <span key={`p${k}`} className="mx-1 font-mono text-sm text-muted" title="Long pause">
          ‖ {p.seconds.toFixed(1)} s
        </span>
      )),
    ...result.inserts
      .filter((x) => x.afterWord === k)
      .map((x, n) => (
        <span
          key={`i${k}-${n}`}
          className="mx-1 rounded-full bg-[#F2F4F7] px-2 py-0.5 text-base text-[#344054]"
          title={x.kind === "filler" ? "Filler" : "Not in your script"}
        >
          {x.text}
        </span>
      )),
  ];

  const first = result.heard[0];
  const last = result.heard.at(-1);
  function playLine() {
    if (!audioUrl) return;
    if (wholeClip) playClip(audioUrl);
    else if (first && last) playClip(audioUrl, first.start - 0.15, last.end + 0.25);
  }

  const speed = lineSpeedLabel(result);
  const marked = result.words.some((w) => w.kind !== "ok") || result.inserts.length > 0 || result.pauses.length > 0;
  return (
    <div className="flex flex-col gap-2 border-b border-line py-4">
      {label && <span className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</span>}
      <p className="text-2xl leading-[2.4]">
        {between(-1)}
        {groups.map((g) => {
          const marks = g.map((i) => result.words[i]);
          const kind = marks.some((m) => m.kind === "missed") ? "missed" : marks.some((m) => m.kind === "unclear") ? "unclear" : "ok";
          const timed = marks.filter((m) => m.start !== undefined);
          const heardAs = marks.map((m) => m.heard).filter(Boolean).join(" ");
          const word = (
            <span className={WORD_STYLE[kind]} title={wordTitle(marks)}>
              {line.shown[g[0]]}
            </span>
          );
          return (
            <span key={g[0]}>
              <ruby className="[ruby-position:under]">
                {audioUrl && timed.length ? (
                  // Click a word to hear exactly what the listener heard.
                  <button type="button" className="cursor-pointer" onClick={() => playClip(audioUrl, timed[0].start! - 0.3, timed.at(-1)!.end! + 0.3)}>
                    {word}
                  </button>
                ) : (
                  word
                )}
                <rt className="text-sm text-[#D92D20]">{heardAs}</rt>
              </ruby>
              {between(g.at(-1)!)}{" "}
            </span>
          );
        })}
      </p>
      <div className="flex flex-wrap items-center gap-3 text-sm">
        {result.wpm !== null && (
          <span className="rounded border border-line px-2 py-0.5 font-mono text-xs text-muted">
            {result.wpm} wpm{speed && ` · ${speed}`}
          </span>
        )}
        {audioUrl && first && (
          <button className="text-accent underline" onClick={playLine}>
            Play
          </button>
        )}
        {onRetake &&
          (recorder.recording ? (
            <button className="rounded bg-accent px-3 py-1 text-white" onClick={async () => onRetake(await recorder.stop())}>
              Stop · {recorder.seconds}s
            </button>
          ) : (
            <button
              className={marked ? "rounded bg-accent px-3 py-1 text-white disabled:opacity-40" : "text-muted underline disabled:opacity-40"}
              disabled={busy}
              onClick={recorder.start}
            >
              {busy ? "Listening back…" : "Retake line"}
            </button>
          ))}
        {recorder.blocked && <span className="text-muted">Retake can&apos;t use your microphone. Allow it in the address bar.</span>}
      </div>
    </div>
  );
}
