"use client";
import { useMemo, useState } from "react";
import { ScriptStep } from "@/components/ScriptStep";
import { ReadStep } from "@/components/ReadStep";
import { ReviewStep } from "@/components/ReviewStep";
import { listen } from "@/lib/listen";
import { splitScript } from "@/lib/lines";
import { markTake, type LineResult } from "@/lib/marks";

export default function Home() {
  const [step, setStep] = useState<"script" | "read" | "review">("script");
  const [script, setScript] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [take1, setTake1] = useState<LineResult[] | null>(null);
  const lines = useMemo(() => splitScript(script), [script]);

  async function onTake(audio: Blob) {
    setBusy(true);
    setError("");
    try {
      setTake1(markTake(lines, await listen(audio)));
      setStep("review");
    } catch {
      setError("Couldn't check this take. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-12">
      {step === "script" && (
        <ScriptStep script={script} lines={lines} onChange={setScript} onStart={() => setStep("read")} />
      )}
      {step === "read" && <ReadStep lines={lines} busy={busy} onBack={() => setStep("script")} onTake={onTake} />}
      {error && <p className="mt-4 text-muted">{error}</p>}
      {step === "review" && take1 && (
        <ReviewStep lines={lines} results={take1} onReadAgain={() => setStep("read")} onEdit={() => setStep("script")} />
      )}
    </main>
  );
}
