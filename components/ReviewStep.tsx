import type { Line } from "@/lib/lines";
import { isReady, speedLabel, type LineResult } from "@/lib/marks";
import { MarkedLine } from "./MarkedLine";

export function ReviewStep({
  lines,
  results,
  onReadAgain,
  onEdit,
}: {
  lines: Line[];
  results: LineResult[];
  onReadAgain: () => void;
  onEdit: () => void;
}) {
  const status = isReady(results);
  const speed = speedLabel(status.wpm);
  return (
    <section className="flex flex-col gap-4">
      <div className="sticky top-0 flex flex-wrap items-center gap-x-6 gap-y-2 border-b border-line bg-background py-3">
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
      <p className="text-sm text-muted">
        Red: the listener missed it or heard another word (hover to see what). Amber: heard, but not clearly. Grey chips:
        fillers and words not in your script. ‖: a long stop inside a sentence.
      </p>
      <div>
        {lines.map((line, i) => (
          <MarkedLine key={line.index} line={line} result={results[i]} />
        ))}
      </div>
      <div className="flex gap-4">
        <button className="rounded-lg bg-accent px-5 py-2.5 text-white" onClick={onReadAgain}>
          Read again
        </button>
        <button className="text-muted underline" onClick={onEdit}>
          Edit script
        </button>
      </div>
    </section>
  );
}
