import type { Line } from "@/lib/lines";
import { speedLabel, type LineResult, type WordMark } from "@/lib/marks";

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

export function MarkedLine({ line, result }: { line: Line; result: LineResult }) {
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

  const speed = speedLabel(result.wpm);
  return (
    <div className="flex flex-col gap-2 border-b border-line py-4">
      <p className="text-2xl leading-loose">
        {between(-1)}
        {groups.map((g) => {
          const marks = g.map((i) => result.words[i]);
          const kind = marks.some((m) => m.kind === "missed") ? "missed" : marks.some((m) => m.kind === "unclear") ? "unclear" : "ok";
          return (
            <span key={g[0]}>
              <span className={WORD_STYLE[kind]} title={wordTitle(marks)}>
                {line.shown[g[0]]}
              </span>
              {between(g.at(-1)!)}{" "}
            </span>
          );
        })}
      </p>
      {result.wpm !== null && (
        <span className="self-start rounded border border-line px-2 py-0.5 font-mono text-xs text-muted">
          {result.wpm} wpm{speed && ` · ${speed}`}
        </span>
      )}
    </div>
  );
}
