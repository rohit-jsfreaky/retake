"use client";
import { useEffect, useMemo, useState } from "react";
import { ScriptStep } from "@/components/ScriptStep";
import { ReadStep } from "@/components/ReadStep";
import { ReviewStep } from "@/components/ReviewStep";
import { AppFrame, AppSidebar, STEP_NAME, VIEW_NAME, type Step, type View } from "@/components/AppShell";
import { Pill } from "@/components/ui";
import { AlertCircle } from "@untitledui/icons";
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
  const [step, setStep] = useState<Step>("script");
  const [view, setView] = useState<View>("take1");
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
      if (Object.keys(saved.take2 ?? {}).length) setView("take2");
      if (saved.take1) setStep("review");
    }
    setLoaded(true);
    // The landing page's "See a real take" links here with ?sample.
    if (new URLSearchParams(window.location.search).has("sample")) openSample();
    /* eslint-enable react-hooks/set-state-in-effect */
    // eslint-disable-next-line react-hooks/exhaustive-deps -- runs once on open
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
      setView("take1");
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
      setView("take2");
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
      setView(Object.keys(session.take2).length ? "take2" : "take1");
      setStep("review");
    } catch {
      setError("The sample couldn't be opened. Try again in a moment.");
    }
  }

  // Starts over with an empty script. The sample is simply left; your own work is only cleared after asking.
  function newScript() {
    if (!sample && (take1 || script.trim()) && !window.confirm("Start a new script? This clears your current script and takes.")) return;
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

  const retakes = Object.keys(take2).length;
  const takeSeconds = take1 ? Math.max(0, ...take1.flatMap((r) => r.heard.map((w) => w.end))) : undefined;
  const title = step === "review" ? `Review · ${VIEW_NAME[retakes ? view : "take1"]}${sample ? " · Sample" : ""}` : STEP_NAME[step];

  return (
    <div className="paper flex h-dvh flex-col bg-[linear-gradient(in_oklab,var(--sky-from),var(--sky-to))] p-3 md:p-5">
      <AppFrame
        className="min-h-0 flex-1"
        title={title}
        sidebar={
          <AppSidebar
            step={step}
            view={retakes ? view : "take1"}
            canRead={lines.length > 0}
            canReview={Boolean(take1)}
            takeSeconds={takeSeconds}
            retakes={retakes}
            sample={sample}
            onNew={newScript}
            onStep={setStep}
            onView={(v) => {
              setView(v);
              setStep("review");
            }}
            onSample={openSample}
          />
        }
      >
        {error && (
          <div role="alert" className="m-6 mb-0 flex flex-wrap items-center gap-4 rounded-2xl bg-[#FEF3F2] p-4 md:mx-8">
            <AlertCircle size={20} className="text-[#D92D20]" />
            <span className="flex-1">{error}</span>
            {failed && (
              <Pill size="sm" disabled={busy || busyLine !== null} onClick={tryAgain}>
                Try again
              </Pill>
            )}
          </div>
        )}
        {step === "script" && <ScriptStep script={script} lines={lines} onChange={setScript} onStart={() => setStep("read")} />}
        {step === "read" && <ReadStep lines={lines} busy={busy} onTake={onTake} onSample={openSample} />}
        {step === "review" && take1 && (
          <ReviewStep
            lines={lines}
            take1={take1}
            take2={take2}
            take1Audio={take1Audio}
            take2Audio={take2Audio}
            view={retakes ? view : "take1"}
            busyLine={busyLine}
            sample={sample}
            onRetake={onRetake}
            onReadAgain={() => setStep("read")}
            onEdit={sample ? newScript : () => setStep("script")}
            onExport={
              process.env.NODE_ENV === "development" && !sample && take1Audio
                ? () => exportSample(script, take1, take2, take1Audio, take2Audio)
                : undefined
            }
          />
        )}
      </AppFrame>
    </div>
  );
}
