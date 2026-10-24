"use client";
import { Edit05, RefreshCw01 } from "@untitledui/icons";
import type { Line } from "@/lib/lines";
import { currentTake, type LineResult } from "@/lib/marks";
import type { View } from "./AppShell";
import { CompareView } from "./CompareView";
import { MarkedLine } from "./MarkedLine";
import { TakeSummary } from "./TakeSummary";
import { Pill } from "./ui";

export function ReviewStep({
  lines,
  take1,
  take2,
  take1Audio,
  take2Audio,
  view,
  busyLine,
  sample,
  onRetake,
  onReadAgain,
  onEdit,
  onExport,
}: {
  lines: Line[];
  take1: LineResult[];
  take2: Record<number, LineResult>;
  take1Audio: string | null;
  take2Audio: Record<number, string>;
  view: View;
  busyLine: number | null;
  sample: boolean;
  onRetake: (line: number, audio: Blob) => void;
  onReadAgain: () => void;
  onEdit: () => void;
  onExport?: () => void;
}) {
  const retakes = Object.keys(take2).length;
  const shown = view === "take1" || !retakes ? take1 : currentTake(take1, take2);
  const heard = take1.flatMap((r) => r.heard);

  return (
    <section className="flex flex-col">
      <div className="sticky top-0 z-10 border-b border-line bg-white/90 px-6 py-4 backdrop-blur-xl md:px-8">
        <TakeSummary results={shown} />
      </div>

      <div className="px-6 md:px-8">
        {view === "compare" && retakes ? (
          <CompareView lines={lines} take1={take1} take2={take2} take1Audio={take1Audio} take2Audio={take2Audio} />
        ) : (
          lines.map((line, i) => {
            const retaken = view === "take2" && Boolean(take2[i]);
            return (
              <MarkedLine
                key={line.index}
                line={line}
                result={shown[i]}
                audioUrl={retaken ? (take2Audio[i] ?? null) : take1Audio}
                wholeClip={retaken}
                label={retaken ? "Retaken" : undefined}
                busy={busyLine !== null}
                onRetake={sample ? undefined : (audio) => onRetake(i, audio)}
              />
            );
          })
        )}
      </div>

      <div className="mx-6 mb-6 mt-2 rounded-2xl bg-panel p-5 md:mx-8">
        <p className="text-sm font-medium">Your recording</p>
        {take1Audio ? (
          <audio controls src={take1Audio} className="mt-3 w-full" />
        ) : (
          <p className="mt-1 text-sm text-muted">Recordings aren&apos;t kept after a reload. The marks are.</p>
        )}
        <details className="mt-3 text-sm">
          <summary className="cursor-pointer text-muted">What the listener heard · {heard.length} words</summary>
          <p className="mt-2 font-read leading-relaxed text-muted">{heard.length ? heard.map((w) => w.word).join(" ") : "Nothing."}</p>
        </details>
        <p className="mt-4 text-xs leading-relaxed text-subtle">
          Red: missed, or heard as the word under it · Amber: heard, but not clearly · Grey chip: a filler or a word not in your
          script · ‖: a long stop inside a sentence · Click any word to hear it.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3 px-6 pb-8 md:px-8">
        {sample ? (
          <Pill onClick={onEdit}>Try it with your own script</Pill>
        ) : (
          <>
            <Pill onClick={onReadAgain}>
              <RefreshCw01 size={18} /> Read it all again
            </Pill>
            <Pill variant="ghost" onClick={onEdit}>
              <Edit05 size={18} /> Edit script
            </Pill>
          </>
        )}
        {onExport && (
          <button className="ml-auto text-sm text-subtle underline" onClick={onExport}>
            Export session as sample (dev)
          </button>
        )}
      </div>
    </section>
  );
}
