"use client";
import type { Line } from "@/lib/lines";
import { useRecorder } from "./useRecorder";

export function ReadStep({ lines, busy, onBack, onTake, onSample }: { lines: Line[]; busy: boolean; onBack: () => void; onTake: (audio: Blob) => void; onSample: () => void }) {
  const { recording, seconds, blocked, micName, level, quiet, start, stop } = useRecorder();

  return (
    <section className="flex flex-col gap-6">
      <button className="self-start text-muted underline" onClick={onBack} disabled={recording || busy}>
        Back to script
      </button>
      <div className="flex flex-col gap-3 font-read text-2xl leading-relaxed">
        {lines.map((l) => (
          <p key={l.index}>{l.text}</p>
        ))}
      </div>
      <div className="flex items-center gap-4">
        {recording ? (
          <button className="rounded-lg bg-accent px-5 py-2.5 text-white" onClick={async () => onTake(await stop())}>
            Stop
          </button>
        ) : (
          <button className="rounded-lg bg-accent px-5 py-2.5 text-white disabled:opacity-40" onClick={start} disabled={busy}>
            Record
          </button>
        )}
        {recording && <span className="font-mono">{Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, "0")}</span>}
        {busy && <span className="text-muted">Listening back…</span>}
      </div>
      {recording && (
        <div className="flex flex-col gap-1 text-sm text-muted">
          <div className="h-2 w-64 overflow-hidden rounded-full bg-panel" aria-label="Mic level">
            <div className="h-full bg-accent transition-[width] duration-100" style={{ width: `${Math.min(100, level * 250)}%` }} />
          </div>
          <span>Mic: {micName || "default"}{quiet && " — we can't hear you. Check which mic Chrome is using (the mic icon in the address bar)."}</span>
        </div>
      )}
      {blocked && (
        <p className="text-muted">
          Retake can&apos;t use your microphone. Allow it in the address bar, then press Record again.{" "}
          <button className="text-accent underline" onClick={onSample}>
            Try the sample instead
          </button>
        </p>
      )}
    </section>
  );
}
