"use client";
import { useRecorder } from "./useRecorder";

export function ReadStep({ script, busy, onBack, onTake }: { script: string; busy: boolean; onBack: () => void; onTake: (audio: Blob) => void }) {
  const { recording, seconds, blocked, start, stop } = useRecorder();

  return (
    <section className="flex flex-col gap-6">
      <button className="self-start text-muted underline" onClick={onBack} disabled={recording || busy}>
        Back to script
      </button>
      <p className="whitespace-pre-wrap text-2xl leading-relaxed">{script}</p>
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
      {blocked && <p className="text-muted">Retake can&apos;t use your microphone. Allow it in the address bar, then press Record again.</p>}
    </section>
  );
}
