"use client";
import { useState } from "react";
import { ScriptStep } from "@/components/ScriptStep";
import { ReadStep } from "@/components/ReadStep";
import { listen } from "@/lib/listen";
import type { HeardWord } from "@/lib/align";

export default function Home() {
  const [step, setStep] = useState<"script" | "read" | "review">("script");
  const [script, setScript] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [heard, setHeard] = useState<HeardWord[]>([]);

  async function onTake(audio: Blob) {
    setBusy(true);
    setError("");
    try {
      setHeard(await listen(audio));
      setStep("review");
    } catch {
      setError("Couldn't check this take. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-12">
      {step === "script" && <ScriptStep script={script} onChange={setScript} onStart={() => setStep("read")} />}
      {step === "read" && <ReadStep script={script} busy={busy} onBack={() => setStep("script")} onTake={onTake} />}
      {error && <p className="mt-4 text-muted">{error}</p>}
      {step === "review" && (
        <section className="flex flex-col gap-4">
          <button className="self-start text-muted underline" onClick={() => setStep("read")}>Read again</button>
          <h2 className="text-xl font-semibold">What the listener heard</h2>
          <ol className="font-mono text-sm">
            {heard.map((w, i) => (
              <li key={i}>
                {w.start.toFixed(2)}–{w.end.toFixed(2)} s · {w.word} · {w.confidence.toFixed(2)}
              </li>
            ))}
          </ol>
        </section>
      )}
    </main>
  );
}
