"use client";
import { useState } from "react";
import { CheckCircle, Edit05, RefreshCw01 } from "@untitledui/icons";
import type { Line } from "@/lib/lines";
import { currentTake, isReady, speedLabel, type LineResult } from "@/lib/marks";
import { CompareView } from "./CompareView";
import { MarkedLine } from "./MarkedLine";
import { AppWindow, Card, Pill, StepHeader } from "./ui";

function Count({ n, label, tone }: { n: number; label: string; tone: string }) {
  return (
    <span className={`rounded-full px-3 py-1 text-sm ${n ? tone : "bg-panel text-subtle"}`}>
      {n} {label}
    </span>
  );
}

export function ReviewStep({
  lines,
  take1,
  take2,
  take1Audio,
  take2Audio,
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
  busyLine: number | null;
  onRetake: (line: number, audio: Blob) => void;
  onReadAgain: () => void;
  onEdit: () => void;
  sample: boolean;
  onExport?: () => void;
}) {
  const [view, setView] = useState<"take" | "compare">("take");
  const latest = currentTake(take1, take2);
  const status = isReady(latest);
  const speed = speedLabel(status.wpm);
  const heard = take1.flatMap((r) => r.heard);
  const retakes = Object.keys(take2).length;

  return (
    <section className="flex flex-col gap-10">
      <StepHeader
        step="Review"
        title={sample ? "A real take, marked" : status.ready ? "Ready to record" : "What a listener would miss"}
        sub={
          sample
            ? `The maker's own voice: take 1${retakes ? `, then ${retakes} retaken ${retakes === 1 ? "line" : "lines"}` : ""}. Everything here is the real listener result for these recordings.`
            : "Red words were missed or heard as something else. Retake only those lines, then compare."
        }
      />

      <div className="sticky top-[84px] z-30 mx-auto flex w-full flex-wrap items-center gap-2 rounded-full bg-white/90 p-2 pl-4 shadow-[var(--shadow-float)] backdrop-blur-xl">
        <strong className="mr-2 flex items-center gap-2 font-medium">
          {status.ready ? <CheckCircle size={18} className="text-[#079455]" /> : <span className="size-2 rounded-full bg-[#D92D20]" />}
          {status.ready ? "Ready to record" : `Not yet: ${status.left.join(", ")}`}
        </strong>
        <span className="flex flex-wrap gap-2 sm:ml-auto">
          <Count n={status.missed} label="missed" tone="bg-[#FEE4E2] text-[#B42318]" />
          <Count n={status.unclear} label="unclear" tone="bg-[#FEF0C7] text-[#B54708]" />
          <Count n={status.fillers} label="fillers" tone="bg-[#F2F4F7] text-[#344054]" />
          <Count n={status.pauses} label="pauses" tone="bg-[#F2F4F7] text-[#344054]" />
          <span className={`rounded-full px-3 py-1 font-mono text-sm ${speed ? "bg-[#FEF0C7] text-[#B54708]" : "bg-panel"}`}>
            {status.wpm ?? "–"} wpm{speed && ` · ${speed}`}
          </span>
        </span>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_320px]">
        <AppWindow
          title={view === "compare" ? "Take 1 · Take 2" : retakes ? "Take 2" : "Take 1"}
          right={
            <span className="flex rounded-full bg-black/5 p-0.5 text-[13px]">
              <button className={`rounded-full px-3 py-1 ${view === "take" ? "bg-white shadow-sm" : "text-muted"}`} onClick={() => setView("take")}>
                Marked
              </button>
              <button
                className={`rounded-full px-3 py-1 disabled:opacity-40 ${view === "compare" ? "bg-white shadow-sm" : "text-muted"}`}
                disabled={!retakes}
                onClick={() => setView("compare")}
              >
                Compare
              </button>
            </span>
          }
        >
          <div className="px-6 py-2 md:px-8">
            {view === "compare" && retakes ? (
              <CompareView lines={lines} take1={take1} take2={take2} take1Audio={take1Audio} take2Audio={take2Audio} />
            ) : (
              lines.map((line, i) => (
                <MarkedLine
                  key={line.index}
                  line={line}
                  result={latest[i]}
                  audioUrl={take2[i] ? (take2Audio[i] ?? null) : take1Audio}
                  wholeClip={Boolean(take2[i])}
                  label={take2[i] ? "Retaken" : undefined}
                  busy={busyLine !== null}
                  onRetake={sample ? undefined : (audio) => onRetake(i, audio)}
                />
              ))
            )}
          </div>
        </AppWindow>

        <aside className="flex flex-col gap-6 lg:sticky lg:top-[160px]">
          <Card className="p-6">
            <h3 className="font-serif text-2xl tracking-[-0.02em]">Your recording</h3>
            {take1Audio ? (
              <audio controls src={take1Audio} className="mt-4 w-full" />
            ) : (
              <p className="mt-2 text-sm text-muted">Recordings aren&apos;t kept after a reload. The marks are.</p>
            )}
            <h4 className="mt-6 text-sm font-medium text-muted">What the listener heard · {heard.length} words</h4>
            <p className="mt-2 max-h-48 overflow-auto font-read leading-relaxed text-muted">
              {heard.length ? heard.map((w) => w.word).join(" ") : "Nothing."}
            </p>
          </Card>
          <Card className="p-6 text-sm">
            <h3 className="font-serif text-2xl tracking-[-0.02em]">How to read it</h3>
            <ul className="mt-4 space-y-3 text-muted">
              <li><span className="rounded bg-[#FEE4E2] px-1 text-[#D92D20] underline decoration-2 underline-offset-2">Red</span> missed, or heard as the word under it</li>
              <li><span className="rounded bg-[#FEF0C7] px-1 underline decoration-[#B54708] decoration-dotted decoration-2 underline-offset-2">Amber</span> heard, but not clearly</li>
              <li><span className="rounded-full bg-[#F2F4F7] px-2 py-0.5 text-[#344054]">chip</span> a filler or a word not in your script</li>
              <li><span className="font-mono">‖ 1.5 s</span> a long stop inside a sentence</li>
              <li>Click any word to hear it.</li>
            </ul>
          </Card>
        </aside>
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        {sample ? (
          <Pill onClick={onEdit}>Try it with your own script</Pill>
        ) : (
          <>
            <Pill onClick={onReadAgain}>
              <RefreshCw01 size={18} /> Read it all again
            </Pill>
            <Pill variant="glass" onClick={onEdit}>
              <Edit05 size={18} /> Edit script
            </Pill>
          </>
        )}
      </div>
      {onExport && (
        <button className="mx-auto text-sm text-subtle underline" onClick={onExport}>
          Export session as sample (dev)
        </button>
      )}
    </section>
  );
}
