"use client";
import { useEffect, useMemo, useState } from "react";
import { ScriptStep } from "@/components/ScriptStep";
import { ReadStep } from "@/components/ReadStep";
import { ReviewStep } from "@/components/ReviewStep";
import { align } from "@/lib/align";
import { listen, ListenError } from "@/lib/listen";
import { splitScript } from "@/lib/lines";
import { markLine, markTake, type LineResult } from "@/lib/marks";
import { forgetClip } from "@/lib/play";
import { exportSample, sessionFromSample, type Sample } from "@/lib/sample";
import { load, save } from "@/lib/storage";

const NOTHING_HEARD = "We didn't hear anything — check your mic and try again.";
const LISTENER_DOWN = "Couldn't check this take. Your recording is kept — try again.";

export default function Home() {
  const [loaded, setLoaded] = useState(false);
  const [step, setStep] = useState<"script" | "read" | "review">("script");
  const [script, setScript] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [failed, setFailed] = useState<{ audio: Blob; line: number | null } | null>(null);
  const [take1, setTake1] = useState<LineResult[] | null>(null);
  const [take1Audio, setTake1Audio] = useState<string | null>(null);
  const [take2, setTake2] = useState<Record<number, LineResult>>({});
  const [take2Audio, setTake2Audio] = useState<Record<number, string>>({});
  const [busyLine, setBusyLine] = useState<number | null>(null);
  const [sample, setSample] = useState(false);
  const lines = useMemo(() => splitScript(script), [script]);

  // localStorage exists only in the browser, so the saved session is read after the first render.
  useEffect(() => {
    const saved = load();
    /* eslint-disable react-hooks/set-state-in-effect -- one-time restore from browser storage */
    if (saved) {
      setScript(saved.script);
      setTake1(saved.take1);
      setTake2(saved.take2 ?? {});
      if (saved.take1) setStep("review");
    }
    setLoaded(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  useEffect(() => {
    // The sample never overwrites the visitor's own saved session.
    if (loaded && !sample) save({ script, take1, take2 });
  }, [loaded, sample, script, take1, take2]);

  // An empty or soundless recording can't be fixed by re-sending it; anything else can.
  const failure = (e: unknown) => (e instanceof ListenError && (e.status === 400 || e.status === 422) ? NOTHING_HEARD : LISTENER_DOWN);

  function fail(message: string, audio: Blob, line: number | null) {
    setError(message);
    setFailed(message === LISTENER_DOWN ? { audio, line } : null);
  }

  async function onTake(audio: Blob) {
    setBusy(true);
    setError("");
    setFailed(null);
    try {
      const heard = await listen(audio);
      if (!heard.length) return fail(NOTHING_HEARD, audio, null);
      forgetAudio();
      setSample(false);
      setTake1Audio(URL.createObjectURL(audio));
      setTake2({});
      setTake2Audio({});
      setTake1(markTake(lines, heard));
      setStep("review");
    } catch (e) {
      fail(failure(e), audio, null);
    } finally {
      setBusy(false);
    }
  }

  // A retake is checked against its own line only; the latest retake of a line wins.
  async function onRetake(i: number, audio: Blob) {
    setBusyLine(i);
    setError("");
    setFailed(null);
    try {
      const heard = await listen(audio);
      if (!heard.length) return fail(NOTHING_HEARD, audio, i);
      const result = markLine(lines[i], align(lines[i].words, heard), take1![i].restAfter);
      if (take2Audio[i]) forgetClip(take2Audio[i]);
      setTake2((t) => ({ ...t, [i]: result }));
      setTake2Audio((a) => ({ ...a, [i]: URL.createObjectURL(audio) }));
    } catch (e) {
      fail(failure(e), audio, i);
    } finally {
      setBusyLine(null);
    }
  }

  function forgetAudio() {
    if (take1Audio) forgetClip(take1Audio);
    Object.values(take2Audio).forEach(forgetClip);
  }

  async function openSample() {
    setError("");
    setFailed(null);
    try {
      const data: Sample = await (await fetch("/sample/sample.json")).json();
      const session = sessionFromSample(data);
      forgetAudio();
      setScript(data.script);
      setTake1(session.take1);
      setTake2(session.take2);
      setTake1Audio(session.take1Audio);
      setTake2Audio(session.take2Audio);
      setSample(true);
      setStep("review");
    } catch {
      setError("The sample couldn't be opened. Try again in a moment.");
    }
  }

  function leaveSample() {
    forgetAudio();
    setSample(false);
    setScript("");
    setTake1(null);
    setTake2({});
    setTake1Audio(null);
    setTake2Audio({});
    setStep("script");
  }

  function tryAgain() {
    if (!failed) return;
    if (failed.line === null) onTake(failed.audio);
    else onRetake(failed.line, failed.audio);
  }

  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-12">
      {error && (
        <div role="alert" className="mb-6 flex flex-wrap items-center gap-4 rounded-lg border border-[#FDA29B] bg-[#FEF3F2] p-4">
          <span>{error}</span>
          {failed && (
            <button className="rounded bg-accent px-3 py-1 text-white disabled:opacity-40" disabled={busy || busyLine !== null} onClick={tryAgain}>
              Try again
            </button>
          )}
        </div>
      )}
      {step === "script" && (
        <ScriptStep script={script} lines={lines} onChange={setScript} onStart={() => setStep("read")} onSample={openSample} />
      )}
      {step === "read" && <ReadStep lines={lines} busy={busy} onBack={() => setStep("script")} onTake={onTake} onSample={openSample} />}
      {step === "review" && take1 && (
        <ReviewStep
          lines={lines}
          take1={take1}
          take2={take2}
          take1Audio={take1Audio}
          take2Audio={take2Audio}
          busyLine={busyLine}
          sample={sample}
          onRetake={onRetake}
          onReadAgain={() => setStep("read")}
          onEdit={sample ? leaveSample : () => setStep("script")}
          onExport={
            process.env.NODE_ENV === "development" && !sample && take1Audio
              ? () => exportSample(script, take1, take2, take1Audio, take2Audio)
              : undefined
          }
        />
      )}
    </main>
  );
}
