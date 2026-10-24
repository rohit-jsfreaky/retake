import { CheckCircle } from "@untitledui/icons";
import { isReady, speedLabel, type LineResult } from "@/lib/marks";

function Count({ n, label, tone }: { n: number; label: string; tone: string }) {
  return <span className={`rounded-full px-2.5 py-1 text-xs ${n ? tone : "bg-panel text-subtle"}`}>{n} {label}</span>;
}

// The status line at the top of a marked take: Ready or what is left, then each count.
export function TakeSummary({ results }: { results: LineResult[] }) {
  const status = isReady(results);
  const speed = speedLabel(status.wpm);
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="mr-1 flex items-center gap-1.5 text-sm font-medium">
        {status.ready ? <CheckCircle size={16} className="text-[#079455]" /> : <span className="size-2 rounded-full bg-[#D92D20]" />}
        {status.ready ? "Ready to record" : `Not yet: ${status.left.join(", ")}`}
      </span>
      <Count n={status.missed} label="missed" tone="bg-[#FEE4E2] text-[#B42318]" />
      <Count n={status.unclear} label="unclear" tone="bg-[#FEF0C7] text-[#B54708]" />
      <Count n={status.fillers} label="fillers" tone="bg-[#F2F4F7] text-[#344054]" />
      <Count n={status.added} label="added" tone="bg-[#F2F4F7] text-[#344054]" />
      <Count n={status.pauses} label="pauses" tone="bg-[#F2F4F7] text-[#344054]" />
      <span className={`rounded-full px-2.5 py-1 font-mono text-xs ${speed ? "bg-[#FEF0C7] text-[#B54708]" : "bg-panel"}`}>
        {status.wpm ?? "–"} wpm{speed && ` · ${speed}`}
      </span>
    </div>
  );
}
