"use client";
import { Microphone01 } from "@untitledui/icons";
import type { Line } from "@/lib/lines";
import { PaneHeader, Pill } from "./ui";
import { useRecorder } from "./useRecorder";

export function ReadStep({ lines, busy, onTake, onSample }: { lines: Line[]; busy: boolean; onTake: (audio: Blob) => void; onSample: () => void }) {
  const { recording, seconds, blocked, micName, level, quiet, start, stop } = useRecorder();
  const clock = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;

  return (
    <section className="flex min-h-full flex-col gap-6 p-6 md:p-8">
      <PaneHeader title="Read it out loud, once" sub="Read the whole script the way you will on the day, then press stop." />
      <div className="flex flex-1 flex-col gap-5 py-4 font-read text-[26px] leading-[1.6]">
        {lines.map((l) => (
          <p key={l.index}>{l.text}</p>
        ))}
      </div>

      {blocked && (
        <div role="alert" className="flex flex-wrap items-center gap-4 rounded-2xl bg-[#FEF3F2] p-4">
          <p className="flex-1">Retake can&apos;t use your microphone. Allow it in the address bar, then press Record again.</p>
          <Pill variant="glass" size="sm" onClick={onSample}>
            Try the sample instead
          </Pill>
        </div>
      )}

      {/* Controls stay at the bottom of the pane so the script stays readable while recording. */}
      <div className="sticky bottom-4 flex flex-wrap items-center gap-4 rounded-full border border-line bg-white/90 p-2 pl-2 shadow-[var(--shadow-float)] backdrop-blur-xl">
        {recording ? (
          <Pill variant="danger" onClick={async () => onTake(await stop())}>
            <span className="size-2.5 rounded-sm bg-white" /> Stop
          </Pill>
        ) : (
          <Pill onClick={start} disabled={busy}>
            <Microphone01 size={18} /> {busy ? "Listening back…" : "Record"}
          </Pill>
        )}
        {recording ? (
          <div className="flex min-w-0 flex-1 flex-col gap-1 pr-3">
            <div className="flex items-center gap-3">
              <span className="font-mono text-sm">{clock}</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-panel" aria-label="Mic level">
                <div className="h-full rounded-full bg-accent transition-[width] duration-100" style={{ width: `${Math.min(100, level * 250)}%` }} />
              </div>
            </div>
            <span className={`truncate text-xs ${quiet ? "text-[#B42318]" : "text-subtle"}`}>
              {quiet ? "We can't hear you. Check which mic Chrome is using (the mic icon in the address bar)." : `Mic: ${micName || "default"}`}
            </span>
          </div>
        ) : (
          <span className="pr-3 text-sm text-subtle">{busy ? "Checking what a listener would hear…" : "Chrome will ask for your mic the first time."}</span>
        )}
      </div>
    </section>
  );
}
