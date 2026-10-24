"use client";
import { useState } from "react";
import type { Line } from "@/lib/lines";
import { currentTake, isReady, speedLabel, type LineResult } from "@/lib/marks";
import { CompareView } from "./CompareView";
import { MarkedLine } from "./MarkedLine";

export function ReviewStep({
  lines,
  take1,
  take2,
  take1Audio,
  take2Audio,
  busyLine,
  onRetake,
  onReadAgain,
  onEdit,
}: {
  lines: Line[];
  take1: LineResult[];
  take2: Record<number, LineResult>;
  take1Audio: string | null;
  take2Audio: Record<number, string>;
  busyLine: number | null;
  onRetake: (line: number, audio: Blob) => void;
  onReadAgain: () => void;
  onEdit: () => void;
}) {
  const [view, setView] = useState<"take" | "compare">("take");
  const latest = currentTake(take1, take2);
  const status = isReady(latest);
  const speed = speedLabel(status.wpm);
  const heard = take1.flatMap((r) => r.heard);
  const retakes = Object.keys(take2).length;

  return (
    <section className="flex flex-col gap-4">
      <div className="sticky top-0 z-10 flex flex-wrap items-center gap-x-6 gap-y-2 border-b border-line bg-background py-3">
        <strong className={status.ready ? "text-accent" : ""}>
          {status.ready ? "Ready to record" : `Not yet: ${status.left.join(", ")}`}
        </strong>
        <span>Missed {status.missed}</span>
        <span>Unclear {status.unclear}</span>
        <span>Fillers {status.fillers}</span>
        <span>Added {status.added}</span>
        <span>Pauses {status.pauses}</span>
        <span className="font-mono">
          {status.wpm ?? "–"} wpm{speed && ` · ${speed}`}
        </span>
      </div>
      <div className="flex flex-col gap-2 rounded-lg border border-line bg-panel p-4">
        <span className="text-sm font-semibold">Take 1 recording</span>
        {take1Audio ? (
          <audio controls src={take1Audio} className="w-full" />
        ) : (
          <span className="text-sm text-muted">Not kept after a reload.</span>
        )}
        <span className="text-sm font-semibold">What the listener heard ({heard.length} words)</span>
        <p className="text-muted">{heard.length ? heard.map((w) => w.word).join(" ") : "Nothing."}</p>
      </div>
      <p className="text-sm text-muted">
        Red: the listener missed it or heard another word (shown under it). Amber: heard, but not clearly. Grey chips:
        fillers and words not in your script. ‖: a long stop inside a sentence. Click any word to hear it.
      </p>
      <div className="flex gap-2 text-sm">
        <button className={view === "take" ? "font-semibold underline" : "text-muted"} onClick={() => setView("take")}>
          {retakes ? "Take 2" : "Take 1"}
        </button>
        <button
          className={view === "compare" ? "font-semibold underline" : "text-muted disabled:opacity-40"}
          disabled={!retakes}
          onClick={() => setView("compare")}
        >
          Compare
        </button>
      </div>
      {view === "compare" && retakes ? (
        <CompareView lines={lines} take1={take1} take2={take2} take1Audio={take1Audio} take2Audio={take2Audio} />
      ) : (
        <div>
          {lines.map((line, i) => (
            <MarkedLine
              key={line.index}
              line={line}
              result={latest[i]}
              audioUrl={take2[i] ? (take2Audio[i] ?? null) : take1Audio}
              wholeClip={Boolean(take2[i])}
              label={take2[i] ? "Retaken" : undefined}
              busy={busyLine !== null}
              onRetake={(audio) => onRetake(i, audio)}
            />
          ))}
        </div>
      )}
      <div className="flex gap-4">
        <button className="rounded-lg bg-accent px-5 py-2.5 text-white" onClick={onReadAgain}>
          Read it all again
        </button>
        <button className="text-muted underline" onClick={onEdit}>
          Edit script
        </button>
      </div>
    </section>
  );
}
