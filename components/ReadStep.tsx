"use client";
import { ArrowLeft, Microphone01 } from "@untitledui/icons";
import type { Line } from "@/lib/lines";
import { AppWindow, Pill, StepHeader } from "./ui";
import { useRecorder } from "./useRecorder";

export function ReadStep({ lines, busy, onBack, onTake, onSample }: { lines: Line[]; busy: boolean; onBack: () => void; onTake: (audio: Blob) => void; onSample: () => void }) {
  const { recording, seconds, blocked, micName, level, quiet, start, stop } = useRecorder();
  const clock = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;

  return (
    <section className="flex flex-col gap-12">
      <StepHeader
        step="Read"
        title="Read it out loud, once"
        sub="Press record and read the whole script the way you will on the day. Then press stop."
      />
      <AppWindow
        title={recording ? `Recording · ${clock}` : busy ? "Listening back…" : "Teleprompter"}
        right={recording ? <span className="size-3 animate-pulse rounded-full bg-[#D92D20]" aria-label="Recording" /> : null}
      >
        <div className="flex flex-col gap-5 px-8 py-10 font-read text-[26px] leading-[1.6] md:px-14">
          {lines.map((l) => (
            <p key={l.index}>{l.text}</p>
          ))}
        </div>
      </AppWindow>

      {/* Controls float at the bottom so the script stays readable while recording. */}
      <div className="sticky bottom-6 z-20 mx-auto flex w-full max-w-[640px] flex-wrap items-center gap-4 rounded-full bg-white/85 p-2 pl-3 shadow-[var(--shadow-float)] backdrop-blur-xl">
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
          <div className="flex min-w-0 flex-1 flex-col gap-1">
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
          <Pill variant="ghost" size="sm" className="ml-auto" onClick={onBack} disabled={busy}>
            <ArrowLeft size={16} /> Back to script
          </Pill>
        )}
      </div>

      {blocked && (
        <div role="alert" className="mx-auto flex max-w-[640px] flex-wrap items-center gap-4 rounded-2xl bg-[#FEF3F2] p-5">
          <p className="flex-1">Retake can&apos;t use your microphone. Allow it in the address bar, then press Record again.</p>
          <Pill variant="glass" size="sm" onClick={onSample}>
            Try the sample instead
          </Pill>
        </div>
      )}
    </section>
  );
}
