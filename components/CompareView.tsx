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
    <div className="grid grid-cols-2 gap-x-8">
      <span className="text-sm font-semibold">Take 1</span>
      <span className="text-sm font-semibold">Take 2</span>
      {lines.map((line, i) => (
        <div key={line.index} className="contents">
          <MarkedLine line={line} result={take1[i]} audioUrl={take1Audio} wholeClip={false} />
          {take2[i] ? (
            <MarkedLine line={line} result={take2[i]} audioUrl={take2Audio[i] ?? null} wholeClip />
          ) : (
            <p className="border-b border-line py-4 text-muted">Same as take 1</p>
          )}
        </div>
      ))}
    </div>
  );
}
