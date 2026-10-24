import type { Line } from "@/lib/lines";
import type { LineResult } from "@/lib/marks";
import { MarkedLine } from "./MarkedLine";

export function CompareView({
  lines,
  take1,
  take2,
  take1Audio,
  take2Audio,
}: {
  lines: Line[];
  take1: LineResult[];
  take2: Record<number, LineResult>;
  take1Audio: string | null;
  take2Audio: Record<number, string>;
}) {
  return (
    <div className="flex flex-col">
      <div className="grid grid-cols-2 gap-8 pt-4 text-sm font-medium text-muted">
        <span>TAKE 1</span>
        <span>TAKE 2</span>
      </div>
      {lines.map((line, i) => (
        // The row draws the divider, so the two sides line up.
        <div key={line.index} className="grid grid-cols-2 gap-8 border-b border-line last:border-b-0 [&>div]:border-b-0">
          <MarkedLine line={line} result={take1[i]} audioUrl={take1Audio} wholeClip={false} />
          {take2[i] ? (
            <MarkedLine line={line} result={take2[i]} audioUrl={take2Audio[i] ?? null} wholeClip />
          ) : (
            <p className="self-center py-5 text-subtle">Same as take 1</p>
          )}
        </div>
      ))}
    </div>
  );
}
