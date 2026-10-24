"use client";
import { useMemo, useState } from "react";
import { ScriptStep } from "@/components/ScriptStep";
import { ReadStep } from "@/components/ReadStep";
import { ReviewStep } from "@/components/ReviewStep";
import { align } from "@/lib/align";
import { listen } from "@/lib/listen";
import { splitScript } from "@/lib/lines";
import { markLine, markTake, type LineResult } from "@/lib/marks";
import { forgetClip } from "@/lib/play";

export default function Home() {
  const [step, setStep] = useState<"script" | "read" | "review">("script");
  const [script, setScript] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [take1, setTake1] = useState<LineResult[] | null>(null);
  const [take1Audio, setTake1Audio] = useState<string | null>(null);
  const [take2, setTake2] = useState<Record<number, LineResult>>({});
  const [take2Audio, setTake2Audio] = useState<Record<number, string>>({});
  const [busyLine, setBusyLine] = useState<number | null>(null);
  const lines = useMemo(() => splitScript(script), [script]);

  async function onTake(audio: Blob) {
    setBusy(true);
    setError("");
    if (take1Audio) forgetClip(take1Audio);
    Object.values(take2Audio).forEach(forgetClip);
    setTake1Audio(URL.createObjectURL(audio));
    setTake2({});
    setTake2Audio({});
    try {
      setTake1(markTake(lines, await listen(audio)));
      setStep("review");
    } catch {
      setError("Couldn't check this take. Try again.");
    } finally {
      setBusy(false);
    }
  }

  // A retake is checked against its own line only; the latest retake of a line wins.
  async function onRetake(i: number, audio: Blob) {
    setBusyLine(i);
    setError("");
    try {
      const result = markLine(lines[i], align(lines[i].words, await listen(audio)), take1![i].restAfter);
      const url = URL.createObjectURL(audio);
      if (take2Audio[i]) forgetClip(take2Audio[i]);
      setTake2((t) => ({ ...t, [i]: result }));
      setTake2Audio((a) => ({ ...a, [i]: url }));
    } catch {
      setError("Couldn't check this retake. Try again.");
    } finally {
      setBusyLine(null);
    }
  }

  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-12">
      {step === "script" && (
        <ScriptStep script={script} lines={lines} onChange={setScript} onStart={() => setStep("read")} />
      )}
      {step === "read" && <ReadStep lines={lines} busy={busy} onBack={() => setStep("script")} onTake={onTake} />}
      {error && <p className="mt-4 text-muted">{error}</p>}
      {step === "review" && take1 && (
        <ReviewStep
          lines={lines}
          take1={take1}
          take2={take2}
          take1Audio={take1Audio}
          take2Audio={take2Audio}
          busyLine={busyLine}
          onRetake={onRetake}
          onReadAgain={() => setStep("read")}
          onEdit={() => setStep("script")}
        />
      )}
    </main>
  );
}
